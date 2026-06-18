import app from './app.js';
import config from './config/index.js';
import pool from './db/pool.js';
import { startScheduler } from './services/project/schedulerService.js';
import './workers/scrapeWorker.js';

async function ensureWebhooksTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
      platform    VARCHAR(50) NOT NULL,
      url         TEXT NOT NULL,
      is_active   BOOLEAN DEFAULT true,
      created_at  TIMESTAMP DEFAULT NOW()
    )
  `);
}

async function ensureApiKeysTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
      name          VARCHAR(255) NOT NULL,
      key_hash      VARCHAR(255) NOT NULL UNIQUE,
      truncated_key VARCHAR(50) NOT NULL,
      created_at    TIMESTAMP DEFAULT NOW(),
      expires_at    TIMESTAMP NULL,
      last_used_at  TIMESTAMP NULL
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_api_keys_user_id   ON api_keys(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash  ON api_keys(key_hash)`);
}

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connected');
    await ensureApiKeysTable();
    await ensureWebhooksTable();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    console.error('Ensure PostgreSQL is running and migrations have been applied.');
  }

  startScheduler();

  app.listen(config.port, () => {
    console.log(`WebPulse API running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.env}`);
  });
}

start();
