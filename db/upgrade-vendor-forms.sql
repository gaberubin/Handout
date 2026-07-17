-- New vendor-form fields: weekly tiffin menu + pricing, category-specific service details.
-- Run once in Supabase → SQL Editor. Safe to re-run. Does NOT wipe data.
ALTER TABLE public.tiffin_listings ADD COLUMN IF NOT EXISTS price_per_week NUMERIC;
ALTER TABLE public.tiffin_listings ADD COLUMN IF NOT EXISTS meals_per_day INT DEFAULT 1;
ALTER TABLE public.tiffin_listings ADD COLUMN IF NOT EXISTS weekly_menu JSONB;
ALTER TABLE public.service_listings ADD COLUMN IF NOT EXISTS details JSONB;
NOTIFY pgrst, 'reload schema';
SELECT '✅ Vendor form columns added.' AS status;
