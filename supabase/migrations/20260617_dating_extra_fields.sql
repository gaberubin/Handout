ALTER TABLE dating_profiles ADD COLUMN IF NOT EXISTS photos        TEXT[]  DEFAULT '{}';
ALTER TABLE dating_profiles ADD COLUMN IF NOT EXISTS major         TEXT;
ALTER TABLE dating_profiles ADD COLUMN IF NOT EXISTS year_of_study TEXT;
ALTER TABLE dating_profiles ADD COLUMN IF NOT EXISTS height_cm     INTEGER;
ALTER TABLE dating_profiles ADD COLUMN IF NOT EXISTS hometown      TEXT;
