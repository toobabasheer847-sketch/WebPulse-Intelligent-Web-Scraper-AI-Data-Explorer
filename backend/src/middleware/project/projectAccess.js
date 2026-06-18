import pool from '../../db/pool.js';
import { notFound, forbidden } from '../../utils/errors.js';

export async function requireProjectAccess(req, res, next) {
  const projectId = req.params.projectId || req.params.id;
  if (!projectId) return next();

  const result = await pool.query(
    'SELECT id, user_id FROM projects WHERE id = $1',
    [projectId]
  );

  if (result.rows.length === 0) {
    return next(notFound('Project not found'));
  }

  const project = result.rows[0];
  if (project.user_id !== req.user.id && req.user.role !== 'admin') {
    return next(forbidden('You do not have access to this project'));
  }

  req.project = project;
  next();
}
