-- Migration 008: Certificates table for path completion certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  path text NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, path)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);

-- RLS: anyone can read certificates for public verification
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Certificates are publicly readable"
  ON certificates FOR SELECT
  USING (true);
