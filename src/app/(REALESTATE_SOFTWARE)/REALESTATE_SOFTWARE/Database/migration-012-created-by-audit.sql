-- Migration 012 — created_by audit trail on S_realestate_users, and an
-- auto-populated Director -> Governing Council assignment at creation
-- time.
--
-- Two gaps this closes:
--
-- 1. "Who created this account" was only ever inferable for sales-tier
--    roles, via parent_id (createExecutiveAction sets parent_id =
--    callerId for everyone EXCEPT admin peers/Operation Manager, since
--    parent_id also drives the downline "wing" tree and org-chart edges
--    for those roles). Admin peers (it/ceo/governing_council) and
--    Operation Manager always get parent_id = NULL — correctly, since
--    e.g. every Governing Council member is conceptually a child of
--    "the Company" (every active CEO), not of whichever specific CEO
--    happened to create them (HierarchyGraph.tsx already renders that
--    as a multi-parent edge). But that same NULL means there has never
--    been ANY record of who actually created an IT/CEO/GC/Operation
--    Manager account. created_by is a separate, audit-only column —
--    it never feeds the org chart or the downline tree, only "who did
--    this."
--
-- 2. A Director created directly by a Governing Council member should
--    start already assigned to that GC's wing (S_director_gc, migration
--    011) rather than landing in "Unassigned Directors" and waiting for
--    a manual fix on the Payout Rules page. A Director created by IT or
--    CEO directly (bypassing any GC) still has no GC to infer, so still
--    starts unassigned, same as today — that gap stays visible on
--    purpose (HIERARCHY.md's existing "don't guess" rule).
--
-- Both are additive: existing rows are untouched, nothing here changes
-- payout behavior for a single sale already recorded.

ALTER TABLE public.S_realestate_users
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.S_realestate_users(id);

COMMENT ON COLUMN public.S_realestate_users.created_by IS
  'Audit-only: who actually created this account. Distinct from parent_id, which drives the downline/org-chart tree and is NULL for admin peers (it/ceo/governing_council) and Operation Manager by design — those roles are not part of that tree, but this column still records their real creator.';
