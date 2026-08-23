-- Migration 003 — payout rounding transparency.
-- Adds a column to keep the exact, pre-rounding commission figure
-- alongside the actual (ceiling-rounded-to-the-rupee) amount that gets
-- paid — so every payout stays auditable even though the paid amount is
-- always a whole rupee. Run once in the Supabase SQL Editor.

ALTER TABLE public.S_sales_payouts
  ADD COLUMN IF NOT EXISTS computed_amount DECIMAL(15,2);

-- Backfill: the 3 existing rows (from earlier live testing) already
-- happen to be whole-rupee amounts, so the exact figure and the paid
-- figure are identical — no information is lost by this backfill.
UPDATE public.S_sales_payouts SET computed_amount = amount WHERE computed_amount IS NULL;

ALTER TABLE public.S_sales_payouts ALTER COLUMN computed_amount SET NOT NULL;
