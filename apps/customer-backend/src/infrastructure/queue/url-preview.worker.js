// apps/customer-backend/src/infrastructure/queue/url-preview.worker.js

// 1. Import thư viện BullMQ và Connection Helper
import { Worker } from "bullmq";
import { Logger } from "../../shared/utils/index.js";
import { getRedisConnectionConfig } from "../cache/redis-connection.helper.js";
import { getCircuitBreaker } from "./circuit-breaker.js";

// 2. IMPORT FILE LOGIC CŨ CỦA BẠN VÀO ĐÂY 👇
import { urlProcessorWorker } from "../../modules/chat/workers/url-processor.worker.js";

// Circuit breaker để ngăn spam Redis khi gặp lỗi
const circuitBreaker = getCircuitBreaker("url-preview-worker", {
  failureThreshold: 3, // Mở circuit sau 3 lỗi liên tiếp
  resetTimeout: 120000, // Thử lại sau 2 phút
});

/**
 * Hàm khởi động Worker
 */
export const startUrlPreviewWorker = () => {
  try {
    // Lấy kết nối Redis chuẩn
    const redisConnection = getRedisConnectionConfig();

    // Định nghĩa hàm xử lý: Khi có Job -> Gọi logic cũ chạy với circuit breaker
    const processor = async (job) => {
      try {
        return await circuitBreaker.execute(async () => {
          return await urlProcessorWorker.processUrlJob(job);
        });
      } catch (error) {
        // Nếu circuit breaker OPEN, không retry
        if (error.message?.includes("Circuit breaker")) {
          Logger.warn(`[URL Preview Worker] ${error.message}`);
          // Đánh dấu job failed nhưng không retry
          throw new Error("CIRCUIT_BREAKER_OPEN");
        }
        throw error;
      }
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
      // Giảm số lần retry khi gặp lỗi
      limiter: {
        max: 1, // Chỉ xử lý 1 job/lần
        duration: 2000, // Đợi 2s giữa các job
      },
    });

    // Lắng nghe sự kiện
    worker.on("failed", (job, err) => {
      // Không log nếu là circuit breaker open
      if (err.message === "CIRCUIT_BREAKER_OPEN") {
        return;
      }
      Logger.error(`❌ [ERROR] [URL Preview Worker] Error: ${err.message}`);
    });

    worker.on("error", (err) => {
      // Chỉ log lỗi Redis limit 1 lần
      if (err.message?.includes("max requests limit")) {
        const state = circuitBreaker.getState();
        if (state.failureCount === 1) {
          Logger.error(
            `❌ [ERROR] [URL Preview Worker] Redis limit exceeded. Circuit breaker activating...`
          );
        }
        return;
      }
      if (err.code !== "ECONNREFUSED") {
        Logger.error(`❌ [ERROR] [URL Preview Worker] Error: ${err.message}`);
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
