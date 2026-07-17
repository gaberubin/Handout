-- Subletting: add sublet_end_date to roommate_listings
ALTER TABLE roommate_listings ADD COLUMN IF NOT EXISTS sublet_end_date DATE;

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at     TIMESTAMPTZ,
  rewarded      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Insert own referrals" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);
