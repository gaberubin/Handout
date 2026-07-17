-- ── Verifications: selfie column ─────────────────────────────────────────
-- Student ID verification now captures BOTH a student ID card photo
-- (id_doc_path) and a live selfie (selfie_path) so admins can match the
-- face to the ID. Both live in the PRIVATE id-documents bucket.
--
-- Run this in the Supabase SQL editor (same as the other db/*.sql files).

ALTER TABLE public.verifications ADD COLUMN IF NOT EXISTS selfie_path TEXT;

SELECT '✅ verifications.selfie_path ready.' AS status;
