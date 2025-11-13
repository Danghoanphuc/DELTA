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
      enum: ["customer-bot", "customer-printer"],
      required: true,
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
    // *** THÊM TRƯỜNG MỚI NÀY VÀO ***
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message", // Tham chiếu đến model 'Message'
      },
    ],

    lastMessageAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
