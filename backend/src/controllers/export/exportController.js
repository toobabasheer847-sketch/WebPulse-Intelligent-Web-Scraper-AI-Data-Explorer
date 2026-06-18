import * as scrapeRepo from '../../repositories/project/scrapeRepository.js';
import * as projectService from '../../services/project/projectService.js';
import { toCSV, toJSON } from '../../services/export/exportService.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { notFound } from '../../utils/errors.js';

export const exportProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const format = req.query.format || 'json';
  await projectService.getProject(id, req.user.id);

  const data = await scrapeRepo.findDataByProject(id, { limit: 1000, offset: 0 });
  const filename = `webpulse-project-${id}.${format}`;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(toCSV(data));
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(toJSON(data));
});

export const exportRun = asyncHandler(async (req, res) => {
  const { id, runId } = req.params;
  const format = req.query.format || 'json';
  await projectService.getProject(id, req.user.id);

  const run = await scrapeRepo.findRunById(runId);
  if (!run || run.project_id !== id) throw notFound('Scrape run not found');

  const data = await scrapeRepo.findDataByRun(runId);
  const filename = `webpulse-run-${runId}.${format}`;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(toCSV(data));
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(toJSON(data));
});
