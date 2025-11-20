import { Types } from "mongoose";
import {
  MASTER_ORDER_STATUS,
  PAYMENT_STATUS,
  SUB_ORDER_STATUS,
} from "@printz/types";

export type MasterOrderStatusValue =
  (typeof MASTER_ORDER_STATUS)[keyof typeof MASTER_ORDER_STATUS];

export type PaymentStatusValue =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export type SubOrderStatusValue =
  (typeof SUB_ORDER_STATUS)[keyof typeof SUB_ORDER_STATUS];

export type AdminOrderStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Cancelled";

export interface IShippingAddress {
  recipientName: string;
  phone: string;
  street: string;
  ward?: string;
  district: string;
  city: string;
  notes?: string;
}

export interface IPrinterOrderItem {
  productId?: Types.ObjectId | string;
  productName: string;
  thumbnailUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  designFileUrl?: string;
  options?: Record<string, string | number | boolean | null | undefined>;
}

export interface IPopulatedPrinterProfile {
  _id: Types.ObjectId;
  businessName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  tier?: string | null;
  logoUrl?: string | null;
  shopAddress?: {
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  isActive?: boolean;
  stripeAccountId?: string | null;
}

export interface IPrinterOrder {
  _id: Types.ObjectId;
  printerProfileId: Types.ObjectId | IPopulatedPrinterProfile;
  printerBusinessName: string;
  stripeAccountId?: string;
  items: IPrinterOrderItem[];
  printerTotalPrice: number;
  appliedCommissionRate: number;
  commissionFee: number;
  printerPayout: number;
  printerStatus: SubOrderStatusValue;
  artworkStatus:
    | "pending_upload"
    | "pending_approval"
    | "approved"
    | "rejected";
  printerNotes?: string;
  shippingCode?: string;
  shippedAt?: Date;
  completedAt?: Date;
}

export interface IMasterOrder {
  _id: Types.ObjectId;
  orderNumber: string;
  customerId: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerNotes?: string;
  printerOrders: IPrinterOrder[];
  shippingAddress: IShippingAddress;
  totalAmount: number;
  totalItems: number;
  totalPrice: number;
  totalCommission: number;
  totalPayout: number;
  paymentIntentId?: string;
  orderCode?: number;
  paymentStatus: PaymentStatusValue;
  paidAt?: Date;
  masterStatus: MasterOrderStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderListQuery {
  page?: number | string;
  limit?: number | string;
  status?: AdminOrderStatus | "All" | "all";
  search?: string;
}

export interface PaginatedOrdersResult {
  data: IMasterOrder[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RequestContextMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ForceUpdateStatusInput {
  orderId: string;
  status: AdminOrderStatus;
  adminNote?: string;
}

