// Shared role/permission model for REALESTATE_SOFTWARE.
//
// Implements ../Doubts/HIERARCHY.md §2 (creation/management rights) and
// §4 (CEO-visibility exception). This is the single source of truth for
// "who can create/manage/see whom" — server actions should call these
// helpers rather than re-implementing role checks inline.
//
// NOT covered here: §4's per-tier downline walling (a Director only
// seeing their own Sr.Core-through-LIA team, not another Director's).
// That's instance-based (depends on the actual s_realestate_users.parent_id
// chain for a specific person), not a static role-pair rule, so it belongs
// in the data-fetching layer (a query scoped by parent_id / an upline walk),
// not in this file.

export type RealEstateRole =
  | 'it'
  | 'ceo'
  | 'governing_council'
  | 'operation_manager'
  | 'director'
  | 'sr_core'
  | 'core'
  | 'gm'
  | 'agm'
  | 'rm'
  | 'lio'
  | 'lia'
  | 'customer';

// Admin peers (§2): IT, CEO, and Governing Council can create/manage any
// role, including each other. Not part of the sales downline tree.
// Operation Manager is deliberately NOT a peer — it's a standalone,
// narrower role (§7d): the sole company-wide approver for Registration
// Done and Payout completion, nothing else. It can't create/manage
// anyone, doesn't earn commission, and has no downline.
export const ADMIN_PEER_ROLES: readonly RealEstateRole[] = ['it', 'ceo', 'governing_council'];

export function isAdminPeer(role: RealEstateRole): boolean {
  return (ADMIN_PEER_ROLES as RealEstateRole[]).includes(role);
}

/** Only Operation Manager can click "Registration Done" (registrations)
 * or "Mark Paid" (payouts) — not Director, not IT/CEO/GC. A standing
 * rule referenced from both action files rather than repeating the
 * string comparison. */
export function isOperationManager(role: RealEstateRole): boolean {
  return role === 'operation_manager';
}

// Human-readable labels — single source so every page/component shows
// the same names (§1's rank-order table).
export const ROLE_LABELS: Record<RealEstateRole, string> = {
  it: 'IT Admin',
  ceo: 'CEO',
  governing_council: 'Governing Council',
  operation_manager: 'Operation Manager',
  director: 'Director',
  sr_core: 'Sr. Core',
  core: 'Core',
  gm: 'GM',
  agm: 'AGM',
  rm: 'RM',
  lio: 'LIO',
  lia: 'LIA',
  customer: 'Customer',
};

// Sales-tier rank order, top to bottom (§1/§2). Lower index = higher
// rank. Director-through-LIA only — admin peers aren't ranked against
// this chain or against each other.
export const SALES_RANK_ORDER: readonly RealEstateRole[] = [
  'director',
  'sr_core',
  'core',
  'gm',
  'agm',
  'rm',
  'lio',
  'lia',
];

function salesRank(role: RealEstateRole): number {
  return SALES_RANK_ORDER.indexOf(role);
}

export function isSalesRole(role: RealEstateRole): boolean {
  return salesRank(role) !== -1;
}

// Commission-eligible roles (§3a) — the sales chain plus CEO and
// Governing Council. IT and Customer are never paid.
export function isCommissionEligible(role: RealEstateRole): boolean {
  return isSalesRole(role) || role === 'ceo' || role === 'governing_council';
}

/**
 * §2: can `callerRole` create/manage a profile with `targetRole`?
 *
 * - IT / CEO / Governing Council are peers: can create anyone, including
 *   each other.
 * - Director-through-LIA: strict downward cascade only — can create any
 *   role with a strictly lower rank (higher index in SALES_RANK_ORDER)
 *   than themselves. Never upward, never a peer at the same tier.
 * - Anything else (e.g. a sales role targeting an admin role, or
 *   Customer) is false.
 */
export function canCreateRole(callerRole: RealEstateRole, targetRole: RealEstateRole): boolean {
  if (isAdminPeer(callerRole)) {
    return true;
  }
  const callerRank = salesRank(callerRole);
  const targetRank = salesRank(targetRole);
  if (callerRank === -1 || targetRank === -1) return false;
  return targetRank > callerRank;
}

// §2's assumed rule: whatever a role can create, it can also
// edit/deactivate/delete. Same check — kept as a separate export for
// call-site clarity (createExecutiveAction vs. updateExecutiveAction, etc.).
export const canManageRole = canCreateRole;

/**
 * §4: is a profile with `subjectRole` visible to `viewerRole` at all?
 * The one role-level exception in this system: CEO is hidden from
 * Director-and-below, even though every other role is visible to anyone
 * who has reason to see it (subject to the separate downline-walling
 * check for sales roles, not covered here — see file header).
 */
export function canViewRole(viewerRole: RealEstateRole, subjectRole: RealEstateRole): boolean {
  if (subjectRole === 'ceo') {
    return isAdminPeer(viewerRole);
  }
  return true;
}
