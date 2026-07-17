-- Adds roommate preference fields used by the matching algorithm.
-- Run once in Supabase → SQL Editor. Safe to re-run.

ALTER TABLE public.roommate_listings
  ADD COLUMN IF NOT EXISTS occupancy  TEXT,
  ADD COLUMN IF NOT EXISTS diet       TEXT,
  ADD COLUMN IF NOT EXISTS smoking    TEXT,
  ADD COLUMN IF NOT EXISTS pets       TEXT,
  ADD COLUMN IF NOT EXISTS university TEXT;

-- Make sure any signed-in student can READ all listings (so cross-user
-- visibility works — A's room shows on B's page).
DROP POLICY IF EXISTS rl_read ON public.roommate_listings;
CREATE POLICY rl_read ON public.roommate_listings FOR SELECT TO authenticated USING (true);

NOTIFY pgrst, 'reload schema';
SELECT '✅ roommate preference columns added + read policy ensured.' AS status;
