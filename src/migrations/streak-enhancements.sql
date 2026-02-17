-- Streak enhancements: history table for analytics and milestone tracking
-- NOTE: Requires 001-retention-features.sql to be run first (creates user_streaks, daily_activity, etc.)
-- If you haven't run it yet, run sql/001-retention-features.sql in Supabase SQL Editor first.

-- Create streak_history table (tracks daily snapshots for analytics)
CREATE TABLE IF NOT EXISTS streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_count INTEGER NOT NULL,
  milestone_reached INTEGER, -- e.g. 7, 30, 100 (NULL if not a milestone day)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE streak_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own streak history" ON streak_history;
CREATE POLICY "Users view own streak history" ON streak_history
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_streak_history_user
  ON streak_history(user_id, date DESC);
