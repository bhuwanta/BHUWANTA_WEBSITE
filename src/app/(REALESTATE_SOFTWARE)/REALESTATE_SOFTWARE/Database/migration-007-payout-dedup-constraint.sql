-- Migration 007: prevent duplicate commission payouts on the same sale.
--
-- markRegistrationDoneAction (registrations/actions.ts) now guards the
-- registration's status UPDATE with WHERE status='pending_registration'
-- AND payment_status='paid', so two concurrent "Mark Done" calls (a
-- double-click, two tabs) can no longer both proceed to
-- runCommissionPayout(). This constraint is the second, independent
-- layer: even if the payout engine is ever invoked twice for the same
-- registration_id through some other path, the database itself refuses
-- to store two payout rows for the same person on the same sale.
--
-- Safe to add: within a single sale's chain (seller + their real
-- upline, one row per participant), a payee_id can only ever appear
-- once — nobody is paid twice in their own chain, so this constraint
-- matches how the data is actually shaped and rejects nothing legitimate.
--
-- Run once in the Supabase SQL Editor. Idempotent — safe to re-run.
-- (Postgres has no "ADD CONSTRAINT IF NOT EXISTS" — this DO block is
-- the standard equivalent, checking pg_constraint first.)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 's_sales_payouts_registration_payee_unique'
  ) THEN
    ALTER TABLE public.S_sales_payouts
      ADD CONSTRAINT s_sales_payouts_registration_payee_unique
      UNIQUE (registration_id, payee_id);
  END IF;
END $$;
