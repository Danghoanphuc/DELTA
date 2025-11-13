// apps/admin-backend/src/workers/index.ts
import cron from "node-cron";
import { runDailyHealthCheck } from "./printer.health.worker.js";

/**
 * Khởi tạo tất cả các kịch bản tự động (Cron Jobs)
 */
export const initializeCronJobs = () => {
  console.log("[Cron Scheduler] Khởi tạo trình lập lịch...");

  // 1. TÁC VỤ SỨC KHỎE (HÀNG ĐÊM)
  // Lập lịch chạy vào 2:00 sáng mỗi ngày
  cron.schedule(
    "0 2 * * *", // (Phút, Giờ, Ngày, Tháng, Thứ)
    async () => {
      console.log(
        "[Cron Scheduler] Kích hoạt Tác vụ Sức khỏe (runDailyHealthCheck)..."
      );
      await runDailyHealthCheck();
    },
    {
      timezone: "Asia/Ho_Chi_Minh", // Rất quan trọng: Chạy theo giờ Việt Nam
    }
  );

  // (Chúng ta có thể thêm các cron job khác ở đây trong tương lai)
  // Ví dụ: cron.schedule("*/30 * * * *", runRealtimeOrderSync); // 30 phút/lần

  console.log("[Cron Scheduler] Đã lập lịch thành công cho 1 tác vụ.");
};
