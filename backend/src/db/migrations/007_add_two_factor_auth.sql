-- Migration: 007_add_two_factor_auth
-- Adds support for TOTP-based two-factor authentication

ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_two_factor_enabled BOOLEAN DEFAULT FALSE;
