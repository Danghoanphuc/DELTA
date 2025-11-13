// apps/admin-backend/src/models/tier-rule.model.ts
import { Schema, model, Document, Types } from "mongoose"; // <-- Thêm Types
import {
  type PrinterTier,
  PRINTER_TIERS_OBJECT,
  type ITierRule as ITierRuleContract,
} from "@printz/types";

// ✅ SỬA LỖI TS2320 & TS2353: Interface Mongoose nội bộ
export interface ITierRule extends Document {
  _id: Types.ObjectId;
  tier: PrinterTier;
  commissionPercent: number;
  promotionCriteria: {
    minHealthScore: number;
    maxLateRate: number;
    minDaysInTier: number;
  };
  badgeColor: string;

  // ✅ SỬA LỖI TS2353: Thêm trường bị thiếu
  displayName: string;
}

const tierRuleSchema = new Schema<ITierRule>({
  tier: {
    type: String,
    enum: Object.values(PRINTER_TIERS_OBJECT),
    unique: true,
    required: true,
  },
  // ✅ SỬA LỖI TS2353: 'displayName' đã có trong interface
  displayName: { type: String, required: true },
  badgeColor: { type: String, default: "#808080" },
  promotionCriteria: {
    minHealthScore: { type: Number, default: 98 },
    maxLateRate: { type: Number, default: 0.01 }, // 1%
    minDaysInTier: { type: Number, default: 90 }, // 90 ngày
  },
  commissionPercent: { type: Number, required: true },
});

export const TierRule = model<ITierRule>("TierRule", tierRuleSchema);
