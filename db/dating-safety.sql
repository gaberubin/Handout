-- ════════════════════════════════════════════════════════════════════════
-- CAMPUS CONNECT SAFETY — Block & Report
-- Run in Supabase → SQL Editor. Safe to re-run (idempotent).
--
--   • dating_blocks         — student blocks another student (one-directional)
--   • dating_reports        — student reports another student, visible to admin
--   • block_dating_user()   — SECURITY DEFINER: records the block AND removes
--                              both sides of any existing like/match atomically
--                              (so a blocked match disappears immediately).
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.dating_blocks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id)
);
ALTER TABLE public.dating_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS db_owner ON public.dating_blocks;
CREATE POLICY db_owner ON public.dating_blocks
  FOR ALL USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);
DROP POLICY IF EXISTS db_admin ON public.dating_blocks;
CREATE POLICY db_admin ON public.dating_blocks
  FOR SELECT USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.dating_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reported_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT DEFAULT 'open',   -- open | reviewed | closed
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.dating_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dr_insert ON public.dating_reports;
CREATE POLICY dr_insert ON public.dating_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS dr_admin ON public.dating_reports;
CREATE POLICY dr_admin ON public.dating_reports
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Block + auto-unmatch in one atomic call.
CREATE OR REPLACE FUNCTION public.block_dating_user(p_blocked_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_blocked_id = auth.uid() THEN RETURN; END IF;

  INSERT INTO public.dating_blocks (blocker_id, blocked_id)
  VALUES (auth.uid(), p_blocked_id)
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  DELETE FROM public.dating_likes
  WHERE (liker_id = auth.uid() AND liked_id = p_blocked_id)
     OR (liker_id = p_blocked_id AND liked_id = auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.block_dating_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.block_dating_user(UUID) TO authenticated;

SELECT '✅ Campus Connect safety ready — dating_blocks, dating_reports, block_dating_user().' AS status;
