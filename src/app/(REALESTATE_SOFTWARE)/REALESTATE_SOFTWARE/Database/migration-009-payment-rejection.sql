-- Migration 009 — payment rejection audit trail
--
-- Context: the Operation Manager can now undo a payment the customer
-- self-declared via "Pay Now" (undoPaymentAction), for the case where
-- verification shows the money never actually arrived. Before this,
-- payment_status simply flipped back to 'pending_payment' with no record
-- of who reversed it or why, and the customer saw their confirmation
-- silently vanish with no explanation — a real risk of them paying a
-- second time.
--
-- payment_status is VARCHAR(20) with no CHECK constraint, so the new
-- 'rejected' value needs no type change. Every existing comparison in
-- the app is either `=== 'paid'` or `!== 'paid'`, so 'rejected' is
-- correctly treated as "not paid" everywhere without further changes.
--
-- Safe to re-run: every ADD COLUMN is IF NOT EXISTS.

ALTER TABLE public.S_new_registrations
  ADD COLUMN IF NOT EXISTS payment_rejected_by UUID REFERENCES public.S_realestate_users(id),
  ADD COLUMN IF NOT EXISTS payment_rejected_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS payment_rejection_note TEXT;

COMMENT ON COLUMN public.S_new_registrations.payment_rejected_by IS
  'Operation Manager who undid the customer''s payment confirmation (undoPaymentAction). Only ever set alongside payment_status = ''rejected''.';
COMMENT ON COLUMN public.S_new_registrations.payment_rejection_note IS
  'Short reason shown to the customer on their Payment page, e.g. "cheque bounced", "no UTR found". Cleared when they successfully re-confirm payment.';
