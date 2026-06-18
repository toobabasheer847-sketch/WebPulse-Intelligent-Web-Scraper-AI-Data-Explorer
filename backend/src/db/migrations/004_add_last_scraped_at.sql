-- Add last_scraped_at column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ;
