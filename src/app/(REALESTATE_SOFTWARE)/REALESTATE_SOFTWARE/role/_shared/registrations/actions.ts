'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyCaller } from '../auth'
import { sendSetupPasswordEmail } from '@/lib/emails/resend'
import { isAdminPeer, isSalesRole, isOperationManager } from '../permissions'
import { getDownlineIds, findUplineDirectorId } from '../downline'
import { runCommissionPayout } from '../payout-engine'

/** A "table doesn't exist" error, however it's reported: PostgREST
 * surfaces it as a PGRST205 schema-cache miss, raw Postgres as 42P01.
 * Used to degrade gracefully when migration 006 hasn't been run yet. */
function isMissingTableError(error: { code?: string } | null): boolean {
  return error?.code === 'PGRST205' || error?.code === '42P01'
}

/** Ids of every `pending_registration` row this caller is allowed to
 * see — company-wide for IT/CEO/GC and Operation Manager, self+downline
 * for a sales tier (§4 walling). Shared by the badge count and the
 * mark-all-read action so the two can never disagree about scope. */
async function getVisiblePendingRegistrationIds(
  supabaseAdmin: ReturnType<typeof createServiceClient>,
  caller: { id: string; role: Parameters<typeof isAdminPeer>[0] }
): Promise<string[] | null> {
  let query = supabaseAdmin.from('s_new_registrations').select('id').eq('status', 'pending_registration')

  if (!isAdminPeer(caller.role) && !isOperationManager(caller.role)) {
    if (!isSalesRole(caller.role)) return null
    const downlineIds = await getDownlineIds(supabaseAdmin, caller.id)
    query = query.in('submitted_by', [caller.id, ...downlineIds])
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []).map((r: any) => r.id as string)
}

/** Sidebar notification badge — counts pending registrations this
 * specific user hasn't acknowledged yet (S_registration_reads,
 * migration 006), NOT every pending registration. That distinction is
 * what makes "Mark all as read" able to clear the badge without
 * touching any registration's real status. */
export async function getPendingRegistrationCountAction() {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, count: 0 }

    const supabaseAdmin = createServiceClient()
    const pendingIds = await getVisiblePendingRegistrationIds(supabaseAdmin, caller)
    if (pendingIds === null) return { success: true, count: 0 }
    if (pendingIds.length === 0) return { success: true, count: 0 }

    const { data: reads, error: readsError } = await supabaseAdmin
      .from('s_registration_reads')
      .select('registration_id')
      .eq('user_id', caller.id)
      .in('registration_id', pendingIds)

    if (readsError) {
      // Table missing (migration 006 not applied yet) — fall back to the
      // old behavior of counting every pending registration rather than
      // hiding the badge entirely. PostgREST reports a missing table as
      // PGRST205 (schema-cache miss), not the raw Postgres 42P01, so
      // accept both.
      if (isMissingTableError(readsError)) {
        return { success: true, count: pendingIds.length }
      }
      throw readsError
    }

    const readIds = new Set((reads || []).map((r: any) => r.registration_id as string))
    return { success: true, count: pendingIds.filter((id) => !readIds.has(id)).length }
  } catch (error: any) {
    console.error('Error fetching pending registration count:', error)
    return { success: false, count: 0 }
  }
}

/** Clears this user's Registrations badge by marking every pending
 * registration currently visible to them as read. Purely a per-user
 * notification acknowledgement — it does not change any registration's
 * status, doesn't approve anything, and doesn't affect anyone else's
 * badge (see the composite PK note in migration 006). */
export async function markRegistrationsReadAction() {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, error: 'Not authenticated.' }

    const supabaseAdmin = createServiceClient()
    const pendingIds = await getVisiblePendingRegistrationIds(supabaseAdmin, caller)
    if (pendingIds === null || pendingIds.length === 0) {
      return { success: true, message: 'Nothing to mark as read.' }
    }

    const rows = pendingIds.map((registrationId) => ({ user_id: caller.id, registration_id: registrationId }))
    // Upsert so re-marking an already-read row is a no-op rather than a
    // primary-key violation.
    const { error } = await supabaseAdmin.from('s_registration_reads').upsert(rows, { onConflict: 'user_id,registration_id' })
    if (error) {
      if (isMissingTableError(error)) {
        return { success: false, error: 'Read-tracking table missing — run Database/migration-006-registration-reads.sql first.' }
      }
      throw error
    }

    return { success: true, message: 'All caught up.' }
  } catch (error: any) {
    console.error('Error marking registrations read:', error)
    return { success: false, error: error.message || 'Failed to mark as read.' }
  }
}

/** Acknowledges ONE registration, dropping this user's badge count by
 * exactly one. Same per-user, status-neutral semantics as the
 * mark-all version above. */
export async function markOneRegistrationReadAction(registrationId: string) {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, error: 'Not authenticated.' }

    const supabaseAdmin = createServiceClient()
    const { error } = await supabaseAdmin
      .from('s_registration_reads')
      .upsert({ user_id: caller.id, registration_id: registrationId }, { onConflict: 'user_id,registration_id' })

    if (error) {
      if (isMissingTableError(error)) {
        return { success: false, error: 'Read-tracking table missing — run Database/migration-006-registration-reads.sql first.' }
      }
      throw error
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error marking registration read:', error)
    return { success: false, error: error.message || 'Failed to mark as read.' }
  }
}

/**
 * §7/§8: company-wide view for IT/CEO/GC and Operation Manager,
 * own-downline-only for a sales-tier caller (§4 walling — always
 * includes the caller's own submissions too, not just their
 * downline's). `canMarkDone` tells the client whether to show the
 * "Mark Done" action at all — true ONLY for Operation Manager (§7d).
 * Director and IT/CEO/GC see registrations read-only now; the approval
 * right was centralized to Operation Manager specifically so it's never
 * ambiguous who actually confirmed a registration.
 */
export async function getRegistrationsAction() {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, data: [], canMarkDone: false, companyWide: false, error: 'Not authenticated.' }

    const supabaseAdmin = createServiceClient()

    let query = supabaseAdmin
      .from('s_new_registrations')
      .select(`
        id, plot_size_sqyd, base_price_at_submission, mrp_at_submission,
        customer_name, customer_phone, status, payment_status,
        submitted_by, submitted_at,
        registration_done_by, registration_done_at,
        cancelled_at, refund_status,
        s_areas ( name ),
        s_projects ( name ),
        seller:s_realestate_users!submitted_by ( full_name, role )
      `)
      .order('submitted_at', { ascending: false })

    const canMarkDone = isOperationManager(caller.role)
    const companyWide = isAdminPeer(caller.role) || isOperationManager(caller.role)

    if (!companyWide) {
      if (!isSalesRole(caller.role)) {
        return { success: false, data: [], canMarkDone: false, companyWide: false, error: 'Not available for this role.' }
      }
      const downlineIds = await getDownlineIds(supabaseAdmin, caller.id)
      query = query.in('submitted_by', [caller.id, ...downlineIds])
    }

    const { data, error } = await query
    if (error) throw error

    // Tag each row with this user's own read state so the page can show
    // an unread dot and a per-row "mark read" control. Only pending rows
    // ever count toward the badge, so non-pending ones are reported as
    // read regardless.
    const rows = data || []
    let readIds = new Set<string>()
    const pendingIds = rows.filter((r: any) => r.status === 'pending_registration').map((r: any) => r.id as string)

    if (pendingIds.length > 0) {
      const { data: reads, error: readsError } = await supabaseAdmin
        .from('s_registration_reads')
        .select('registration_id')
        .eq('user_id', caller.id)
        .in('registration_id', pendingIds)

      // Migration 006 not applied yet — treat everything as unread
      // rather than failing the whole page load.
      if (readsError && !isMissingTableError(readsError)) throw readsError
      readIds = new Set((reads || []).map((r: any) => r.registration_id as string))
    }

    const withReadState = rows.map((r: any) => ({
      ...r,
      isRead: r.status !== 'pending_registration' || readIds.has(r.id),
    }))

    return { success: true, data: withReadState, canMarkDone, companyWide }
  } catch (error: any) {
    console.error('Error fetching registrations:', error)
    return { success: false, data: [], canMarkDone: false, companyWide: false, error: error.message }
  }
}

/**
 * §3c step 8 / §7d: a single action that both records registration
 * completion and authorizes commission release, starting the 48h
 * payout clock. Authorized callers: Operation Manager, and ONLY
 * Operation Manager — not Director, not IT/CEO/GC. Centralizing this
 * to one role means it's never ambiguous who actually confirmed a
 * registration really happened. Gated on payment_status === 'paid'
 * (§3c: payment must precede Registration Done). Immediately runs the
 * §3b payout engine on success — see payout-engine.ts.
 */
export async function markRegistrationDoneAction(registrationId: string) {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, error: 'Not authenticated.' }
    if (!isOperationManager(caller.role)) {
      return { success: false, error: 'Only the Operation Manager can mark a registration done.' }
    }

    const supabaseAdmin = createServiceClient()

    const { data: registration, error: fetchError } = await supabaseAdmin
      .from('s_new_registrations')
      .select('status, submitted_by, payment_status')
      .eq('id', registrationId)
      .single()

    if (fetchError || !registration) {
      return { success: false, error: 'Registration not found.' }
    }
    if (registration.status !== 'pending_registration') {
      return { success: false, error: `This registration is already "${registration.status}" — cannot mark it done again.` }
    }
    if (registration.payment_status !== 'paid') {
      return { success: false, error: 'The customer has not completed payment yet.' }
    }

    // The two .eq()s above (status/payment_status) are the real guard,
    // not the read-then-check above — that read is only for a friendly
    // error message. Two concurrent "Mark Done" clicks (a double-click,
    // or two tabs) can both pass the read-side check before either
    // writes; without a condition on the UPDATE itself, both would then
    // proceed to runCommissionPayout() and every payee would be paid
    // twice for one sale. Postgres only lets one of two concurrent
    // UPDATEs matching the same row through as an actual row change —
    // the second one's WHERE no longer matches once the first commits,
    // so .select().maybeSingle() coming back empty here is the reliable
    // signal that this call lost the race, not a re-check of state
    // already read above.
    const { data: updated, error } = await supabaseAdmin
      .from('s_new_registrations')
      .update({
        status: 'registration_done',
        registration_done_by: caller.id,
        registration_done_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .eq('status', 'pending_registration')
      .eq('payment_status', 'paid')
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!updated) {
      return { success: false, error: 'This registration was already marked done (possibly by another tab or user) — commission payouts were not duplicated.' }
    }

    const payoutResult = await runCommissionPayout(supabaseAdmin, registrationId)
    if (!payoutResult.success) {
      console.error('Payout computation failed after marking registration done:', payoutResult.error)
      return { success: true, message: `Registration marked done, but commission payout calculation failed (contact IT): ${payoutResult.error}` }
    }

    return { success: true, message: 'Registration marked done. Commission payouts have been calculated (rounded up to the nearest rupee) and scheduled within 48 hours.' }
  } catch (error: any) {
    console.error('Error marking registration done:', error)
    return { success: false, error: error.message || 'Failed to update registration.' }
  }
}

/**
 * §3c steps 1-5: the New Registration form submission. Only a
 * sales-tier caller (Director→LIA) can submit one. The Project must be
 * one actually assigned (directly or via Director-inheritance, §5) to
 * this seller's Director. Base Price/MRP are snapshotted at submission
 * time (§3d/§6), not read live later. A returning customer (matched by
 * phone) reuses their existing account instead of a duplicate.
 */
export async function createRegistrationAction(input: {
  areaId: string
  projectId: string
  plotSizeSqyd: number
  customerName: string
  customerPhone: string
  customerEmail: string
  customerAddress?: string
  mrpOverride?: number
}) {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, error: 'Not authenticated.' }
    if (!isSalesRole(caller.role)) return { success: false, error: 'Only sales-tier roles can submit a New Registration.' }

    if (!input.plotSizeSqyd || input.plotSizeSqyd <= 0) {
      return { success: false, error: 'Enter a valid plot size.' }
    }
    if (!input.customerName?.trim() || !input.customerPhone?.trim() || !input.customerEmail?.trim()) {
      return { success: false, error: 'Customer name, phone, and email are required.' }
    }

    const supabaseAdmin = createServiceClient()

    const directorId = await findUplineDirectorId(supabaseAdmin, caller.id, caller.role)
    if (!directorId) {
      return { success: false, error: 'No Director found in your chain — cannot determine which Projects you may sell.' }
    }

    const { data: assignment } = await supabaseAdmin
      .from('s_director_projects')
      .select('project_id')
      .eq('director_id', directorId)
      .eq('project_id', input.projectId)
      .maybeSingle()
    if (!assignment) {
      return { success: false, error: 'This Project is not assigned to your Director — you cannot sell it.' }
    }

    const { data: project } = await supabaseAdmin.from('s_projects').select('id, area_id, base_price, mrp_default').eq('id', input.projectId).single()
    if (!project) return { success: false, error: 'Project not found.' }
    if (project.area_id !== input.areaId) return { success: false, error: 'Area/Project mismatch.' }
    if (project.base_price == null || Number(project.base_price) <= 0) {
      return { success: false, error: 'This project has no valid Base Price set yet — ask IT, CEO, or Governing Council to set one before submitting a sale.' }
    }

    const mrp = input.mrpOverride ?? project.mrp_default
    if (mrp == null || Number(mrp) <= 0) {
      return { success: false, error: 'No valid MRP set for this project — enter one, or ask IT/CEO/GC to set a default.' }
    }

    // Reuse an existing customer profile by phone rather than creating a
    // duplicate (S_realestate_users.phone is UNIQUE) — a returning
    // customer buying a second plot gets one login for both.
    let customerUserId: string
    const { data: existingCustomer } = await supabaseAdmin.from('s_realestate_users').select('id').eq('phone', input.customerPhone).eq('role', 'customer').maybeSingle()

    if (existingCustomer) {
      customerUserId = existingCustomer.id
    } else {
      // Every Supabase Auth account (staff and customers alike) needs a
      // globally unique email — check upfront rather than letting the
      // create call fail, so the seller gets a clear, specific message
      // instead of a raw Auth API error string.
      const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      const emailTaken = (authUsersData?.users || []).some((u: any) => u.email?.toLowerCase() === input.customerEmail.trim().toLowerCase())
      if (emailTaken) {
        return { success: false, error: 'This email already exists — please use a different email for this customer.' }
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: input.customerEmail,
        email_confirm: true,
        user_metadata: { full_name: input.customerName, raw_phone: input.customerPhone },
      })
      if (authError || !authData.user) {
        const isDuplicateEmail = /already|exist|registered/i.test(authError?.message || '')
        return {
          success: false,
          error: isDuplicateEmail
            ? 'This email already exists — please use a different email for this customer.'
            : `Could not create the customer's account: ${authError?.message || 'unknown error'}`,
        }
      }

      const { error: profileError } = await supabaseAdmin.from('s_realestate_users').insert({
        id: authData.user.id,
        phone: input.customerPhone,
        full_name: input.customerName,
        role: 'customer',
        parent_id: null,
        is_active: true,
      })
      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: `Could not create the customer's profile: ${profileError.message}` }
      }

      customerUserId = authData.user.id

      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: input.customerEmail,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/REALESTATE_SOFTWARE/password/set-password` },
      })
      if (linkData?.properties?.action_link) {
        await sendSetupPasswordEmail(input.customerEmail, input.customerName, linkData.properties.action_link)
      }
    }

    const { error: insertError } = await supabaseAdmin.from('s_new_registrations').insert({
      area_id: input.areaId,
      project_id: input.projectId,
      plot_size_sqyd: input.plotSizeSqyd,
      base_price_at_submission: project.base_price,
      mrp_at_submission: mrp,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail,
      customer_address: input.customerAddress || null,
      submitted_by: caller.id,
      customer_user_id: customerUserId,
    })
    if (insertError) throw insertError

    return { success: true, message: 'Registration submitted. It now appears in your Director’s Registrations queue.' }
  } catch (error: any) {
    console.error('Error creating registration:', error)
    return { success: false, error: error.message || 'Failed to submit registration.' }
  }
}

/**
 * §3d: the seller or the customer can cancel any time before
 * Registration Done. If payment was already marked paid, this sets
 * refund_status to 'pending' (manual stub — no automated refund gateway
 * is wired up, §6's refund mechanics are still undesigned) rather than
 * processing anything automatically.
 */
export async function cancelRegistrationAction(registrationId: string) {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, error: 'Not authenticated.' }

    const supabaseAdmin = createServiceClient()
    const { data: registration } = await supabaseAdmin
      .from('s_new_registrations')
      .select('status, submitted_by, customer_user_id, payment_status')
      .eq('id', registrationId)
      .single()

    if (!registration) return { success: false, error: 'Registration not found.' }
    if (registration.status !== 'pending_registration') {
      return { success: false, error: 'This registration can no longer be cancelled.' }
    }

    const isSeller = registration.submitted_by === caller.id
    const isCustomer = registration.customer_user_id === caller.id
    if (!isSeller && !isCustomer) {
      return { success: false, error: 'Not authorized to cancel this registration.' }
    }

    const refundStatus = registration.payment_status === 'paid' ? 'pending' : 'not_applicable'

    const { error } = await supabaseAdmin
      .from('s_new_registrations')
      .update({ status: 'cancelled', cancelled_by: caller.id, cancelled_at: new Date().toISOString(), refund_status: refundStatus })
      .eq('id', registrationId)
    if (error) throw error

    return {
      success: true,
      message: refundStatus === 'pending' ? 'Registration cancelled. A refund is now pending — contact IT/CEO/Governing Council to process it.' : 'Registration cancelled.',
    }
  } catch (error: any) {
    console.error('Error cancelling registration:', error)
    return { success: false, error: error.message || 'Failed to cancel registration.' }
  }
}

/** Customer-only: flips payment_status to 'paid' (§3c step 6's manual
 * stub — no payment gateway wired up, see the ADR note on this module's
 * README/HIERARCHY §6). Unlocks the Director's "Registration Done"
 * button, which itself is gated on payment_status === 'paid' above. */
export async function markPaymentPaidAction(registrationId: string) {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, error: 'Not authenticated.' }
    if (caller.role !== 'customer') return { success: false, error: 'Only the customer can confirm their own payment.' }

    const supabaseAdmin = createServiceClient()
    const { data: registration } = await supabaseAdmin
      .from('s_new_registrations')
      .select('customer_user_id, status, payment_status')
      .eq('id', registrationId)
      .single()

    if (!registration) return { success: false, error: 'Registration not found.' }
    if (registration.customer_user_id !== caller.id) return { success: false, error: 'Not authorized.' }
    if (registration.status !== 'pending_registration') return { success: false, error: 'This registration is no longer pending.' }
    if (registration.payment_status === 'paid') return { success: false, error: 'Already marked as paid.' }

    const { error } = await supabaseAdmin.from('s_new_registrations').update({ payment_status: 'paid' }).eq('id', registrationId)
    if (error) throw error

    return { success: true, message: 'Payment recorded. Your registration now moves to your Director for completion.' }
  } catch (error: any) {
    console.error('Error marking payment paid:', error)
    return { success: false, error: error.message || 'Failed to record payment.' }
  }
}
