// backend/src/shared/models/Message.js

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true, // ✅ REFACTOR: Đánh index để tăng tốc query
    },
    sender: {
      // Chúng ta chỉ cần lưu ID của người gửi
      // AI sẽ có ID là null hoặc một ID bot đặc biệt
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderType: {
      type: String,
      enum: ["User", "AI"],
      required: true,
    },
    
    // ✅ REFACTOR: Thêm trường 'type' để hỗ trợ Rich Messages
    type: {
      type: String,
      enum: ["text", "image", "file", "product", "order", "system"],
      default: "text",
    },
    
    content: {
      text: {
        type: String,
        required: true,
      },
      // (Sau này bạn có thể thêm: images, attachments...)
    },
    
    // ✅ REFACTOR: Thêm trường 'metadata' cho Rich Messages
    // Ví dụ: { productId: "xxx", price: 50000, image: "url" } cho type='product'
    // Hoặc: { orderId: "xxx", status: "pending" } cho type='order'
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true } // Ghi lại thời gian tạo (createdAt)
);

// ✅ REFACTOR: Tạo compound index để tối ưu query theo conversationId + createdAt
messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
