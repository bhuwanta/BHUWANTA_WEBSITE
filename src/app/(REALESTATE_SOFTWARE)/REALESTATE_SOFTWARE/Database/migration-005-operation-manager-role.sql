-- Migration 005 — Operation Manager role.
-- Standalone role (not an admin peer, not part of the sales downline):
-- the sole company-wide approver for "Registration Done" and "Mark
-- Paid" payouts. Run once in the Supabase SQL Editor, as its own
-- statement (Postgres enum additions can't share a transaction with
-- code that immediately uses the new value).

ALTER TYPE public.realestate_role ADD VALUE IF NOT EXISTS 'operation_manager';
