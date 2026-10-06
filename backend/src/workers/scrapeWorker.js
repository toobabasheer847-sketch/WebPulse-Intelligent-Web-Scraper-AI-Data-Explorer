import { Worker } from 'bullmq';
import { getQueueConnection } from '../services/project/queueService.js';
import { executeScrapeJob } from '../services/project/scrapeJobService.js';
import { closeBrowser } from '../services/scraper/puppeteerScraper.js';

const connection = getQueueConnection();

if (!connection) {
  console.warn('⚠️ BullMQ worker is disabled because Redis is not reachable. The API will continue to run without the background scrape queue.');
} else {
  const worker = new Worker(
    'scrape-jobs',
    async (job) => {
      const { projectId, runId, userId } = job.data;
      console.log(`Processing scrape job ${job.id} for project ${projectId}`);
      return executeScrapeJob({ projectId, runId, userId });
    },
    {
      connection,
      concurrency: 2,
    }
  );

  worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed:`, result?.changes ?? 0, 'changes');
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  process.on('SIGTERM', async () => {
    await worker.close();
    await closeBrowser();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await worker.close();
    await closeBrowser();
    process.exit(0);
  });

  console.log('🚀 BullMQ Scraper Worker successfully started and listening for jobs...');
}
