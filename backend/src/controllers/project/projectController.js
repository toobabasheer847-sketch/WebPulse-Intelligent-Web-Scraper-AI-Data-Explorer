import * as projectService from '../../services/project/projectService.js';
import * as scrapeRepo from '../../repositories/project/scrapeRepository.js';
import * as changeLogRepo from '../../repositories/notification/changeLogRepository.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects(req.user.id);
  res.json({ projects });
});

export const get = asyncHandler(async (req, res) => {
  const project = await projectService.getProject(req.params.id, req.user.id);
  res.json({ project });
});

export const create = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.user.id, req.body);
  res.status(201).json({ project });
});

export const update = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.user.id, req.body);
  res.json({ project });
});

export const remove = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id, req.user.id);
  res.status(204).send();
});

export const triggerScrape = asyncHandler(async (req, res) => {
  const run = await projectService.triggerScrape(req.params.id, req.user.id);
  res.status(202).json({ run, message: 'Scrape job queued' });
});

export const getRuns = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);
  const limit = parseInt(req.query.limit || '20', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  const runs = await scrapeRepo.findRunsByProject(req.params.id, { limit, offset });
  res.json({ runs });
});

export const getData = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  const search = req.query.search || '';
  const data = await scrapeRepo.findDataByProject(req.params.id, { limit, offset, search });
  res.json({ data });
});

export const getChanges = asyncHandler(async (req, res) => {
  await projectService.getProject(req.params.id, req.user.id);
  const limit = parseInt(req.query.limit || '50', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  const changes = await changeLogRepo.findByProject(req.params.id, { limit, offset });
  res.json({ changes });
});
