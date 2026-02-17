-- ═══════════════════════════════════════════════════════════════════════════
-- HeapSight: Retention Features Schema (Phase 1-2)
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- TASK 1: Extend profiles table
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_notification_time TIME DEFAULT '20:00:00';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- ─────────────────────────────────────────────────────────────────────────
-- TASK 2: Streak tracking
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_count INT DEFAULT 0,
  last_freeze_reset DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own streaks" ON user_streaks;
CREATE POLICY "Users manage own streaks" ON user_streaks
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- TASK 3: Achievements
-- ─────────────────────────────────────────────────────────────────────────
-- Drop old tables if they exist with wrong column types (UUID vs TEXT id)
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category TEXT,
  unlock_condition JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own achievements" ON user_achievements;
CREATE POLICY "Users view own achievements" ON user_achievements
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- TASK 4: Daily challenges
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  lesson_id TEXT NOT NULL,
  challenge_type TEXT CHECK (challenge_type IN ('speed', 'perfect', 'debug', 'creative')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  time_limit_seconds INT,
  reward_xp INT DEFAULT 100,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_taken_seconds INT,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_challenge_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own challenge completions" ON user_challenge_completions;
CREATE POLICY "Users manage own challenge completions" ON user_challenge_completions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- TASK 5: Daily activity tracking (for leaderboard)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INT DEFAULT 0,
  lessons_completed INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own activity" ON daily_activity;
CREATE POLICY "Users manage own activity" ON daily_activity
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Weekly leaderboard view
DROP VIEW IF EXISTS weekly_leaderboard;
CREATE VIEW weekly_leaderboard AS
SELECT
  p.id,
  SPLIT_PART(p.email, '@', 1) AS display_name,
  p.total_xp,
  COALESCE(SUM(da.xp_earned), 0) AS weekly_xp,
  COALESCE(SUM(da.lessons_completed), 0) AS weekly_lessons
FROM profiles p
LEFT JOIN daily_activity da
  ON p.id = da.user_id
  AND da.activity_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY p.id, p.email, p.total_xp
ORDER BY weekly_xp DESC
LIMIT 100;

-- ─────────────────────────────────────────────────────────────────────────
-- TASK 6: Notification queue
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled
  ON notification_queue(scheduled_for, status);

-- ─────────────────────────────────────────────────────────────────────────
-- TASK 7: Database functions
-- ─────────────────────────────────────────────────────────────────────────

-- Update user streak on activity
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INT;
  v_longest_streak INT;
BEGIN
  -- Ensure row exists
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (p_user_id, 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM user_streaks
  WHERE user_id = p_user_id;

  IF v_last_activity = CURRENT_DATE THEN
    -- Already counted today
    RETURN;
  ELSIF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day
    v_current_streak := v_current_streak + 1;
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  ELSE
    -- Streak broken (or first activity)
    v_current_streak := 1;
    IF v_longest_streak = 0 THEN
      v_longest_streak := 1;
    END IF;
  END IF;

  UPDATE user_streaks
  SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Also update profiles.last_activity_date
  UPDATE profiles
  SET last_activity_date = CURRENT_DATE
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_completed_count INT;
  v_current_streak INT;
BEGIN
  -- Count completed lessons
  SELECT COUNT(*) INTO v_completed_count
  FROM lesson_progress
  WHERE user_id = p_user_id AND status = 'completed';

  -- Get current streak
  SELECT current_streak INTO v_current_streak
  FROM user_streaks
  WHERE user_id = p_user_id;

  -- First Steps: complete 1 lesson
  IF v_completed_count >= 1 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (p_user_id, 'first_steps')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  -- C++ Novice: complete 5 lessons
  IF v_completed_count >= 5 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (p_user_id, 'cpp_novice')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  -- Consistent Coder: 7-day streak
  IF v_current_streak >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (p_user_id, 'consistent_coder')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;

  -- Unstoppable: 30-day streak
  IF v_current_streak >= 30 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (p_user_id, 'unstoppable')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────
-- TASK 8: Seed initial achievements
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO achievements (id, title, description, icon, rarity, category) VALUES
  ('first_steps',      'First Steps',      'Complete your first lesson',                     '🎯', 'common',    'progress'),
  ('cpp_novice',       'C++ Novice',       'Complete 5 lessons',                             '📚', 'common',    'progress'),
  ('consistent_coder', 'Consistent Coder', 'Maintain a 7-day streak',                       '🔥', 'rare',      'streak'),
  ('unstoppable',      'Unstoppable',      'Maintain a 30-day streak',                       '⚡', 'epic',      'streak'),
  ('speed_demon',      'Speed Demon',      'Complete a lesson in under 2 minutes',           '⚡', 'rare',      'speed'),
  ('perfectionist',    'Perfectionist',    'Complete 10 lessons with 100% on first try',     '💎', 'epic',      'quality'),
  ('night_owl',        'Night Owl',        'Code between 12am-4am',                          '🦉', 'rare',      'special'),
  ('early_bird',       'Early Bird',       'Code between 5am-7am',                           '🐦', 'rare',      'special'),
  ('weekend_warrior',  'Weekend Warrior',  'Code on both Saturday and Sunday',               '⚔️', 'rare',      'special'),
  ('memory_master',    'Memory Master',    'Complete pointers lesson on first try',           '🧠', 'legendary', 'mastery')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- TASK 9: Performance indexes
-- ─────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_user_challenge_completions_user ON user_challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON daily_activity(user_id, activity_date);
