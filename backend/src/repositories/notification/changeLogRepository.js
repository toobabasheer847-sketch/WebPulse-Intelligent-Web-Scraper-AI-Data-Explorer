import pool from '../../db/pool.js';

export async function createMany(changes) {
  if (!changes.length) return [];

  const values = [];
  const placeholders = changes.map((c, i) => {
    const base = i * 6;
    values.push(c.projectId, c.runId, c.fieldName, c.changeType, c.oldValue, c.newValue);
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
  });

  const result = await pool.query(
    `INSERT INTO change_logs (project_id, run_id, field_name, change_type, old_value, new_value)
     VALUES ${placeholders.join(', ')}
     RETURNING *`,
    values
  );
  return result.rows;
}

export async function findByProject(projectId, { limit = 50, offset = 0 } = {}) {
  const result = await pool.query(
    `SELECT * FROM change_logs
     WHERE project_id = $1
     ORDER BY detected_at DESC
     LIMIT $2 OFFSET $3`,
    [projectId, limit, offset]
  );
  return result.rows;
}

export async function countByUser(userId, since = null) {
  let query = `
    SELECT COUNT(*)::int AS count FROM change_logs cl
    JOIN projects p ON p.id = cl.project_id
    WHERE p.user_id = $1`;
  const params = [userId];

  if (since) {
    query += ' AND cl.detected_at >= $2';
    params.push(since);
  }

  const result = await pool.query(query, params);
  return result.rows[0].count;
}

export async function getAnalyticsByProject(projectId) {
  const result = await pool.query(
    `SELECT change_type, COUNT(*)::int AS count,
            DATE_TRUNC('day', detected_at) AS day
     FROM change_logs
     WHERE project_id = $1
     GROUP BY change_type, DATE_TRUNC('day', detected_at)
     ORDER BY day DESC
     LIMIT 30`,
    [projectId]
  );
  return result.rows;
}
