-- ============================================================================
-- LESSON ENHANCEMENT SCHEMA
-- ============================================================================
-- Supports: DB-backed hints, AI tutor tracking, session analytics
-- Note: lesson_id is TEXT (e.g. "01-hello-world") since lessons are defined
-- in TypeScript, not in a database table.

-- ============================================================================
-- HINT SYSTEM TABLES
-- ============================================================================

-- Pre-written hints for each lesson (3 levels of scaffolding)
CREATE TABLE IF NOT EXISTS lesson_hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  hint_level INTEGER NOT NULL CHECK (hint_level BETWEEN 1 AND 3),
  hint_text TEXT NOT NULL,
  hint_code TEXT,
  unlock_after_seconds INTEGER DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_hints_lesson
  ON lesson_hints(lesson_id, hint_level);

ALTER TABLE lesson_hints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view hints" ON lesson_hints;
CREATE POLICY "Anyone can view hints"
  ON lesson_hints FOR SELECT
  TO authenticated
  USING (true);

-- Track hint usage for analytics
CREATE TABLE IF NOT EXISTS hint_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  hint_level INTEGER NOT NULL,
  time_before_hint_seconds INTEGER NOT NULL,
  helped_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hint_usage_user_lesson
  ON hint_usage(user_id, lesson_id);

ALTER TABLE hint_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own hint usage" ON hint_usage;
CREATE POLICY "Users can insert own hint usage"
  ON hint_usage FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own hint usage" ON hint_usage;
CREATE POLICY "Users can view own hint usage"
  ON hint_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- AI TUTOR TABLES (PRO FEATURE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('error_explanation', 'code_suggestion', 'concept_clarification')),
  user_code TEXT NOT NULL,
  error_message TEXT,
  ai_response TEXT NOT NULL,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  model_used TEXT,
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tutor_user ON ai_tutor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_lesson ON ai_tutor_sessions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_date ON ai_tutor_sessions(created_at);

ALTER TABLE ai_tutor_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own AI tutor sessions" ON ai_tutor_sessions;
CREATE POLICY "Users can insert own AI tutor sessions"
  ON ai_tutor_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own AI tutor sessions" ON ai_tutor_sessions;
CREATE POLICY "Users can view own AI tutor sessions"
  ON ai_tutor_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own AI tutor sessions" ON ai_tutor_sessions;
CREATE POLICY "Users can update own AI tutor sessions"
  ON ai_tutor_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SESSION TRACKING (MICRO-LEARNING ANALYTICS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS lesson_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_on_part1_seconds INTEGER DEFAULT 0,
  time_on_part2_seconds INTEGER DEFAULT 0,
  attempts_before_success INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  ai_help_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_sessions_user
  ON lesson_sessions(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_lesson
  ON lesson_sessions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_sessions_completed
  ON lesson_sessions(lesson_id, completed_at)
  WHERE completed_at IS NOT NULL;

ALTER TABLE lesson_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own sessions" ON lesson_sessions;
CREATE POLICY "Users can manage own sessions"
  ON lesson_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
