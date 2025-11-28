// apps/customer-backend/src/infrastructure/queue/url-preview.worker.js

// 1. Import thư viện BullMQ và Connection Helper
import { Worker } from 'bullmq';
import { Logger } from '../../shared/utils/index.js';
import { getRedisConnectionConfig } from '../cache/redis-connection.helper.js';

// 2. IMPORT FILE LOGIC CŨ CỦA BẠN VÀO ĐÂY 👇
import { urlProcessorWorker } from '../../modules/chat/workers/url-processor.worker.js';

/**
 * Hàm khởi động Worker
 */
export const startUrlPreviewWorker = () => {
  try {
    // Lấy kết nối Redis chuẩn
    const redisConnection = getRedisConnectionConfig();

      // Định nghĩa hàm xử lý: Khi có Job -> Gọi logic cũ chạy
      const processor = async (job) => {
        return await urlProcessorWorker.processUrlJob(job);
      };

    // Khởi tạo Worker lắng nghe Redis
    const worker = new Worker('url-preview', processor, {
      connection: redisConnection, // ✅ Kết nối chuẩn (Upstash/Redis)
      concurrency: 1, // Chạy từng cái một
      lockDuration: 60000, // Khóa job 60s
    });

    // Lắng nghe sự kiện
    worker.on('failed', (job, err) => {
      Logger.error(`[URL Preview Worker] Job ${job?.id} failed: ${err.message}`);
    });

    worker.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED') {
        Logger.error(`[URL Preview Worker] Error: ${err.message}`);
      }
    });
    return worker;

  } catch (error) {
    Logger.warn(`[URL Preview Worker] Failed to start: ${error.message}`);
    return null;
  }
};