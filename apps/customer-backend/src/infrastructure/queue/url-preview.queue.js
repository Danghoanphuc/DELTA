// @ts-nocheck
// src/infrastructure/queue/url-preview.queue.js
// ✅ Queue Infrastructure cho URL Preview Processing
// Sử dụng Bull Queue với Redis để xử lý bất đồng bộ việc chụp ảnh website

import Queue from "bull";
import { Logger } from "../../shared/utils/index.js";

/**
 * URL Preview Queue
 * Xử lý việc chụp ảnh website và phân tích bằng AI Vision
 * 
 * CONFIGURATION:
 * - Concurrency: 1 (chỉ chạy 1 job cùng lúc để tránh quá tải RAM)
 * - removeOnComplete: true (tự động xóa job sau khi hoàn thành để không rác Redis)
 */

// ✅ LAZY INITIALIZATION: Queue chỉ được tạo khi gọi getUrlPreviewQueue()
// Tránh kết nối Redis ngay khi import module
let _urlPreviewQueue = null;

/**
 * ✅ Lazy getter cho urlPreviewQueue - chỉ tạo khi cần dùng
 * Đảm bảo Redis đã kết nối trước khi tạo queue
 */
export async function getUrlPreviewQueue() {
  if (!_urlPreviewQueue) {
    try {
      // ✅ Parse REDIS_URL hoặc fallback về REDIS_HOST/REDIS_PORT
      // Bull v4 hỗ trợ URL string (bao gồm rediss://) tốt hơn object config
      const { getBullRedisConfig } = await import("../../infrastructure/cache/redis-connection.helper.js");
      const redisConfig = getBullRedisConfig();
      
      _urlPreviewQueue = new Queue("url-preview", {
        redis: redisConfig,
      settings: {
        // ✅ Stalled interval: Thời gian chờ trước khi coi job là stalled
        stalledInterval: 30000, // 30 giây (mặc định)
        maxStalledCount: 1, // Cho phép 1 lần stalled trước khi fail
      },
      defaultJobOptions: {
        // ✅ Tự động xóa job sau khi hoàn thành (tránh rác Redis)
        removeOnComplete: true,
        // ✅ Giữ lại job failed để debug (tối đa 10 jobs)
        removeOnFail: {
          age: 24 * 3600, // 24 giờ
          count: 10, // Tối đa 10 jobs failed
        },
        // ✅ Retry policy: Thử lại 2 lần, mỗi lần cách nhau 5s
        attempts: 2,
        backoff: {
          type: "fixed",
          delay: 5000, // 5 giây
        },
        // ✅ Timeout: Đủ cho ApiFlash API call + upload R2 + AI Vision analysis
        timeout: 60000, // 60 giây (ApiFlash nhanh hơn Puppeteer nhiều)
      },
    });

    // Event listeners để theo dõi queue
    _urlPreviewQueue.on("completed", (job, result) => {
      Logger.info(`✅ [URL Preview Queue] Job ${job.id} completed successfully`);
    });

    _urlPreviewQueue.on("failed", (job, err) => {
      Logger.error(`❌ [URL Preview Queue] Job ${job.id} failed:`, err.message);
    });

    _urlPreviewQueue.on("stalled", (job) => {
      Logger.warn(`⚠️ [URL Preview Queue] Job ${job.id} stalled (có thể do worker crash hoặc timeout)`);
    });

    _urlPreviewQueue.on("error", (error) => {
      // ✅ FIX: Chỉ log warning, không throw để server vẫn chạy được khi không có Redis
      if (error.code === 'ECONNREFUSED') {
        Logger.warn(`⚠️ [URL Preview Queue] Redis connection refused. Queue will retry automatically.`);
      } else {
        Logger.error(`❌ [URL Preview Queue] Queue error:`, error);
      }
    });
    } catch (error) {
      Logger.warn(`⚠️ [URL Preview Queue] Failed to create queue (Redis may not be available): ${error.message}`);
      return null; // Return null để server vẫn chạy được
    }
  }
  return _urlPreviewQueue;
}

// ✅ Export getter function (chỉ export một lần)
// ❌ KHÔNG export default trực tiếp - sẽ gọi getter ngay khi import
// Code cũ cần sửa để dùng getUrlPreviewQueue() thay vì import default

