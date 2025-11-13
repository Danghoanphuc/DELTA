// apps/admin-backend/src/workers/printer.health.worker.ts
import { Infraction } from "../models/infraction.model.js";
import { TierRule } from "../models/tier-rule.model.js";
// import { Order } from "../../../customer-backend/src/shared/models/order.model.js"; // SẼ DÙNG Ở GĐ 5
// import { Product } from "../../../customer-backend/src/shared/models/product.model.js"; // SẼ DÙNG Ở GĐ 5
// import { PrinterProfile } from "../../../customer-backend/src/shared/models/printer-profile.model.js"; // SẼ DÙNG Ở GĐ 5

/**
 * Đây là hàm "siêu worker" sẽ chạy hàng đêm.
 * Nó chịu trách nhiệm cập nhật sức khỏe của TOÀN BỘ nền tảng.
 */
export const runDailyHealthCheck = async () => {
  console.log(
    `[Cron Worker] Bắt đầu chạy Tác vụ Sức khỏe hàng ngày... ${new Date().toISOString()}`
  );

  try {
    // === CHÚ Ý: LOGIC BÊN DƯỚI SẼ ĐƯỢC HOÀN THIỆN Ở GIAI ĐOẠN 5 & 6 ===

    // --- 1. Tự động Phạt (Infraction) ---
    // TODO: (GĐ 5) Query `OrderModel` tìm các đơn hàng bị `LATE_FULFILLMENT`.
    // TODO: (GĐ 5) Query `OrderModel` tìm các đơn hàng bị `PRINTER_CANCELLATION`.
    // TODO: (GĐ 5) Tạo `Infraction` cho các nhà in vi phạm.

    // --- 2. Tự động Thưởng (Tiering) & Ngăn chặn (Throttling) ---
    // TODO: (GĐ 6) Query tất cả `PrinterProfileModel`.
    // TODO: (GĐ 6) Với mỗi nhà in, tính toán lại `healthScore` (dựa trên Infractions 90 ngày qua).
    // TODO: (GĐ 6) Tính toán lại `dailyCapacity` (dựa trên số đơn hoàn thành 30 ngày qua).
    // TODO: (GĐ 6) Áp dụng luật từ `TierRuleModel` để xử lý Thăng/Giáng hạng (Tiers).

    // --- 3. Tự động Quản lý Sản phẩm (Product Health) ---
    // TODO: (GĐ 5) Tính toán `refundRate` và `cancellationRate` cho MỖI sản phẩm.
    // TODO: (GĐ 5) Tự động "Suspended" (gỡ) các sản phẩm có `refundRate > 20%`.

    console.log("[Cron Worker] Tác vụ Sức khỏe (Placeholder) hoàn thành.");
  } catch (error) {
    console.error(
      "[Cron Worker] LỖI NGHIÊM TRỌNG khi đang chạy Health Check:",
      error
    );
  }
};
