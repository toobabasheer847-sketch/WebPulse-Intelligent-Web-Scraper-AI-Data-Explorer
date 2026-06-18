-- Add message column to scrape_runs
ALTER TABLE scrape_runs ADD COLUMN IF NOT EXISTS message TEXT;
