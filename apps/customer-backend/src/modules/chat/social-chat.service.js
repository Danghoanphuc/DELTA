// apps/customer-backend/src/modules/chat/social-chat.service.js
// ✅ FIXED: Logic tách biệt - Tin nhắn không lưu vào Chuông thông báo

import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { Logger } from "../../shared/utils/index.js";
import { socketService } from "../../infrastructure/realtime/socket.service.js";
// import { notificationService } from "../notifications/notification.service.js"; // ❌ KHÔNG CẦN DÙNG NỮA

export class SocialChatService {
  // ... (Giữ nguyên hàm createPeerConversation)
  async createPeerConversation(userId1, userId2, session = null) {
    try {
      let conversation = await Conversation.findOne({
        type: "peer-to-peer",
        "participants.userId": { $all: [userId1, userId2] },
      }).session(session);

      if (conversation) {
        if (!session) {
          await conversation.populate(
            "participants.userId",
            "username displayName avatarUrl"
          );
        }
        return { conversation, isNew: false };
      }

      const newConv = new Conversation({
        type: "peer-to-peer",
        title: "Cuộc trò chuyện",
        participants: [
          { userId: userId1, role: "member" },
          { userId: userId2, role: "member" },
        ],
        lastMessageAt: new Date(),
        isActive: true,
      });

      await newConv.save({ session });
      Logger.info(`[SocialChatSvc] ✅ Created P2P chat: ${newConv._id}`);
      return { conversation: newConv, isNew: true };
    } catch (error) {
      Logger.error(`[SocialChatSvc] Error creating P2P chat:`, error);
      throw error;
    }
  }

  // ... (Giữ nguyên hàm handleSocialMessage)
  async handleSocialMessage(user, body) {
    const { message, fileUrl, conversationId, type, metadata } = body;

    const conversation = await Conversation.findById(conversationId).populate(
      "participants.userId",
      "_id username displayName avatarUrl"
    );

    if (!conversation) throw new Error("Cuộc trò chuyện không tồn tại");

    const isParticipant = conversation.participants.some((p) => {
      const uId = p.userId?._id || p.userId;
      return uId.toString() === user._id.toString();
    });

    if (!isParticipant) {
      throw new Error("Bạn không có quyền gửi tin nhắn");
    }

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

    Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
    }).exec();

    this.notifyRecipient(conversation, newMessage, user).catch((err) =>
      Logger.error("[SocialChatSvc] Notify failed:", err)
    );

    return {
      ...newMessage.toObject(),
      conversationId: conversation._id,
    };
  }

  /**
   * ✅ FIXED: Chỉ bắn Socket, KHÔNG lưu vào Notification DB
   */
  async notifyRecipient(conversation, message, sender) {
    try {
      const recipient = conversation.participants.find((p) => {
        const uId = p.userId?._id || p.userId;
        return uId && uId.toString() !== sender._id.toString();
      });

      if (recipient) {
        const recipientId = (
          recipient.userId?._id || recipient.userId
        ).toString();
        const senderName = sender.displayName || sender.username || "Ai đó";
        const previewText = message.content?.text || "Đã gửi một file đính kèm";

        // 1. BẮN SOCKET CHAT (Hiện tin nhắn trong khung chat & Badge Icon Message)
        socketService.emitToUser(recipientId, "new_message", {
          ...message.toObject(),
          conversationId: conversation._id,
        });

        // 2. BẮN SOCKET TOAST (Hiện Popup góc màn hình)
        // Vẫn giữ cái này để user biết có tin mới nếu đang ở trang khác
        socketService.emitToUser(recipientId, "notification", {
          userId: recipientId,
          type: "message", // Frontend Listener sẽ hiện Toast + Sound
          title: `Tin nhắn mới từ ${senderName}`,
          message: previewText,
          data: {
            conversationId: conversation._id,
            senderId: sender._id.toString(),
            avatarUrl: sender.avatarUrl,
          },
          // isRead: false -> Không cần thiết vì không lưu DB
        });

        // ❌ ĐÃ XÓA: await notificationService.createNotification(...)
        // Việc xóa dòng này sẽ khiến API /notifications/unread-count KHÔNG ĐẾM tin nhắn này nữa
        // -> Icon Chuông sẽ KHÔNG sáng.

        Logger.info(
          `[SocialChatSvc] Notified user ${recipientId} (Socket only)`
        );
      }
    } catch (error) {
      Logger.warn("[SocialChatSvc] Error in notifyRecipient:", error);
    }
  }
}
