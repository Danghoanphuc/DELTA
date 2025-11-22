// apps/customer-backend/src/modules/chat/social-chat.service.js
// ✅ FIXED: Auto send "System Message" & Socket trigger on Group Create

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
        { userId: creatorId, role: "admin", isVisible: true },
        ...memberIds.map(id => ({ userId: id, role: "member", isVisible: true }))
      ];

      // 3. Tạo Conversation
      const newGroup = new Conversation({
        type: "group",
        title: title || "Nhóm mới",
        participants: participants,
        lastMessageAt: new Date(),
        isActive: true,
      });

      await newGroup.save();
      await newGroup.populate("participants.userId", "username displayName avatarUrl");

      Logger.info(`[SocialChatSvc] ✅ Created GROUP chat: ${newGroup._id} with ${participants.length} members`);

      // 4. ✅ QUAN TRỌNG: Tạo tin nhắn hệ thống đầu tiên
      // Việc này giúp kích hoạt logic "New Message" ở Client -> Client sẽ tự fetch conversation mới về
      const systemMsg = await Message.create({
        conversationId: newGroup._id,
        sender: creatorId, // Người tạo là người gửi
        senderType: "User",
        content: { text: `Đã tạo nhóm "${title}"` },
        type: "text", // Hoặc 'system' nếu frontend hỗ trợ render type này
      });

      // 5. ✅ Bắn Socket cho TẤT CẢ thành viên (Bao gồm cả người tạo để sync message)
      // Frontend (SocialChatSync) sẽ nhận sự kiện 'new_message', 
      // thấy conversationId lạ -> tự động gọi API fetchConversationById -> Hiển thị nhóm lên
      const allMembers = [creatorId, ...memberIds];
      
      allMembers.forEach(memberId => {
        socketService.emitToUser(memberId.toString(), "new_message", {
           ...systemMsg.toObject(),
           conversationId: newGroup._id
        });

        // (Optional) Bắn thêm noti
        if (memberId.toString() !== creatorId.toString()) {
           socketService.emitToUser(memberId.toString(), "notification", {
              userId: memberId.toString(),
              type: "message",
              title: "Bạn được thêm vào nhóm mới",
              message: `${title}`,
              data: { conversationId: newGroup._id }
           });
        }
      });

      return newGroup;
    } catch (error) {
      Logger.error(`[SocialChatSvc] Error creating GROUP chat:`, error);
      throw error;
    }
  }

  // ... (Các hàm createPeerConversation, handleSocialMessage giữ nguyên như cũ) ...
  async createPeerConversation(userId1, userId2, session = null) {
    try {
      let conversation = await Conversation.findOne({
        type: "peer-to-peer",
        "participants.userId": { $all: [userId1, userId2] },
      }).session(session);

      if (conversation) {
        // Revive logic
        let needSave = false;
        conversation.participants.forEach(p => {
            if (!p.isVisible) { p.isVisible = true; needSave = true; }
        });
        if (needSave) await conversation.save({ session });

        if (!session) {
          await conversation.populate("participants.userId", "username displayName avatarUrl");
        }
        return { conversation, isNew: false };
      }

      const newConv = new Conversation({
        type: "peer-to-peer",
        title: "Cuộc trò chuyện",
        participants: [
          { userId: userId1, role: "member", isVisible: true },
          { userId: userId2, role: "member", isVisible: true },
        ],
        lastMessageAt: new Date(),
        isActive: true,
      });

      await newConv.save({ session });
      return { conversation: newConv, isNew: true };
    } catch (error) {
      Logger.error(`[SocialChatSvc] Error creating P2P chat:`, error);
      throw error;
    }
  }

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

    if (!isParticipant) throw new Error("Bạn không có quyền gửi tin nhắn");

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: user._id,
      senderType: "User",
      content: { text: message, fileUrl: fileUrl },
      type: type || "text",
      metadata: metadata,
    });

    // Revive & Update
    await Conversation.updateOne(
      { _id: conversation._id },
      { 
        $set: { 
          lastMessageAt: new Date(),
          "participants.$[].isVisible": true 
        } 
      }
    ).exec();

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
      const recipients = conversation.participants.filter((p) => {
        const uId = p.userId?._id || p.userId;
        return uId && uId.toString() !== sender._id.toString();
      });

      recipients.forEach(recipient => {
          const recipientId = (recipient.userId?._id || recipient.userId).toString();
          const senderName = sender.displayName || sender.username || "Ai đó";
          const previewText = message.content?.text || "Đã gửi một file đính kèm";

          socketService.emitToUser(recipientId, "new_message", {
            ...message.toObject(),
            conversationId: conversation._id,
          });

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