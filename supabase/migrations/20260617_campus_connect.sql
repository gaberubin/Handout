-- ══════════════════════════════════════════════════════════
--  Campus Connect — dating_profiles + dating_likes tables
--  Run this in Supabase SQL Editor to enable the feature.
-- ══════════════════════════════════════════════════════════

-- 1. Dating profiles (opt-in, one per student)
CREATE TABLE IF NOT EXISTS dating_profiles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_visible   BOOLEAN     DEFAULT TRUE,
  display_name TEXT,
  age          INTEGER     CHECK (age >= 18 AND age <= 60),
  gender       TEXT,
  looking_for  TEXT        DEFAULT 'everyone',  -- 'men', 'women', 'everyone'
  bio          TEXT,
  interests    TEXT[],
  photo_url    TEXT,
  university   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Likes (who liked whom)
CREATE TABLE IF NOT EXISTS dating_likes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);

-- 3. RLS — dating_profiles
ALTER TABLE dating_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dp_select_auth" ON dating_profiles;
DROP POLICY IF EXISTS "dp_insert_own"  ON dating_profiles;
DROP POLICY IF EXISTS "dp_update_own"  ON dating_profiles;
DROP POLICY IF EXISTS "dp_delete_own"  ON dating_profiles;

CREATE POLICY "dp_select_auth"
  ON dating_profiles FOR SELECT
  TO authenticated
  USING (is_visible = TRUE OR auth.uid() = user_id);

CREATE POLICY "dp_insert_own"
  ON dating_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dp_update_own"
  ON dating_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "dp_delete_own"
  ON dating_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. RLS — dating_likes
ALTER TABLE dating_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dl_select_own" ON dating_likes;
DROP POLICY IF EXISTS "dl_insert_own" ON dating_likes;
DROP POLICY IF EXISTS "dl_delete_own" ON dating_likes;

CREATE POLICY "dl_select_own"
  ON dating_likes FOR SELECT
  TO authenticated
  USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "dl_insert_own"
  ON dating_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "dl_delete_own"
  ON dating_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = liker_id);
