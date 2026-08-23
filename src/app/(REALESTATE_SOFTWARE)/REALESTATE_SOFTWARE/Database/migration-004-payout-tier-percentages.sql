-- Migration 004 — payout tier-percentage transparency.
-- Adds the two columns needed to show the real "26% − 24% = 2%"
-- subtraction on the Payouts/Wallet pages using ONLY stored DB values —
-- no client-side recomputation, no reliance on current (possibly
-- since-changed) Commission Rates. Run once in the Supabase SQL Editor.

ALTER TABLE public.S_sales_payouts
  ADD COLUMN IF NOT EXISTS tier_percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS previous_tier_percentage DECIMAL(5,2);

-- Backfill the 3 existing rows from earlier live testing with their
-- known real historical values (Director 24%, GC 26%, CEO 28%, full
-- chain — matches the rates table at the time these were computed).
UPDATE public.S_sales_payouts SET tier_percentage = 24, previous_tier_percentage = 0  WHERE role = 'director' AND tier_percentage IS NULL;
UPDATE public.S_sales_payouts SET tier_percentage = 26, previous_tier_percentage = 24 WHERE role = 'governing_council' AND tier_percentage IS NULL;
UPDATE public.S_sales_payouts SET tier_percentage = 28, previous_tier_percentage = 26 WHERE role = 'ceo' AND tier_percentage IS NULL;

ALTER TABLE public.S_sales_payouts
  ALTER COLUMN tier_percentage SET NOT NULL,
  ALTER COLUMN previous_tier_percentage SET NOT NULL;
