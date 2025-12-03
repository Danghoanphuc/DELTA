// apps/customer-backend/src/modules/chat/social-chat.service.js
// ✅ Social Chat Service - Xử lý tin nhắn giữa users (peer-to-peer, group, customer-printer)

import mongoose from "mongoose";
import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { MasterOrder } from "../../shared/models/master-order.model.js";
import { Logger } from "../../shared/utils/index.js";
import { ChatRepository } from "./chat.repository.js";
import { cloudinary } from "../../infrastructure/storage/multer.config.js";
import { addNotificationJob } from "../../infrastructure/queue/notification.queue.js";
import { socketService } from "../../infrastructure/realtime/pusher.service.js";
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";

// ✅ Tạm thời định nghĩa local để không bị lỗi code
const MASTER_ORDER_STATUS = {
  PENDING: "pending",
  PENDING_PAYMENT: "pending_payment",
  PAID_WAITING_FOR_PRINTER: "paid_waiting_for_printer",
  PROCESSING: "processing",
  SHIPPING: "shipping",
};

export class SocialChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this._socketService = null; // Lazy load
  }

  /**
   * ✅ LAZY LOAD: Chỉ import socketService khi cần dùng
   */
  async getSocketService() {
    if (!this._socketService) {
      this._socketService = socketService;
    }
    return this._socketService;
  }

  /**
   * ✅ Xử lý tin nhắn social chat (peer-to-peer, group, customer-printer)
   */
  async handleSocialMessage(user, body) {
    const {
      message,
      displayText,
      fileUrl,
      conversationId,
      type,
      metadata,
      fileName,
      fileType,
      attachments,
      replyToId,
    } = body;
    const userId = user?._id || null;

    // ✅ LOG: Input data (chỉ log thông tin quan trọng)
    Logger.debug(
      `[SocialChat] 📨 handleSocialMessage: conv=${conversationId}, user=${userId}, hasFile=${!!fileUrl}, hasAttachments=${
        !!attachments && attachments.length > 0
      }, attachmentsCount=${attachments?.length || 0}`
    );

    if (!conversationId) {
      throw new ValidationException("conversationId is required");
    }

    // 1. Tìm conversation
    const conversation = await Conversation.findById(conversationId)
      .populate("participants.userId", "username displayName avatarUrl")
      .lean();

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    // 🔥 [NEW PATCH] Chặn nhắn tin nếu hội thoại đã bị disable (do unfriend/block)
    if (conversation.isActive === false) {
      throw new ValidationException("Cuộc trò chuyện này không còn khả dụng.");
    }

    // 2. Kiểm tra user có trong participants không
    const isParticipant = conversation.participants.some(
      (p) =>
        p.userId._id?.toString() === userId?.toString() ||
        p.userId.toString() === userId?.toString()
    );

    if (!isParticipant && userId) {
      throw new ValidationException(
        "You are not a participant of this conversation"
      );
    }

    // 3. Lưu tin nhắn vào DB
    const messageData = {
      conversationId: conversation._id,
      sender: userId,
      senderType: userId ? "User" : "Guest",
      content: { text: displayText || message },
      type: fileUrl ? "file" : "text",
      metadata: metadata || {},
      replyTo: replyToId || null,
    };

    // ✅ FIX: Xử lý file từ attachments array (frontend gửi) hoặc fileUrl trực tiếp (legacy)
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      // ✅ Frontend đã gửi attachments array - dùng trực tiếp
      Logger.info(
        `[SocialChat] 📎 Processing ${attachments.length} attachment(s) from frontend`
      );

      messageData.content.attachments = attachments.map((att) => ({
        url: att.url,
        fileUrl: att.url, // Giữ cả 2 để tương thích
        originalName: att.originalName || att.fileName || "file",
        fileName: att.originalName || att.fileName || "file", // Giữ cả 2 để tương thích
        type:
          att.type || (att.fileType?.startsWith("image/") ? "image" : "file"),
        fileType: att.fileType || att.type || "application/octet-stream",
        fileKey: att.fileKey, // Giữ fileKey nếu có (cho R2)
        storage: att.storage, // Giữ storage info nếu có
        size: att.size,
      }));

      // ✅ Nếu có ảnh thì set type = "image"
      const hasImage = messageData.content.attachments.some(
        (a) => a.type === "image" || a.fileType?.startsWith("image/")
      );
      if (hasImage) {
        messageData.type = "image";
      } else {
        messageData.type = "file";
      }

      Logger.info(
        `[SocialChat] 📎 Formatted ${messageData.content.attachments.length} attachment(s), type=${messageData.type}`
      );
    } else if (fileUrl) {
      // ✅ Legacy: Xử lý fileUrl trực tiếp (từ multer upload)
      const finalFileName = metadata?.fileName || fileName || "file";
      const finalFileType =
        metadata?.fileType || fileType || "application/octet-stream";
      const isImage = finalFileType.startsWith("image/");

      // ✅ LOG: File processing (legacy)
      Logger.info(
        `[SocialChat] 📎 Processing file (legacy): ${finalFileName}, type=${finalFileType}, isImage=${isImage}`
      );

      // ✅ Frontend mong đợi: content.attachments = [{ url, originalName, type, fileKey? }]
      messageData.content.attachments = [
        {
          url: fileUrl,
          fileUrl: fileUrl, // Giữ cả 2 để tương thích
          originalName: finalFileName,
          fileName: finalFileName, // Giữ cả 2 để tương thích
          type: isImage ? "image" : "file",
          fileType: finalFileType, // Giữ cả 2 để tương thích
        },
      ];

      // ✅ Nếu là ảnh thì set type = "image" để frontend hiển thị đúng
      if (isImage) {
        messageData.type = "image";
      }

      Logger.info(
        `[SocialChat] 📎 Formatted attachment (legacy), type=${messageData.type}`
      );
    }

    const savedMessage = await this.chatRepository.createMessage(messageData);

    // ✅ LOG: Message saved
    Logger.info(
      `[SocialChat] 💾 Message saved: id=${savedMessage._id}, type=${
        savedMessage.type
      }, attachments=${savedMessage.content?.attachments?.length || 0}`
    );

    // 4. Populate sender info và replyTo để gửi đi
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "username displayName avatarUrl _id")
      .populate({
        path: "replyTo",
        select: "content sender createdAt type",
        populate: {
          path: "sender",
          select: "username displayName avatarUrl",
        },
      })
      .lean();

    // ✅ Đảm bảo message có đầy đủ thông tin
    if (!populatedMessage) {
      throw new Error("Failed to save message");
    }

    // ✅ LOG: Populated message (chỉ log thông tin quan trọng)
    Logger.info(
      `[SocialChat] 📤 Populated message: id=${populatedMessage._id}, type=${
        populatedMessage.type
      }, attachments=${populatedMessage.content?.attachments?.length || 0}`
    );

    // ✅ FIX: Đảm bảo attachments được format đúng khi emit qua Pusher
    // Nếu message có fileUrl nhưng chưa có attachments array, format lại
    if (
      populatedMessage.content?.fileUrl &&
      !populatedMessage.content?.attachments
    ) {
      const finalFileName =
        populatedMessage.content?.fileName || fileName || "file";
      const finalFileType =
        populatedMessage.content?.fileType ||
        fileType ||
        "application/octet-stream";

      populatedMessage.content.attachments = [
        {
          url: populatedMessage.content.fileUrl,
          fileUrl: populatedMessage.content.fileUrl,
          originalName: finalFileName,
          fileName: finalFileName,
          type: finalFileType.startsWith("image/") ? "image" : "file",
          fileType: finalFileType,
        },
      ];

      // ✅ Nếu là ảnh thì set type = "image"
      if (finalFileType.startsWith("image/")) {
        populatedMessage.type = "image";
      }
    }

    // 5. ✅ Emit event qua Pusher cho TẤT CẢ participants (bao gồm cả sender để hiển thị ngay)
    const socketService = await this.getSocketService();
    const participants = conversation.participants || [];

    for (const participant of participants) {
      const participantId =
        participant.userId?._id?.toString() || participant.userId?.toString();

      if (!participantId) continue;

      // ✅ Emit event new_message cho TẤT CẢ participants (bao gồm cả sender)
      // Lý do: Frontend cần nhận event để cập nhật UI ngay lập tức (optimistic update)
      const emitPayload = {
        ...populatedMessage,
        conversationId: conversation._id.toString(),
      };

      socketService.emitToUser(participantId, "new_message", emitPayload);
      Logger.info(
        `[SocialChat] 📡 Emitted to user ${participantId}: msgId=${
          emitPayload._id
        }, type=${emitPayload.type}, attachments=${
          emitPayload.content?.attachments?.length || 0
        }`
      );

      // ✅ Push Notification (Dùng Queue thay vì gọi trực tiếp)
      if (participantId !== userId?.toString()) {
        const senderName =
          user?.displayName || user?.username || "Một người bạn";
        // 🔥 Gửi job vào Redis -> Server trả response ngay lập tức
        addNotificationJob("chat-notify", {
          userId: participantId,
          message: displayText || message || "Đã gửi tệp đính kèm",
          conversationId: conversation._id.toString(),
          senderName: senderName,
        });
      }
    }

    Logger.info(
      `[SocialChat] Message sent: ${savedMessage._id} in conversation ${conversationId}`
    );

    return {
      ...populatedMessage,
      conversationId: conversation._id,
    };
  }

  /**
   * ✅ Tạo nhóm chat mới
   */
  async createGroupConversation({
    title,
    description,
    members,
    avatarUrl,
    avatarFile,
    context,
    creatorId,
  }) {
    // Implementation giữ nguyên từ code cũ
    const conversation = await Conversation.create({
      type: "group",
      title,
      description,
      participants: [
        { userId: creatorId, role: "admin", isVisible: true },
        ...members.map((m) => ({ userId: m, role: "member", isVisible: true })),
      ],
      avatarUrl: avatarUrl || null,
      isActive: true,
    });

    // Emit event conversation_created
    const socketService = await this.getSocketService();
    for (const member of members) {
      socketService.emitToUser(
        member.toString(),
        "conversation_created",
        conversation.toObject()
      );
    }

    return conversation;
  }

  /**
   * ✅ Cập nhật nhóm chat (Cũng dùng cho đổi tên - Rename)
   */
  async updateGroupConversation(
    conversationId,
    userId,
    { title, avatarFile, membersToRemove, membersToAdd }
  ) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");

    // Track old participants for comparison
    const oldParticipantIds = conversation.participants
      .map((p) => p.userId?.toString())
      .filter((id) => id);

    // Update title
    if (title) conversation.title = title;

    // Upload avatar logic
    if (avatarFile) {
      // Upload avatar logic (implement if needed)
    }

    // Remove members
    if (membersToRemove && membersToRemove.length > 0) {
      conversation.participants = conversation.participants.filter(
        (p) => !membersToRemove.includes(p.userId?.toString())
      );
      Logger.info(
        `[SocialChat] Removed ${membersToRemove.length} member(s) from group ${conversationId}`
      );
    }

    // Add new members
    if (membersToAdd && membersToAdd.length > 0) {
      const newParticipants = membersToAdd.map((memberId) => ({
        userId: memberId,
        role: "member",
        isVisible: true,
        joinedAt: new Date(),
      }));
      conversation.participants.push(...newParticipants);
      Logger.info(
        `[SocialChat] Added ${membersToAdd.length} new member(s) to group ${conversationId}`
      );
    }

    await conversation.save();

    // Populate conversation for emit
    const populatedConversation = await Conversation.findById(conversationId)
      .populate("participants.userId", "username displayName avatarUrl _id")
      .lean();

    // Get all current participant IDs (including new members)
    const currentParticipantIds = populatedConversation.participants
      .map((p) => p.userId?._id?.toString() || p.userId?.toString())
      .filter((id) => id);

    // Emit event conversation_updated to ALL participants (old + new)
    const socketService = await this.getSocketService();

    // Emit to all current participants
    for (const participantId of currentParticipantIds) {
      socketService.emitToUser(
        participantId,
        "conversation_updated",
        populatedConversation
      );
      Logger.info(
        `[SocialChat] 📡 Emitted conversation_updated to user ${participantId}`
      );
    }

    // Also emit to removed members so they know they're removed
    if (membersToRemove && membersToRemove.length > 0) {
      for (const removedId of membersToRemove) {
        socketService.emitToUser(removedId, "conversation_removed", {
          conversationId: conversationId.toString(),
        });
        Logger.info(
          `[SocialChat] 📡 Emitted conversation_removed to removed user ${removedId}`
        );
      }
    }

    // Create system message for member changes
    if (
      (membersToAdd && membersToAdd.length > 0) ||
      (membersToRemove && membersToRemove.length > 0)
    ) {
      const systemMessageText = [];

      if (membersToAdd && membersToAdd.length > 0) {
        systemMessageText.push(
          `Đã thêm ${membersToAdd.length} thành viên mới vào nhóm`
        );
      }

      if (membersToRemove && membersToRemove.length > 0) {
        systemMessageText.push(
          `Đã xóa ${membersToRemove.length} thành viên khỏi nhóm`
        );
      }

      const systemMessage = await this.chatRepository.createMessage({
        conversationId,
        sender: userId,
        senderType: "System",
        content: { text: systemMessageText.join(". ") },
        type: "system",
        metadata: {
          action: "member_update",
          membersAdded: membersToAdd || [],
          membersRemoved: membersToRemove || [],
        },
      });

      // Emit system message to all current participants
      const populatedSystemMessage = await Message.findById(systemMessage._id)
        .populate("sender", "username displayName avatarUrl _id")
        .lean();

      for (const participantId of currentParticipantIds) {
        socketService.emitToUser(participantId, "new_message", {
          ...populatedSystemMessage,
          conversationId: conversationId.toString(),
        });
      }
    }

    // Invalidate cache for ALL participants (old + new + removed)
    const allAffectedIds = [
      ...new Set([
        ...oldParticipantIds,
        ...currentParticipantIds,
        ...(membersToRemove || []),
      ]),
    ];
    await this.chatRepository.invalidateParticipantsCache(allAffectedIds);

    Logger.info(
      `[SocialChat] ✅ Group ${conversationId} updated successfully. Affected users: ${allAffectedIds.length}`
    );

    return populatedConversation;
  }

  /**
   * ✅ Xóa conversation
   */
  async deleteConversation(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");

    // Soft delete: Set isActive = false
    conversation.isActive = false;
    await conversation.save();

    // Emit event conversation_removed
    const socketService = await this.getSocketService();
    const participants = conversation.participants || [];
    const participantIds = []; // Array để lưu ID cần xóa cache

    for (const participant of participants) {
      const participantId = participant.userId?.toString();
      if (participantId) {
        participantIds.push(participantId);
        socketService.emitToUser(participantId, "conversation_removed", {
          conversationId: conversation._id.toString(),
        });
      }
    }

    // 🔥 FIX 2: Xóa Cache Redis ngay lập tức
    // Nếu không xóa, F5 lại sẽ thấy item hiện về do Cache cũ vẫn còn
    await this.chatRepository.invalidateParticipantsCache(participantIds);

    return conversation;
  }

  /**
   * ✅ Tạo hoặc lấy peer conversation
   */
  async createPeerConversation(userId, otherUserId) {
    let conversation = await Conversation.findOne({
      type: "peer-to-peer",
      "participants.userId": { $all: [userId, otherUserId] },
      isActive: true,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: "peer-to-peer",
        participants: [
          { userId, role: "member", isVisible: true },
          { userId: otherUserId, role: "member", isVisible: true },
        ],
        isActive: true,
      });
    }

    return conversation;
  }

  /**
   * ✅ Tạo hoặc lấy printer conversation
   */
  async createOrGetPrinterConversation(userId, printerId) {
    let conversation = await Conversation.findOne({
      type: "customer-printer",
      "participants.userId": { $all: [userId, printerId] },
      isActive: true,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: "customer-printer",
        participants: [
          { userId, role: "customer", isVisible: true },
          { userId: printerId, role: "printer", isVisible: true },
        ],
        isActive: true,
      });
    }

    return conversation;
  }

  /**
   * ✅ Lấy business context (orders, quotes, etc.)
   */
  async getBusinessContext(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");

    // Lấy orders liên quan
    const orders = await MasterOrder.find({
      customerId: new mongoose.Types.ObjectId(userId),
      masterStatus: {
        $in: [
          MASTER_ORDER_STATUS.PENDING,
          MASTER_ORDER_STATUS.PENDING_PAYMENT,
          MASTER_ORDER_STATUS.PAID_WAITING_FOR_PRINTER,
          MASTER_ORDER_STATUS.PROCESSING,
          MASTER_ORDER_STATUS.SHIPPING,
        ],
      },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      orders,
      conversation: conversation.toObject(),
    };
  }

  /**
   * ✅ Lấy media từ conversation (ảnh, video)
   */
  async getConversationMedia(conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");

    // Lấy tất cả messages có type = "image" hoặc có attachments
    const messages = await Message.find({
      conversationId,
      $or: [
        { type: "image" },
        { "content.attachments": { $exists: true, $ne: [] } },
      ],
    })
      .populate("sender", "displayName username avatarUrl _id")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Extract media từ messages
    const media = [];
    for (const msg of messages) {
      // Nếu có attachments array
      if (msg.content?.attachments && Array.isArray(msg.content.attachments)) {
        for (const att of msg.content.attachments) {
          if (att.type === "image" || att.fileType?.startsWith("image/")) {
            media.push({
              _id: `${msg._id}-${att.url}`,
              messageId: msg._id,
              url: att.url,
              thumbnailUrl: att.url, // Có thể tạo thumbnail sau
              type: "image",
              createdAt: msg.createdAt,
              sender: msg.sender, // Include sender info
            });
          }
        }
      }
      // Legacy: Nếu có fileUrl trực tiếp
      else if (msg.content?.fileUrl && msg.type === "image") {
        media.push({
          _id: msg._id,
          messageId: msg._id,
          url: msg.content.fileUrl,
          thumbnailUrl: msg.content.fileUrl,
          type: "image",
          createdAt: msg.createdAt,
          sender: msg.sender, // Include sender info
        });
      }
    }

    return { media };
  }

  /**
   * ✅ Lấy files từ conversation (documents, PDFs, etc.)
   */
  async getConversationFiles(conversationId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");

    // Lấy tất cả messages có type = "file" hoặc có attachments không phải image
    const messages = await Message.find({
      conversationId,
      $or: [
        { type: "file" },
        { "content.attachments": { $exists: true, $ne: [] } },
      ],
    })
      .populate("sender", "displayName username avatarUrl _id")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Extract files từ messages
    const files = [];
    for (const msg of messages) {
      // Nếu có attachments array
      if (msg.content?.attachments && Array.isArray(msg.content.attachments)) {
        for (const att of msg.content.attachments) {
          if (att.type === "file" || !att.fileType?.startsWith("image/")) {
            files.push({
              _id: `${msg._id}-${att.url}`,
              messageId: msg._id,
              url: att.url,
              name: att.originalName || att.fileName || "file",
              size: att.size || 0,
              type: att.fileType || "application/octet-stream",
              createdAt: msg.createdAt,
              sender: msg.sender, // Include sender info
            });
          }
        }
      }
      // Legacy: Nếu có fileUrl trực tiếp
      else if (msg.content?.fileUrl && msg.type === "file") {
        files.push({
          _id: msg._id,
          messageId: msg._id,
          url: msg.content.fileUrl,
          name: msg.content.fileName || "file",
          size: msg.content.fileSize || 0,
          type: msg.content.fileType || "application/octet-stream",
          createdAt: msg.createdAt,
          sender: msg.sender, // Include sender info
        });
      }
    }

    return { files };
  }

  /**
   * ✅ Tạo quote message
   */
  async createQuoteMessage(conversationId, userId, quoteData) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");

    const message = await this.chatRepository.createMessage({
      conversationId,
      sender: userId,
      senderType: "User",
      content: {
        text: `Quote: ${quoteData.description || "N/A"}`,
        quote: quoteData,
      },
      type: "quote",
      metadata: quoteData,
    });

    // Emit event
    const socketService = await this.getSocketService();
    const participants = conversation.participants || [];
    for (const participant of participants) {
      const participantId = participant.userId?.toString();
      if (participantId !== userId?.toString()) {
        socketService.emitToUser(participantId, "new_message", {
          ...message.toObject(),
          conversationId: conversation._id.toString(),
        });
      }
    }

    return message;
  }

  /**
   * ✅ Xóa message
   */
  async deleteMessage(messageId, userId, deleteForEveryone = false) {
    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundException("Message not found");

    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");

    // Check if user is sender
    const isSender = message.sender?.toString() === userId?.toString();

    if (deleteForEveryone && !isSender) {
      throw new ValidationException(
        "Bạn không có quyền xóa tin nhắn cho mọi người"
      );
    }

    const socketService = await this.getSocketService();
    const participants = conversation.participants || [];

    if (deleteForEveryone) {
      // Delete for everyone - actually delete the message
      await Message.findByIdAndDelete(messageId);

      // ✅ Emit event to ALL participants
      for (const participant of participants) {
        const participantId = participant.userId?.toString();
        socketService.emitToUser(participantId, "message_deleted", {
          messageId: messageId.toString(),
          conversationId: conversation._id.toString(),
          deleteForEveryone: true,
        });
      }

      Logger.info(
        `[SocialChat] Message ${messageId} deleted for everyone by ${userId}`
      );
    } else {
      // Delete for self only - add userId to deletedFor array
      if (!message.deletedFor) {
        message.deletedFor = [];
      }
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }

      // ✅ Emit event to ONLY this user (để update UI của họ)
      socketService.emitToUser(userId.toString(), "message_deleted", {
        messageId: messageId.toString(),
        conversationId: conversation._id.toString(),
        deleteForEveryone: false,
      });

      Logger.info(
        `[SocialChat] Message ${messageId} deleted for user ${userId}`
      );
    }

    return { success: true };
  }

  /**
   * ✅ [NEW PATCH] Tìm và Vô hiệu hóa chat giữa 2 người (Dùng cho Unfriend/Block)
   */
  async disableConversationBetween(userId1, userId2) {
    // Tìm hội thoại peer-to-peer đang active giữa 2 người
    const conversation = await Conversation.findOne({
      type: "peer-to-peer",
      "participants.userId": { $all: [userId1, userId2] },
      isActive: true, // Chỉ tìm cái đang active
    }).select("_id");

    if (conversation) {
      Logger.info(
        `[SocialChat] Disabling conversation ${conversation._id} due to connection break.`
      );
      // Tái sử dụng hàm deleteConversation có sẵn để đảm bảo logic Socket & Cache đồng bộ
      // Truyền userId1 làm người thực hiện hành động
      return await this.deleteConversation(conversation._id, userId1);
    }
    return null;
  }
}
