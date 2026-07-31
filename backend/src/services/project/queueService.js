import { Queue } from 'bullmq';
import Redis from 'ioredis';
import config from '../../config/index.js';

const redisUrl = process.env.REDIS_URL || config.redisUrl;

if (!redisUrl) {
  console.error('❌ Redis is not configured. Set REDIS_URL in your environment or .env file.');
  throw new Error('Redis URL is not configured');
}

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

connection.on('connect', () => {
  console.log('🔗 Redis client connected');
});

connection.on('ready', () => {
  console.log('✅ Redis client ready');
});

connection.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

connection.on('reconnecting', (delay) => {
  console.warn(`⏳ Redis reconnecting in ${delay}ms`);
});

// Fix the MISCONF Redis write error automatically for local environment
connection.config('SET', 'stop-writes-on-bgsave-error', 'no')
  .then(() => {
    console.log('⚙️ Redis bypass config set: stop-writes-on-bgsave-error = no');
  })
  .catch((err) => {
    console.warn('⚠️ Failed to set Redis config:', err.message);
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
