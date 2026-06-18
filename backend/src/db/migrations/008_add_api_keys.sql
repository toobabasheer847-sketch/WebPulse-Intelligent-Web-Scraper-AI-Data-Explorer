-- Migration: 008_add_api_keys
-- Adds support for API keys for scraping-as-a-service

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE, -- SHA-256 hash of the key
  truncated_key VARCHAR(50) NOT NULL,    -- e.g., "wp_live_...2f3a"
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
