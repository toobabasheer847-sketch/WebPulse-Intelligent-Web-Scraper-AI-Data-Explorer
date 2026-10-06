import { Queue } from 'bullmq';
import Redis from 'ioredis';
import config from '../../config/index.js';

const LOCAL_REDIS_URL = 'redis://127.0.0.1:6379';

function resolveRedisUrl() {
  const configuredUrl = (process.env.REDIS_URL || config.redisUrl || '').trim();

  if (!configuredUrl) {
    return process.env.NODE_ENV === 'production' ? null : LOCAL_REDIS_URL;
  }

  const isRailwayInternalHost = /railway\.internal/i.test(configuredUrl);
  const isMissingUrlScheme = !/^redis(?:s)?:\/\//i.test(configuredUrl);

  if (isRailwayInternalHost || isMissingUrlScheme) {
    if (process.env.NODE_ENV === 'production') {
      return configuredUrl;
    }

    console.warn(
      '⚠️ REDIS_URL points to a non-routable local host or an invalid format. Falling back to local Redis at 127.0.0.1:6379.'
    );
    return LOCAL_REDIS_URL;
  }

  return configuredUrl;
}

const redisUrl = resolveRedisUrl();
const connection = redisUrl ? new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
}) : null;

if (connection) {
  connection.on('connect', () => {
    console.log('🔗 Redis client connected');
  });

  connection.on('ready', async () => {
    console.log('✅ Redis client ready');

    try {
      await connection.config(
        'SET',
        'stop-writes-on-bgsave-error',
        'no'
      );

      console.log(
        '⚙️ Redis config updated: stop-writes-on-bgsave-error = no'
      );
    } catch (err) {
      console.warn(
        '⚠️ Redis config update skipped:',
        err.message
      );
    }
  });

  connection.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
  });

  connection.on('reconnecting', (delay) => {
    console.warn(`⏳ Redis reconnecting in ${delay}ms`);
  });
}

export const scrapeQueue = connection
  ? new Queue('scrape-jobs', {
      connection,

      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          count: 100,
        },
        removeOnFail: {
          count: 50,
        },
      },
    })
  : null;

export async function enqueueScrapeJob({
  projectId,
  runId,
  userId,
  trigger = 'manual',
}) {
  if (!scrapeQueue) {
    console.warn(
      '⚠️ Scrape queue is disabled because Redis is unavailable. Set REDIS_URL to a reachable Redis instance or start the local Redis service.'
    );
    return null;
  }

  return scrapeQueue.add(
    'scrape',
    {
      projectId,
      runId,
      userId,
      trigger,
    },
    {
      jobId: `scrape-${runId}`,
    }
  );
}

export function getQueueConnection() {
  return connection;
}