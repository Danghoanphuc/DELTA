import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { Logger } from "../../shared/utils/index.js";
import { socketService } from "../../infrastructure/realtime/socket.service.js";

export class SocialChatService {
  /**
   * ✅ ZERO-LATENCY: Tạo hoặc lấy hội thoại P2P
   * Hàm này được gọi bởi ConnectionService ngay khi Accept Friend
   */
  async createPeerConversation(userId1, userId2) {
    try {
      // 1. Kiểm tra đã tồn tại chưa
      let conversation = await Conversation.findOne({
        type: "peer-to-peer",
        "participants.userId": { $all: [userId1, userId2] },
      }).populate("participants.userId", "username displayName avatarUrl");

      if (conversation) {
        return { conversation, isNew: false };
      }

      // 2. Tạo mới ngay lập tức
      // Title sẽ được Frontend hiển thị dynamic dựa trên tên người kia
      conversation = await Conversation.create({
        type: "peer-to-peer",
        title: "Cuộc trò chuyện",
        participants: [
          { userId: userId1, role: "member" },
          { userId: userId2, role: "member" },
        ],
        lastMessageAt: new Date(),
        isActive: true,
      });

      await conversation.populate(
        "participants.userId",
        "username displayName avatarUrl"
      );

      Logger.info(`[SocialChatSvc] ✅ Created P2P chat: ${conversation._id}`);
      return { conversation, isNew: true };
    } catch (error) {
      Logger.error(`[SocialChatSvc] Error creating P2P chat:`, error);
      throw error;
    }
  }

  /**
   * ✅ Xử lý tin nhắn Social (Text/File) - Không qua AI Agent
   */
  async handleSocialMessage(user, body) {
    const { message, fileUrl, conversationId, type, metadata } = body;

    // 1. Validate Conversation
    const conversation = await Conversation.findById(conversationId).populate(
      "participants.userId",
      "_id"
    );

    if (!conversation) throw new Error("Cuộc trò chuyện không tồn tại");

    // 2. Tạo Message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: user._id,
      senderType: "User",
      content: {
        text: message,
        fileUrl: fileUrl,
      },
      type: type || "text",
      metadata: metadata,
    });

    // 3. Cập nhật Last Message cho Conversation (để nhảy lên đầu list)
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
    });

    // 4. Bắn Socket cho người nhận (Realtime)
    this.emitSocketToRecipient(conversation, newMessage, user._id);

    return {
      ...newMessage.toObject(),
      conversationId: conversation._id,
    };
  }

  /**
   * Helper: Bắn socket cho người còn lại
   */
  emitSocketToRecipient(conversation, message, senderId) {
    try {
      // Tìm người nhận (người không phải là sender)
      const recipient = conversation.participants.find(
        (p) => p.userId._id.toString() !== senderId.toString()
      );

      if (recipient && recipient.userId) {
        const recipientId = recipient.userId._id.toString();

        // Emit tin nhắn mới
        socketService.emitToUser(recipientId, "new_message", {
          ...message.toObject(),
          conversationId: conversation._id,
        });

        // Emit thông báo (để hiện badge đỏ nếu đang ở màn hình khác)
        socketService.emitToUser(recipientId, "notification", {
          type: "new_message",
          title: "Tin nhắn mới",
          body: message.content.text || "Đã gửi một file",
          data: { conversationId: conversation._id },
        });
      }
    } catch (error) {
      Logger.warn("[SocialChatSvc] Socket emit failed:", error);
    }
  }
}
