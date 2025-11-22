// apps/customer-backend/src/modules/chat/chat-conversation.controller.js
import { SocialChatService } from "./social-chat.service.js";
import { ChatRepository } from "./chat.repository.js";
import { User } from "../../shared/models/user.model.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { Connection } from "../../shared/models/connection.model.js";
import {
  NotFoundException,
  ValidationException,
} from "../../shared/exceptions/index.js";

export class ChatConversationController {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.socialChatService = new SocialChatService();
  }

  createGroupConversation = async (req, res, next) => {
    try {
      const currentUserId = req.user._id;
      const { title, members } = req.body;

      if (!members || !Array.isArray(members) || members.length === 0) {
        throw new ValidationException("Danh sách thành viên không hợp lệ");
      }
      
      if (!title || title.trim().length === 0) {
        throw new ValidationException("Tên nhóm không được để trống");
      }

      const group = await this.socialChatService.createGroupConversation(
        currentUserId,
        title,
        members
      );

      res.status(201).json({
        success: true,
        message: "Đã tạo nhóm thành công",
        data: { conversation: group },
      });
    } catch (error) {
      next(error);
    }
  };

  createOrGetPrinterConversation = async (req, res, next) => {
    try {
      const customerId = req.user._id;
      const { printerId } = req.params;

      if (!printerId || printerId === customerId.toString()) {
        throw new ValidationException("Printer ID không hợp lệ");
      }

      const printer = await User.findById(printerId).populate(
        "printerProfileId"
      );
      if (!printer || !printer.printerProfileId) {
        throw new NotFoundException("Không tìm thấy nhà in");
      }

      let conversation = await Conversation.findOne({
        type: "customer-printer",
        "participants.userId": { $all: [customerId, printerId] },
      }).populate("participants.userId", "username displayName avatarUrl");

      if (conversation) {
        return res.json({
          success: true,
          data: { conversation, isNew: false },
        });
      }

      conversation = await Conversation.create({
        type: "customer-printer",
        title: `Chat với ${printer.printerProfileId.businessName}`,
        participants: [
          { userId: customerId, role: "customer", isVisible: true },
          { userId: printerId, role: "printer", isVisible: true },
        ],
      });

      await conversation.populate(
        "participants.userId",
        "username displayName avatarUrl"
      );

      res.status(201).json({
        success: true,
        message: "Đã tạo cuộc trò chuyện với nhà in",
        data: { conversation, isNew: true },
      });
    } catch (error) {
      next(error);
    }
  };

  createOrGetPeerConversation = async (req, res, next) => {
    try {
      const currentUserId = req.user._id;
      const { userId: targetUserId } = req.params;

      if (!targetUserId || targetUserId === currentUserId.toString()) {
        throw new ValidationException("User ID không hợp lệ");
      }

      const areConnected = await Connection.areConnected(
        currentUserId,
        targetUserId
      );
      if (!areConnected) {
        throw new ValidationException("Bạn phải kết bạn trước khi có thể chat");
      }

      const result = await this.socialChatService.createPeerConversation(
        currentUserId,
        targetUserId
      );

      res.status(result.isNew ? 201 : 200).json({
        success: true,
        message: result.isNew
          ? "Đã tạo cuộc trò chuyện"
          : "Đã mở cuộc trò chuyện",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllConversations = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { type } = req.query;
      
      // ✅ FIXED: Chỉ lấy những cuộc trò chuyện mà user chưa xóa (isVisible: true)
      const query = { 
        "participants": { $elemMatch: { userId: userId, isVisible: true } },
        isActive: true 
      };
      
      if (type) query.type = type;

      const conversations = await Conversation.find(query)
        .populate("participants.userId", "username displayName avatarUrl")
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .lean();

      res.json({
        success: true,
        data: { conversations, count: conversations.length },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✅ FIXED: Chỉ ẩn cuộc trò chuyện với user hiện tại (Soft Delete)
   */
  deleteConversation = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id: conversationId } = req.params;

      const conversation = await Conversation.findOne({
        _id: conversationId,
        "participants.userId": userId,
      });

      if (!conversation)
        throw new NotFoundException("Không tìm thấy cuộc trò chuyện");

      // ✅ FIX: Chỉ set isVisible = false cho user này, KHÔNG set isActive=false
      await Conversation.updateOne(
        { _id: conversationId, "participants.userId": userId },
        { 
          $set: { "participants.$.isVisible": false } 
        }
      );

      res.json({ success: true, message: "Đã xóa cuộc trò chuyện" });
    } catch (error) {
      next(error);
    }
  };

  markAllConversationsAsRead = async (req, res, next) => {
    try {
      const userId = req.user._id;

      const conversations = await Conversation.find({
        "participants.userId": userId,
        type: { $in: ["peer-to-peer", "customer-printer", "group"] },
        isActive: true,
      }).select("_id");

      const conversationIds = conversations.map((c) => c._id);

      res.json({
        success: true,
        message: "Đã đánh dấu tất cả là đã đọc",
        data: { conversationIds },
      });
    } catch (error) {
      next(error);
    }
  };
}