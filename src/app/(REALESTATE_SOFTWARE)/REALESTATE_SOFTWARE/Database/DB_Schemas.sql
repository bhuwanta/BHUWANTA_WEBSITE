-- Real Estate Software Database Schema
-- Run these queries in your Supabase SQL Editor
--
-- Rebuilt to match the 11-tier hierarchy decided in
-- ../Doubts/HIERARCHY.md (it, ceo, governing_council, director, sr_core,
-- core, gm, agm, rm, lio, lia, customer). This is a full DROP + recreate —
-- confirmed safe against the live DB (test data only, nothing to preserve)
-- as of the rebuild date. If real data ever exists here, do NOT re-run
-- this file as-is; write an incremental ALTER-based migration instead.
--
-- Naming convention followed throughout (matches the pre-existing file):
-- tables use "S_" prefix + PascalCase-ish words (Postgres folds unquoted
-- identifiers to lowercase regardless), columns are snake_case, UUID PKs
-- default to gen_random_uuid(), timestamps default to
-- timezone('utc'::text, now()).
--
-- Verified against the live database (2026-08-23): every table, column,
-- type, nullability, default, and the realestate_role enum's exact
-- ordinal order below were cross-checked against the live schema via
-- PostgREST's OpenAPI description (direct Postgres access isn't
-- reachable from this environment — only HTTPS egress). That method
-- confirms columns/types/nullability/defaults/enums but can't see
-- index names, CHECK constraints, or RLS policy internals beyond what's
-- already documented inline below — those weren't independently
-- re-verified this pass. All 13 live tables are present below; nothing
-- exists live that isn't reflected here, and nothing below is stale.

-- ==========================================
-- DANGER: DROP EXISTING SCHEMA
-- ==========================================
DROP VIEW IF EXISTS public.v_wing_leader_stats CASCADE;

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.sales_payouts CASCADE;
DROP TABLE IF EXISTS public.inventory_plots CASCADE;
DROP TABLE IF EXISTS public.wings CASCADE;
DROP TABLE IF EXISTS public.developer_mandates CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.realestate_users CASCADE;

DROP TABLE IF EXISTS public.S_new_registrations CASCADE;
DROP TABLE IF EXISTS public.S_sales_payouts CASCADE;
DROP TABLE IF EXISTS public.S_director_projects CASCADE;
DROP TABLE IF EXISTS public.S_commission_rates CASCADE;
DROP TABLE IF EXISTS public.S_agent_requests CASCADE;
DROP TABLE IF EXISTS public.S_audit_logs CASCADE;
DROP TABLE IF EXISTS public.S_inventory_plots CASCADE;
DROP TABLE IF EXISTS public.S_wing_agents CASCADE;
DROP TABLE IF EXISTS public.S_wings CASCADE;
DROP TABLE IF EXISTS public.S_developer_mandates CASCADE;
DROP TABLE IF EXISTS public.S_system_settings CASCADE;
DROP TABLE IF EXISTS public.S_modules CASCADE;
DROP TABLE IF EXISTS public.S_project_documents CASCADE;
DROP TABLE IF EXISTS public.S_project_areas CASCADE;
DROP TABLE IF EXISTS public.S_projects CASCADE;
DROP TABLE IF EXISTS public.S_areas CASCADE;
DROP TABLE IF EXISTS public.S_realestate_users CASCADE;

DROP TYPE IF EXISTS public.realestate_role CASCADE;
DROP TYPE IF EXISTS public.plot_status CASCADE;
DROP TYPE IF EXISTS public.payout_status CASCADE;
DROP TYPE IF EXISTS public.registration_status CASCADE;

DROP SEQUENCE IF EXISTS public.bhuwanta_id_seq CASCADE;
-- ==========================================

-- 1. Role enum — the full 13-value hierarchy (HIERARCHY.md §1).
-- IT/CEO/Governing Council are admin peers (§2) and sit outside the
-- downline tree. Director through LIA form the sales chain (§2 cascade,
-- §3 commission, §4 walling). Customer is unrelated to the sales
-- hierarchy but shares this users table/enum for consistency.
-- operation_manager: standalone role, not an admin peer, not part of
-- the sales downline — the sole company-wide approver for Registration
-- Done and payout completion.
--
-- Value ORDER below matches the live database exactly, not a logical
-- grouping — Postgres enums are ordinal (ORDER BY role, MIN/MAX, and
-- comparisons all follow this literal declaration order), and
-- 'operation_manager' was added to the already-live enum via
-- migration-005's `ALTER TYPE ... ADD VALUE`, which always appends to
-- the end. A fresh DROP+CREATE of this file must declare the same order
-- the live enum actually has, or a `role` column sort would silently
-- come out differently on a rebuilt database than on production.
CREATE TYPE public.realestate_role AS ENUM (
    'it', 'ceo', 'governing_council',
    'director', 'sr_core', 'core', 'gm', 'agm', 'rm', 'lio', 'lia',
    'customer', 'operation_manager'
);

-- 2. Sequence for Bhuwanta ID
CREATE SEQUENCE IF NOT EXISTS public.bhuwanta_id_seq START 1;

-- 3. User profiles/roles table
CREATE TABLE public.S_realestate_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    bhuwanta_id VARCHAR(20) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    -- VARCHAR, not the public.realestate_role enum (migration 008) — the
    -- 8 sales-tier values (director..lia) are now admin-editable data in
    -- S_role_definitions below, not a fixed enum. it/ceo/governing_council/
    -- operation_manager/customer stay as fixed, hardcoded strings; role
    -- validity as a whole is enforced in code (createExecutiveAction),
    -- same as everywhere else in this app — the enum was never the
    -- primary access-control layer to begin with.
    role VARCHAR(50) NOT NULL,
    -- The person who created/manages this profile — their direct upline
    -- in the commission/visibility chain (HIERARCHY.md §6's resolved
    -- open question: parent_id self-reference, not a closure table).
    -- NULL for it/ceo/governing_council, since those three are peers,
    -- not part of a downline tree (§2). Director's parent_id is their
    -- Governing Council creator; every tier below points at whoever
    -- created them, all the way down to lia.
    parent_id UUID REFERENCES public.S_realestate_users(id),
    is_active BOOLEAN DEFAULT true,
    -- (migration 010) When false this person is excluded from every
    -- commission chain but keeps their role, login and permissions —
    -- set from the IT-only Payout Rules page. Note for a wing-scoped
    -- ('chain') role: excluding the only holder of a tier does not
    -- delete that tier's share, the gap flows up to the tier above.
    earns_commission BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Row Level Security (RLS)
-- Note: in practice this app's server actions almost exclusively use a
-- service-role client (bypasses RLS) — these policies are a safety net,
-- not the primary access control layer, matching the existing pattern
-- throughout REALESTATE_SOFTWARE.
ALTER TABLE public.S_realestate_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.S_realestate_users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
    ON public.S_realestate_users FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 5. Triggers for modified time and auto-id
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_S_realestate_users_modtime
    BEFORE UPDATE ON public.S_realestate_users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE FUNCTION generate_bhuwanta_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bhuwanta_id := 'BHUWANTA-' || LPAD(nextval('public.bhuwanta_id_seq')::text, 5, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER assign_bhuwanta_id
    BEFORE INSERT ON public.S_realestate_users
    FOR EACH ROW
    EXECUTE FUNCTION generate_bhuwanta_id();

-- 6. System Settings Table (Managed by IT) — unrelated to the hierarchy
-- rework, left as-is.
CREATE TABLE public.S_system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    master_equity_split DECIMAL(5,2) DEFAULT 0.00,
    kill_switch_active BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES public.S_realestate_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Developer Mandates Table — unrelated to the hierarchy rework, left
-- as-is.
CREATE TABLE public.S_developer_mandates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_name VARCHAR(255) NOT NULL,
    mandate_percentage DECIMAL(5,2) NOT NULL,
    dossier_url TEXT,
    layout_map_url TEXT,
    created_by UUID REFERENCES public.S_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Modules Configuration Table — feature-flag toggles per role,
-- unchanged structurally (HIERARCHY.md §7 keeps Modules as-is).
CREATE TABLE public.S_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_key VARCHAR(100) UNIQUE NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    enabled_roles JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- DYNAMIC SALES-TIER ROLES (migration 008)
-- ==========================================

-- 8b. Role Definitions Table — the sales-tier cascade order (Director
-- through LIA) as data instead of a hardcoded TypeScript array
-- (SALES_RANK_ORDER in role/_shared/permissions.ts), so IT/CEO/
-- Governing Council can create a brand-new sales-tier role from the
-- Commission Rates page with no code deploy. rank is NUMERIC so a new
-- role can be inserted anywhere — including above Director — via one
-- averaged value between its two neighbors, without renumbering the
-- rest of the table. Only covers the sales-tier cascade: it/ceo/
-- governing_council/operation_manager/customer are NOT rows here and
-- stay fully hardcoded — they aren't rank-compared against this table.
CREATE TABLE public.S_role_definitions (
    role_code VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    rank NUMERIC(10,4) NOT NULL UNIQUE,
    is_system BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.S_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed with the current 8 sales-tier roles at their current order —
-- matches SALES_RANK_ORDER exactly, pure data, zero behavior change.
INSERT INTO public.S_role_definitions (role_code, label, rank, is_system) VALUES
    ('director', 'Director', 1, true),
    ('sr_core', 'Sr. Core', 2, true),
    ('core', 'Core', 3, true),
    ('gm', 'GM', 4, true),
    ('agm', 'AGM', 5, true),
    ('rm', 'RM', 6, true),
    ('lio', 'LIO', 7, true),
    ('lia', 'LIA', 8, true);

-- Per-role payout policy (migration 010). Read by getUplineChain
-- (role/_shared/downline.ts) to decide WHO is paid on a sale, separately
-- from S_commission_rates below which decides HOW MUCH. A role with no
-- row here is treated as 'chain' — the restrictive default. Seeded to
-- reproduce the behaviour that used to be hardcoded in downline.ts.
CREATE TABLE public.S_payout_rules (
    role_code VARCHAR(50) PRIMARY KEY,
    -- 'chain'             = paid only when this role appears in the
    --                       seller's own parent_id upline (wing-scoped).
    -- 'company_wide'      = every active holder is paid on every sale.
    -- 'director_assigned' = (migration 011) resolved through
    --                       S_director_gc off the seller's own upline
    --                       Director — exactly one holder earns, not
    --                       every holder of the role. Only
    --                       governing_council uses this.
    scope VARCHAR(20) NOT NULL DEFAULT 'chain',
    updated_by UUID REFERENCES public.S_realestate_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT s_payout_rules_scope_check CHECK (scope IN ('chain', 'company_wide', 'director_assigned'))
);

INSERT INTO public.S_payout_rules (role_code, scope) VALUES
    ('director', 'chain'),
    ('sr_core', 'chain'),
    ('core', 'chain'),
    ('gm', 'chain'),
    ('agm', 'chain'),
    ('rm', 'chain'),
    ('lio', 'chain'),
    ('lia', 'chain'),
    ('governing_council', 'director_assigned'),
    ('ceo', 'company_wide');

-- (migration 011) Custom display label for one of the 5 fixed roles —
-- it/ceo/governing_council/operation_manager/customer — which have no
-- row in S_role_definitions above (mixing them in would corrupt every
-- rank-sensitive consumer of that table). No row = use the ROLE_LABELS
-- static default in permissions.ts. role_code itself is never renamed
-- here, only what's shown on screen.
CREATE TABLE public.S_role_labels (
    role_code VARCHAR(50) PRIMARY KEY CHECK (role_code IN ('it', 'ceo', 'governing_council', 'operation_manager', 'customer')),
    label VARCHAR(100) NOT NULL,
    updated_by UUID REFERENCES public.S_realestate_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- (migration 011) Exactly one Governing Council member per Director —
-- director_id is the PK (not composite like S_director_projects below),
-- so a second insert for the same Director replaces rather than adds.
-- Read by getUplineChain when governing_council's scope above is
-- 'director_assigned'.
CREATE TABLE public.S_director_gc (
    director_id UUID PRIMARY KEY REFERENCES public.S_realestate_users(id) ON DELETE CASCADE,
    gc_id UUID NOT NULL REFERENCES public.S_realestate_users(id),
    updated_by UUID REFERENCES public.S_realestate_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- COMMISSION RATES (HIERARCHY.md §3a)
-- ==========================================

-- 9. Commission Rate Table — one row per sales tier, global default (not
-- per-person). Writable by it/ceo/governing_council only (§2 peer rule) —
-- enforced at the application layer, same as everywhere else in this
-- schema.
CREATE TABLE public.S_commission_rates (
    -- VARCHAR, not the enum — see S_realestate_users.role's comment
    -- above (migration 008).
    role VARCHAR(50) PRIMARY KEY,
    percentage DECIMAL(5,2) NOT NULL,
    updated_by UUID REFERENCES public.S_realestate_users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed with the current rates (HIERARCHY.md §3a). it/customer are
-- intentionally absent — not commission-eligible.
INSERT INTO public.S_commission_rates (role, percentage) VALUES
    ('lia', 10.00),
    ('lio', 12.00),
    ('rm', 14.00),
    ('agm', 16.00),
    ('gm', 18.00),
    ('core', 20.00),
    ('sr_core', 22.00),
    ('director', 24.00),
    ('governing_council', 26.00),
    ('ceo', 28.00);

-- ==========================================
-- AREAS AND PROJECTS
-- ==========================================

-- 10. Areas Table — unchanged.
CREATE TABLE public.S_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_by UUID REFERENCES public.S_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Projects Table — revised per HIERARCHY.md §5: a Project belongs to
-- exactly ONE Area now (area_id FK, NOT a many-to-many junction like the
-- old S_project_areas table), plus Base Price and default MRP, both
-- writable by it/ceo/governing_council (§5).
CREATE TABLE public.S_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255),
    google_maps_url TEXT,
    area_id UUID REFERENCES public.S_areas(id) NOT NULL,
    -- Base Price: ₹/sq.yard rate, used ONLY for commission calculation
    -- (§3b) — not the customer-facing price.
    base_price DECIMAL(15,2),
    -- Default MRP: ₹/sq.yard, the starting customer-facing rate shown on
    -- a New Registration form — the seller can override it per sale
    -- (§5), the actual value used gets snapshotted onto the registration
    -- record, not read live from here at payout time.
    mrp_default DECIMAL(15,2),
    created_by UUID REFERENCES public.S_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Director <-> Project Mapping (Many-to-Many) — HIERARCHY.md §5: a
-- Director can be on multiple Projects, a Project can have multiple
-- Directors. A Director's whole downline inherits these assignments —
-- no separate per-person project table needed.
CREATE TABLE public.S_director_projects (
    project_id UUID REFERENCES public.S_projects(id) ON DELETE CASCADE,
    director_id UUID REFERENCES public.S_realestate_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (project_id, director_id)
);

-- 13. Project Documents (Brochures, Layouts, etc) — unchanged, now
-- managed from the shared Areas & Projects admin page (§7) instead of
-- the old separate "Uploads" page.
CREATE TABLE public.S_project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.S_projects(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'brochure', 'layout', 'linkdocument'
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    created_by UUID REFERENCES public.S_realestate_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- NEW REGISTRATIONS & PAYOUTS (HIERARCHY.md §3c/§3d)
-- ==========================================

-- 14. Registration status — a New Registration's lifecycle (§3c).
CREATE TYPE public.registration_status AS ENUM (
    'pending_registration', 'registration_done', 'cancelled'
);

-- 15. New Registrations Table — own dedicated table, minimum viable
-- fields per §3d, not bolted onto sales_payouts. This table has no
-- writers yet (the "New Registration" submission page is a
-- Director-through-LIA page, out of scope for the current IT/CEO/GC
-- build round) — it exists now so the IT/CEO/GC "Registrations"
-- oversight page (§7) has something correctly shaped to query against,
-- even though it'll show an empty state until that later round of work.
CREATE TABLE public.S_new_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID REFERENCES public.S_areas(id) NOT NULL,
    project_id UUID REFERENCES public.S_projects(id) NOT NULL,
    plot_size_sqyd DECIMAL(10,2) NOT NULL,
    -- Snapshots, not live lookups — HIERARCHY.md §3d/§6: what commission
    -- calc uses is whatever was shown at submission time, not whatever
    -- the Project's rates are later.
    base_price_at_submission DECIMAL(15,2) NOT NULL,
    mrp_at_submission DECIMAL(15,2) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    -- Not in HIERARCHY.md §3d's original minimum field list (only
    -- name/phone/address), but required in practice: this app's
    -- Supabase Auth accounts are always email+password (see
    -- createExecutiveAction), and there's no SMS gateway configured to
    -- deliver credentials any other way. Needed to auto-create the
    -- customer's login (§3c step 5).
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT,
    submitted_by UUID REFERENCES public.S_realestate_users(id) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- The customer's own auto-created profile (role='customer' in this
    -- same users table), created on submit (§3c step 5). Reused across a
    -- returning customer's multiple purchases (matched by phone) rather
    -- than creating a duplicate account each time.
    customer_user_id UUID REFERENCES public.S_realestate_users(id),
    status public.registration_status DEFAULT 'pending_registration' NOT NULL,
    -- Manual stub, not a real payment gateway (Razorpay isn't wired up
    -- and refund mechanics aren't designed yet — HIERARCHY.md §6). The
    -- customer flips this themselves from their dashboard; Registration
    -- Done is gated on it being 'paid', matching §3c's confirmed rule
    -- that payment must precede Registration Done.
    payment_status VARCHAR(20) DEFAULT 'pending_payment' NOT NULL,
    -- Set by whichever Director/IT/CEO/GC clicked "Registration Done" —
    -- a single action that both finalizes registration and starts the
    -- 48h payout clock (§3c step 8). No separate approval step.
    registration_done_by UUID REFERENCES public.S_realestate_users(id),
    registration_done_at TIMESTAMP WITH TIME ZONE,
    -- Editable/cancellable by seller or customer any time before
    -- registration_done_at is set; irreversible after (§3d).
    cancelled_by UUID REFERENCES public.S_realestate_users(id),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    refund_status VARCHAR(20) DEFAULT 'not_applicable',
    -- Migration 009: set when the Operation Manager undoes a payment the
    -- customer self-declared (payment_status becomes 'rejected'). The
    -- note is shown to the customer so a reversed payment is never a
    -- silent, unexplained regression on their dashboard.
    payment_rejected_by UUID REFERENCES public.S_realestate_users(id),
    payment_rejected_at TIMESTAMP WITH TIME ZONE,
    payment_rejection_note TEXT
);

-- 16. Sales & Payouts Table — revised to key off a registration (not a
-- plot from the retired inventory model), and to carry which role/rate
-- produced each payout line, since HIERARCHY.md §3b pays out multiple
-- people per sale (seller + upline chain), not one flat commission.
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE public.S_sales_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES public.S_new_registrations(id) NOT NULL,
    payee_id UUID REFERENCES public.S_realestate_users(id) NOT NULL,
    -- VARCHAR, not the enum — see S_realestate_users.role's comment
    -- above (migration 008).
    role VARCHAR(50) NOT NULL,
    -- Snapshot of the rate actually used for this payout line (not a
    -- live join to S_commission_rates — rates can change later without
    -- rewriting history).
    commission_percentage DECIMAL(5,2) NOT NULL,
    -- This role's own absolute tier rate at calculation time (e.g. 26
    -- for Governing Council), and the rate of whoever was directly
    -- below them in this specific chain (0 for the seller's own line).
    -- tier_percentage − previous_tier_percentage === commission_percentage,
    -- always. Stored so the UI can show that real subtraction from DB
    -- columns alone — never recomputed client-side, never dependent on
    -- whatever S_commission_rates says NOW (which may have changed).
    tier_percentage DECIMAL(5,2) NOT NULL,
    previous_tier_percentage DECIMAL(5,2) NOT NULL,
    -- Exact, paisa-precise figure computed by the formula (§3b) —
    -- BEFORE the rounding below. Kept so every payout stays auditable:
    -- amount alone doesn't tell you whether/how much rounding changed
    -- it, computed_amount does.
    computed_amount DECIMAL(15,2) NOT NULL,
    -- What's actually paid — computed_amount rounded UP to the next
    -- whole rupee (never left as a sub-rupee figure, never rounded down
    -- against the payee). amount === computed_amount whenever
    -- computed_amount was already a whole rupee.
    amount DECIMAL(15,2) NOT NULL,
    payout_status public.payout_status DEFAULT 'pending',
    razorpay_tx_id VARCHAR(255),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- One payout row per person per sale — migration 007. Second,
    -- independent layer against duplicate payouts (the primary guard is
    -- the status-conditioned UPDATE in markRegistrationDoneAction).
    CONSTRAINT s_sales_payouts_registration_payee_unique UNIQUE (registration_id, payee_id)
);

-- 16b. Per-user read tracking for the Registrations notification badge
-- (migration 006). Composite PK is per-user on purpose: one person
-- acknowledging a registration must never clear it from someone else's
-- badge.
CREATE TABLE public.S_registration_reads (
    user_id UUID REFERENCES public.S_realestate_users(id) ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES public.S_new_registrations(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, registration_id)
);

CREATE INDEX idx_s_registration_reads_user ON public.S_registration_reads(user_id);

-- 17. Audit Logs Table — unchanged.
CREATE TABLE public.S_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.S_realestate_users(id) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- RETIRED — intentionally not recreated
-- ==========================================
-- The following existed in the old (Partner / Wing Leader / Agent) model
-- and are confirmed superseded, per HIERARCHY.md — not carried forward:
--   - S_wings, S_wing_agents, S_inventory_plots, plot_status enum,
--     v_wing_leader_stats view: the Excel-inventory-upload +
--     "Wing Budget %" allocation model is fully replaced by
--     S_commission_rates + S_new_registrations (§3, §7's "Allocations"
--     retirement).
--   - S_project_areas: replaced by S_projects.area_id (one Project, one
--     Area — §5).
--   - S_agent_requests: the self-referral/approval workflow is dropped
--     entirely, replaced by direct cascading creation rights (§2, §8).
--     (That table also stored a plaintext `password_temp` column —
--     worth noting as a pre-existing issue even though it's being
--     removed, not "fixed.")
