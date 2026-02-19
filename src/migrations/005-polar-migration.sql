-- Rename Stripe columns to Polar

ALTER TABLE profiles
RENAME COLUMN stripe_customer_id TO polar_customer_id;

ALTER TABLE profiles
RENAME COLUMN stripe_subscription_id TO polar_subscription_id;

-- Drop old indexes
DROP INDEX IF EXISTS idx_profiles_stripe_customer;
DROP INDEX IF EXISTS idx_profiles_stripe_subscription;
DROP INDEX IF EXISTS idx_profiles_stripe_customer_unique;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_profiles_polar_customer
ON profiles(polar_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_polar_subscription
ON profiles(polar_subscription_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_polar_customer_unique
ON profiles(polar_customer_id)
WHERE polar_customer_id IS NOT NULL;
