-- Migration 007: Referral system

-- Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES profiles(id) NOT NULL,
  referee_id uuid REFERENCES profiles(id) NOT NULL,
  referral_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  rewarded boolean DEFAULT false,
  UNIQUE(referee_id)  -- each person can only be referred once
);

-- Add referral fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pro_trial_until timestamptz;

-- Index for fast referral_code lookups
CREATE INDEX IF NOT EXISTS profiles_referral_code_idx ON profiles (referral_code);

-- RLS for referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can see their own referral records (as referrer or referee)
CREATE POLICY "Users see own referrals" ON referrals
  FOR SELECT USING (
    referrer_id = auth.uid() OR referee_id = auth.uid()
  );

-- Only service role inserts (our API handles this)
CREATE POLICY "Service role inserts" ON referrals
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
