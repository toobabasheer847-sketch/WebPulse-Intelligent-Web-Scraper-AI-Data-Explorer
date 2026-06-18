import pool from '../../db/pool.js';

export async function createRun(projectId) {
  const result = await pool.query(
    `INSERT INTO scrape_runs (project_id, status, started_at)
     VALUES ($1, 'pending', NOW())
     RETURNING *`,
    [projectId]
  );
  return result.rows[0];
}

export async function updateRunStatus(runId, status, errorMessage = null, message = null) {
  const completed = ['completed', 'failed'].includes(status);
  const result = await pool.query(
    `UPDATE scrape_runs
     SET status = $1,
         error_message = $2,
         message = $3,
         completed_at = CASE WHEN $4 THEN NOW() ELSE completed_at END
     WHERE id = $5
     RETURNING *`,
    [status, errorMessage, message, completed, runId]
  );
  return result.rows[0];
}

export async function findRunsByProject(projectId, { limit = 20, offset = 0 } = {}) {
  const result = await pool.query(
    `SELECT * FROM scrape_runs
     WHERE project_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [projectId, limit, offset]
  );
  return result.rows;
}

export async function findRunById(runId) {
  const result = await pool.query('SELECT * FROM scrape_runs WHERE id = $1', [runId]);
  return result.rows[0] || null;
}

export async function saveScrapedData({ runId, projectId, contentJson, embedding = null }) {
  const result = await pool.query(
    `INSERT INTO scraped_data (run_id, project_id, content_json, embedding)
     VALUES ($1, $2, $3, $4)
     RETURNING id, run_id, project_id, content_json, created_at`,
    [runId, projectId, JSON.stringify(contentJson), embedding ? JSON.stringify(embedding) : null]
  );
  return result.rows[0];
}

export async function findDataByProject(projectId, { limit = 50, offset = 0, search = '' } = {}) {
  let query = `
    SELECT sd.id, sd.run_id, sd.project_id, sd.content_json, sd.created_at,
           sr.status AS run_status
    FROM scraped_data sd
    JOIN scrape_runs sr ON sr.id = sd.run_id
    WHERE sd.project_id = $1`;
  const params = [projectId];

  if (search) {
    query += ` AND sd.content_json::text ILIKE $${params.length + 1}`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY sd.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
}

export async function findDataByRun(runId) {
  const result = await pool.query(
    'SELECT * FROM scraped_data WHERE run_id = $1 ORDER BY created_at DESC',
    [runId]
  );
  return result.rows;
}

export async function getLatestDataForProject(projectId) {
  const result = await pool.query(
    `SELECT sd.* FROM scraped_data sd
     JOIN scrape_runs sr ON sr.id = sd.run_id
     WHERE sd.project_id = $1 AND sr.status = 'completed'
     ORDER BY sd.created_at DESC
     LIMIT 1`,
    [projectId]
  );
  return result.rows[0] || null;
}

export async function getPreviousDataForProject(projectId, beforeDate) {
  const result = await pool.query(
    `SELECT sd.* FROM scraped_data sd
     JOIN scrape_runs sr ON sr.id = sd.run_id
     WHERE sd.project_id = $1 AND sr.status = 'completed' AND sd.created_at < $2
     ORDER BY sd.created_at DESC
     LIMIT 1`,
    [projectId, beforeDate]
  );
  return result.rows[0] || null;
}

export async function semanticSearch(projectId, embedding, limit = 10) {
  const vectorStr = `[${embedding.join(',')}]`;
  try {
    const result = await pool.query(
      `SELECT id, run_id, project_id, content_json, created_at,
              1 - (embedding <=> $1::vector) AS similarity
       FROM scraped_data
       WHERE project_id = $2 AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [vectorStr, projectId, limit]
    );
    return result.rows;
  } catch (err) {
    if (['42704', '42883', '42P01'].includes(err.code)) {
      const result = await pool.query(
        `SELECT id, run_id, project_id, content_json, created_at, 0 AS similarity
         FROM scraped_data
         WHERE project_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [projectId, limit]
      );
      return result.rows;
    }
    throw err;
  }
}

export async function countByUser(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM scraped_data sd
     JOIN projects p ON p.id = sd.project_id
     WHERE p.user_id = $1`,
    [userId]
  );
  return result.rows[0].count;
}

export async function countMonthlyRecordsByUser(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM scraped_data sd
     JOIN projects p ON p.id = sd.project_id
     WHERE p.user_id = $1
       AND sd.created_at >= date_trunc('month', NOW())`,
    [userId]
  );
  return result.rows[0].count;
}

export async function findCompletedRunsWithData(projectId) {
  const result = await pool.query(
    `SELECT sr.id AS run_id, sr.completed_at, sd.content_json
     FROM scrape_runs sr
     INNER JOIN scraped_data sd ON sd.run_id = sr.id
     WHERE sr.project_id = $1
       AND sr.status = 'completed'
       AND sr.completed_at IS NOT NULL
     ORDER BY sr.completed_at ASC`,
    [projectId]
  );
  return result.rows;
}

export async function getRecentRunsForUser(userId, limit = 5) {
  const result = await pool.query(
    `SELECT sr.*, p.name AS project_name
     FROM scrape_runs sr
     JOIN projects p ON p.id = sr.project_id
     WHERE p.user_id = $1
     ORDER BY sr.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}
