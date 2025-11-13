// packages/types/src/order.types.ts
// ✅ BẢN VÁ (Lượt 46): Sửa lỗi TS2305 (Đồng nhất IShippingAddress -> IAddress)

import { Types } from "mongoose";
// ✅ SỬA LỖI (TS2305): Đổi IShippingAddress -> IAddress (theo File 2)
// (Và thêm đuôi .js - theo File 1)
import { IAddress } from "./user.types.js";

// (Giữ nguyên các Enum/Type khác của anh)
export enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum PaymentStatus {
  UNPAID = "Unpaid",
  PAID = "Paid",
  FAILED = "Failed",
}

// Constants for Master Order Status
export const MASTER_ORDER_STATUS = {
  PENDING: "pending",
  PENDING_PAYMENT: "pending_payment",
  PROCESSING: "processing",
  SHIPPING: "shipping",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// Constants for Sub Order Status (Printer Order Status)
export const SUB_ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DESIGNING: "designing",
  PRINTING: "printing",
  READY: "ready",
  SHIPPING: "shipping",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// Payment Status Constants (object version for compatibility)
export const PAYMENT_STATUS = {
  PENDING: "pending",
  UNPAID: "unpaid",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

// (Giữ nguyên các Interface khác của anh)
export interface IOrderItem {
  product: Types.ObjectId; // Ref: Product
  quantity: number;
  price: number;
  // (Thêm các trường tùy chọn thiết kế...)
}

/**
 * @description "Hợp đồng" cho Đơn hàng (Sub-Order)
 */
export interface IOrder {
  _id: Types.ObjectId;
  masterOrder: Types.ObjectId; // Ref: MasterOrder
  printer: Types.ObjectId; // Ref: PrinterProfile

  items: IOrderItem[];
  totalPrice: number; // (Sub-total của nhà in này)

  // ✅ SỬA LỖI (TS2305): Đổi IShippingAddress -> IAddress
  shippingAddress: IAddress;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  // (Thêm các trường khác nếu cần)

  createdAt: Date;
  updatedAt: Date;
}

// (Giữ nguyên MasterOrder)
export interface IMasterOrder {
  _id: Types.ObjectId;
  orderNumber: string; // (Ví dụ: P-251112-0001)
  customerId: Types.ObjectId; // Ref: CustomerProfile
  customerEmail: string;

  orders: Types.ObjectId[]; // Mảng các Sub-Orders

  totalAmount: number; // Tổng tiền (VND)
  totalItems: number;

  // ✅ SỬA LỖI (TS2305): Đổi IShippingAddress -> IAddress
  shippingAddress: IAddress;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  paymentIntentId?: string; // (Stripe PI)

  createdAt: Date;
  updatedAt: Date;
}
