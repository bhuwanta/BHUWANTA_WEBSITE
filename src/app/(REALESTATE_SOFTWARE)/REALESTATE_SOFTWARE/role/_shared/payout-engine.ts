'use server'

// Commission payout engine — HIERARCHY.md §3b/§10 item 3. Triggered by
// markRegistrationDoneAction (registrations/actions.ts) the moment a
// registration's status flips to 'registration_done'. Walks the
// seller's real upline chain, applies the tiered-percentage-difference
// formula (commission.ts, pure/no I/O), and writes one S_sales_payouts
// row per participant.

import { createServiceClient } from '@/lib/supabase/server'
import { getUplineChain } from './downline'
import { computeCommissionBreakdown, computePool, type CommissionRatesMap } from './commission'
import type { RealEstateRole } from './permissions'

type ServiceClient = ReturnType<typeof createServiceClient>

const PAYOUT_DELAY_MS = 48 * 60 * 60 * 1000 // 48h, §3c step 10

export async function runCommissionPayout(supabaseAdmin: ServiceClient, registrationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: registration, error: regError } = await supabaseAdmin
      .from('s_new_registrations')
      .select('plot_size_sqyd, base_price_at_submission, submitted_by, seller:s_realestate_users!submitted_by(role)')
      .eq('id', registrationId)
      .single()

    if (regError || !registration) {
      return { success: false, error: 'Registration not found for payout calculation.' }
    }

    const sellerRole = (registration.seller as any)?.role as RealEstateRole | undefined
    if (!sellerRole) {
      return { success: false, error: 'Could not resolve seller role for payout calculation.' }
    }

    const pool = computePool(Number(registration.plot_size_sqyd), Number(registration.base_price_at_submission))
    if (pool <= 0) {
      return { success: false, error: 'Commission pool is zero or invalid (check plot size and Base Price) — no payouts created.' }
    }

    const uplineChain = await getUplineChain(supabaseAdmin, registration.submitted_by, sellerRole)

    const { data: ratesData } = await supabaseAdmin.from('s_commission_rates').select('role, percentage')
    const rates: CommissionRatesMap = {}
    ;(ratesData || []).forEach((r: any) => {
      rates[r.role as RealEstateRole] = Number(r.percentage)
    })

    // Filter the seller + chain down to only roles that actually have a
    // rate set, BEFORE calling computeCommissionBreakdown — that keeps
    // this array's indices aligned 1:1 with the returned CommissionLine
    // array, so payee_id can be zipped in by position without the two
    // silently drifting apart if e.g. a rate was deleted (commission-
    // rates/actions.ts's deleteCommissionRateAction) for a role
    // mid-chain.
    const fullChain: { id: string; role: RealEstateRole }[] = [{ id: registration.submitted_by, role: sellerRole }, ...uplineChain]
    const eligibleChain = fullChain.filter((p) => rates[p.role] != null)

    if (eligibleChain.length === 0) {
      return { success: false, error: 'No commission-eligible roles with a rate set in this chain — no payouts created.' }
    }

    const lines = computeCommissionBreakdown(
      eligibleChain[0].role,
      eligibleChain.slice(1).map((c) => c.role),
      pool,
      rates
    )

    const scheduledFor = new Date(Date.now() + PAYOUT_DELAY_MS).toISOString()

    const rows = lines.map((line, i) => ({
      registration_id: registrationId,
      payee_id: eligibleChain[i].id,
      role: line.role,
      commission_percentage: line.percentage,
      tier_percentage: line.tierPercentage,
      previous_tier_percentage: line.previousTierPercentage,
      computed_amount: line.rawAmount,
      amount: line.amount,
      payout_status: 'pending' as const,
      scheduled_for: scheduledFor,
    }))

    const { error: insertError } = await supabaseAdmin.from('s_sales_payouts').insert(rows)
    if (insertError) {
      // 23505 = unique_violation on (registration_id, payee_id) —
      // migration 007's dedup constraint. Reaching this means payouts
      // for this registration already exist (e.g. this function somehow
      // got invoked twice for the same sale); treat it as already-done
      // rather than a failure, so the caller doesn't surface a scary
      // error for something that isn't actually broken.
      if (insertError.code === '23505') {
        return { success: true }
      }
      console.error('Error writing payout rows:', insertError)
      return { success: false, error: insertError.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error running commission payout:', error)
    return { success: false, error: error.message || 'Failed to compute payouts.' }
  }
}
