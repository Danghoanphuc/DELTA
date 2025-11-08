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

// ===================================
// 3. CÁC LOẠI TIN NHẮN (CHAT MESSAGE)
// ===================================
interface BaseMessage {
  _id: string;
  senderType: "User" | "AI";
  createdAt?: string;

  // ✅ THÊM: Liên kết tin nhắn với cuộc trò chuyện
  conversationId: string;
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

export type ChatMessage =
  | TextMessage
  | AiResponseMessage
  | ProductSelectionMessage
  | OrderSelectionMessage;

// ===================================
// 4. CẤU TRÚC PHẢN HỒI TỪ API
// ===================================
export interface AiApiResponse {
  type: ChatMessage["type"];
  content:
    | TextMessageContent
    | AiResponseContent
    | ProductSelectionContent
    | OrderSelectionContent;
  quickReplies?: QuickReply[];
  isGuest?: boolean;
  savedToHistory?: boolean;

  // ✅ THÊM: Khi một cuộc trò chuyện MỚI được tạo,
  // backend phải trả về thông tin của nó.
  newConversation?: ChatConversation;
}
