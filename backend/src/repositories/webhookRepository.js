import pool from '../db/pool.js';

export async function findActiveByProject(projectId) {
  const result = await pool.query(
    `SELECT * FROM webhooks WHERE project_id = $1 AND is_active = true ORDER BY created_at ASC`,
    [projectId]
  );
  return result.rows;
}

export async function findAllByProject(projectId) {
  const result = await pool.query(
    `SELECT * FROM webhooks WHERE project_id = $1 ORDER BY created_at ASC`,
    [projectId]
  );
  return result.rows;
}

export async function create({ projectId, platform, url }) {
  const result = await pool.query(
    `INSERT INTO webhooks (project_id, platform, url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [projectId, platform, url]
  );
  return result.rows[0];
}

export async function remove(id, projectId) {
  const result = await pool.query(
    `DELETE FROM webhooks WHERE id = $1 AND project_id = $2 RETURNING id`,
    [id, projectId]
  );
  return result.rowCount > 0;
}
