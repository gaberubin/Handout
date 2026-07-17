-- ════════════════════════════════════════════════════════════════
-- HANDOUT — DELETE ALL DATA  (keeps the tables, empties them)
-- Run in Supabase → SQL Editor. This does NOT drop tables; it clears rows.
-- To rebuild from scratch instead, run schema.sql (it drops + recreates).
-- ════════════════════════════════════════════════════════════════

TRUNCATE TABLE
  public.verifications,
  public.notifications,
  public.reviews,
  public.messages,
  public.bookings,
  public.welcome_packages,
  public.service_listings,
  public.tiffin_listings,
  public.roommate_listings,
  public.provider_profiles,
  public.student_profiles,
  public.users
RESTART IDENTITY CASCADE;

-- OPTIONAL — also remove every login (auth accounts).
-- Uncomment the next line ONLY if you want to wipe users entirely and start
-- signups fresh. This cannot be undone.
-- DELETE FROM auth.users;

SELECT '🧹 All Handout data cleared.' AS status;
