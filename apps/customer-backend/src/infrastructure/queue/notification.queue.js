// apps/customer-backend/src/infrastructure/queue/notification.queue.js
// ✅ Notification Queue - Producer (Bắn job vào Redis)
// Sử dụng BullMQ để quản lý hàng đợi notification

import { Queue } from 'bullmq';
import { Logger } from '../../shared/utils/index.js';

// Cấu hình Redis (Lấy từ env hoặc mặc định localhost cho dev)
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

// 1. Khởi tạo Queue tên là 'notifications'
export const notificationQueue = new Queue('notifications', {
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

