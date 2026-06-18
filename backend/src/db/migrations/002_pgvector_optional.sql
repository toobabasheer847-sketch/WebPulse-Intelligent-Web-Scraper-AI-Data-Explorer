-- Optional: enable pgvector when the extension is installed (e.g. Docker image).
-- Skips safely on local PostgreSQL without pgvector.
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector') THEN
    CREATE EXTENSION IF NOT EXISTS vector;
    ALTER TABLE scraped_data
      ALTER COLUMN embedding TYPE vector(1536)
      USING CASE
        WHEN embedding IS NULL OR embedding = '' THEN NULL
        ELSE embedding::vector(1536)
      END;
    CREATE INDEX IF NOT EXISTS idx_scraped_data_embedding ON scraped_data
      USING hnsw (embedding vector_cosine_ops);
  END IF;
END
$do$;
