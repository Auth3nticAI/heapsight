-- ============================================================================
-- Migration: Add path column to lesson_progress for path-isolated tracking
--
-- Problem: lesson_progress uses (user_id, lesson_id) as unique key, but
-- lesson_id is the same across paths ("lesson-06", etc.), so completing
-- a lesson in one path marks it complete in all paths.
--
-- Fix: Add path column, migrate existing data, update unique constraint.
-- ============================================================================

-- Step 1: Add path column (nullable initially for migration)
ALTER TABLE lesson_progress
  ADD COLUMN IF NOT EXISTS path TEXT;

-- Step 2: Backfill existing records with user's current selected_game_template
UPDATE lesson_progress lp
SET path = (
  SELECT selected_game_template
  FROM profiles
  WHERE profiles.id = lp.user_id
)
WHERE lp.path IS NULL;

-- Step 3: Set a default for any orphan rows (no matching profile)
UPDATE lesson_progress
SET path = 'differential_drive_robot'
WHERE path IS NULL;

-- Step 4: Make path required going forward
ALTER TABLE lesson_progress
  ALTER COLUMN path SET NOT NULL;

-- Step 5: Drop old unique constraint (user_id, lesson_id)
ALTER TABLE lesson_progress
  DROP CONSTRAINT IF EXISTS lesson_progress_user_id_lesson_id_key;

-- Step 6: Add new unique constraint (user_id, lesson_id, path)
ALTER TABLE lesson_progress
  ADD CONSTRAINT lesson_progress_user_lesson_path_unique
  UNIQUE (user_id, lesson_id, path);

-- Step 7: Create index for faster per-path queries
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_path
  ON lesson_progress(user_id, path);

-- Step 8: Verify migration
SELECT
  user_id,
  lesson_id,
  path,
  status,
  completed_at
FROM lesson_progress
ORDER BY user_id, path, lesson_id
LIMIT 20;
