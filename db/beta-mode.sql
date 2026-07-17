-- ════════════════════════════════════════════════════════════════════════
-- BETA MODE — supporting tables
-- Run this in Supabase → SQL Editor. Safe to re-run (idempotent).
-- Run order: after db/schema.sql and db/feature-3-marketplace.sql.
--
--   • beta_waitlist   — "Join the waitlist" on Coming Soon pages
--   • market_saves    — students can SAVE marketplace listings
--   • market_reports  — students can REPORT marketplace listings
-- ════════════════════════════════════════════════════════════════════════

-- ── Coming-soon waitlist ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.beta_waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  feature    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, feature)
);
ALTER TABLE public.beta_waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bw_owner ON public.beta_waitlist;
CREATE POLICY bw_owner ON public.beta_waitlist
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS bw_admin ON public.beta_waitlist;
CREATE POLICY bw_admin ON public.beta_waitlist
  FOR SELECT USING (public.is_admin());

-- ── Saved marketplace listings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.market_saves (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.market_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, listing_id)
);
ALTER TABLE public.market_saves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS msv_owner ON public.market_saves;
CREATE POLICY msv_owner ON public.market_saves
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Reported marketplace listings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.market_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID REFERENCES public.market_listings(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.market_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mr_insert ON public.market_reports;
CREATE POLICY mr_insert ON public.market_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS mr_admin ON public.market_reports;
CREATE POLICY mr_admin ON public.market_reports
  FOR SELECT USING (public.is_admin());

-- ── Beta feedback (floating Feedback widget) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  category   TEXT,                       -- bug | feature | general
  message    TEXT NOT NULL,
  status     TEXT DEFAULT 'new',         -- new | reviewed | closed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fb_insert ON public.feedback;
CREATE POLICY fb_insert ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS fb_read_own ON public.feedback;
CREATE POLICY fb_read_own ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS fb_admin ON public.feedback;
CREATE POLICY fb_admin ON public.feedback
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

SELECT '✅ Beta mode tables ready — beta_waitlist, market_saves, market_reports, feedback (RLS).' AS status;
