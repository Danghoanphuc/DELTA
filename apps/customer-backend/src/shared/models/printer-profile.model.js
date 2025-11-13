// apps/customer-backend/src/shared/models/printer-profile.model.js
import mongoose from "mongoose";
import { PRINTER_TIERS_OBJECT } from "@printz/types";

const PrinterProfileSchema = new mongoose.Schema(
  {
    // ... (userId, businessName... giữ nguyên) ...

    // === BƯỚC 2: NÂNG CẤP HỆ THỐNG SỨC KHỎE NHÀ IN (3 TRỤ CỘT) ===

    // ... (healthScore, dailyCapacity, currentQueueSize giữ nguyên) ...

    // Trụ cột 3: Thưởng (Tiering)
    tier: {
      type: String,
      enum: Object.values(PRINTER_TIERS_OBJECT),
      default: PRINTER_TIERS_OBJECT.STANDARD,
      index: true,
    },

    // --- NÂNG CẤP KIẾN TRÚC HOA HỒNG (GĐ 5.4) ---
    /**
     * Mức hoa hồng chuẩn (Standard) dựa trên Tier.
     * Được cập nhật bởi Giai đoạn 6 (Health Worker) hàng tháng.
     */
    standardCommissionRate: {
      type: Number,
      default: 0.1, // Mặc định 10%
      min: 0,
      max: 1,
    },

    /**
     * Mức hoa hồng "Ghi đè" (Override) cho mục đích marketing hoặc phạt/thưởng tức thời.
     * Được quản lý bởi Giai đoạn 7 (Marketing) hoặc Admin.
     * Logic của CheckoutService sẽ ưu tiên mức này nếu nó tồn tại và còn hạn.
     */
    commissionOverride: {
      rate: { type: Number, min: 0, max: 1 },
      expiresAt: { type: Date },
    },
    // --- KẾT THÚC NÂNG CẤP ---

    stats: {
      lastDemotionAt: Date,
      lastPromotionAt: Date,
    },

    // ... (Các trường còn lại như stripe, shopAddress... giữ nguyên từ file gốc của anh) ...
  },
  { timestamps: true }
);

// (Indexes giữ nguyên)
PrinterProfileSchema.index({ "shopAddress.location": "2dsphere" });
PrinterProfileSchema.index({ businessName: "text", description: "text" });

export const PrinterProfile = mongoose.model(
  "PrinterProfile",
  PrinterProfileSchema
);
