-- Add the `type` column to notifications if it doesn't exist yet.
-- Run once in Supabase → SQL Editor. Safe to re-run.
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'system';
NOTIFY pgrst, 'reload schema';
SELECT '✅ notifications.type column ready.' AS status;
