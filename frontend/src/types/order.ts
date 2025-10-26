// frontend/src/types/order.ts

// ==================== ORDER STATUS ====================

export type OrderStatus =
  | "pending" // Chờ xác nhận từ nhà in
  | "confirmed" // Đã xác nhận
  | "printing" // Đang in
  | "shipping" // Đang giao
  | "completed" // Hoàn thành
  | "cancelled" // Đã hủy
  | "refunded"; // Đã hoàn tiền

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "cash" | "transfer" | "vnpay" | "momo";

// ==================== ORDER ITEM ====================

export interface OrderItem {
  productId: string;
  productName: string;
  printerId: string;
  printerName: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  customization?: {
    fileUrl?: string;
    notes?: string;
  };
  productSnapshot?: {
    // Lưu lại thông tin sản phẩm tại thời điểm đặt hàng
    specifications?: any;
    images?: any[];
  };
}

// ==================== SHIPPING ADDRESS ====================

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  street: string;
  ward?: string;
  district: string;
  city: string;
  notes?: string;
}

// ==================== ORDER ====================

export interface Order {
  _id: string;
  orderNumber: string; // Mã đơn hàng dễ đọc (VD: ORD-2024-001)
  customerId: string;
  customerName: string;
  customerEmail: string;

  items: OrderItem[];

  shippingAddress: ShippingAddress;

  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  // Tracking
  statusHistory?: {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }[];

  // Notes
  customerNotes?: string;
  printerNotes?: string;

  // Timeline
  estimatedDelivery?: Date;
  deliveredAt?: Date;

  createdAt: string;
  updatedAt: string;
}

// ==================== CREATE ORDER PAYLOAD ====================

export interface CreateOrderPayload {
  items: {
    productId: string;
    quantity: number;
    pricePerUnit: number;
    customization?: {
      fileUrl?: string;
      notes?: string;
    };
  }[];

  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  customerNotes?: string;
}

// ==================== ORDER SUMMARY ====================

export interface OrderSummary {
  totalOrders: number;
  pending: number;
  confirmed: number;
  printing: number;
  shipping: number;
  completed: number;
  cancelled: number;
}
