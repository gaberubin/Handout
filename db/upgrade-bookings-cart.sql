-- ── Bookings: cart / checkout detail columns ─────────────────────────────
-- The cart sends quantity, item name, fulfillment method (pickup/delivery),
-- delivery address and payment method with each order, but the base
-- bookings table has no columns for them — so those details were being
-- dropped and the vendor never saw them. This adds them (idempotent).
--
-- Run this in the Supabase SQL editor (same as the other db/*.sql files).

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS qty              INT DEFAULT 1;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS item_name        TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS fulfillment      TEXT;      -- 'pickup' | 'delivery'
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method   TEXT;      -- 'venmo' | 'zelle' | 'cashapp' | 'card'

SELECT '✅ bookings cart columns ready.' AS status;
