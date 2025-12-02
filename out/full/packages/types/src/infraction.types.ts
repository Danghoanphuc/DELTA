// packages/types/src/infraction.types.ts
import { type IAdmin } from "./admin.types.js";
import { type IPrinterProfile } from "./printer.types.js";
import { type IOrder } from "./order.types.js";

// Định nghĩa các loại vi phạm (dùng chung)
export type InfractionType =
  | "LATE_FULFILLMENT" // Giao hàng trễ (Tự động)
  | "PRINTER_CANCELLATION" // Nhà in hủy đơn (Tự động)
  | "POOR_QUALITY" // Chất lượng kém (Admin xử lý tranh chấp)
  | "MANUAL_ADJUSTMENT"; // Admin điều chỉnh thủ công (cộng/trừ)

// "Hợp đồng" cho một bản ghi vi phạm
export interface IInfraction {
  _id: string;
  printerProfileId: string | IPrinterProfile; // Nhà in nào
  orderId?: string | IOrder; // Gây ra bởi đơn hàng nào (nếu có)
  adminId?: string | IAdmin; // Admin nào xử lý (nếu là thủ công)
  type: InfractionType;
  pointsDeducted: number; // Số điểm bị trừ (ví dụ: -10)
  notes: string; // Ghi chú của Admin
  expiresAt: Date; // Ngày vi phạm này hết hạn
  createdAt: Date;
}

// "Hợp đồng" cho DTO (Data Transfer Object) khi tạo mới
export interface ICreateInfractionDto {
  printerProfileId: string;
  orderId?: string;
  type: InfractionType;
  pointsDeducted: number;
  notes: string;
}
