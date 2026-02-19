-- Add Stripe fields to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Indexes for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
ON profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription
ON profiles(stripe_subscription_id);

-- Unique constraint (only one profile per Stripe customer)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_unique
ON profiles(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;
