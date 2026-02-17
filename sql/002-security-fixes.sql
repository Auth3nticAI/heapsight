-- ═══════════════════════════════════════════════════════════════════════════
-- HeapSight: Security & Data Integrity Fixes
-- Run this in the Supabase SQL Editor after 001-retention-features.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- FIX C4: increment_xp RPC function (was referenced but never created)
-- Uses SECURITY INVOKER so auth.uid() resolves to the calling user.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_xp(xp_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_xp = COALESCE(total_xp, 0) + xp_amount
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- ─────────────────────────────────────────────────────────────────────────
-- FIX C7: Atomic record_lesson_completion (replaces read-then-write pattern)
-- Single INSERT ... ON CONFLICT DO UPDATE avoids race conditions.
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION record_lesson_completion(p_user_id UUID, p_xp INT)
RETURNS TABLE(lessons_today INT, xp_today INT) AS $$
BEGIN
  INSERT INTO daily_activity (user_id, activity_date, lessons_completed, xp_earned)
  VALUES (p_user_id, CURRENT_DATE, 1, p_xp)
  ON CONFLICT (user_id, activity_date) DO UPDATE
  SET lessons_completed = daily_activity.lessons_completed + 1,
      xp_earned = daily_activity.xp_earned + p_xp;

  RETURN QUERY
  SELECT da.lessons_completed, da.xp_earned
  FROM daily_activity da
  WHERE da.user_id = p_user_id AND da.activity_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────
-- FIX H12: Profiles table RLS policies
-- Ensures users can only read/update their own profile row.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Allow the trigger / auth hook to insert a profile row on signup
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────
-- FIX C8: Updated weekly_leaderboard view (email → display_name)
-- Must DROP first because PostgreSQL can't rename columns via CREATE OR REPLACE.
-- ─────────────────────────────────────────────────────────────────────────
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

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 2: Idempotent XP Award + Achievement Unlock + Missing RLS
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- Idempotent lesson XP award: only grants XP on first completion
-- Prevents duplicate XP from rapid re-submissions
-- Works with or without the "path" column on lesson_progress
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION award_lesson_xp(
  p_lesson_id TEXT,
  p_xp_amount INTEGER,
  p_path TEXT
)
RETURNS TABLE(xp_awarded BOOLEAN, is_first_completion BOOLEAN, new_total_xp INTEGER)
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_user_id UUID;
  v_already_completed BOOLEAN;
  v_new_xp INTEGER;
  v_has_path_col BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check whether lesson_progress has a "path" column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lesson_progress'
      AND column_name = 'path'
  ) INTO v_has_path_col;

  IF v_has_path_col THEN
    EXECUTE 'SELECT EXISTS (
      SELECT 1 FROM lesson_progress
      WHERE user_id = $1 AND lesson_id = $2 AND path = $3 AND status = ''completed''
    )' INTO v_already_completed USING v_user_id, p_lesson_id, p_path;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM lesson_progress
      WHERE user_id = v_user_id
        AND lesson_id = p_lesson_id
        AND status = 'completed'
    ) INTO v_already_completed;
  END IF;

  IF NOT v_already_completed THEN
    UPDATE profiles
    SET total_xp = COALESCE(total_xp, 0) + p_xp_amount
    WHERE id = v_user_id
    RETURNING total_xp INTO v_new_xp;

    RETURN QUERY SELECT true, true, v_new_xp;
  ELSE
    SELECT total_xp INTO v_new_xp FROM profiles WHERE id = v_user_id;
    RETURN QUERY SELECT false, false, v_new_xp;
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Idempotent achievement unlock + XP bonus: prevents duplicate awards
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION award_achievement_xp(
  p_achievement_id TEXT,
  p_xp_amount INTEGER
)
RETURNS TABLE(xp_awarded BOOLEAN, is_new_unlock BOOLEAN)
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_user_id UUID;
  v_inserted BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Attempt insert; ON CONFLICT means already unlocked
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (v_user_id, p_achievement_id)
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted > 0 THEN
    UPDATE profiles
    SET total_xp = COALESCE(total_xp, 0) + p_xp_amount
    WHERE id = v_user_id;
    RETURN QUERY SELECT true, true;
  ELSE
    RETURN QUERY SELECT false, false;
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Missing RLS: achievements table (read-only for users)
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT TO authenticated USING (true);

-- ─────────────────────────────────────────────────────────────────────────
-- Missing RLS: daily_challenges table (read-only for users)
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view challenges" ON daily_challenges;
CREATE POLICY "Anyone can view challenges" ON daily_challenges
  FOR SELECT TO authenticated USING (true);

-- ─────────────────────────────────────────────────────────────────────────
-- Missing RLS: notification_queue table (users see only their own)
-- ─────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notification_queue') THEN
    ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users see own notifications" ON notification_queue;
    CREATE POLICY "Users see own notifications" ON notification_queue
      FOR ALL TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────
-- Performance indexes
-- ─────────────────────────────────────────────────────────────────────────
-- Only create the composite index if the "path" column exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lesson_progress'
      AND column_name = 'path'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson_path
      ON lesson_progress(user_id, lesson_id, path);
  ELSE
    CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson
      ON lesson_progress(user_id, lesson_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_total_xp
  ON profiles(total_xp DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- NOT NULL constraints on daily_activity numeric columns
-- ─────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_col RECORD;
BEGIN
  -- Only proceed if the table exists
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_activity') THEN
    RETURN;
  END IF;

  -- For each expected numeric column, backfill NULLs and set NOT NULL + DEFAULT 0
  FOR v_col IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_activity'
      AND column_name IN ('xp_earned', 'lessons_completed', 'time_spent_seconds')
  LOOP
    EXECUTE format('UPDATE daily_activity SET %I = 0 WHERE %I IS NULL', v_col.column_name, v_col.column_name);
    EXECUTE format('ALTER TABLE daily_activity ALTER COLUMN %I SET NOT NULL', v_col.column_name);
    EXECUTE format('ALTER TABLE daily_activity ALTER COLUMN %I SET DEFAULT 0', v_col.column_name);
  END LOOP;
END $$;
