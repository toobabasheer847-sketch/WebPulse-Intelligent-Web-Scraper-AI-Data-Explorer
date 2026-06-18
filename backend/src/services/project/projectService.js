import * as projectRepo from '../../repositories/project/projectRepository.js';
import * as scrapeRepo from '../../repositories/project/scrapeRepository.js';
import { enqueueScrapeJob } from './queueService.js';
import { registerProjectSchedule } from './schedulerService.js';
import { notFound } from '../../utils/errors.js';

export async function listProjects(userId) {
  return projectRepo.findByUserId(userId);
}

export async function getProject(id, userId) {
  const project = await projectRepo.findById(id);
  if (!project || project.user_id !== userId) throw notFound('Project not found');
  return project;
}

export async function createProject(userId, data) {
  const project = await projectRepo.create({ userId, ...data });
  registerProjectSchedule(project);
  return project;
}

export async function updateProject(id, userId, data) {
  await getProject(id, userId);
  const project = await projectRepo.update(id, data);
  registerProjectSchedule(project);
  return project;
}

export async function deleteProject(id, userId) {
  await getProject(id, userId);
  await projectRepo.remove(id);
}

export async function triggerScrape(projectId, userId) {
  const project = await getProject(projectId, userId);
  const run = await scrapeRepo.createRun(project.id);
  await enqueueScrapeJob({
    projectId: project.id,
    runId: run.id,
    userId,
    trigger: 'manual',
  });
  await projectRepo.updateLastScrapedAt(project.id);
  return run;
}
