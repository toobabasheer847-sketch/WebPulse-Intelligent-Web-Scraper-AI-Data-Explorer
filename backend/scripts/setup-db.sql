-- Create webpulse role if missing
DO $do$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'webpulse') THEN
    CREATE ROLE webpulse WITH LOGIN PASSWORD '12345';
  ELSE
    ALTER ROLE webpulse WITH LOGIN PASSWORD '12345';
  END IF;
END
$do$;

-- Create database if missing
SELECT 'CREATE DATABASE webpulse OWNER webpulse'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'webpulse')\gexec

GRANT ALL PRIVILEGES ON DATABASE webpulse TO webpulse;
