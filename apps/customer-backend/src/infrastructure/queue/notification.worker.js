// apps/customer-backend/src/infrastructure/queue/notification.worker.js
// ✅ Notification Worker - Xử lý job từ Redis và gọi Novu
// Sử dụng BullMQ Worker để xử lý notification bất đồng bộ

import { Worker } from "bullmq";
import { novuService } from "../notifications/novu.service.js";
import { Logger } from "../../shared/utils/index.js";
import { getRedisConnectionConfig } from "../cache/redis-connection.helper.js";
import { getCircuitBreaker } from "./circuit-breaker.js";

// ✅ Parse REDIS_URL hoặc fallback về REDIS_HOST/REDIS_PORT
const redisConnection = getRedisConnectionConfig();

// Circuit breaker để ngăn spam Redis khi gặp lỗi
const circuitBreaker = getCircuitBreaker("notification-worker", {
  failureThreshold: 3,
  resetTimeout: 120000,
});

// Hàm xử lý chính với circuit breaker
const processor = async (job) => {
  const { type } = job;
  const data = job.data;

  Logger.info(`[Worker] ⚙️ Processing job ${job.id} (${job.name})...`);

  try {
    return await circuitBreaker.execute(async () => {
      switch (job.name) {
        case "chat-notify":
          // Gọi Novu Service (cái chúng ta đã fix ở bước trước)
          await novuService.triggerChatNotification(
            data.userId,
            data.message,
            data.conversationId,
            data.senderName
          );
          break;

        case "order-notify":
          // Sau này mở rộng cho đơn hàng
          // await novuService.triggerOrderNotification(...)
          Logger.info(`[Worker] Order notification not implemented yet`);
          break;

        case "delivery-thread-message":
          // ✅ FIX: Handle delivery thread notifications
          Logger.debug(
            `[Worker] Processing delivery-thread-message for recipient: ${data.recipientId}`
          );
          await novuService.triggerDeliveryThreadNotification(
            data.recipientId,
            data.recipientModel,
            data.threadId,
            data.orderNumber,
            data.senderName,
            data.senderRole,
            data.messagePreview,
            data.checkinId
          );
          break;

        default:
          Logger.warn(`[Worker] Unknown job type: ${job.name}`);
      }
    });
  } catch (error) {
    // Nếu circuit breaker OPEN, không retry
    if (error.message?.includes("Circuit breaker")) {
      Logger.warn(`[Notification Worker] ${error.message}`);
      throw new Error("CIRCUIT_BREAKER_OPEN");
    }
    Logger.error(`[Worker] ❌ Job ${job.id} failed: ${error.message}`);
    throw error; // Ném lỗi để BullMQ biết mà retry
  }
};

// Hàm khởi động Worker (Gọi ở file server.ts)
export const startNotificationWorker = async () => {
  try {
    // Check if Redis connection is available
    if (!redisConnection) {
      Logger.warn(
        "⚠️ [Notification Worker] Redis not available. Worker disabled."
      );
      return null;
    }

    // ✅ FIX: Check Redis health before starting worker
    const { isRedisAvailable } = await import("../cache/redis-health.js");
    const redisHealthy = await isRedisAvailable(redisConnection);

    if (!redisHealthy) {
      Logger.warn(
        "⚠️ [Notification Worker] Redis not responding. Worker disabled. Start Docker/Redis to enable."
      );
      return null;
    }

    const worker = new Worker("notifications", processor, {
      connection: redisConnection,
      concurrency: 3,
      // 🚀 EVENT-DRIVEN: Worker wake up qua Redis Pub/Sub (không polling!)
      // BullMQ tự động dùng SUBSCRIBE khi có job mới → Tiết kiệm 99% Redis requests
      settings: {
        stalledInterval: 300000, // 5 phút (chỉ check stalled, không poll job mới)
        maxStalledCount: 1,
        lockRenewTime: 10000,
      },
      // Giảm số lần retry khi gặp lỗi
      limiter: {
        max: 3, // Xử lý tối đa 3 jobs/lần
        duration: 2000, // Đợi 2s giữa các batch
      },
    });

    worker.on("completed", (job) => {
      Logger.info(`[Worker] ✅ Job ${job.id} completed!`);
    });

    worker.on("failed", (job, err) => {
      // Không log nếu là circuit breaker open
      if (err.message === "CIRCUIT_BREAKER_OPEN") {
        return;
      }
      Logger.warn(
        `[Worker] ⚠️ Job ${job?.id || "unknown"} failed. Retrying... Reason: ${
          err.message
        }`
      );
    });

    // ✅ FIX: Debounce error logging để tránh spam
    let lastErrorLog = 0;
    const ERROR_LOG_INTERVAL = 30000; // Log mỗi 30 giây

    worker.on("error", (error) => {
      const now = Date.now();
      const shouldLog = now - lastErrorLog > ERROR_LOG_INTERVAL;

      // Chỉ log lỗi Redis limit 1 lần
      if (error.message?.includes("max requests limit")) {
        if (shouldLog) {
          Logger.error(
            `❌ [Notification Worker] Redis limit exceeded. Circuit breaker activating...`
          );
          lastErrorLog = now;
        }
        return;
      }

      // ✅ FIX: Chỉ log warning cho Redis connection errors, không spam
      if (error.code === "ECONNREFUSED") {
        if (shouldLog) {
          Logger.warn(
            `⚠️ [Notification Worker] Redis connection refused. Worker paused.`
          );
          lastErrorLog = now;
        }
      } else if (shouldLog) {
        Logger.error(`[Worker] ❌ Worker error: ${error.message}`);
        lastErrorLog = now;
      }
    });

    Logger.info("[Worker] 🚀 Notification Worker started");
    Logger.info("✅ Notification Worker đã sẵn sàng (concurrency: 5)");

    return worker;
  } catch (error) {
    Logger.warn(
      `⚠️ [Worker] Failed to start notification worker (Redis may not be available): ${error.message}`
    );
    return null; // Return null để server vẫn chạy được
  }
};
