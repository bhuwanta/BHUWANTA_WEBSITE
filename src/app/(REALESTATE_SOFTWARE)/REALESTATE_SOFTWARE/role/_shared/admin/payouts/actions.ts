'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyCaller } from '../../auth'
import { isAdminPeer, isOperationManager } from '../../permissions'

/** IT/CEO/Governing Council keep read-only company-wide visibility into
 * the payout queue (oversight, same as Registrations §7), but ONLY
 * Operation Manager can act on it (§7d) — see requireOperationManager
 * below. This is the disbursement side of the pipeline: the payout
 * engine (payout-engine.ts) only ever writes rows as 'pending' —
 * nothing else moves them forward, since there's no real payment
 * gateway wired up (same reason customer payment is a manual "Mark as
 * Paid" stub, not real Razorpay). */
async function requireCanViewPayouts() {
  const caller = await verifyCaller()
  if (!caller || !(isAdminPeer(caller.role) || isOperationManager(caller.role))) {
    return { ok: false as const, error: 'Only IT, CEO, Governing Council, or Operation Manager can view payouts.' }
  }
  return { ok: true as const, role: caller.role }
}

/** The sole authorized approver for actually marking a payout paid. */
async function requireOperationManager() {
  const caller = await verifyCaller()
  if (!caller || !isOperationManager(caller.role)) {
    return { ok: false as const, error: 'Only the Operation Manager can approve payouts.' }
  }
  return { ok: true as const, id: caller.id }
}

/** Per-sale totals the Payouts page needs (total distributed, how many
 * lines are still pending) — computed here, server-side, from the DB
 * rows. The page groups/displays these; it never sums or counts money
 * itself. Keyed by registration id. */
export interface SaleTotals {
  totalDistributed: number
  pendingCount: number
  lineCount: number
}

export async function getAllPayoutsAction() {
  try {
    const verified = await requireCanViewPayouts()
    if (!verified.ok) return { success: false, data: [] as any[], saleTotals: {} as Record<string, SaleTotals>, canApprove: false, error: verified.error }

    const supabaseAdmin = createServiceClient()
    const { data, error } = await supabaseAdmin
      .from('s_sales_payouts')
      .select(`
        id, role, commission_percentage, tier_percentage, previous_tier_percentage, computed_amount, amount, payout_status, scheduled_for, processed_at, created_at,
        payee:s_realestate_users!payee_id ( full_name ),
        s_new_registrations (
          id, plot_size_sqyd, submitted_at,
          s_projects ( name ),
          seller:s_realestate_users!submitted_by ( full_name, role )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const rows = data || []
    const saleTotals: Record<string, SaleTotals> = {}
    for (const row of rows as any[]) {
      const regId = row.s_new_registrations?.id
      if (!regId) continue
      if (!saleTotals[regId]) saleTotals[regId] = { totalDistributed: 0, pendingCount: 0, lineCount: 0 }
      saleTotals[regId].totalDistributed += Number(row.amount)
      saleTotals[regId].lineCount += 1
      if (row.payout_status === 'pending' || row.payout_status === 'processing') saleTotals[regId].pendingCount += 1
    }

    return { success: true, data: rows, saleTotals, canApprove: isOperationManager(verified.role) }
  } catch (error: any) {
    console.error('Error fetching all payouts:', error)
    return { success: false, data: [] as any[], saleTotals: {} as Record<string, SaleTotals>, canApprove: false, error: error.message }
  }
}

/** Marks one payout row as actually paid — the manual stub for real
 * disbursement. Sets processed_at to now; doesn't touch anyone else's
 * rows for the same registration (each payee's line is disbursed
 * independently, not all-or-nothing per sale). */
export async function markPayoutCompletedAction(payoutId: string) {
  try {
    const verified = await requireOperationManager()
    if (!verified.ok) return { success: false, error: verified.error }

    const supabaseAdmin = createServiceClient()
    const { data: payout } = await supabaseAdmin.from('s_sales_payouts').select('payout_status').eq('id', payoutId).single()
    if (!payout) return { success: false, error: 'Payout not found.' }
    if (payout.payout_status === 'completed') return { success: false, error: 'Already marked completed.' }

    const { error } = await supabaseAdmin
      .from('s_sales_payouts')
      .update({ payout_status: 'completed', processed_at: new Date().toISOString() })
      .eq('id', payoutId)

    if (error) throw error
    return { success: true, message: 'Payout marked as paid.' }
  } catch (error: any) {
    console.error('Error marking payout completed:', error)
    return { success: false, error: error.message || 'Failed to update payout.' }
  }
}
