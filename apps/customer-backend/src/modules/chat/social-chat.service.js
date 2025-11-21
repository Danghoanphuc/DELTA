// apps/customer-backend/src/modules/chat/social-chat.service.js
// ✅ FIXED: Added createGroupConversation logic

import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { Logger } from "../../shared/utils/index.js";
import { socketService } from "../../infrastructure/realtime/socket.service.js";
import { ChatRepository } from "./chat.repository.js";

export class SocialChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
  }
  
  /**
   * ✅ HÀM MỚI: Tạo nhóm chat
   */
  async createGroupConversation(creatorId, title, memberIds) {
    try {
      // 1. Validate input
      if (!memberIds || memberIds.length === 0) {
        throw new Error("Nhóm phải có ít nhất 1 thành viên khác");
      }

      // 2. Chuẩn bị participants
      // Creator là admin, các người khác là member
      const participants = [
        { userId: creatorId, role: "admin" },
        ...memberIds.map(id => ({ userId: id, role: "member" }))
      ];

      // 3. Tạo Conversation
      const newGroup = new Conversation({
        type: "group",
        title: title || "Nhóm mới",
        participants: participants,
        lastMessageAt: new Date(),
        isActive: true,
        // Có thể thêm logic avatar mặc định cho nhóm ở đây nếu cần
      });

      await newGroup.save();

      // 4. Populate để trả về đầy đủ thông tin
      await newGroup.populate("participants.userId", "username displayName avatarUrl");

      Logger.info(`[SocialChatSvc] ✅ Created GROUP chat: ${newGroup._id} with ${participants.length} members`);
      
      // 5. Bắn Socket thông báo cho các thành viên mới (Optional - để họ thấy nhóm ngay lập tức)
      // memberIds.forEach(memberId => { ... socketService.emit ... })

      return newGroup;
    } catch (error) {
      Logger.error(`[SocialChatSvc] Error creating GROUP chat:`, error);
      throw error;
    }
  }

  // ... (Giữ nguyên createPeerConversation) ...
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

  // ... (Giữ nguyên handleSocialMessage & notifyRecipient) ...
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

  async notifyRecipient(conversation, message, sender) {
    try {
      // Với nhóm, gửi cho tất cả trừ người gửi
      const recipients = conversation.participants.filter((p) => {
        const uId = p.userId?._id || p.userId;
        return uId && uId.toString() !== sender._id.toString();
      });

      recipients.forEach(recipient => {
          const recipientId = (recipient.userId?._id || recipient.userId).toString();
          const senderName = sender.displayName || sender.username || "Ai đó";
          const previewText = message.content?.text || "Đã gửi một file đính kèm";

          // 1. Socket Chat
          socketService.emitToUser(recipientId, "new_message", {
            ...message.toObject(),
            conversationId: conversation._id,
          });

          // 2. Socket Notification
          socketService.emitToUser(recipientId, "notification", {
            userId: recipientId,
            type: "message",
            title: conversation.type === 'group' ? `${conversation.title}` : `Tin nhắn mới từ ${senderName}`,
            message: conversation.type === 'group' ? `${senderName}: ${previewText}` : previewText,
            data: {
              conversationId: conversation._id,
              senderId: sender._id.toString(),
              avatarUrl: sender.avatarUrl,
            },
          });
      });
      
    } catch (error) {
      Logger.warn("[SocialChatSvc] Error in notifyRecipient:", error);
    }
  }
}