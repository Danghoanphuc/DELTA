// apps/customer-backend/src/modules/chat/social-chat.service.js
// ✅ FIXED: Auto send "System Message" & Socket trigger on Group Create/Update/Delete
// ✅ REFACTORED: Realtime synchronization logic added

import mongoose from "mongoose";
import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { MasterOrder } from "../../shared/models/master-order.model.js";
import { Logger } from "../../shared/utils/index.js";
import { socketService } from "../../infrastructure/realtime/socket.service.js";
import { ChatRepository } from "./chat.repository.js";
import { cloudinary } from "../../infrastructure/storage/multer.config.js";
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import { MASTER_ORDER_STATUS } from "@printz/types";

export class SocialChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
  }
  
  /**
   * ✅ REFACTORED: Tạo nhóm chat
   * ⚡ FIX: Xử lý cả avatarUrl (string URL) và avatarFile (object cần upload)
   */
  async createGroupConversation({ title, description, members, avatarUrl, avatarFile, context, creatorId }) {
    // 1. Validate
    if (!members || !Array.isArray(members) || members.length === 0) {
      throw new ValidationException("Nhóm phải có ít nhất 1 thành viên khác.");
    }

    // 2. ⚡ FIX: Xử lý Avatar - Ưu tiên avatarUrl (đã là URL từ multer-storage-cloudinary)
    // Nếu có avatarUrl (string) -> dùng trực tiếp
    // Nếu có avatarFile (object) -> upload lên Cloudinary
    let finalAvatarUrl = null;
    if (avatarUrl) {
      // avatarUrl đã là URL từ multer-storage-cloudinary (req.file.path)
      finalAvatarUrl = avatarUrl;
      Logger.info("[GroupCreate] Using provided avatarUrl:", avatarUrl);
    } else if (avatarFile) {
      try {
        if (avatarFile.path && avatarFile.path.startsWith("http")) {
          // Path đã là URL từ multer-storage-cloudinary
          finalAvatarUrl = avatarFile.path;
          Logger.info("[GroupCreate] Using avatarFile.path as URL:", avatarFile.path);
        } else {
          // Upload file lên Cloudinary
          const result = await cloudinary.uploader.upload(avatarFile.path, {
            folder: "printz/groups",
            transformation: [{ width: 300, height: 300, crop: "fill" }],
          });
          finalAvatarUrl = result.secure_url;
          Logger.info("[GroupCreate] Uploaded avatar to Cloudinary:", result.secure_url);
        }
      } catch (error) {
        Logger.error("Upload group avatar failed:", error);
      }
    }

    // 3. Chuẩn bị danh sách participants
    const participantList = [
      { userId: creatorId, role: "admin", isVisible: true, joinedAt: new Date() },
    ];

    const uniqueMembers = [...new Set(members)].filter(
      (id) => id.toString() !== creatorId.toString()
    );
    uniqueMembers.forEach((memberId) => {
      participantList.push({ userId: memberId, role: "member", isVisible: true, joinedAt: new Date() });
    });

    // 4. Tạo Conversation
    const newGroup = new Conversation({
      type: "group",
      title: title || "Nhóm mới",
      description: description || "",
      avatarUrl: finalAvatarUrl,
      participants: participantList,
      creatorId,
      context: context || { referenceType: "NONE" },
      lastMessageAt: new Date(),
      isActive: true,
    });

    await newGroup.save();

    // 5. Tạo tin nhắn hệ thống
    const systemMsg = new Message({
      conversationId: newGroup._id,
      sender: null,
      senderType: "AI",
      content: { text: `Đã tạo nhóm "${newGroup.title}"` },
      type: "system",
    });
    await systemMsg.save();

    // 6. Populate
    await newGroup.populate("participants.userId", "username displayName avatarUrl isOnline"); // ✅ THÊM isOnline

    // 7. ✅ Bắn Socket & Notification
    const allMembers = [creatorId, ...uniqueMembers];
    
    // Clear Redis Cache
    await this.chatRepository.invalidateParticipantsCache(allMembers);

    allMembers.forEach((memberId) => {
      const mIdStr = memberId.toString();
      
      // Emit tin nhắn mới để list chat nhảy lên đầu
      socketService.emitToUser(mIdStr, "new_message", {
        ...systemMsg.toObject(),
        conversationId: newGroup._id,
      });

      // Notification cho người được thêm
      if (mIdStr !== creatorId.toString()) {
        socketService.emitToUser(mIdStr, "notification", {
          userId: mIdStr,
          type: "message",
          title: "Bạn được thêm vào nhóm mới",
          message: `${title}`,
          data: { conversationId: newGroup._id },
        });
      }
    });

    return newGroup;
  }

  /**
   * ✅ REFACTORED: Cập nhật nhóm chat + REALTIME UPDATE
   * ⚡ FIX: Dùng trực tiếp URL từ kết quả upload multer-storage-cloudinary, không tự chế URL
   */
  async updateGroupConversation(conversationId, userId, { title, avatarFile, membersToRemove, membersToAdd }) {
    // 1. Tìm nhóm
    const conversation = await Conversation.findOne({
      _id: conversationId,
      type: "group",
      "participants.userId": userId,
    });

    if (!conversation) throw new NotFoundException("Không tìm thấy nhóm");

    // 2. Upload Avatar
    if (avatarFile) {
      try {
        Logger.info("[GroupUpdate] Uploading new avatar...");
        
        // Nếu avatarFile.path đã là URL (do multer-storage-cloudinary xử lý), dùng luôn!
        if (avatarFile.path && avatarFile.path.startsWith("http")) {
          conversation.avatarUrl = avatarFile.path;
          Logger.info("[GroupUpdate] Using existing Cloudinary URL from Multer:", avatarFile.path);
        } else {
          // Nếu là file local, upload lên Cloudinary
          const result = await cloudinary.uploader.upload(avatarFile.path, {
            folder: "printz/groups",
            transformation: [{ width: 300, height: 300, crop: "fill" }],
            resource_type: "image"
          });
          conversation.avatarUrl = result.secure_url;
          Logger.info("[GroupUpdate] Uploaded avatar to Cloudinary:", result.secure_url);
        }
      } catch (err) {
        Logger.error("[GroupUpdate] Upload avatar failed:", err);
      }
    }

    // 3. Update Title
    if (title) conversation.title = title;

    // 4. Xử lý XÓA thành viên
    let removedIds = [];
    if (membersToRemove && membersToRemove.length > 0) {
      removedIds = membersToRemove.map((id) => id.toString());
      conversation.participants = conversation.participants.filter(
        (p) => !removedIds.includes(p.userId.toString())
      );
    }

    // 5. Xử lý THÊM thành viên
    let addedIds = [];
    if (membersToAdd && membersToAdd.length > 0) {
      const currentMemberIds = conversation.participants.map((p) => p.userId.toString());
      addedIds = membersToAdd
        .map((id) => id.toString())
        .filter((idStr) => !currentMemberIds.includes(idStr));

      addedIds.forEach((newIdStr) => {
        conversation.participants.push({
          userId: new mongoose.Types.ObjectId(newIdStr),
          role: "member",
          isVisible: true,
          joinedAt: new Date(),
        });
      });
    }

    // Tạo tin nhắn hệ thống báo thay đổi (Optional nhưng tốt cho UX)
    if (addedIds.length > 0 || removedIds.length > 0 || title) {
        let msgText = "Đã cập nhật thông tin nhóm.";
        if (addedIds.length > 0) msgText = "Đã thêm thành viên mới.";
        
        const sysMsg = await Message.create({
            conversationId: conversation._id,
            sender: null,
            senderType: "AI",
            content: { text: msgText },
            type: "system"
        });
        conversation.lastMessageAt = new Date(); // Bump lên đầu
    }

    await conversation.save();

    // 6. ✅ REALTIME SYNC: Populate & Emit Events
    await conversation.populate("participants.userId", "username displayName avatarUrl isOnline"); // ✅ THÊM isOnline

    // Lấy danh sách ID của các thành viên hiện tại
    const currentParticipantIds = conversation.participants.map(p => p.userId._id.toString());
    
    // Gộp cả người bị xóa để xóa cache cho họ
    const allAffectedIds = [...currentParticipantIds, ...removedIds];
    
    // 6.1 Xóa Cache Redis
    await this.chatRepository.invalidateParticipantsCache(allAffectedIds);

    // 6.2 Bắn Socket "conversation_updated" cho thành viên hiện tại
    // Frontend nghe event này -> Update lại item trong list chat ngay lập tức
    currentParticipantIds.forEach(pId => {
        socketService.emitToUser(pId, "conversation_updated", conversation);
    });

    // 6.3 Bắn Socket "conversation_removed" cho người bị xóa (nếu có)
    removedIds.forEach(rId => {
        socketService.emitToUser(rId, "conversation_removed", { conversationId });
    });

    return conversation;
  }

  /**
   * ✅ REFACTORED: Soft delete + REALTIME REMOVE
   * ⚡ FIX: Dùng $[] để update TẤT CẢ participants, không chỉ phần tử đầu tiên
   */
  async deleteConversation(conversationId, userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Tìm conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userObjectId,
    });

    if (!conversation) {
      throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
    }

    // 2. ⚡ FIX CRITICAL: Soft Delete - Dùng $[] để update TẤT CẢ participants có userId match
    // Thay vì $ chỉ match phần tử đầu tiên
    await Conversation.updateOne(
      { _id: conversationId },
      {
        $set: { "participants.$[elem].isVisible": false },
      },
      {
        arrayFilters: [{ "elem.userId": userObjectId }],
      }
    );

    // 3. ✅ REDIS & REALTIME
    await this.chatRepository.invalidateUserCache(userId);

    // Bắn event ngay lập tức cho chính user đó để FE xóa khỏi list
    socketService.emitToUser(userId.toString(), "conversation_removed", { conversationId });

    Logger.info(`[SocialChatSvc] Soft deleted conversation ${conversationId} for user ${userId}`);
  }

  // ... (createPeerConversation giữ nguyên) ...
  async createPeerConversation(userId1, userId2, session = null) {
    try {
      let conversation = await Conversation.findOne({
        type: "peer-to-peer",
        "participants.userId": { $all: [userId1, userId2] },
      }).session(session);

      if (conversation) {
        let needSave = false;
        conversation.participants.forEach(p => {
            if (!p.isVisible) { p.isVisible = true; needSave = true; }
        });
        if (needSave) await conversation.save({ session });

        if (!session) {
          await conversation.populate("participants.userId", "username displayName avatarUrl isOnline"); // ✅ THÊM isOnline
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

  // ... (handleSocialMessage giữ nguyên) ...
  async handleSocialMessage(user, body) {
    const { message, fileUrl, conversationId, type, metadata, attachments } = body; // ✅ Lấy attachments từ body

    const conversation = await Conversation.findById(conversationId).populate(
      "participants.userId",
      "_id username displayName avatarUrl isOnline" // ✅ THÊM isOnline
    );

    if (!conversation) throw new Error("Cuộc trò chuyện không tồn tại");

    const isParticipant = conversation.participants.some((p) => {
      const uId = p.userId?._id || p.userId;
      return uId.toString() === user._id.toString();
    });

    if (!isParticipant) throw new Error("Bạn không có quyền gửi tin nhắn");

    // ✅ DEAL CLOSER: Xác định message type dựa trên attachments
    let messageType = type || "text";
    if (attachments && attachments.length > 0) {
      // Nếu có cả text và attachments -> file, nếu chỉ có attachments -> file/image
      messageType = message && message.trim() ? "file" : "file";
      // Kiểm tra nếu tất cả attachments đều là image
      const allImages = attachments.every(
        (att) => att.type === "image" || (att.url && att.url.match(/\.(jpeg|jpg|gif|png|webp)$/i))
      );
      if (allImages && attachments.length > 0) {
        messageType = "image";
      }
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: user._id,
      senderType: "User",
      content: {
        text: message || "",
        fileUrl: fileUrl,
        attachments: attachments || [], // ✅ LƯU VÀO DB
      },
      type: messageType,
      metadata: metadata,
    });

    // ✅ FIX: Tạo nội dung xem trước (Preview)
    let previewText = "Đã gửi tin nhắn";
    if (type === 'text' && message) {
      // Cắt ngắn nếu tin nhắn quá dài
      previewText = message.length > 50 ? message.substring(0, 50) + '...' : message;
    } else if (type === 'image') {
      previewText = "📷 Đã gửi một ảnh";
    } else if (type === 'file') {
      previewText = "📎 Đã gửi một tệp đính kèm";
    }

    await Conversation.updateOne(
      { _id: conversation._id },
      { 
        $set: { 
          lastMessageAt: new Date(),
          lastMessagePreview: previewText, // ✅ Lưu nội dung tin nhắn
          "participants.$[].isVisible": true 
        } 
      }
    ).exec();

    const participantIds = conversation.participants.map(p => {
      const uId = p.userId?._id || p.userId;
      return uId;
    });
    
    // Invalidate Cache
    await this.chatRepository.invalidateParticipantsCache(participantIds);

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

          // Notification
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

  /**
   * ✅ DEAL CLOSER: Lấy Business Context cho conversation
   * Trả về activeOrders và designFiles để hỗ trợ bán hàng
   */
  async getBusinessContext(conversationId, userId) {
    // 1. Kiểm tra quyền truy cập conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });

    if (!conversation) {
      throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
    }

    // 2. Xác định customerId: Lấy từ otherParticipant hoặc dùng userId nếu là group
    const otherParticipant = conversation.participants.find(
      (p) => p.userId.toString() !== userId.toString()
    );
    const customerId = otherParticipant
      ? otherParticipant.userId
      : userId;

    // 3. Lấy activeOrders (pending/processing) - Limit 5
    const activeOrders = await MasterOrder.find({
      customerId: new mongoose.Types.ObjectId(customerId),
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
      .select("orderNumber masterStatus totalAmount printerOrders.items")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Format activeOrders
    const formattedOrders = activeOrders.map((order) => ({
      orderNumber: order.orderNumber,
      status: order.masterStatus,
      totalAmount: order.totalAmount,
      items: (order.printerOrders || []).flatMap((po) =>
        (po.items || []).map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.unitPrice,
        }))
      ),
    }));

    // 4. Lấy designFiles từ messages (PDF, AI, PSD, CDR, ZIP, RAR)
    // Exclude JPG, PNG unless marked as 'final'
    const designFileExtensions = /\.(pdf|ai|psd|cdr|zip|rar)$/i;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

    const allFiles = await Message.find({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      type: "file",
      "content.fileUrl": { $exists: true, $ne: null },
    })
      .select("_id content.fileUrl content.fileName content.fileType metadata createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const designFiles = allFiles
      .filter((msg) => {
        const fileName = msg.content?.fileName || "";
        const fileUrl = msg.content?.fileUrl || "";
        const fileType = msg.content?.fileType || "";
        const isFinal = msg.metadata?.isFinal === true || msg.metadata?.tag === "final";

        // Include design formats
        if (designFileExtensions.test(fileName) || designFileExtensions.test(fileUrl)) {
          return true;
        }

        // Include images only if marked as final
        if (imageExtensions.test(fileName) || imageExtensions.test(fileUrl)) {
          return isFinal;
        }

        // Check MIME type for design formats
        const designMimeTypes = [
          "application/pdf",
          "application/postscript",
          "application/illustrator",
          "application/x-photoshop",
          "application/x-coreldraw",
          "application/zip",
          "application/x-rar-compressed",
        ];
        if (designMimeTypes.some((mime) => fileType.toLowerCase().includes(mime.split("/")[1]))) {
          return true;
        }

        return false;
      })
      .map((msg) => ({
        _id: msg._id,
        fileName: msg.content?.fileName || "Unknown",
        fileUrl: msg.content?.fileUrl,
        fileType: msg.content?.fileType,
        createdAt: msg.createdAt,
      }));

    return {
      activeOrders: formattedOrders,
      designFiles,
    };
  }

  /**
   * ✅ DEAL CLOSER: Tạo Quick Quote message
   */
  async createQuoteMessage(conversationId, userId, quoteData) {
    const { items, total, note } = quoteData;

    // Validate
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationException("Items không được để trống");
    }

    if (!total || typeof total !== "number" || total <= 0) {
      throw new ValidationException("Total phải là số dương");
    }

    // Validate items structure
    for (const item of items) {
      if (!item.name || !item.quantity || !item.price) {
        throw new ValidationException("Mỗi item phải có name, quantity, price");
      }
    }

    // 1. Kiểm tra quyền truy cập conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });

    if (!conversation) {
      throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
    }

    // 2. Tạo message với type='quote'
    const quoteMessage = new Message({
      conversationId: conversation._id,
      sender: userId,
      senderType: "User",
      type: "quote",
      content: {
        text: note || `Báo giá: ${items.length} sản phẩm - Tổng: ${total.toLocaleString("vi-VN")}đ`,
      },
      metadata: {
        items,
        total,
        note: note || null,
        createdAt: new Date(),
      },
    });

    await quoteMessage.save();

    // 3. Cập nhật lastMessageAt của conversation
    await Conversation.updateOne(
      { _id: conversation._id },
      {
        $set: {
          lastMessageAt: new Date(),
          lastMessagePreview: `💰 Báo giá: ${total.toLocaleString("vi-VN")}đ`,
        },
      }
    );

    // 4. Invalidate cache
    const participantIds = conversation.participants.map((p) => p.userId);
    await this.chatRepository.invalidateParticipantsCache(participantIds);

    // 5. Notify recipients
    this.notifyRecipient(conversation, quoteMessage, { _id: userId }).catch((err) =>
      Logger.error("[SocialChatSvc] Notify quote failed:", err)
    );

    return quoteMessage;
  }
}