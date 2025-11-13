// backend/src/shared/models/Message.js

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
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
    content: {
      text: {
        type: String,
        required: true,
      },
      // (Sau này bạn có thể thêm: images, attachments...)
    },
  },
  { timestamps: true } // Ghi lại thời gian tạo (createdAt)
);

export const Message = mongoose.model("Message", messageSchema);
