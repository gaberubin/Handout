-- ════════════════════════════════════════════════════════════════════════
-- FEATURE 2 — "FIND YOUR PEOPLE" MATCHING
-- Run this in Supabase → SQL Editor. Safe to re-run (idempotent).
-- Run order: after db/schema.sql. Independent of features 1 and 3.
--
-- A non-dating matching layer: students say who they want to meet (study buddy,
-- friends, gym partner, project/team partner), list interests, and get matched
-- with others on the same campus. Public read of ACTIVE profiles, owner writes.
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.connection_profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  looking_for  TEXT[] DEFAULT '{}',    -- e.g. {'Study buddy','Friends','Gym partner','Project/team partner'}
  interests    TEXT[] DEFAULT '{}',
  major        TEXT,
  availability TEXT,                    -- free text, e.g. 'Evenings & weekends'
  bio          TEXT,
  campus       TEXT,                    -- university (used for same-campus matching)
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cp_active_idx ON public.connection_profiles (is_active);
CREATE INDEX IF NOT EXISTS cp_campus_idx ON public.connection_profiles (campus);

ALTER TABLE public.connection_profiles ENABLE ROW LEVEL SECURITY;

-- Read: any signed-in student can see ACTIVE profiles; owners always see their own.
DROP POLICY IF EXISTS cp_read ON public.connection_profiles;
CREATE POLICY cp_read ON public.connection_profiles
  FOR SELECT TO authenticated
  USING (is_active = true OR auth.uid() = user_id);

-- Write: owner only (insert / update / delete their single row).
DROP POLICY IF EXISTS cp_write ON public.connection_profiles;
CREATE POLICY cp_write ON public.connection_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin: full control (moderation).
DROP POLICY IF EXISTS cp_admin ON public.connection_profiles;
CREATE POLICY cp_admin ON public.connection_profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

SELECT '✅ Feature 2 ready — connection_profiles table with RLS (public read active, owner write).' AS status;
