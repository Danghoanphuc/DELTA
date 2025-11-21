// src/types/chat.ts (CẬP NHẬT)

import { PrinterProduct } from "./product";
import { Order } from "./order";

// ===================================
// ✅ MỚI: ĐỊNH NGHĨA CUỘC TRÒ CHUYỆN
// ===================================
export interface ChatConversation {
  _id: string;
  userId: string;
  title: string; // Tên do AI tự động đặt (hoặc do người dùng sửa)
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string; // ✅ NEW: Timestamp of the last message
  type?: "individual" | "group" | "ai"; // ✅ NEW: Type of conversation
  participants?: { userId: string; username: string; avatarUrl?: string }[]; // ✅ NEW: Participants in the conversation
}

// ===================================
// 1. CÁC THÀNH PHẦN CƠ BẢN
// ===================================
export interface QuickReply {
  text: string;
  payload: string;
}
// ===================================
// 2. CÁC LOẠI NỘI DUNG TIN NHẮN
// ===================================
export interface TextMessageContent {
  text: string;
}
export interface ProductSelectionContent {
  text: string;
  products: PrinterProduct[];
}
export interface OrderSelectionContent {
  text: string;
  orders: Order[];
}

export interface AiResponseContent {
  text: string;
  entities?: any;
  printers?: any[];
}

// ✅ ZERO-EXIT PAYMENT: Payment request content
export interface PaymentRequestContent {
  orderId: string;
  orderNumber: string;
  amount: number;
  description: string;
  qrCode: string;
  checkoutUrl: string;
  paymentLinkId?: string;
  status: "pending" | "paid" | "cancelled";
  
  // ✅ NEW FIELDS FOR MINI INVOICE CONTEXT
  productName: string;       // e.g., "In Card Visit + 2 others"
  quantity: number;          // e.g., 100
  itemsCount: number;        // e.g., 3 (number of different products)
}

// ===================================
// 3. CÁC LOẠI TIN NHẮN (CHAT MESSAGE)
// ===================================

// ✅ RICH MESSAGES: Product metadata interface
export interface ProductMetadata {
  productId: string;
  productName?: string;
  productSlug?: string;
  price?: number;
  image?: string;
  category?: string;
  printerName?: string;
  [key: string]: any; // Allow additional fields
}

// ✅ RICH MESSAGES: Order metadata interface  
export interface OrderMetadata {
  orderId: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  [key: string]: any; // Allow additional fields
}

// ✅ RICH MESSAGES: Generic metadata type
export type MessageMetadata = ProductMetadata | OrderMetadata | Record<string, any> | null;

// ✅ ENTERPRISE: Message delivery status
export type MessageStatus = 
  | "pending"    // Đang chờ gửi (Optimistic UI)
  | "sending"    // Đang gửi lên server
  | "sent"       // Đã gửi thành công
  | "delivered"  // Đã nhận được (Socket ACK)
  | "read"       // Đã xem (Seen)
  | "error";     // Gửi thất bại

interface BaseMessage {
  _id: string;
  senderType: "User" | "AI";
  sender?:
    | string
    | {
        _id: string;
        username?: string;
        displayName?: string;
        avatarUrl?: string;
      };
  createdAt?: string;

  // ✅ THÊM: Liên kết tin nhắn với cuộc trò chuyện
  conversationId: string;
  
  // ✅ RICH MESSAGES: Thêm type và metadata từ backend
  type?: "text" | "image" | "file" | "product" | "order" | "system" | "ai_response" | "product_selection" | "order_selection" | "payment_request" | "error";
  metadata?: MessageMetadata;

  // ✅ ENTERPRISE: Delivery tracking
  status?: MessageStatus;
  tempId?: string;        // Temporary ID for optimistic updates
  retryCount?: number;    // Số lần retry
  error?: string;         // Error message nếu có
  readBy?: string[];      // Array of userIds đã đọc (for group chat)
  deliveredAt?: string;   // Timestamp khi delivered
  readAt?: string;        // Timestamp khi read
}

export interface TextMessage extends BaseMessage {
  type: "text";
  content: TextMessageContent;
}

export interface AiResponseMessage extends BaseMessage {
  type: "ai_response";
  senderType: "AI";
  content: AiResponseContent;
}

export interface ProductSelectionMessage extends BaseMessage {
  type: "product_selection";
  senderType: "AI";
  content: ProductSelectionContent;
}
export interface OrderSelectionMessage extends BaseMessage {
  type: "order_selection";
  senderType: "AI";
  content: OrderSelectionContent;
}

// ✅ ZERO-EXIT PAYMENT: Payment request message
export interface PaymentRequestMessage extends BaseMessage {
  type: "payment_request";
  senderType: "AI";
  content: PaymentRequestContent;
}

// ✅ NEW: Image Message
export interface ImageMessage extends BaseMessage {
  type: "image";
  content: { imageUrl: string; text?: string };
  metadata?: { imageUrl: string; description?: string };
}

// ✅ NEW: File Message
export interface FileMessage extends BaseMessage {
  type: "file";
  content: { fileUrl: string; fileName: string; fileSize?: number };
  metadata?: { fileUrl: string; fileName: string; fileSize?: number };
}

// ✅ NEW: Product Message (for rich message cards)
export interface ProductMessage extends BaseMessage {
  type: "product";
  content: TextMessageContent; // Can be a simple text message
  metadata: ProductMetadata;
}

// ✅ NEW: Order Message (for rich message cards)
export interface OrderMessage extends BaseMessage {
  type: "order";
  content: TextMessageContent; // Can be a simple text message
  metadata: OrderMetadata;
}

// ✅ NEW: System Message
export interface SystemMessage extends BaseMessage {
  type: "system";
  content: TextMessageContent;
}

// ✅ NEW: Error Message
export interface ErrorMessage extends BaseMessage {
  type: "error";
  content: TextMessageContent;
}

export type ChatMessage =
  | TextMessage
  | AiResponseMessage
  | ProductSelectionMessage
  | OrderSelectionMessage
  | PaymentRequestMessage
  | ImageMessage
  | FileMessage
  | ProductMessage
  | OrderMessage
  | SystemMessage
  | ErrorMessage;

// ===================================
// 4. CẤU TRÚC PHẢN HỒI TỪ API
// ===================================
export interface AiApiResponse {
  type: ChatMessage["type"];
  content:
    | TextMessageContent
    | AiResponseContent
    | ProductSelectionContent
    | OrderSelectionContent
    | PaymentRequestContent; // ✅ Add payment request
  quickReplies?: QuickReply[];
  isGuest?: boolean;
  savedToHistory?: boolean;
  metadata?: MessageMetadata;

  // ✅ THÊM: Khi một cuộc trò chuyện MỚI được tạo,
  // backend phải trả về thông tin của nó.
  newConversation?: ChatConversation;
}

// ===================================
// 5. ENTERPRISE FEATURES
// ===================================

// ✅ ENTERPRISE: Offline Queue Item
export interface QueuedMessage {
  tempId: string;
  message: string;
  conversationId: string | null;
  latitude?: number;
  longitude?: number;
  type?: ChatMessage["type"];
  metadata?: MessageMetadata;
  retryCount: number;
  createdAt: number; // Timestamp
  error?: string;
}

// ✅ ENTERPRISE: Typing Indicator State
export interface TypingState {
  conversationId: string;
  userId?: string;
  userName?: string;
  isTyping: boolean;
  timestamp: number; // To handle timeout
}

// ✅ ENTERPRISE: Cross-Tab Sync Message
export interface SyncMessage {
  type: "NEW_MESSAGE" | "UPDATE_MESSAGE" | "DELETE_MESSAGE" | "TYPING" | "READ";
  payload: any;
  timestamp: number;
}

// ✅ ENTERPRISE: Read Receipt
export interface ReadReceipt {
  messageId: string;
  conversationId: string;
  userId: string;
  readAt: string;
}
