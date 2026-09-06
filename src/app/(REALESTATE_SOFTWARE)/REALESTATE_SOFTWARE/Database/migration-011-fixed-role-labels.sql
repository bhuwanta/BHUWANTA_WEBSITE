-- Migration 011 — fixed-role labels, and Governing Council becomes a
-- real position in the org tree instead of "everyone in that role"
--
-- Context: the 5 fixed roles (it, ceo, governing_council,
-- operation_manager, customer) have only ever had a hardcoded display
-- label (ROLE_LABELS in permissions.ts) — unlike the 8 sales tiers,
-- which got S_role_definitions in migration 008. That's why CEO
-- couldn't be renamed to "Company" and Governing Council couldn't be
-- renamed at all on the Roles / Commissions page: there was no row to
-- write to.
--
-- Separately, Governing Council was paid on EVERY sale in the company
-- (S_payout_rules.scope = 'company_wide', every active GC holder
-- earns). The real rule: each Director reports to exactly one GC
-- member, and only that one GC earns on a sale from that Director's
-- team — not the whole GC role. S_director_gc is the explicit
-- assignment (mirrors S_director_projects), and scope
-- 'director_assigned' is a new third option alongside 'chain'/
-- 'company_wide' that resolves through it.
--
-- Run once in the Supabase SQL Editor. Safe to re-run: table guards are
-- IF NOT EXISTS, the backfill only inserts for a Director with no
-- existing S_director_gc row (ON CONFLICT DO NOTHING), and the scope
-- seed is a plain UPDATE that's idempotent by construction.

-- ---------------------------------------------------------------
-- 1. Fixed-role label overrides
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.S_role_labels (
    role_code VARCHAR(50) PRIMARY KEY CHECK (role_code IN ('it', 'ceo', 'governing_council', 'operation_manager', 'customer')),
    label VARCHAR(100) NOT NULL,
    updated_by UUID REFERENCES public.S_realestate_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.S_role_labels IS
  'Custom display label for one of the 5 fixed roles. No row = use the ROLE_LABELS static default (permissions.ts) — same "absent row is the safe default" convention as S_payout_rules. role_code itself is NEVER renamed here (routing/isAdminPeer/RealEstateRole all keep using the literal code) — only what''s shown on screen changes.';

-- ---------------------------------------------------------------
-- 2. Director -> Governing Council assignment (one GC per Director)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.S_director_gc (
    director_id UUID PRIMARY KEY REFERENCES public.S_realestate_users(id) ON DELETE CASCADE,
    gc_id UUID NOT NULL REFERENCES public.S_realestate_users(id),
    updated_by UUID REFERENCES public.S_realestate_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.S_director_gc IS
  'Exactly one Governing Council member per Director (director_id is the PK, not composite like S_director_projects — a second insert must replace, not add). Read by getUplineChain (role/_shared/downline.ts) when governing_council''s S_payout_rules.scope = ''director_assigned'': only this one GC earns on a sale from that Director''s team, not every active GC holder.';

-- Backfill: every existing Director -> the single currently-active GC.
-- Deliberately NOT behaviour-neutral (unlike migration 010) — this is
-- the explicit new rule. With exactly one active GC today this
-- reproduces today's payout numbers exactly; it only diverges once a
-- second GC exists and Directors start being split between them.
INSERT INTO public.S_director_gc (director_id, gc_id)
SELECT d.id, gc.id
FROM public.S_realestate_users d
CROSS JOIN LATERAL (
    SELECT id FROM public.S_realestate_users
    WHERE role = 'governing_council' AND is_active = true
    ORDER BY created_at ASC
    LIMIT 1
) gc
WHERE d.role = 'director'
ON CONFLICT (director_id) DO NOTHING;

-- ---------------------------------------------------------------
-- 3. New payout scope: 'director_assigned'
-- ---------------------------------------------------------------
ALTER TABLE public.S_payout_rules DROP CONSTRAINT IF EXISTS s_payout_rules_scope_check;
ALTER TABLE public.S_payout_rules ADD CONSTRAINT s_payout_rules_scope_check
  CHECK (scope IN ('chain', 'company_wide', 'director_assigned'));

COMMENT ON COLUMN public.S_payout_rules.scope IS
  '''chain'' = paid only when this role appears in the seller''s own parent_id upline (wing-scoped). ''company_wide'' = every active holder is paid on every sale. ''director_assigned'' = resolved through S_director_gc off the seller''s own upline Director — exactly one holder earns, not every holder of the role. Only governing_council uses this today.';

UPDATE public.S_payout_rules SET scope = 'director_assigned', updated_at = timezone('utc'::text, now())
WHERE role_code = 'governing_council';
