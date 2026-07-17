-- ── Welcome packages: service & tier columns ─────────────────────────────
-- The base welcome_packages table only had title/description/price/airport.
-- The student browse + detail pages and the vendor management form read a
-- richer set of fields (tier, community, per-service flags, nights, meals,
-- notes). This adds them (idempotent).
--
-- Run this in the Supabase SQL editor (same as the other db/*.sql files).

ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS tier              TEXT DEFAULT 'basic';   -- basic | standard | premium | custom
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS community         TEXT;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS notes             TEXT;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS airport_pickup    BOOLEAN DEFAULT false;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS nights_stay       INT     DEFAULT 0;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS meals_included    INT     DEFAULT 0;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS dropoff_included  BOOLEAN DEFAULT false;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS grocery_run       BOOLEAN DEFAULT false;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS campus_tour       BOOLEAN DEFAULT false;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS sim_card_help     BOOLEAN DEFAULT false;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS bank_account_help BOOLEAN DEFAULT false;
ALTER TABLE public.welcome_packages ADD COLUMN IF NOT EXISTS housing_hunt_help BOOLEAN DEFAULT false;

SELECT '✅ welcome_packages service columns ready.' AS status;
