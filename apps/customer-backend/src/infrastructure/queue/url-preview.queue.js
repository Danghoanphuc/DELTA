// apps/customer-backend/src/infrastructure/queue/url-preview.queue.js
import { Queue } from 'bullmq';
import { Logger } from '../../shared/utils/index.js';
import { getRedisConnectionConfig } from '../cache/redis-connection.helper.js';

let _urlPreviewQueue = null;

export const getUrlPreviewQueue = () => {
  if (_urlPreviewQueue) return _urlPreviewQueue;

  try {
    const redisConnection = getRedisConnectionConfig();

    _urlPreviewQueue = new Queue('url-preview', {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: {
          age: 24 * 3600,
          count: 20,
        },
        attempts: 2,
      },
    });

    _urlPreviewQueue.on('error', (error) => {
       if (error.code === 'ECONNREFUSED') return;
       Logger.error(`[URL Preview Queue] Error: ${error.message}`);
    });

  } catch (error) {
    Logger.warn(`[URL Preview Queue] Failed to initialize: ${error.message}`);
    _urlPreviewQueue = null;
  }

  return _urlPreviewQueue;
};