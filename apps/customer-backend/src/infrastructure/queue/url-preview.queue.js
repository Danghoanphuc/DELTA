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
export const urlPreviewQueue = new Queue("url-preview", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
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
    // ✅ Timeout cho mỗi job: 45 giây (đủ cho Puppeteer chụp ảnh + upload + AI)
    // Tăng lên 45s để đảm bảo đủ thời gian cho toàn bộ flow
    timeout: 45000,
  },
});

// Event listeners để theo dõi queue
urlPreviewQueue.on("completed", (job, result) => {
  Logger.info(`✅ [URL Preview Queue] Job ${job.id} completed successfully`);
});

urlPreviewQueue.on("failed", (job, err) => {
  Logger.error(`❌ [URL Preview Queue] Job ${job.id} failed:`, err.message);
});

urlPreviewQueue.on("stalled", (job) => {
  Logger.warn(`⚠️ [URL Preview Queue] Job ${job.id} stalled (có thể do worker crash hoặc timeout)`);
  // ✅ Có thể thêm logic để retry hoặc cleanup ở đây nếu cần
});

urlPreviewQueue.on("error", (error) => {
  Logger.error(`❌ [URL Preview Queue] Queue error:`, error);
});

// ✅ Export để sử dụng trong các module khác
export default urlPreviewQueue;

