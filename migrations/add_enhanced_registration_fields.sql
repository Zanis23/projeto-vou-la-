-- Migration: Add enhanced user registration fields
-- Created: 2024-12-25
-- Description: Adds phone, age, city, and terms acceptance fields to profiles table

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN profiles.phone IS 'User phone number (digits only, no formatting)';
COMMENT ON COLUMN profiles.age IS 'User age (must be 18+)';
COMMENT ON COLUMN profiles.city IS 'User city of residence';
COMMENT ON COLUMN profiles.terms_accepted_at IS 'Timestamp when user accepted Terms of Use';
COMMENT ON COLUMN profiles.privacy_accepted_at IS 'Timestamp when user accepted Privacy Policy';

-- Optional: Add check constraint for age (must be 18+)
ALTER TABLE profiles ADD CONSTRAINT check_age_minimum CHECK (age IS NULL OR age >= 18);
