// Shared s_realestate_users.parent_id tree-walking helpers — used by
// user-management (downline scoping, §4), the commission payout engine
// (upline chain, §3b), and the registrations/dashboard scoping for
// sales-tier pages (§8). Single source so the walk logic isn't
// reimplemented per caller.

import { createServiceClient } from '@/lib/supabase/server'
import { isSalesRole, type RealEstateRole } from './permissions'

type ServiceClient = ReturnType<typeof createServiceClient>

/** Walks parent_id downward from `rootId`, returning every descendant id
 * (the whole downline, not just direct reports) — HIERARCHY.md §4's
 * per-tier walling. Iterative BFS, not recursive SQL — the sales chain
 * is bounded (at most 8 tiers, Director→LIA). */
export async function getDownlineIds(supabaseAdmin: ServiceClient, rootId: string): Promise<string[]> {
  const ids: string[] = []
  let frontier = [rootId]
  while (frontier.length > 0) {
    const { data } = await supabaseAdmin.from('s_realestate_users').select('id').in('parent_id', frontier)
    const nextIds = (data || []).map((r: any) => r.id as string)
    ids.push(...nextIds)
    frontier = nextIds
  }
  return ids
}

/** Walks parent_id upward from `sellerId`, collecting each ancestor's
 * {id, role} for as long as the ancestor is still a sales-tier role
 * (§1's Director→LIA chain). Stops at the first non-sales ancestor (an
 * admin peer who created the topmost sales person, or no parent at all)
 * — admin peers aren't part of this tree (§2). Always appends the single
 * active Governing Council member then the single active CEO at the top,
 * regardless of where the parent_id walk stopped: HIERARCHY.md §3b is
 * explicit that "CEO's cut is computed on every sale," and §1 that GC/
 * CEO sit structurally above every Director — that's an organizational
 * fact, not something parent_id alone can be relied on to encode, since
 * a Director may have literally been created by IT rather than GC.
 *
 * `sellerRole` matters here beyond just being the starting point of the
 * walk: if the SELLER themselves is already Governing Council or CEO
 * (both can now submit a New Registration directly), the "always
 * append GC/CEO" step below must not re-add someone already at or above
 * the seller's own rank — the `chain.some(...)` check alone only looks
 * at walked ANCESTORS, not the seller's own role.
 *
 * A CEO seller needs BOTH skipped, not just CEO itself: CEO is the apex
 * of the whole hierarchy, so nothing — not even Governing Council — sits
 * above them on their own sale. Skipping only the CEO append and still
 * appending GC would fix the literal duplicate-CEO-payout bug but leave
 * a spurious, structurally meaningless Governing Council line on every
 * CEO sale (harmless in raw rupees, since clampNonNegative floors its
 * marginal percentage to 0 when GC's 26% comes after CEO's 28% in the
 * chain — but it's still a payout row that shouldn't exist, since GC
 * had nothing to do with the sale). A Governing Council seller only
 * needs GC itself skipped — CEO is still genuinely above GC, and still
 * earns a real marginal cut on a GC seller's own sale. */
export async function getUplineChain(
  supabaseAdmin: ServiceClient,
  sellerId: string,
  sellerRole: RealEstateRole
): Promise<{ id: string; role: RealEstateRole }[]> {
  const chain: { id: string; role: RealEstateRole }[] = []
  let currentId = sellerId

  while (true) {
    const { data: current } = await supabaseAdmin.from('s_realestate_users').select('parent_id').eq('id', currentId).single()
    if (!current?.parent_id) break

    const { data: parent } = await supabaseAdmin.from('s_realestate_users').select('id, role').eq('id', current.parent_id).single()
    if (!parent || !isSalesRole(parent.role as RealEstateRole)) break

    chain.push({ id: parent.id, role: parent.role as RealEstateRole })
    currentId = parent.id
  }

  const alreadyHasGC = sellerRole === 'governing_council' || sellerRole === 'ceo' || chain.some((c) => c.role === 'governing_council')
  const alreadyHasCEO = sellerRole === 'ceo' || chain.some((c) => c.role === 'ceo')

  if (!alreadyHasGC) {
    const { data: gc } = await supabaseAdmin.from('s_realestate_users').select('id').eq('role', 'governing_council').eq('is_active', true).limit(1).maybeSingle()
    if (gc) chain.push({ id: gc.id, role: 'governing_council' })
  }
  if (!alreadyHasCEO) {
    const { data: ceo } = await supabaseAdmin.from('s_realestate_users').select('id').eq('role', 'ceo').eq('is_active', true).limit(1).maybeSingle()
    if (ceo) chain.push({ id: ceo.id, role: 'ceo' })
  }

  return chain
}

/** Finds the nearest Director in `personId`'s own chain — themselves if
 * they already are one, otherwise the first sales-tier ancestor with
 * role='director' walking up via parent_id. Used to gate "Registration
 * Done" (§3c/§8a — only the seller's own upline Director, not any
 * Director company-wide) and to resolve which Project(s) a non-Director
 * seller may pick from on the New Registration form (§5's "whole
 * downline inherits the Director's Project assignments"). Returns null
 * if no Director is found in the chain (shouldn't happen for a real
 * sales-tier account, but a caller should treat null as "no projects
 * available" rather than throwing). */
export async function findUplineDirectorId(supabaseAdmin: ServiceClient, personId: string, personRole: RealEstateRole): Promise<string | null> {
  if (personRole === 'director') return personId

  let currentId = personId
  while (true) {
    const { data: current } = await supabaseAdmin.from('s_realestate_users').select('parent_id').eq('id', currentId).single()
    if (!current?.parent_id) return null

    const { data: parent } = await supabaseAdmin.from('s_realestate_users').select('id, role').eq('id', current.parent_id).single()
    if (!parent) return null
    if (parent.role === 'director') return parent.id
    if (!isSalesRole(parent.role as RealEstateRole)) return null

    currentId = parent.id
  }
}
