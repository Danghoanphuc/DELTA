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
      enum: ["text", "image", "file", "product", "order", "system", "quote"],
      default: "text",
    },
    
    content: {
      text: {
        type: String,
        default: "",
      },
      fileUrl: {
        type: String,
        default: null,
      },
      // ✅ DEAL CLOSER: Hỗ trợ attachments (mảng file đính kèm)
      attachments: [
        {
          url: { 
            type: String, 
            required: function() {
              // url required nếu không có fileKey (Cloudinary)
              return !this.fileKey;
            }
          },
          fileKey: { type: String }, // ✅ R2 file key (thay thế url khi storage === "r2")
          storage: { type: String, enum: ["cloudinary", "r2"], default: "cloudinary" }, // ✅ Đánh dấu storage type
          type: { type: String, enum: ["image", "video", "file"], default: "file" },
          originalName: { type: String },
          name: { type: String },
          format: { type: String }, // ✅ Extension (pdf, ai, zip...) để Frontend hiển thị icon đúng
          size: { type: Number },
          context: {
            type: String,
            enum: ["PRINT_FILE", "REFERENCE", "INVOICE", "OTHER"],
            default: "OTHER",
          },
        },
      ],
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
