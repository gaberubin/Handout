-- ── Welcome Requests ──────────────────────────────────────────────────────
-- When a student requests a welcome package we capture their arrival details
-- (any airport, any destination — nothing is hard-coded) as an UNASSIGNED
-- request. An admin later assigns a host, who then coordinates over messages.
--
-- Run this in the Supabase SQL editor (same as the other db/*.sql files).

CREATE TABLE IF NOT EXISTS public.welcome_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- which package (curated slug OR a real welcome_packages uuid) + a snapshot
  package_ref   TEXT,
  package_title TEXT,
  package_tier  TEXT,
  package_price NUMERIC(10,2),

  -- arrival details (all free-form — not limited to any city/airport)
  arrival_airport   TEXT,
  arrival_date      DATE,
  arrival_time      TEXT,
  flight_number     TEXT,

  -- where they're headed
  destination_city    TEXT,
  destination_address TEXT,
  university          TEXT,

  -- preferences
  community_pref TEXT,
  num_people     INT DEFAULT 1,
  dietary        TEXT,
  notes          TEXT,
  contact_phone  TEXT,

  -- workflow
  status           TEXT DEFAULT 'pending',   -- pending | assigned | confirmed | completed | cancelled
  assigned_host_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wr_status_idx  ON public.welcome_requests (status);
CREATE INDEX IF NOT EXISTS wr_student_idx ON public.welcome_requests (student_id);

ALTER TABLE public.welcome_requests ENABLE ROW LEVEL SECURITY;

-- Student: create & read their own requests
DROP POLICY IF EXISTS wr_student_insert ON public.welcome_requests;
CREATE POLICY wr_student_insert ON public.welcome_requests
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS wr_student_read ON public.welcome_requests;
CREATE POLICY wr_student_read ON public.welcome_requests
  FOR SELECT USING (auth.uid() = student_id);

-- Assigned host: read requests assigned to them
DROP POLICY IF EXISTS wr_host_read ON public.welcome_requests;
CREATE POLICY wr_host_read ON public.welcome_requests
  FOR SELECT USING (auth.uid() = assigned_host_id);

-- Admin: full control (assign hosts, change status)
DROP POLICY IF EXISTS wr_admin_all ON public.welcome_requests;
CREATE POLICY wr_admin_all ON public.welcome_requests
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

SELECT '✅ welcome_requests table ready.' AS status;
