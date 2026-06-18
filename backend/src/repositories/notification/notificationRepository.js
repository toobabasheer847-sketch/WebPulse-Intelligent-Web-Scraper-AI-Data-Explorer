import pool from '../../db/pool.js';

export async function create({ userId, projectId, type, title, message }) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, project_id, type, title, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, projectId, type, title, message]
  );
  return result.rows[0];
}

export async function findByUser(userId, { limit = 20, unreadOnly = false } = {}) {
  let query = 'SELECT * FROM notifications WHERE user_id = $1';
  const params = [userId];

  if (unreadOnly) {
    query += ' AND read = FALSE';
  }

  query += ' ORDER BY created_at DESC LIMIT $2';
  params.push(limit);

  const result = await pool.query(query, params);
  return result.rows;
}

export async function markRead(id, userId) {
  const result = await pool.query(
    `UPDATE notifications SET read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function markAllRead(userId) {
  await pool.query(
    'UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE',
    [userId]
  );
}

export async function countUnread(userId) {
  const result = await pool.query(
    'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read = FALSE',
    [userId]
  );
  return result.rows[0].count;
}
