-- Migration 006 — per-user "read" tracking for the Registrations badge.
-- The sidebar's red notification count previously showed every PENDING
-- registration, which meant it could never be cleared without actually
-- approving the work. This makes it a real notification instead: the
-- badge counts pending registrations this specific user hasn't
-- acknowledged yet, and "Mark all as read" clears it without touching
-- the registration's actual status.
--
-- Per-user by design (composite PK) — the Operation Manager marking
-- something read must never clear it from a Director's badge, and vice
-- versa. Run once in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.S_registration_reads (
    user_id UUID REFERENCES public.S_realestate_users(id) ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES public.S_new_registrations(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, registration_id)
);

-- The badge query is always "unread rows for THIS user", so index the
-- lookup side.
CREATE INDEX IF NOT EXISTS idx_s_registration_reads_user ON public.S_registration_reads(user_id);
