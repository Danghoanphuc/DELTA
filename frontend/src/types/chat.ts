// src/types/chat.ts (CẬP NHẬT)

import { PrinterProduct } from "./product";
import { Order } from "./order";

// ... (Các interface QuickReply, TextMessageContent, v.v. giữ nguyên) ...
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

// ✅ MỚI: Thêm nội dung cho ai_response (để bao gồm entities, printers)
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
}

export interface TextMessage extends BaseMessage {
  type: "text";
  content: TextMessageContent;
}

// ✅ MỚI: Thêm type cho "ai_response"
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

// ✅ CẬP NHẬT UNION TYPE
export type ChatMessage =
  | TextMessage
  | AiResponseMessage // <-- Thêm vào đây
  | ProductSelectionMessage
  | OrderSelectionMessage;

// ===================================
// 4. CẤU TRÚC PHẢN HỒI TỪ API
// ===================================
export interface AiApiResponse {
  type: ChatMessage["type"]; // "text" | "ai_response" | "product_selection" | ...
  content:
    | TextMessageContent
    | AiResponseContent // <-- Thêm vào đây
    | ProductSelectionContent
    | OrderSelectionContent;
  quickReplies?: QuickReply[];
  isGuest?: boolean;
  savedToHistory?: boolean;
}
