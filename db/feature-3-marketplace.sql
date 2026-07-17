-- ════════════════════════════════════════════════════════════════════════
-- FEATURE 3 — COMMUNITY MARKETPLACE (books & items only — no food, no services)
-- Run this in Supabase → SQL Editor. Safe to re-run (idempotent).
-- Run order: after db/schema.sql. Independent of features 1 and 2.
--
-- Photos reuse the existing PUBLIC 'listing-media' bucket (db/storage-setup.sql)
-- — no new bucket needed. Only VERIFIED students can post (public.is_approved()).
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.market_listings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2),
  category    TEXT,                       -- Textbook | Furniture | Electronics | Other
  media       JSONB DEFAULT '[]'::jsonb,  -- array of public image URLs (max 5, app-enforced)
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ml_active_idx ON public.market_listings (is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS ml_user_idx   ON public.market_listings (user_id);

ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

-- Read: signed-in students see ACTIVE listings (and always their own).
DROP POLICY IF EXISTS ml_read ON public.market_listings;
CREATE POLICY ml_read ON public.market_listings
  FOR SELECT TO authenticated
  USING (is_active = true OR auth.uid() = user_id);

-- Read: anonymous visitors see active listings (parity with other listing tables).
DROP POLICY IF EXISTS ml_read_public ON public.market_listings;
CREATE POLICY ml_read_public ON public.market_listings
  FOR SELECT TO anon
  USING (is_active = true);

-- Insert: VERIFIED students only (existing verification gate).
DROP POLICY IF EXISTS ml_insert ON public.market_listings;
CREATE POLICY ml_insert ON public.market_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_approved());

-- Update / delete: owner only.
DROP POLICY IF EXISTS ml_update ON public.market_listings;
CREATE POLICY ml_update ON public.market_listings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS ml_delete ON public.market_listings;
CREATE POLICY ml_delete ON public.market_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Admin: full control (moderation).
DROP POLICY IF EXISTS ml_admin ON public.market_listings;
CREATE POLICY ml_admin ON public.market_listings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

SELECT '✅ Feature 3 ready — market_listings table with RLS (public read active, verified-only insert, owner write/delete).' AS status;
