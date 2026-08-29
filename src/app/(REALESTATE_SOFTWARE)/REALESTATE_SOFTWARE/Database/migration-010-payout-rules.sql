-- Migration 010 — configurable payout rules
--
-- Context: who earns commission on a sale was hardcoded in
-- role/_shared/downline.ts — sales tiers (Director→LIA) wing-scoped via
-- the parent_id walk, Governing Council and CEO appended company-wide to
-- every sale. Changing any of that meant a code change and a deploy, and
-- the cost of that rigidity was real: getUplineChain used `.limit(1)`,
-- so exactly one arbitrary CEO was paid and the others silently earned
-- nothing on every sale in the company until someone noticed by eye.
--
-- These two tables lift that policy into data:
--
--   S_payout_rules.scope        — per ROLE: is this tier paid only when
--                                 it sits in the seller's own parent_id
--                                 chain ('chain'), or is every holder
--                                 paid on every sale ('company_wide')?
--   S_realestate_users
--     .earns_commission         — per PERSON: lets a specific holder
--                                 stop earning while keeping their role
--                                 and all their access.
--
-- Deliberately behaviour-NEUTRAL on its own: the seed below reproduces
-- exactly what the code did before this migration (every sales tier
-- 'chain'; governing_council and ceo 'company_wide'), and
-- earns_commission defaults to true, so nobody's earnings change until
-- IT explicitly changes something on the Payout Rules page.
--
-- Run once in the Supabase SQL Editor. Safe to re-run: the table guard
-- is IF NOT EXISTS, the column guard is ADD COLUMN IF NOT EXISTS, and
-- the seed is ON CONFLICT DO NOTHING so it will not stomp a scope that
-- IT has since changed.

CREATE TABLE IF NOT EXISTS public.S_payout_rules (
    role_code VARCHAR(50) PRIMARY KEY,
    scope VARCHAR(20) NOT NULL DEFAULT 'chain',
    updated_by UUID REFERENCES public.S_realestate_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT s_payout_rules_scope_check CHECK (scope IN ('chain', 'company_wide'))
);

COMMENT ON TABLE public.S_payout_rules IS
  'Per-role payout policy, read by getUplineChain (role/_shared/downline.ts). A role with no row here is treated as ''chain'' — the restrictive default.';
COMMENT ON COLUMN public.S_payout_rules.scope IS
  '''chain'' = paid only when this role appears in the seller''s own parent_id upline (wing-scoped). ''company_wide'' = every active holder of this role is paid on every sale, regardless of wing.';

ALTER TABLE public.S_realestate_users
  ADD COLUMN IF NOT EXISTS earns_commission BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.S_realestate_users.earns_commission IS
  'When false this person is excluded from every commission chain but keeps their role, login and permissions. Note for a wing-scoped (''chain'') role: excluding the only holder of a tier does not delete that tier''s share — the gap flows up to the next tier above them.';

-- Seed: mirrors the previously-hardcoded behaviour exactly.
INSERT INTO public.S_payout_rules (role_code, scope)
SELECT role_code, 'chain' FROM public.S_role_definitions
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO public.S_payout_rules (role_code, scope)
VALUES ('governing_council', 'company_wide'), ('ceo', 'company_wide')
ON CONFLICT (role_code) DO NOTHING;
