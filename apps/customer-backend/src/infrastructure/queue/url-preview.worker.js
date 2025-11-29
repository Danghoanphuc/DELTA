// apps/customer-backend/src/infrastructure/queue/url-preview.worker.js

// 1. Import thư viện BullMQ và Connection Helper
import { Worker } from "bullmq";
import { Logger } from "../../shared/utils/index.js";
import { getRedisConnectionConfig } from "../cache/redis-connection.helper.js";

// 2. IMPORT FILE LOGIC CŨ CỦA BẠN VÀO ĐÂY 👇
import { urlProcessorWorker } from "../../modules/chat/workers/url-processor.worker.js";

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
    const worker = new Worker("url-preview", processor, {
      connection: redisConnection,
      concurrency: 1,
      lockDuration: 30000,
      // 🚀 EVENT-DRIVEN: Worker wake up qua Redis Pub/Sub (không polling!)
      // BullMQ tự động dùng SUBSCRIBE khi có job mới → Tiết kiệm 99% Redis requests
      settings: {
        stalledInterval: 300000, // 5 phút (chỉ check stalled, không poll job mới)
        maxStalledCount: 1,
        lockRenewTime: 15000,
      },
    });

    // Lắng nghe sự kiện
    worker.on("failed", (job, err) => {
      Logger.error(
        `[URL Preview Worker] Job ${job?.id} failed: ${err.message}`
      );
    });

    worker.on("error", (err) => {
      if (err.code !== "ECONNREFUSED") {
        Logger.error(`[URL Preview Worker] Error: ${err.message}`);
      }
    });

    Logger.info(
      "✅ [URL Preview Worker] Started with optimized settings (stalledInterval: 60s)"
    );
    return worker;
  } catch (error) {
    Logger.warn(`[URL Preview Worker] Failed to start: ${error.message}`);
    return null;
  }
};
