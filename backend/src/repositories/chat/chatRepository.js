import pool from '../../db/pool.js';

export async function saveMessage({ projectId, userId, role, message }) {
  const result = await pool.query(
    `INSERT INTO chat_history (project_id, user_id, role, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [projectId, userId, role, message]
  );
  return result.rows[0];
}

export async function getHistory(projectId, userId, limit = 50) {
  const result = await pool.query(
    `SELECT * FROM chat_history
     WHERE project_id = $1 AND user_id = $2
     ORDER BY created_at ASC
     LIMIT $3`,
    [projectId, userId, limit]
  );
  return result.rows;
}

export async function clearHistory(projectId, userId) {
  await pool.query(
    'DELETE FROM chat_history WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );
}
