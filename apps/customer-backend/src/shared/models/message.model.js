// apps/customer-backend/src/shared/models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    senderType: {
      type: String,
      enum: ["User", "Admin", "System", "AI", "Guest"],
      required: true,
    },
    
    // 🔥 FIX: Thêm đầy đủ các type mới để tránh lỗi ValidatorError
    type: {
      type: String,
      enum: [
        "text",
        "image",
        "file",
        "system",
        "ai_response",       // ✅ Mới
        "product_selection", // ✅ Mới
        "order_selection",   // ✅ Mới
        "printer_selection", // ✅ Mới: Tìm kiếm nhà in
        "payment_request",   // ✅ Mới
        "product",           
        "order",             
        "error",             
        "quote"              
      ],
      default: "text",
    },
    
    // Cho phép lưu mọi định dạng (text, object, array...)
    content: {
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    },
    
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ "content.text": "text" });
messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);