import cron from 'node-cron';
import * as projectRepo from '../../repositories/project/projectRepository.js';
import * as scrapeRepo from '../../repositories/project/scrapeRepository.js';
import { enqueueScrapeJob } from './queueService.js';

export function startScheduler() {
  console.log('Starting scrape scheduler...');

  cron.schedule('* * * * *', async () => {
    try {
      const projects = await projectRepo.findDueProjects();
      for (const project of projects) {
        const run = await scrapeRepo.createRun(project.id);
        await enqueueScrapeJob({
          projectId: project.id,
          runId: run.id,
          userId: project.user_id,
          trigger: 'scheduled',
        });
        await projectRepo.updateLastScrapedAt(project.id);
        console.log(`[Scheduler] Automatically queued ${project.schedule} job for project: ${project.name}`);
      }
    } catch (err) {
      console.error('Scheduler tick error:', err);
    }
  });
}

export function registerProjectSchedule(project) {
  // No need for in-memory tracking anymore
}
