-- ════════════════════════════════════════════════════════════════════════
-- FEATURE 1 — REWARDS / POINTS SYSTEM
-- Run this in Supabase → SQL Editor. Safe to re-run (idempotent).
-- Run order: after db/schema.sql. No dependencies on features 2/3.
--
-- Adds:
--   • users.points / users.streak / users.last_active        (columns)
--   • point_events                                            (ledger table, RLS)
--   • award_points(action)      SECURITY DEFINER              (server-authoritative)
--   • touch_daily_login()       SECURITY DEFINER              (daily streak + login pts)
--
-- SECURITY NOTE: the point AMOUNT is decided inside the function by the action
-- name — the client can never choose how many points to grant, and a per-action
-- daily cap blocks farming. Points are only ever written through these two
-- SECURITY DEFINER functions.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. USER COLUMNS ───────────────────────────────────────────────────────
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points      INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS streak      INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_active DATE;

-- ── 2. POINT EVENTS LEDGER ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.point_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  points     INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pe_user_idx      ON public.point_events (user_id);
CREATE INDEX IF NOT EXISTS pe_user_day_idx  ON public.point_events (user_id, action, created_at);

ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;

-- users can read ONLY their own point history
DROP POLICY IF EXISTS pe_owner_read ON public.point_events;
CREATE POLICY pe_owner_read ON public.point_events
  FOR SELECT USING (auth.uid() = user_id);

-- admins can see everything (moderation / support)
DROP POLICY IF EXISTS pe_admin_all ON public.point_events;
CREATE POLICY pe_admin_all ON public.point_events
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- NOTE: no INSERT policy on purpose. Rows are only ever inserted by the
-- award_points() SECURITY DEFINER function below (which runs as the function
-- owner and bypasses RLS). This prevents clients writing arbitrary ledger rows.

-- ── 3. AWARD POINTS (server-authoritative amount + daily cap) ─────────────
CREATE OR REPLACE FUNCTION public.award_points(p_action TEXT)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid         UUID := auth.uid();
  v_amount      INT;
  v_daily_cap   INT;
  v_today_count INT;
BEGIN
  IF v_uid IS NULL THEN RETURN 0; END IF;

  -- canonical point values — the ONLY place amounts are defined
  v_amount := CASE p_action
    WHEN 'create_post'            THEN 15
    WHEN 'send_message'           THEN 2
    WHEN 'rsvp_event'             THEN 10
    WHEN 'refer_friend'           THEN 50
    WHEN 'complete_profile'       THEN 40
    WHEN 'get_verified'           THEN 60
    WHEN 'daily_login'            THEN 5
    WHEN 'list_item'              THEN 20
    WHEN 'set_connection_profile' THEN 25
    ELSE 0
  END;
  IF v_amount = 0 THEN RETURN 0; END IF;

  -- anti-farming: max times this action can pay out per day
  v_daily_cap := CASE p_action
    WHEN 'send_message' THEN 10
    WHEN 'create_post'  THEN 5
    WHEN 'rsvp_event'   THEN 10
    WHEN 'list_item'    THEN 10
    ELSE 1                       -- profile / verify / refer / daily_login → once per day
  END;

  SELECT COUNT(*) INTO v_today_count
  FROM public.point_events
  WHERE user_id = v_uid AND action = p_action
    AND created_at >= date_trunc('day', now());

  IF v_today_count >= v_daily_cap THEN RETURN 0; END IF;

  INSERT INTO public.point_events (user_id, action, points)
  VALUES (v_uid, p_action, v_amount);

  UPDATE public.users
     SET points = COALESCE(points, 0) + v_amount
   WHERE id = v_uid;

  RETURN v_amount;
END;
$$;

REVOKE ALL ON FUNCTION public.award_points(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_points(TEXT) TO authenticated;

-- ── 4. DAILY LOGIN STREAK ─────────────────────────────────────────────────
-- Called once per app load. Increments streak on consecutive days, resets
-- otherwise, and pays the daily_login bonus (once/day via award_points cap).
CREATE OR REPLACE FUNCTION public.touch_daily_login()
RETURNS TABLE(points INTEGER, streak INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid    UUID := auth.uid();
  v_last   DATE;
  v_streak INT;
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;

  -- columns qualified (u.*) so they don't collide with the OUT params points/streak
  SELECT u.last_active, COALESCE(u.streak, 0)
    INTO v_last, v_streak
  FROM public.users u WHERE u.id = v_uid;

  IF v_last IS DISTINCT FROM current_date THEN
    IF v_last = current_date - 1 THEN
      v_streak := v_streak + 1;      -- consecutive day
    ELSE
      v_streak := 1;                 -- streak broken / first ever
    END IF;
    UPDATE public.users
       SET last_active = current_date, streak = v_streak
     WHERE id = v_uid;
    PERFORM public.award_points('daily_login');
  END IF;

  RETURN QUERY SELECT u.points, u.streak FROM public.users u WHERE u.id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.touch_daily_login() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.touch_daily_login() TO authenticated;

-- ── 5. REFERRAL AWARD (server-side, credits the REFERRER) ─────────────────
-- Referral completion is tracked by users.referral_count. Awarding this from
-- the client would credit the wrong person (the current session), so we do it
-- with a trigger that credits NEW.id (the referrer) whenever their count rises.
CREATE OR REPLACE FUNCTION public.on_referral_award()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_delta INT := COALESCE(NEW.referral_count, 0) - COALESCE(OLD.referral_count, 0);
BEGIN
  IF v_delta > 0 THEN
    INSERT INTO public.point_events (user_id, action, points)
    VALUES (NEW.id, 'refer_friend', 50 * v_delta);
    NEW.points := COALESCE(NEW.points, 0) + 50 * v_delta;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_referral_award ON public.users;
CREATE TRIGGER trg_referral_award
  BEFORE UPDATE OF referral_count ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.on_referral_award();

SELECT '✅ Feature 1 ready — points/streak columns, point_events (RLS), award_points(), touch_daily_login(), referral trigger.' AS status;
