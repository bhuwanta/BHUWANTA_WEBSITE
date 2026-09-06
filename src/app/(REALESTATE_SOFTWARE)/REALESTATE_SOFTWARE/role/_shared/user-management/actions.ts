'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyCaller } from '../auth'
import { sendSetupPasswordEmail } from '@/lib/emails/resend'
import { canCreateRoleDynamic, canManageRoleDynamic, canViewRole, canViewCompanyWide, isAdminPeer, isOperationManager, isSalesRole, getSalesRoleOrder, type RealEstateRole } from '../permissions'
import { normalizePhone, validatePhone } from '../phone-policy'
import { getDownlineIds, getSubtreePendingSales } from '../downline'
import { validatePassword } from '../password-policy'

export async function checkUserManagementModuleStatusAction(role: RealEstateRole) {
  try {
    const supabaseAdmin = createServiceClient();

    const { data: moduleData } = await supabaseAdmin
      .from('s_modules')
      .select('enabled_roles')
      .eq('module_key', 'user_management')
      .maybeSingle();

    if (!moduleData) return { success: true, isEnabled: false };

    const isEnabled = (moduleData.enabled_roles || []).includes(role);
    return { success: true, isEnabled };
  } catch (error: any) {
    console.error('Error checking user management module status:', error);
    return { success: false, isEnabled: false };
  }
}

/**
 * Every mutating action below takes `callerRole`/`callerId` params for
 * UI convenience, but those are client-supplied and NEVER trusted for
 * authorization — this re-derives the real caller from the session
 * before any permission check runs. A crafted direct call to a Server
 * Action (bypassing the page/button that normally invokes it) with a
 * forged `callerRole: 'it'` is rejected here rather than silently
 * trusted, since `createServiceClient()` bypasses RLS and would
 * otherwise have no other check standing in the way.
 */
async function verifyOrReject() {
  const caller = await verifyCaller();
  if (!caller) {
    return { ok: false as const, error: 'Not authenticated, or your account is inactive.' };
  }
  return { ok: true as const, id: caller.id, role: caller.role };
}

export async function createExecutiveAction(
  _callerRole: RealEstateRole,
  _callerId: string,
  data: {
    fullName: string
    phone: string
    email: string
    role: RealEstateRole
  }
) {
  try {
    const verified = await verifyOrReject();
    if (!verified.ok) return { success: false, error: verified.error };
    const { id: callerId, role: callerRole } = verified;

    const supabaseAdmin = createServiceClient()

    // Company is a singleton, IT-only creation — a bespoke branch rather
    // than canCreateRoleDynamic (which always denies 'company' as a
    // target, precisely so this can't be reached through the generic
    // admin-peer path by CEO/Governing Council too).
    if (data.role === 'company') {
      if (callerRole !== 'it') {
        return { success: false, error: 'Only IT can create the Company account.' }
      }
      const { count: companyCount } = await supabaseAdmin.from('s_realestate_users').select('id', { count: 'exact', head: true }).eq('role', 'company')
      if ((companyCount || 0) > 0) {
        return { success: false, error: 'A Company account already exists — only one is allowed.' }
      }
    } else {
      const rankOrder = await getSalesRoleOrder(supabaseAdmin)
      if (!canCreateRoleDynamic(callerRole, data.role, rankOrder)) {
        return { success: false, error: `A ${callerRole.replace('_', ' ')} cannot create a ${data.role.replace('_', ' ')} profile.` };
      }
    }

    // Normalize before validating AND before writing, so the stored
    // value is always bare digits — the phone is the login ID and the
    // key a returning customer is matched on, so "+91 98765 43210" and
    // "9876543210" must never end up as two different accounts.
    const phone = normalizePhone(data.phone)
    const phoneError = validatePhone(phone)
    if (phoneError) return { success: false, error: phoneError };

    // No admin-set password, ever — matches how a New Registration
    // auto-creates a Customer account (registrations/actions.ts): only
    // an email is provided here, Supabase creates the account with no
    // password at all, and the person sets their own via the emailed
    // setup link below. Nobody except the account holder ever knows
    // their password.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        raw_phone: phone
      },
    })

    if (authError) {
      console.error('Error creating auth user:', authError);
      return { success: false, error: `Auth Error: ${authError.message}` }
    }

    const userId = authData.user.id

    // 2. Insert into public.S_realestate_users profile table.
    // parent_id: admin peers (it/ceo/governing_council) and Operation
    // Manager aren't part of the downline tree, so NULL. Every
    // sales-tier profile's parent_id is whoever created it (§6's
    // resolved upline-chain question).
    const parentId = (isAdminPeer(data.role) || isOperationManager(data.role) || data.role === 'company') ? null : callerId;

    const { data: insertedUser, error: profileError } = await supabaseAdmin
      .from('s_realestate_users')
      .insert({
        id: userId,
        phone,
        full_name: data.fullName,
        role: data.role,
        parent_id: parentId,
        // Migration 012: audit-only, records the real creator even for
        // admin peers (whose parent_id is always NULL above, since
        // they're deliberately outside the downline/org-chart tree —
        // e.g. a Governing Council member is a child of every active
        // CEO in the hierarchy graph, not just whoever created them).
        created_by: callerId,
        is_active: true,
      })
      .select('bhuwanta_id')
      .single()

    if (profileError) {
      console.error('Error creating user profile (trigger may have failed):', profileError);
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { success: false, error: `Profile Error: ${profileError.message}` }
    }

    // 2b. A brand-new Director starts assigned to every existing
    // Project — their whole downline (Sr.Core through LIA) inherits
    // these assignments (§5), so without this a fresh Director's team
    // couldn't submit a single New Registration until someone manually
    // ticked every checkbox in the Areas & Projects modal. Non-fatal:
    // this is a convenience default, not a requirement for the account
    // itself to exist, so a failure here is logged but doesn't roll
    // back the account that was already successfully created above.
    if (data.role === 'director') {
      const { data: allProjects, error: projectsError } = await supabaseAdmin.from('s_projects').select('id')
      if (projectsError) {
        console.error('Error fetching projects for default Director assignment:', projectsError)
      } else if (allProjects && allProjects.length > 0) {
        const { error: assignError } = await supabaseAdmin
          .from('s_director_projects')
          .insert(allProjects.map((p: { id: string }) => ({ project_id: p.id, director_id: userId })))
        if (assignError) {
          console.error('Error auto-assigning projects to new Director:', assignError)
        }
      }

      // 2c. Migration 012 / 011: a Director created directly BY a
      // Governing Council member starts already assigned to that GC's
      // wing — matches HIERARCHY.md's model (GC creates Directors under
      // them; that Director's whole downline belongs to that wing, not
      // any other GC's). Only fires when the caller IS a GC; a Director
      // created by IT/CEO directly still has no GC to infer, so still
      // starts in "Unassigned Directors" on the hierarchy graph, same
      // as before — that gap stays visible on purpose rather than
      // guessed at. Non-fatal, same as the project-assignment default
      // above: this is a convenience default, reassignable any time
      // afterward on the Payout Rules page, not a requirement for the
      // account to exist.
      if (callerRole === 'governing_council') {
        const { error: gcAssignError } = await supabaseAdmin
          .from('s_director_gc')
          .upsert({ director_id: userId, gc_id: callerId, updated_by: callerId, updated_at: new Date().toISOString() }, { onConflict: 'director_id' })
        if (gcAssignError) {
          console.error('Error auto-assigning new Director to creating Governing Council member:', gcAssignError)
        }
      }
    }

    // 3. Email them a secure link to set their own password.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: data.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'}/REALESTATE_SOFTWARE/password/set-password`
      }
    });

    if (linkError) {
      console.error('Error generating setup link:', linkError);
    } else if (linkData?.properties?.action_link) {
      await sendSetupPasswordEmail(data.email, data.fullName, linkData.properties.action_link);
    }

    return {
      success: true,
      message: `Successfully created ${data.role.replace('_', ' ')}. ID: ${insertedUser?.bhuwanta_id}`
    }
  } catch (error: any) {
    console.error('Server action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

export async function getExecutivesAction(
  _callerRole: RealEstateRole,
  _callerId: string,
  page: number = 1,
  limit: number = 50,
  searchQuery: string = '',
  roleFilter: RealEstateRole | 'all' = 'all',
  sortCol: string = 'created_at',
  sortDir: 'asc' | 'desc' = 'desc'
) {
  try {
    const verified = await verifyOrReject();
    if (!verified.ok) return { success: false, data: [], count: 0, error: verified.error };
    const { id: callerId, role: callerRole } = verified;

    const supabaseAdmin = createServiceClient()

    let query = supabaseAdmin
      .from('s_realestate_users')
      .select('id, bhuwanta_id, full_name, role, phone, parent_id, is_active, created_at', { count: 'exact' })

    if (canViewCompanyWide(callerRole)) {
      // IT/CEO/Governing Council/Company: see everyone, no downline
      // scoping (Company is read-only here — this function only lists,
      // it never mutates).
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }
    } else {
      // Sales tiers: only their own whole downline (§4 walling), never
      // a peer's team, never anyone above them.
      const downlineIds = await getDownlineIds(supabaseAdmin, callerId);
      if (downlineIds.length === 0) return { success: true, data: [], count: 0 };
      query = query.in('id', downlineIds);

      if (roleFilter !== 'all') {
        const rankOrder = await getSalesRoleOrder(supabaseAdmin)
        if (!canCreateRoleDynamic(callerRole, roleFilter as RealEstateRole, rankOrder)) {
          return { success: false, data: [], count: 0, error: 'Unauthorized role filter' };
        }
        query = query.eq('role', roleFilter);
      }
    }

    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,bhuwanta_id.ilike.%${searchQuery}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order(sortCol, { ascending: sortDir === 'asc' })
      .range(from, to)

    if (error) {
      console.error('Error fetching users:', error)
      return { success: false, data: [], count: 0 }
    }

    let finalData: any[] = (data || []).filter((u: any) => canViewRole(callerRole, u.role));

    // Fetch emails from auth.users (up to 1000 for mapping) — email lives
    // only in Supabase Auth, s_realestate_users has no email column.
    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = new Map();
    if (authUsersData?.users) {
      authUsersData.users.forEach((u: any) => emailMap.set(u.id, u.email));
    }

    finalData = finalData.map((u: any) => ({
      ...u,
      email: emailMap.get(u.id) || 'No Email'
    }));

    return { success: true, data: finalData, count: count || 0 }
  } catch (error) {
    console.error('Server action error:', error)
    return { success: false, data: [], count: 0 }
  }
}

export async function updateExecutiveAction(
  _callerRole: RealEstateRole,
  _callerId: string,
  id: string,
  data: {
    fullName: string
    phone: string
    email: string
    role: RealEstateRole
    password?: string
  }
) {
  try {
    const verified = await verifyOrReject();
    if (!verified.ok) return { success: false, error: verified.error };
    const { id: callerId, role: callerRole } = verified;

    const supabaseAdmin = createServiceClient()

    const rankOrder = await getSalesRoleOrder(supabaseAdmin)
    if (!canManageRoleDynamic(callerRole, data.role, rankOrder)) {
      return { success: false, error: `A ${callerRole.replace('_', ' ')} cannot manage a ${data.role.replace('_', ' ')} profile.` };
    }

    if (!isAdminPeer(callerRole)) {
      const downlineIds = await getDownlineIds(supabaseAdmin, callerId);
      if (!downlineIds.includes(id)) {
        return { success: false, error: 'You can only manage people in your own downline.' };
      }
    }

    // Same normalize-then-validate as createExecutiveAction — an edit
    // must not be able to reintroduce a malformed login ID that create
    // would have rejected.
    const phone = normalizePhone(data.phone)
    const phoneError = validatePhone(phone)
    if (phoneError) return { success: false, error: phoneError };

    const updateData: any = {}
    if (data.password) {
      const passwordError = validatePassword(data.password);
      if (passwordError) return { success: false, error: passwordError };
      updateData.password = data.password
    }
    if (data.email) {
      updateData.email = data.email
      // Without this, an admin-initiated email change can leave the
      // account in an unconfirmed state, unable to log in with the new
      // address until they click a confirmation link that was never
      // sent through this flow.
      updateData.email_confirm = true
    }
    updateData.user_metadata = { full_name: data.fullName, raw_phone: phone }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
    if (authError) {
      console.error('Error updating auth user:', authError)
      return { success: false, error: `Auth Update Error: ${authError.message}` }
    }

    const { error: profileError } = await supabaseAdmin
      .from('s_realestate_users')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        role: data.role,
      })
      .eq('id', id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return { success: false, error: `Profile Update Error: ${profileError.message}` }
    }

    return { success: true, message: `Successfully updated ${data.role.replace('_', ' ')}` }
  } catch (error: any) {
    console.error('Server action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

export async function toggleExecutiveStatusAction(
  _callerRole: RealEstateRole,
  _callerId: string,
  id: string,
  currentStatus: boolean
) {
  try {
    const verified = await verifyOrReject();
    if (!verified.ok) return { success: false, error: verified.error };
    const { id: callerId, role: callerRole } = verified;

    const supabaseAdmin = createServiceClient()

    if (!isAdminPeer(callerRole)) {
      const downlineIds = await getDownlineIds(supabaseAdmin, callerId);
      if (!downlineIds.includes(id)) {
        return { success: false, error: 'You can only manage people in your own downline.' };
      }
    }

    if (callerId === id && currentStatus) {
      return { success: false, error: "You cannot deactivate your own account." }
    }

    // IT is the platform's root admin — CEO/Governing Council are peers
    // for creation purposes but must not be able to lock IT out.
    if (callerRole !== 'it') {
      const { data: targetUser } = await supabaseAdmin.from('s_realestate_users').select('role').eq('id', id).single();
      if (targetUser?.role === 'it') {
        return { success: false, error: 'Only IT can deactivate an IT Admin account.' };
      }
    }

    const { error } = await supabaseAdmin
      .from('s_realestate_users')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error toggling status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, message: `Successfully ${!currentStatus ? 'activated' : 'deactivated'} user` }
  } catch (error: any) {
    console.error('Server action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

export async function deleteExecutiveAction(
  _callerRole: RealEstateRole,
  _callerId: string,
  id: string
) {
  try {
    const verified = await verifyOrReject();
    if (!verified.ok) return { success: false, error: verified.error };
    const { id: callerId, role: callerRole } = verified;

    const supabaseAdmin = createServiceClient()

    const { data: targetUser } = await supabaseAdmin.from('s_realestate_users').select('role').eq('id', id).single();
    const rankOrder = await getSalesRoleOrder(supabaseAdmin)
    if (!targetUser || !canManageRoleDynamic(callerRole, targetUser.role as RealEstateRole, rankOrder)) {
      return { success: false, error: 'You are not authorized to delete this profile.' };
    }

    // IT is the platform's root admin — CEO/Governing Council are peers
    // for creation purposes but must not be able to delete IT.
    if (targetUser.role === 'it' && callerRole !== 'it') {
      return { success: false, error: 'Only IT can delete an IT Admin account.' };
    }

    if (!isAdminPeer(callerRole)) {
      const downlineIds = await getDownlineIds(supabaseAdmin, callerId);
      if (!downlineIds.includes(id)) {
        return { success: false, error: 'You can only manage people in your own downline.' };
      }
    }

    if (callerId === id) {
      return { success: false, error: "You cannot delete your own account." }
    }

    // Delete from profile table first. If this person still has
    // descendants (their downline's parent_id points at them), the FK
    // constraint on parent_id blocks the delete — surfaced below as a
    // friendly error rather than a raw DB error, since silently
    // cascading a delete through someone's whole downline would be far
    // more destructive than refusing it.
    const { error: profileError } = await supabaseAdmin
      .from('s_realestate_users')
      .delete()
      .eq('id', id);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      if (profileError.code === '23503') {
        return { success: false, error: 'This person still has people in their downline. Reassign or remove them first.' };
      }
      return { success: false, error: profileError.message };
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      console.error('Error deleting auth user:', authError);
      return { success: false, error: authError.message };
    }

    return { success: true, message: 'User permanently deleted' }
  } catch (error: any) {
    console.error('Server action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

/** Roles this caller is allowed to pick when creating/editing a profile
 * — drives the role picker in the UI so it never shows an option the
 * server would reject anyway. Reads the real, current sales-tier order
 * (built-in + any admin-created roles) via getSalesRoleOrder, not the
 * static SALES_RANK_ORDER — a newly created role shows up here the
 * moment it exists, no code change needed. */
export async function getCreatableRolesAction(callerRole: RealEstateRole): Promise<RealEstateRole[]> {
  const supabaseAdmin = createServiceClient()
  const rankOrder = await getSalesRoleOrder(supabaseAdmin)
  const salesRoleCodes = rankOrder.map((r) => r.role_code) as RealEstateRole[]

  if (isAdminPeer(callerRole)) {
    // IT and Operation Manager sit outside the commission chain, so
    // they're kept together at the front rather than interrupting the
    // CEO→LIA run — everyone from CEO down to LIA reads as one
    // unbroken, strictly descending-by-percentage ladder (salesRoleCodes
    // is already highest-rank-first from getSalesRoleOrder).
    const creatable: RealEstateRole[] = ['it', 'operation_manager', 'ceo', 'governing_council', ...salesRoleCodes];

    // Company is a singleton, IT-only creation (createExecutiveAction
    // enforces this server-side regardless of what this list shows) — so
    // it's only ever offered to IT, and only while none exists yet. CEO
    // and Governing Council never see it as an option.
    if (callerRole === 'it') {
      const { count: companyCount } = await supabaseAdmin.from('s_realestate_users').select('id', { count: 'exact', head: true }).eq('role', 'company')
      if (!companyCount) creatable.unshift('company')
    }

    return creatable;
  }
  return salesRoleCodes.filter((r) => canCreateRoleDynamic(callerRole, r, rankOrder));
}

/** Roles the caller can FILTER the list by — deliberately not the same
 * set as getCreatableRolesAction, which also drives the "Add User" role
 * dropdown.
 *
 * Admin peers get a Customer tab on top of the creatable roles: customer
 * rows already come back under "All" (the query applies no role
 * exclusion for peers, and canViewRole only ever hides CEO), so this
 * just makes them reachable directly instead of buried among staff.
 * Customer stays out of the creatable list on purpose — a customer
 * account is only ever created by createRegistrationAction alongside a
 * real registration, phone and Auth login, so offering it in the Add
 * User modal would produce an orphaned account with no sale attached. */
export async function getFilterableRolesAction(callerRole: RealEstateRole): Promise<RealEstateRole[]> {
  const creatable = await getCreatableRolesAction(callerRole)
  if (isAdminPeer(callerRole)) {
    return [...creatable, 'customer'] as RealEstateRole[]
  }
  return creatable
}

/** IT-only. A Director's real "reports to" is resolved through
 * S_director_gc (migration 011), never parent_id — their parent_id is
 * creation lineage (whichever admin peer's account created them), not a
 * payout relationship. Every other sales tier's parent_id IS the real
 * upline, so this function is only ever called for non-Director roles;
 * the Edit User modal routes a Director to the GC-picker instead. */
async function requireIt() {
  const caller = await verifyCaller()
  if (!caller || caller.role !== 'it') {
    return { ok: false as const, error: 'Only IT can change who someone reports to.' }
  }
  return { ok: true as const, id: caller.id }
}

/** Every active, non-Director sales-tier person who could validly
 * become `userId`'s new upline: outranks them (by the LIVE rank order,
 * S_role_definitions — never a hardcoded tier list, so a custom
 * admin-created role in an unusual rank position is still handled
 * correctly), isn't `userId` themselves, and isn't already inside
 * `userId`'s own downline (which would create a cycle — reassigning
 * someone to report to their own descendant). */
export async function getReportsToCandidatesAction(userId: string) {
  try {
    const verified = await requireIt()
    if (!verified.ok) return { success: false, error: verified.error, data: [] as { id: string; full_name: string; role: string }[] }

    const supabaseAdmin = createServiceClient()

    const { data: target } = await supabaseAdmin.from('s_realestate_users').select('id, role').eq('id', userId).maybeSingle()
    if (!target || target.role === 'director' || !isSalesRole(target.role as RealEstateRole)) {
      return { success: false, error: 'Not a reassignable sales-tier role.', data: [] as { id: string; full_name: string; role: string }[] }
    }

    const rankOrder = await getSalesRoleOrder(supabaseAdmin)
    const rankIndex = new Map(rankOrder.map((r, i) => [r.role_code, i]))
    const targetRank = rankIndex.get(target.role)
    if (targetRank === undefined) return { success: false, error: 'Unknown role rank.', data: [] as { id: string; full_name: string; role: string }[] }

    const ownDownline = new Set(await getDownlineIds(supabaseAdmin, userId))

    const { data: candidates } = await supabaseAdmin
      .from('s_realestate_users')
      .select('id, full_name, role')
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    const data = (candidates || [])
      .filter((c: any) => {
        if (c.id === userId || ownDownline.has(c.id)) return false
        const cRank = rankIndex.get(c.role)
        return cRank !== undefined && cRank < targetRank
      })
      .map((c: any) => ({ id: c.id as string, full_name: c.full_name as string, role: c.role as string }))

    return { success: true, data }
  } catch (error: any) {
    console.error('Error loading reports-to candidates:', error)
    return { success: false, error: error.message || 'Failed to load candidates.', data: [] as { id: string; full_name: string; role: string }[] }
  }
}

/** IT-only. Reassigns a non-Director sales-tier person's parent_id —
 * their whole existing downline comes with them automatically, since
 * those descendants' own parent_id values are untouched and still point
 * at this person. Blocked outright (not just warned) if this person or
 * anyone in their downline has a sale sitting in pending_registration
 * right now — see getSubtreePendingSales for why that's a real, not
 * theoretical, danger. Never retroactive: only sales that reach
 * "Registration Done" after this change use the new chain. */
export async function reassignReportsToAction(userId: string, newParentId: string) {
  try {
    const verified = await requireIt()
    if (!verified.ok) return { success: false, error: verified.error }

    const supabaseAdmin = createServiceClient()

    const [{ data: target }, { data: newParent }] = await Promise.all([
      supabaseAdmin.from('s_realestate_users').select('id, full_name, role').eq('id', userId).maybeSingle(),
      supabaseAdmin.from('s_realestate_users').select('id, full_name, role, is_active').eq('id', newParentId).maybeSingle(),
    ])

    if (!target) return { success: false, error: 'User not found.' }
    if (target.role === 'director' || !isSalesRole(target.role as RealEstateRole)) {
      return { success: false, error: 'This role’s "Reports To" is not reassignable here.' }
    }
    if (!newParent || !newParent.is_active) return { success: false, error: 'The selected upline was not found or is inactive.' }
    if (newParentId === userId) return { success: false, error: 'A person cannot report to themselves.' }

    const rankOrder = await getSalesRoleOrder(supabaseAdmin)
    const rankIndex = new Map(rankOrder.map((r, i) => [r.role_code, i]))
    const targetRank = rankIndex.get(target.role)
    const parentRank = rankIndex.get(newParent.role)
    if (targetRank === undefined || parentRank === undefined || parentRank >= targetRank) {
      return { success: false, error: `${newParent.full_name || 'That person'} does not outrank ${target.full_name || 'this person'} — pick someone higher in the sales cascade.` }
    }

    const ownDownline = new Set(await getDownlineIds(supabaseAdmin, userId))
    if (ownDownline.has(newParentId)) {
      return { success: false, error: `${newParent.full_name || 'That person'} is currently inside ${target.full_name || 'this person'}'s own team — reassigning to them would create a loop.` }
    }

    // Blocked, not just warned — see getSubtreePendingSales.
    const pendingSales = await getSubtreePendingSales(supabaseAdmin, userId)
    if (pendingSales.length > 0) {
      return {
        success: false,
        error: `Cannot reassign ${target.full_name || 'this person'} right now — ${pendingSales.length} sale${pendingSales.length === 1 ? ' is' : 's are'} still pending in their team. Resolve them first (customer payment + Registration Done), then reassign.`,
        pendingSales,
      }
    }

    const { error } = await supabaseAdmin.from('s_realestate_users').update({ parent_id: newParentId }).eq('id', userId)
    if (error) throw error

    return { success: true, message: `${target.full_name || 'This person'} now reports to ${newParent.full_name || 'the selected person'}.` }
  } catch (error: any) {
    console.error('Error reassigning reports-to:', error)
    return { success: false, error: error.message || 'Failed to reassign.' }
  }
}
