import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import config from '../../config/index.js';

const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });

// Fix the MISCONF Redis write error automatically for local environment
connection.config('SET', 'stop-writes-on-bgsave-error', 'no')
  .then(() => {
    console.log("⚙️ Redis bypass config set: stop-writes-on-bgsave-error = no");
  })
  .catch(err => {
    console.warn("⚠️ Failed to set Redis config:", err.message);
  });

export const scrapeQueue = new Queue('scrape-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export async function enqueueScrapeJob({ projectId, runId, userId, trigger = 'manual' }) {
  return scrapeQueue.add(
    'scrape',
    { projectId, runId, userId, trigger },
    { jobId: `scrape-${runId}` }
  );
}

export function getQueueConnection() {
  return connection;
}
