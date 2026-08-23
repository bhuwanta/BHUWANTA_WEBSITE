-- Migration 002 — Sales-tier build (Director→LIA + Customer Dashboard).
-- Incremental ALTER, NOT a drop/recreate — the live DB already has real
-- seeded Areas/Projects/Commission Rates/user accounts from phases 1-7,
-- unlike the original DB_Schemas.sql full rebuild. Run this once in the
-- Supabase SQL Editor. DB_Schemas.sql has been updated to match, for
-- anyone rebuilding from scratch later.

-- Confirmed empty table as of this migration (no sales-tier page has
-- ever existed to submit a row), so customer_email can go straight to
-- NOT NULL with no backfill step needed.
ALTER TABLE public.S_new_registrations
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending_payment' NOT NULL;

ALTER TABLE public.S_new_registrations ALTER COLUMN customer_email DROP DEFAULT;
