-- Run this if you ALREADY created the tables and don't want to wipe data.
-- It adds the columns the room-listing form needs (fixes the save error)
-- and supports photos/videos. Safe to run more than once.

ALTER TABLE public.roommate_listings
  ADD COLUMN IF NOT EXISTS listing_type  TEXT NOT NULL DEFAULT 'have',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS media         JSONB DEFAULT '[]'::jsonb;

SELECT '✅ roommate_listings upgraded (listing_type, contact_phone, media).' AS status;
