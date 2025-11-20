import mongoose from "mongoose"; // <-- PHẢI CÓ DÒNG NÀY

// 1. Đổi tên biến (viết thường chữ 'c') và BỎ 'export' ở đây
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: String, // 'customer', 'printer', 'bot'
      },
    ],

    type: {
      type: String,
      enum: ["customer-bot", "customer-printer", "peer-to-peer", "group"],
      required: true,
    },

    // ✅ Tiêu đề cuộc trò chuyện (AI auto-generated hoặc user-edited)
    title: {
      type: String,
      default: "Cuộc trò chuyện mới",
    },

    // --- Context cho chatbot ---
    context: {
      searchQuery: String, // "in áo thun rẻ ở Thủ Dầu Một"
      extractedInfo: {
        productType: String,
        location: String,
        criteria: [String], // ['cheap', 'fast', 'nearby']
      },
      suggestedPrinters: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      ],
    },
    
    // ✅ REFACTOR: ĐÃ XÓA trường 'messages' array (anti-pattern gây lỗi MongoDB 16MB limit)
    // Messages giờ được lưu riêng trong collection Message với conversationId

    lastMessageAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
