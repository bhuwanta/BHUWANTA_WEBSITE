-- Migration 013: new "Company" role, structurally above CEO.
--
-- A genuine new role_code ('company'), not a rename of CEO — CEO keeps
-- its own identity and its own rate. Exactly one Company account is
-- ever expected to exist (enforced in application code,
-- role/_shared/user-management/actions.ts's createExecutiveAction —
-- no CHECK/UNIQUE constraint can cleanly express "at most one row with
-- role='company'" against a shared VARCHAR role column). No CHECK
-- constraint anywhere blocks the new value except S_role_labels
-- (migration 011), which is deliberately left untouched — Company
-- isn't a rename-only fixed role.

-- Company: 33%. CEO: 30% (was 28%).
INSERT INTO public.S_commission_rates (role, percentage) VALUES ('company', 33.00)
  ON CONFLICT (role) DO UPDATE SET percentage = 33.00;
UPDATE public.S_commission_rates SET percentage = 30.00 WHERE role = 'ceo';

-- New payout scope: 'company_wide_split' — every active holder of the
-- role earns on every sale (same as 'company_wide'), but the marginal
-- percentage computeCommissionBreakdown gives each holder is then
-- divided equally among however many are active, in payout-engine.ts.
-- CEO moves from 'company_wide' to this: today, several active CEOs
-- would each independently earn the full marginal cut; that stops here.
-- Company itself is plain 'company_wide' — singleton, nothing to split.
ALTER TABLE public.S_payout_rules DROP CONSTRAINT IF EXISTS s_payout_rules_scope_check;
ALTER TABLE public.S_payout_rules ADD CONSTRAINT s_payout_rules_scope_check
  CHECK (scope IN ('chain', 'company_wide', 'director_assigned', 'company_wide_split'));

UPDATE public.S_payout_rules SET scope = 'company_wide_split' WHERE role_code = 'ceo';
INSERT INTO public.S_payout_rules (role_code, scope) VALUES ('company', 'company_wide')
  ON CONFLICT (role_code) DO UPDATE SET scope = 'company_wide';
