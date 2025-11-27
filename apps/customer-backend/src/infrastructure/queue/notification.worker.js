// apps/customer-backend/src/infrastructure/queue/notification.worker.js
// ✅ Notification Worker - Xử lý job từ Redis và gọi Novu
// Sử dụng BullMQ Worker để xử lý notification bất đồng bộ

import { Worker } from 'bullmq';
import { novuService } from '../notifications/novu.service.js';
import { Logger } from '../../shared/utils/index.js';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

// Hàm xử lý chính
const processor = async (job) => {
  const { type } = job;
  const data = job.data;

  Logger.info(`[Worker] ⚙️ Processing job ${job.id} (${job.name})...`);

  try {
    switch (job.name) {
      case 'chat-notify':
        // Gọi Novu Service (cái chúng ta đã fix ở bước trước)
        await novuService.triggerChatNotification(
          data.userId, 
          data.message, 
          data.conversationId, 
          data.senderName
        );
        break;
        
      case 'order-notify':
        // Sau này mở rộng cho đơn hàng
        // await novuService.triggerOrderNotification(...)
        Logger.info(`[Worker] Order notification not implemented yet`);
        break;

      default:
        Logger.warn(`[Worker] Unknown job type: ${job.name}`);
    }
  } catch (error) {
    Logger.error(`[Worker] ❌ Job ${job.id} failed: ${error.message}`);
    throw error; // Ném lỗi để BullMQ biết mà retry
  }
};

// Hàm khởi động Worker (Gọi ở file server.ts)
export const startNotificationWorker = () => {
  const worker = new Worker('notifications', processor, {
    connection: redisConnection,
    concurrency: 5, // Xử lý 5 thông báo cùng lúc
  });

  worker.on('completed', (job) => {
    Logger.info(`[Worker] ✅ Job ${job.id} completed!`);
  });

  worker.on('failed', (job, err) => {
    Logger.warn(`[Worker] ⚠️ Job ${job?.id || 'unknown'} failed. Retrying... Reason: ${err.message}`);
  });

  worker.on('error', (error) => {
    Logger.error(`[Worker] ❌ Worker error: ${error.message}`);
  });
  
  Logger.info('[Worker] 🚀 Notification Worker started');

  return worker;
};

