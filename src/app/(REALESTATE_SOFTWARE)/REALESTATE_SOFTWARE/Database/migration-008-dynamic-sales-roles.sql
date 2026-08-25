-- Migration 008: dynamic sales-tier roles.
--
-- Lets IT/CEO/Governing Council create a brand-new sales-tier role from
-- the Commission Rates page (name + percentage + rank placement) with no
-- code deploy required. Two parts:
--
-- 1. The `role` columns move off the fixed Postgres ENUM
--    (public.realestate_role) to plain VARCHAR(50), on the three tables
--    that use it. This is additive/widening only — every existing value
--    keeps meaning exactly what it did before, nothing is renamed or
--    dropped. The enum TYPE itself is left in place, just unused —
--    safer than dropping it (no need to hunt down every last
--    dependency), costs nothing to leave orphaned.
--
--    Role VALIDITY is no longer enforced by the database (it never was
--    the primary access-control layer in this app — see auth.ts's own
--    comments — server actions in permissions.ts/user-management/
--    actions.ts already do all real enforcement). It's now enforced the
--    same way: only createExecutiveAction can ever write a `role` value,
--    and it only accepts one of the 5 fixed roles or a real row in the
--    new S_role_definitions table below.
--
-- 2. New table S_role_definitions holds the sales-tier cascade order
--    (Director through LIA today) as data instead of the hardcoded
--    SALES_RANK_ORDER TypeScript array. `rank` is NUMERIC, not integer,
--    so a new role can be inserted anywhere (including above Director)
--    via a single averaged value between its two neighbors — no
--    renumbering the rest of the table.
--
-- Run once in the Supabase SQL Editor, in order, top to bottom. Safe to
-- re-run (idempotent guards throughout).

-- ── Part 1: widen the role columns ──────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 's_realestate_users' AND column_name = 'role' AND udt_name = 'realestate_role'
  ) THEN
    ALTER TABLE public.S_realestate_users ALTER COLUMN role TYPE VARCHAR(50) USING role::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 's_commission_rates' AND column_name = 'role' AND udt_name = 'realestate_role'
  ) THEN
    ALTER TABLE public.S_commission_rates ALTER COLUMN role TYPE VARCHAR(50) USING role::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 's_sales_payouts' AND column_name = 'role' AND udt_name = 'realestate_role'
  ) THEN
    ALTER TABLE public.S_sales_payouts ALTER COLUMN role TYPE VARCHAR(50) USING role::text;
  END IF;
END $$;

-- ── Part 2: role_definitions table ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.S_role_definitions (
    role_code VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    -- Sales-tier cascade order — lower rank = higher in the hierarchy
    -- (matches SALES_RANK_ORDER's existing top-to-bottom convention:
    -- director had index 0, i.e. rank 1 here). NUMERIC so a role can be
    -- inserted between two existing ranks (e.g. 1.5, between 1 and 2)
    -- without touching any other row.
    rank NUMERIC(10,4) NOT NULL UNIQUE,
    -- True for the 8 built-in roles seeded below — reserved for future
    -- use (e.g. protecting them from a future "delete role" feature);
    -- not read by any code yet.
    is_system BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.S_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed with the current 8 sales-tier roles at their current order —
-- pure data migration, zero behavior change. Matches SALES_RANK_ORDER
-- in role/_shared/permissions.ts exactly. ON CONFLICT DO NOTHING makes
-- this safe to re-run.
INSERT INTO public.S_role_definitions (role_code, label, rank, is_system) VALUES
    ('director', 'Director', 1, true),
    ('sr_core', 'Sr. Core', 2, true),
    ('core', 'Core', 3, true),
    ('gm', 'GM', 4, true),
    ('agm', 'AGM', 5, true),
    ('rm', 'RM', 6, true),
    ('lio', 'LIO', 7, true),
    ('lia', 'LIA', 8, true)
ON CONFLICT (role_code) DO NOTHING;
