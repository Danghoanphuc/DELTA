// apps/customer-backend/src/infrastructure/queue/url-preview.queue.js
import { Queue } from "bullmq";
import { Logger } from "../../shared/utils/index.js";
import { getRedisConnectionConfig } from "../cache/redis-connection.helper.js";

// 🔁 Lazy Singleton cho URL Preview Queue
let _urlPreviewQueue = null;
let _urlPreviewInitPromise = null;
let _urlPreviewWarnedOnce = false;

/**
 * ✅ Lazy getter cho URL Preview Queue (giống pattern getPdfQueue)
 * - KHÔNG tạo queue ngay khi import file
 * - Nếu Redis down: log cảnh báo 1 lần, trả về null, không spam console
 */
export async function getUrlPreviewQueue() {
  // Đã có instance -> trả thẳng
  if (_urlPreviewQueue) return _urlPreviewQueue;

  // Đã thử và fail trước đó -> không thử lại để tránh spam
  if (_urlPreviewWarnedOnce) return null;

  // Đang có 1 promise khởi tạo -> dùng lại
  if (_urlPreviewInitPromise) return _urlPreviewInitPromise;

  _urlPreviewInitPromise = (async () => {
    try {
      const redisConnection = getRedisConnectionConfig();

      const queue = new Queue("url-preview", {
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

      // Lắng nghe lỗi runtime nhưng bỏ qua ECONNREFUSED để tránh spam
      queue.on("error", (error) => {
        if (error?.code === "ECONNREFUSED") {
          // Redis down sau khi đã chạy – bỏ qua để không spam
          return;
        }
        Logger.error(`[URL Preview Queue] Error: ${error.message}`);
      });

      _urlPreviewQueue = queue;
      return queue;
    } catch (error) {
      if (!_urlPreviewWarnedOnce) {
        Logger.warn(
          `⚠️ [URL Preview Queue] Failed to initialize (Redis offline?): ${error.message}`
        );
        _urlPreviewWarnedOnce = true;
      }
      _urlPreviewQueue = null;
      return null;
    } finally {
      _urlPreviewInitPromise = null;
    }
  })();

  return _urlPreviewInitPromise;
}