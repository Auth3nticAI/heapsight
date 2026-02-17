-- Path progress table: tracks per-path completion for multi-path Pro feature
CREATE TABLE IF NOT EXISTS path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  path_template TEXT NOT NULL,
  lessons_completed INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  current_lesson_id TEXT,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, path_template)
);

-- Enable RLS
ALTER TABLE path_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own path progress" ON path_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_path_progress_user ON path_progress(user_id);

-- Migration: seed path_progress from existing profile data
INSERT INTO path_progress (user_id, path_template, last_accessed)
SELECT id, selected_game_template, NOW()
FROM profiles
WHERE selected_game_template IS NOT NULL
ON CONFLICT (user_id, path_template) DO NOTHING;
