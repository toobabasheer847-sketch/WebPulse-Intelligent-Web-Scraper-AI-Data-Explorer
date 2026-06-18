import pool from '../../db/pool.js';

export async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT p.*,
      (SELECT COUNT(*) FROM scrape_runs sr WHERE sr.project_id = p.id) AS run_count,
      (SELECT COUNT(*) FROM scraped_data sd WHERE sd.project_id = p.id) AS record_count,
      (SELECT MAX(sr.completed_at) FROM scrape_runs sr WHERE sr.project_id = p.id AND sr.status = 'completed') AS last_scrape_at
     FROM projects p
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function findById(id) {
  const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function create(data) {
  const { userId, name, websiteUrl, scraperType, schedule, selectors, extractionConfig } = data;
  const result = await pool.query(
    `INSERT INTO projects (user_id, name, website_url, scraper_type, schedule, selectors, extraction_config)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      userId,
      name,
      websiteUrl,
      scraperType || 'auto',
      schedule || 'none',
      JSON.stringify(selectors || {}),
      JSON.stringify(extractionConfig || {}),
    ]
  );
  return result.rows[0];
}

export async function update(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  const map = {
    name: 'name',
    websiteUrl: 'website_url',
    scraperType: 'scraper_type',
    schedule: 'schedule',
    selectors: 'selectors',
    extractionConfig: 'extraction_config',
  };

  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      values.push(
        key === 'selectors' || key === 'extractionConfig'
          ? JSON.stringify(data[key])
          : data[key]
      );
    }
  }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function remove(id) {
  await pool.query('DELETE FROM projects WHERE id = $1', [id]);
}

export async function findScheduledProjects() {
  const result = await pool.query(
    `SELECT * FROM projects WHERE schedule IS NOT NULL AND schedule != 'none'`
  );
  return result.rows;
}

export async function findDueProjects() {
  const result = await pool.query(`
    SELECT * FROM projects 
    WHERE schedule IS NOT NULL 
      AND schedule != 'none'
      AND schedule != 'manual'
      AND (
        last_scraped_at IS NULL 
        OR (schedule = 'hourly' AND last_scraped_at <= NOW() - INTERVAL '1 hour')
        OR (schedule = 'daily' AND last_scraped_at <= NOW() - INTERVAL '24 hours')
        OR (schedule = 'weekly' AND last_scraped_at <= NOW() - INTERVAL '7 days')
      )
  `);
  return result.rows;
}

export async function updateLastScrapedAt(id) {
  const result = await pool.query(
    `UPDATE projects SET last_scraped_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}
