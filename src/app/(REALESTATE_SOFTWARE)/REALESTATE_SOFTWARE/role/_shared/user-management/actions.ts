'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyCaller } from '../auth'
import { sendSetupPasswordEmail } from '@/lib/emails/resend'
import { canCreateRoleDynamic, canManageRoleDynamic, canViewRole, isAdminPeer, isOperationManager, getSalesRoleOrder, type RealEstateRole } from '../permissions'
import { normalizePhone, validatePhone } from '../phone-policy'
import { getDownlineIds } from '../downline'
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

    const rankOrder = await getSalesRoleOrder(supabaseAdmin)
    if (!canCreateRoleDynamic(callerRole, data.role, rankOrder)) {
      return { success: false, error: `A ${callerRole.replace('_', ' ')} cannot create a ${data.role.replace('_', ' ')} profile.` };
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
    const parentId = (isAdminPeer(data.role) || isOperationManager(data.role)) ? null : callerId;

    const { data: insertedUser, error: profileError } = await supabaseAdmin
      .from('s_realestate_users')
      .insert({
        id: userId,
        phone,
        full_name: data.fullName,
        role: data.role,
        parent_id: parentId,
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
    }

    // 3. Email them a secure link to set their own password.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: data.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/REALESTATE_SOFTWARE/password/set-password`
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

    if (isAdminPeer(callerRole)) {
      // IT/CEO/Governing Council: see everyone, no downline scoping.
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
    return ['it', 'operation_manager', 'ceo', 'governing_council', ...salesRoleCodes] as RealEstateRole[];
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
