// packages/types/src/tier.types.ts
// ✅ BẢN VÁ (Lượt 46): Thêm .js

import { Types } from "./mongoose.types.js";
// ✅ SỬA LỖI (TS2305): Thêm đuôi .js (NodeNext requirement)
import { PrinterTier } from "./printer.types.js"; // (Import từ File 4)

/**
 * @description "Hợp đồng" cho các quy tắc tính thưởng/phạt
 */
export interface ITierRule {
  _id: Types.ObjectId;
  tier: PrinterTier; // (Import từ File 4)
  metric: "LATE_SHIPMENT_RATE" | "DEFECT_RATE" | "CANCELLATION_RATE";
  condition: "LESS_THAN" | "GREATER_THAN";
  threshold: number;
  adjustment: number; // Số tiền thưởng (dương) hoặc phạt (âm)
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
