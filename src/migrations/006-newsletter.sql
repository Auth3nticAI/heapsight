-- Migration 006: Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now(),
  source text DEFAULT 'landing_page'
);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers (email);

-- Allow anonymous inserts (anyone can subscribe without being logged in)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Only service role can read subscribers (for admin/export)
CREATE POLICY "Service role reads all" ON newsletter_subscribers
  FOR SELECT USING (auth.role() = 'service_role');
