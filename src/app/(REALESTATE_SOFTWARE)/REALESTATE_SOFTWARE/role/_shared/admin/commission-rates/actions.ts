'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyCaller } from '../../auth'
import { isAdminPeer } from '../../permissions'

export async function getCommissionRatesAction() {
  try {
    const supabaseAdmin = createServiceClient()
    const { data, error } = await supabaseAdmin
      .from('s_commission_rates')
      .select('role, percentage, updated_by, updated_at, updater:s_realestate_users!updated_by(full_name)')

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('Error fetching commission rates:', error)
    return { success: false, data: [] }
  }
}

/** §2 peer rule: writable by it/ceo/governing_council only. Verified
 * against the real session (not a client-supplied role) — see
 * ../../auth.ts's verifyCaller for why that matters. */
async function requireAdminPeer() {
  const caller = await verifyCaller()
  if (!caller || !isAdminPeer(caller.role)) {
    return { ok: false as const, error: 'Only IT, CEO, or Governing Council can manage commission rates.' };
  }
  return { ok: true as const, id: caller.id };
}

export async function updateCommissionRateAction(role: string, percentage: number) {
  try {
    const verified = await requireAdminPeer();
    if (!verified.ok) return { success: false, error: verified.error };

    if (percentage < 0 || percentage > 100) {
      return { success: false, error: 'Percentage must be between 0 and 100.' }
    }

    const supabaseAdmin = createServiceClient()
    const { error } = await supabaseAdmin
      .from('s_commission_rates')
      .update({ percentage, updated_by: verified.id, updated_at: new Date().toISOString() })
      .eq('role', role)

    if (error) throw error

    return { success: true, message: `Updated ${role.replace('_', ' ')} to ${percentage}%.` }
  } catch (error: any) {
    console.error('Error updating commission rate:', error)
    return { success: false, error: error.message || 'Failed to update rate.' }
  }
}

/** Adds a rate row for a role that doesn't currently have one — normally
 * unnecessary (all 10 sales-eligible roles are seeded on schema setup),
 * but kept as an explicit recovery path rather than requiring a manual
 * SQL insert if a row is ever missing. */
export async function createCommissionRateAction(role: string, percentage: number) {
  try {
    const verified = await requireAdminPeer();
    if (!verified.ok) return { success: false, error: verified.error };

    if (percentage < 0 || percentage > 100) {
      return { success: false, error: 'Percentage must be between 0 and 100.' }
    }

    const supabaseAdmin = createServiceClient()
    const { error } = await supabaseAdmin
      .from('s_commission_rates')
      .insert({ role, percentage, updated_by: verified.id })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This role already has a rate — edit it instead.' }
      }
      throw error
    }

    return { success: true, message: `Added ${role.replace('_', ' ')} at ${percentage}%.` }
  } catch (error: any) {
    console.error('Error creating commission rate:', error)
    return { success: false, error: error.message || 'Failed to add rate.' }
  }
}

/** Deletes a rate row entirely. Confirmed dangerous on purpose — a role
 * with no rate row is excluded from computeCommissionBreakdown (it just
 * skips roles missing from the rates map, see commission.ts), so
 * deleting a rate silently removes that tier from every future payout,
 * not just this page. The UI makes the caller confirm explicitly. */
export async function deleteCommissionRateAction(role: string) {
  try {
    const verified = await requireAdminPeer();
    if (!verified.ok) return { success: false, error: verified.error };

    const supabaseAdmin = createServiceClient()
    const { error } = await supabaseAdmin
      .from('s_commission_rates')
      .delete()
      .eq('role', role)

    if (error) throw error

    return { success: true, message: `Removed the rate for ${role.replace('_', ' ')}.` }
  } catch (error: any) {
    console.error('Error deleting commission rate:', error)
    return { success: false, error: error.message || 'Failed to delete rate.' }
  }
}
