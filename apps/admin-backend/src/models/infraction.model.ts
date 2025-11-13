// apps/admin-backend/src/models/infraction.model.ts
import { Schema, model, Document, Types } from "mongoose"; // <-- Thêm Types
import {
  type InfractionType,
  type IInfraction as IInfractionContract,
} from "@printz/types";

// ✅ SỬA LỖI TS2320: Interface Mongoose nội bộ
export interface IInfraction extends Document {
  _id: Types.ObjectId;
  printerProfileId: Types.ObjectId;
  orderId?: Types.ObjectId;
  adminId?: Types.ObjectId;
  type: InfractionType;
  pointsDeducted: number;
  notes: string;
  createdAt: Date; // Mongoose tự thêm qua timestamps
  updatedAt: Date; // Mongoose tự thêm qua timestamps
}

const infractionSchema = new Schema<IInfraction>(
  {
    printerProfileId: {
      type: Schema.Types.ObjectId,
      ref: "PrinterProfile",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    type: {
      type: String,
      enum: [
        "LATE_FULFILLMENT",
        "PRINTER_CANCELLATION",
        "POOR_QUALITY",
        "MANUAL_ADJUSTMENT",
      ],
      required: true,
    },
    pointsDeducted: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      required: [true, "Ghi chú là bắt buộc khi tạo vi phạm thủ công"],
    },
    // Rất quan trọng: Đặt TTL index để vi phạm tự hết hạn sau 90 ngày
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "90d", // Tự động xóa sau 90 ngày
    },
  },
  { timestamps: true } // Vẫn giữ timestamps
);

export const Infraction = model<IInfraction>("Infraction", infractionSchema);
