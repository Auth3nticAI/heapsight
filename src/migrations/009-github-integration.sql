-- Migration 009: GitHub integration (auto-commit on lesson completion)

-- Add GitHub fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_access_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_repos JSONB DEFAULT '{}'::jsonb;

-- Commit tracking table (idempotent via UNIQUE constraint)
CREATE TABLE IF NOT EXISTS github_commits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  lesson_id text NOT NULL,
  path text NOT NULL,
  repo_full_name text NOT NULL,
  commit_sha text NOT NULL,
  commit_message text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id, path)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS github_commits_user_idx ON github_commits(user_id);

-- RLS
ALTER TABLE github_commits ENABLE ROW LEVEL SECURITY;

-- Users can see their own commits
CREATE POLICY "Users see own commits" ON github_commits
  FOR SELECT USING (user_id = auth.uid());

-- Service role manages all commit records (our API handles inserts/upserts)
CREATE POLICY "Service role manages commits" ON github_commits
  FOR ALL TO service_role USING (true) WITH CHECK (true);
