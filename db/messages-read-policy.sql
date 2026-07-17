-- ── Messages: allow receivers to mark messages as read ──────────────────
-- The messages table has an is_read flag but no UPDATE policy, so the
-- client could never flip it. This grants UPDATE on ONLY the is_read
-- column (column-level grant), and only to the message's receiver.
--
-- Run this in the Supabase SQL editor (same as the other db/*.sql files).

-- Restrict updates to the is_read column only
REVOKE UPDATE ON public.messages FROM authenticated;
GRANT UPDATE (is_read) ON public.messages TO authenticated;

-- Only the receiver of a message may update it
DROP POLICY IF EXISTS msg_mark_read ON public.messages;
CREATE POLICY msg_mark_read ON public.messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);
