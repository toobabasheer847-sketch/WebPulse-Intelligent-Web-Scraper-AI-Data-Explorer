import pool from '../db/pool.js';

export async function create({ userId, name, keyHash, truncatedKey, expiresAt }) {
  const result = await pool.query(
    `INSERT INTO api_keys (user_id, name, key_hash, truncated_key, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, name, truncated_key, created_at, expires_at`,
    [userId, name, keyHash, truncatedKey, expiresAt]
  );
  return result.rows[0];
}

export async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT id, name, truncated_key, created_at, expires_at
     FROM api_keys
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function findByIdAndUserId(id, userId) {
  const result = await pool.query(
    `SELECT * FROM api_keys WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function deleteByIdAndUserId(id, userId) {
  const result = await pool.query(
    `DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function findByKeyHash(keyHash) {
  const result = await pool.query(
    `SELECT * FROM api_keys WHERE key_hash = $1`,
    [keyHash]
  );
  return result.rows[0] || null;
}

export async function updateLastUsedAt(id) {
  await pool.query(
    `UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`,
    [id]
  );
}
