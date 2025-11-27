// apps/customer-backend/src/infrastructure/queue/notification.queue.js
// ✅ Notification Queue - Producer (Bắn job vào Redis)
// Sử dụng BullMQ để quản lý hàng đợi notification

import { Queue } from 'bullmq';
import { Logger } from '../../shared/utils/index.js';
import { getRedisConnectionConfig } from '../cache/redis-connection.helper.js';

// ✅ Parse REDIS_URL hoặc fallback về REDIS_HOST/REDIS_PORT
const redisConnection = getRedisConnectionConfig();

// 1. Khởi tạo Queue tên là 'notifications'
// ✅ FIX: Wrap trong try-catch để không crash khi Redis không có
let notificationQueue;
try {
  notificationQueue = new Queue('notifications', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3, // Thử lại 3 lần nếu lỗi
      backoff: {
        type: 'exponential',
        delay: 5000, // Lần 1 chờ 5s, lần 2 chờ 10s...
      },
      removeOnComplete: true, // Xóa job khi xong để nhẹ Redis
      removeOnFail: false, // Giữ lại job lỗi để debug
    },
  });

  // ✅ FIX: Handle connection errors gracefully
  notificationQueue.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
      Logger.warn(`⚠️ [Notification Queue] Redis connection refused. Queue will retry automatically.`);
    } else {
      Logger.error(`❌ [Notification Queue] Queue error:`, error);
    }
  });
} catch (error) {
  Logger.warn(`⚠️ [Notification Queue] Failed to initialize queue (Redis may not be available):`, error.message);
  // Tạo mock queue để tránh crash
  notificationQueue = null;
}

export { notificationQueue };

/**
 * Hàm bắn Job vào hàng đợi
 * @param {string} type - Loại thông báo ('chat-notify', 'order-email', ...)
 * @param {object} data - Dữ liệu cần thiết
 */
export const addNotificationJob = async (type, data) => {
  try {
    await notificationQueue.add(type, data);
    Logger.info(`[Queue] 📥 Added job '${type}' for user ${data.userId || 'unknown'}`);
  } catch (error) {
    Logger.error(`[Queue] ❌ Failed to add job: ${error.message}`);
    // Fallback: Nếu Redis chết, có thể gọi trực tiếp service ở đây (tuỳ chọn)
  }
};

