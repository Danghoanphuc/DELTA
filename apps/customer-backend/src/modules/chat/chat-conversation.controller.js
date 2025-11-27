import { SocialChatService } from "./social-chat.service.js"; // Static
import { ChatRepository } from "./chat.repository.js"; // Static
import { Conversation } from "../../shared/models/conversation.model.js";
import { User } from "../../shared/models/user.model.js";
import { Connection } from "../../shared/models/connection.model.js";
import { ApiResponse } from "../../shared/utils/index.js";

const socialService = new SocialChatService();
const chatRepo = new ChatRepository();

export class ChatConversationController {
  
  createGroupConversation = async (req, res, next) => {
    try {
      const { title, members } = req.body;
      const avatarUrl = req.file?.path; // Multer Cloudinary

      const group = await socialService.createGroupConversation({
        title,
        members: typeof members === 'string' ? JSON.parse(members) : members,
        avatarUrl,
        creatorId: req.user._id
      });

      res.status(201).json(ApiResponse.success({ conversation: group }));
    } catch (e) { next(e); }
  };

  createOrGetPrinterConversation = async (req, res, next) => {
    try {
      const { printerId } = req.params;
      const customerId = req.user._id;

      let conv = await Conversation.findOne({
        type: "customer-printer",
        "participants.userId": { $all: [customerId, printerId] }
      }).populate("participants.userId", "displayName avatarUrl");

      if (!conv) {
        const printer = await User.findById(printerId).populate("printerProfileId");
        if (!printer) throw new Error("Printer not found");
        
        conv = await Conversation.create({
          type: "customer-printer",
          title: printer.printerProfileId?.businessName || "Nhà in",
          participants: [
             { userId: customerId, role: "customer", isVisible: true },
             { userId: printerId, role: "printer", isVisible: true }
          ]
        });
      }

      res.json(ApiResponse.success({ conversation: conv }));
    } catch (e) { next(e); }
  };

  createOrGetPeerConversation = async (req, res, next) => {
    try {
       const { userId: targetId } = req.params;
       // Check connection (friendship)
       const isConnected = await Connection.findOne({
           $or: [
               { requester: req.user._id, recipient: targetId, status: 'accepted' },
               { requester: targetId, recipient: req.user._id, status: 'accepted' }
           ]
       });
       
       if (!isConnected) throw new Error("Chưa kết bạn.");

       let conv = await Conversation.findOne({
           type: "peer-to-peer",
           "participants.userId": { $all: [req.user._id, targetId] }
       });

       if (!conv) {
           conv = await Conversation.create({
               type: "peer-to-peer",
               participants: [
                   { userId: req.user._id, role: "member", isVisible: true },
                   { userId: targetId, role: "member", isVisible: true }
               ]
           });
       } else {
           // Un-hide if hidden
           let needSave = false;
           conv.participants.forEach(p => { 
               if (!p.isVisible) { p.isVisible = true; needSave = true; } 
           });
           if (needSave) await conv.save();
       }

       res.json(ApiResponse.success({ conversation: conv }));
    } catch (e) { next(e); }
  };

  markAllConversationsAsRead = async (req, res, next) => {
     // Logic đánh dấu đã đọc (đơn giản là trả về success để FE update state, 
     // thực tế cần update field lastReadAt trong participants nếu muốn track kỹ)
     res.json(ApiResponse.success({ message: "Marked all read" }));
  };
}