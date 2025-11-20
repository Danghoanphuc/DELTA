// frontend/src/types/order.ts

// ==================== ORDER STATUS ====================

// Đã cập nhật để khớp với 9 trạng thái trong OrderDetailPage
export type OrderStatus =
  | "pending" // Chờ xác nhận
  | "confirmed" // Đã xác nhận
  | "designing" // Đang thiết kế (Đã thêm)
  | "printing" // Đang in
  | "ready" // Sẵn sàng giao (Đã thêm)
  | "shipping" // Đang giao
  | "completed" // Hoàn thành
  | "cancelled" // Đã hủy
  | "refunded"; // Đã hoàn tiền

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Đã sửa lại tên cho nhất quán với code trong OrderDetailPage
export type PaymentMethod = "cod" | "bank-transfer" | "momo" | "zalopay";

// ==================== ORDER ITEM ====================

// Đã thêm interface riêng cho thông số
export interface OrderItemSpecifications {
  material?: string;
  size?: string;
  color?: string;
  [key: string]: any; // Cho các thông số tùy chọn khác
}

export interface OrderItem {
  productId: string;
  productName: string;
  printerId: string; // ID của nhà in cho sản phẩm này
  printerName: string; // Tên nhà in cho sản phẩm này
  quantity: number;
  pricePerUnit: number;
  subtotal: number;

  // Đã đưa specifications ra ngoài, vì OrderDetailPage truy cập trực tiếp
  specifications?: OrderItemSpecifications;

  customization?: {
    fileUrl?: string;
    notes?: string;
  };
  productSnapshot?: {
    // Lưu lại thông tin sản phẩm tại thời điểm đặt hàng
    images?: { url: string; [key: string]: any }[];
    // specifications cũng có thể vẫn ở đây để lưu trữ bản gốc
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

// ==================== PAYMENT INFO (Đã thêm) ====================
// Interface này bị thiếu, OrderDetailPage cần 'paidAt'
export interface OrderPayment {
  paidAt?: string; // OrderDetailPage dùng 'order.payment.paidAt'
  transactionId?: string; // Thường sẽ có mã giao dịch
  [key: string]: any;
}

// ==================== PRINTER INFO (Đã thêm) ====================
// Interface này bị thiếu, OrderDetailPage cần 'displayName'
export interface OrderPrinterInfo {
  _id: string;
  displayName: string; // OrderDetailPage dùng 'order.printerId.displayName'
  [key: string]: any;
}

// ==================== ORDER ====================

export interface Order {
  _id: string;
  orderNumber: string; // Mã đơn hàng dễ đọc (VD: ORD-2024-001)
  masterOrderId?: string; // Thêm trường này
  printerOrderId?: string; // Thêm trường này
  customerId: string;
  customerName: string;
  customerEmail: string;

  // printerId có thể là một object được populate (theo cách OrderDetailPage sử dụng)
  // hoặc chỉ là string nếu đơn hàng này thuộc về 1 nhà in duy nhất
  // Dựa trên code, nó được dùng khi customer xem -> là 1 object
  printerId?: OrderPrinterInfo;

  items: OrderItem[];

  shippingAddress: ShippingAddress;

  subtotal: number;
  shippingFee: number;
  tax: number; // Mặc dù không dùng ở trang chi tiết, vẫn nên giữ lại
  discount: number;
  total: number;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  // Đã thêm cấu trúc payment object
  payment: OrderPayment;

  // Tracking
  statusHistory?: {
    status: OrderStatus;
    timestamp: string; // OrderDetailPage dùng formatDate, nên là string
    note?: string;
  }[];

  // Notes
  customerNotes?: string;
  printerNotes?: string;

  // Timeline
  estimatedDelivery?: string;
  deliveredAt?: string;

  createdAt: string;
  updatedAt: string;
}

// ==================== CREATE ORDER PAYLOAD ====================

export interface CreateOrderPayload {
  items: {
    productId: string;
    quantity: number;
    pricePerUnit: number;
    specifications?: OrderItemSpecifications; // Cập nhật ở đây
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
  printing: number; // 'printing'
  shipping: number;
  completed: number;
  cancelled: number;

  // Có thể thêm các trạng thái mới nếu cần
  designing?: number;
  ready?: number;
}
