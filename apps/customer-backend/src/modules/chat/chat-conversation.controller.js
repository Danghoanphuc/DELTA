import { SocialChatService } from "./social-chat.service.js"; // ✅ Dùng Social Service
import { ChatRepository } from "./chat.repository.js";
import { User } from "../../shared/models/user.model.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { Connection } from "../../shared/models/connection.model.js";
import { Logger } from "../../shared/utils/index.js";
import {
  NotFoundException,
  ValidationException,
} from "../../shared/exceptions/index.js";

export class ChatConversationController {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.socialChatService = new SocialChatService(); // ✅ Init
  }

  /**
   * POST /api/chat/conversations/printer/:printerId
   */
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
          { userId: customerId, role: "customer" },
          { userId: printerId, role: "printer" },
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

  /**
   * POST /api/chat/conversations/peer/:userId
   * ✅ REFACTOR: Gọi qua SocialChatService
   */
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

      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        throw new NotFoundException("Không tìm thấy người dùng");
      }

      // ✅ Gọi Social Service
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

  /**
   * GET /api/chat/conversations
   */
  getAllConversations = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { type } = req.query;
      const query = { "participants.userId": userId, isActive: true };
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
   * DELETE /api/chat/conversations/:id
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

      conversation.isActive = false;
      await conversation.save();

      res.json({ success: true, message: "Đã xóa cuộc trò chuyện" });
    } catch (error) {
      next(error);
    }
  };
}
