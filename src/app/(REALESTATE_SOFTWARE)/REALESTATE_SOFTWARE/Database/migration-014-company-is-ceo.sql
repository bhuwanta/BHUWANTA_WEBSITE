-- Migration 014: the top tier is the ceo role again, relabelled "Company".
--
-- Reverses migration 013's separate 'company' role_code. The model is now:
--   * one tier at the top, role_code 'ceo', rate 30%, nothing above it;
--   * it displays everywhere as "Company" (S_role_labels, migration 011) —
--     the role_code itself never changes, so routing (/role/ceo),
--     middleware, and every permission check are untouched. Same rename
--     convention already used for the sales tiers;
--   * exactly ONE account holds it (enforced in application code —
--     createExecutiveAction / canCreateRoleDynamic), so all top-tier
--     commission necessarily lands in that single Company account and the
--     people behind it settle up offline.
--
-- Because the tier is a singleton, 'company_wide_split' has nothing left
-- to divide; ceo goes back to plain 'company_wide'. The scope value and
-- its CHECK constraint stay in place — still offered on the Payout Rules
-- page for any role that ever has several company-wide holders.

DELETE FROM public.S_commission_rates WHERE role = 'company';
DELETE FROM public.S_payout_rules WHERE role_code = 'company';

UPDATE public.S_payout_rules SET scope = 'company_wide' WHERE role_code = 'ceo';

INSERT INTO public.S_role_labels (role_code, label) VALUES ('ceo', 'Company')
  ON CONFLICT (role_code) DO UPDATE SET label = 'Company', updated_at = timezone('utc'::text, now());
