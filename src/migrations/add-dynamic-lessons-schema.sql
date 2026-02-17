-- Dynamic lesson system for 25+ lessons per path
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL CHECK (path IN ('robotics', 'space_shooter', 'platformer', 'simple_rpg')),
  order_num INTEGER NOT NULL,
  part INTEGER DEFAULT 2,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')) DEFAULT 'medium',
  estimated_minutes INTEGER DEFAULT 20,
  icon TEXT DEFAULT '📝',
  starter_code TEXT NOT NULL,
  solution_code TEXT NOT NULL,
  tests JSONB NOT NULL,
  hints JSONB,
  required_concepts TEXT[],
  is_pro_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(path, order_num, part)
);

CREATE INDEX IF NOT EXISTS idx_lessons_path ON lessons(path);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_num);
CREATE INDEX IF NOT EXISTS idx_lessons_pro ON lessons(is_pro_only);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lessons" ON lessons
  FOR SELECT USING (true);

-- Add path tracking to lesson_progress
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS path TEXT;
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS lesson_order_num INTEGER;

-- Sample "coming soon" lessons to show growth roadmap
INSERT INTO lessons (id, path, order_num, part, title, description, difficulty, estimated_minutes, icon, is_pro_only, starter_code, solution_code, tests)
VALUES
  ('lesson-26-sensor-fusion', 'robotics', 26, 2, 'Multi-Sensor Fusion',
   'Combine data from multiple sensors for accurate positioning.',
   'expert', 45, '🧠', true,
   '// Coming soon', '// Coming soon', '[]'),
  ('lesson-27-slam-basics', 'robotics', 27, 2, 'SLAM Fundamentals',
   'Build a basic simultaneous localization and mapping system.',
   'expert', 60, '🗺️', true,
   '// Coming soon', '// Coming soon', '[]'),
  ('lesson-26-flocking-ai', 'space_shooter', 26, 2, 'Flocking AI',
   'Implement boids-style flocking for enemy formations.',
   'expert', 45, '🐦', true,
   '// Coming soon', '// Coming soon', '[]'),
  ('lesson-26-wall-jump', 'platformer', 26, 2, 'Wall Jumping',
   'Implement wall detection and wall jump mechanics.',
   'expert', 45, '🧗', true,
   '// Coming soon', '// Coming soon', '[]'),
  ('lesson-26-proc-dungeons', 'simple_rpg', 26, 2, 'Procedural Dungeons',
   'Generate random dungeon layouts with rooms and corridors.',
   'expert', 50, '🏰', true,
   '// Coming soon', '// Coming soon', '[]')
ON CONFLICT DO NOTHING;
