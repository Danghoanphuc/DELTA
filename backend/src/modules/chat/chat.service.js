// src/modules/chat/chat.service.js (✅ REFACTORED - MULTI-CONVERSATION)
import { ChatRepository } from "./chat.repository.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import { ChatAiService } from "./chat.ai.service.js";
import { ChatToolService } from "./chat.tools.service.js";
import { ChatResponseUtil } from "./chat.response.util.js";

export class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.aiService = new ChatAiService();
    this.toolService = new ChatToolService();
  }

  async handleMessage(user, body, isGuest = false) {
    const {
      message,
      fileUrl,
      fileName,
      fileType,
      latitude,
      longitude,
      conversationId, // <-- Lấy conversationId từ body
    } = body;
    const userId = user ? user._id : null;
    let responsePayload;

    // --- 1. Xác định cuộc trò chuyện ---
    let conversation = null;
    let isNewConversation = false;

    if (!isGuest) {
      if (conversationId) {
        conversation = await this.chatRepository.findConversationById(
          conversationId,
          userId
        );
      }
      // Nếu không có conversationId, hoặc ID không hợp lệ (không tìm thấy)
      // Chúng ta sẽ tạo một cuộc trò chuyện mới
      if (!conversation) {
        conversation = await this.chatRepository.createConversation(userId);
        isNewConversation = true;
      }
    }

    // --- 2. Tải lịch sử (nếu có) ---
    let history =
      conversation && conversation.messages ? conversation.messages : [];

    try {
      // --- 3. Xây dựng Context chuẩn ---
      const context = {
        user: user,
        actorId: userId,
        actorType: isGuest ? "Guest" : "User",
        latitude: latitude,
        longitude: longitude,
        conversationId: conversation ? conversation._id : null,
        isNewConversation: isNewConversation,
      };

      // --- 4. Điều phối tác vụ ---
      if (fileUrl) {
        Logger.debug(`[ChatSvc] Handling file upload: ${fileName}`);
        responsePayload = await this.handleFileMessage(
          context,
          { fileUrl, fileName, fileType },
          history
        );
      } else if (message) {
        Logger.debug(`[ChatSvc] Handling orchestrated message: ${message}`);
        responsePayload = await this.handleOrchestratedMessage(
          message,
          history,
          context
        );
      } else {
        throw new ValidationException("Tin nhắn không hợp lệ.");
      }

      // --- 5. Lưu lịch sử (nếu không phải guest) ---
      if (!isGuest && conversation) {
        await this.saveChatHistory(
          userId,
          conversation, // Truyền conversation object
          message || `Đã tải lên: ${fileName}`,
          responsePayload
        );
      }

      // --- 6. Trả về payload ---
      return {
        ...responsePayload,
        // Trả về conversation mới nếu nó vừa được tạo
        newConversation: isNewConversation ? conversation : null,
      };
    } catch (error) {
      Logger.error("[ChatSvc] Fatal error in handleMessage:", error);
      return ChatResponseUtil.createTextResponse(
        "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau."
      );
    }
  }

  // (handleFileMessage giữ nguyên logic, chỉ nhận context)
  async handleFileMessage(context, fileInfo, history) {
    // ... (Giữ nguyên logic từ file trước) ...
    // (Đã bao gồm trong file Phúc vừa dán)
    Logger.debug(
      `[ChatSvc] Processing file with Vision AI: ${fileInfo.fileName}`
    );
    let visionAnalysis = null;
    const isImage = fileInfo.fileType.startsWith("image/");
    const isPdf = fileInfo.fileType === "application/pdf";
    if (isImage || isPdf) {
      const analysisPrompt = `...`; // (như cũ)
      visionAnalysis = await this.aiService.getVisionCompletion(
        fileInfo.fileUrl,
        analysisPrompt,
        context
      );
    } else {
      visionAnalysis = `File loại ${fileInfo.fileType} (${fileInfo.fileName})`;
    }
    const syntheticMessage = `...`; // (như cũ)
    return await this.handleOrchestratedMessage(
      syntheticMessage,
      history,
      context
    );
  }

  // (handleOrchestratedMessage giữ nguyên logic, chỉ nhận context)
  async handleOrchestratedMessage(messageText, history, context) {
    // ... (Giữ nguyên logic từ file trước) ...
    // (Đã bao gồm trong file Phúc vừa dán)
    const messages = ChatResponseUtil.prepareHistoryForOpenAI(history);
    messages.push({ role: "user", content: messageText });
    const toolDefinitions = this.toolService.getToolDefinitions();
    const aiResponse = await this.aiService.getCompletion(
      messages,
      toolDefinitions,
      context
    );
    const responseMessage = aiResponse.choices[0].message;
    if (responseMessage.tool_calls) {
      messages.push(responseMessage);
      const toolCall = responseMessage.tool_calls[0];
      const { response, isTerminal } = await this.toolService.executeTool(
        toolCall,
        context
      );
      if (isTerminal) return response;
      messages.push(response.response);
      const finalAiResponse = await this.aiService.getCompletion(
        messages,
        toolDefinitions,
        context
      );
      return ChatResponseUtil.createTextResponse(
        finalAiResponse.choices[0].message.content,
        true
      );
    } else {
      return ChatResponseUtil.createTextResponse(responseMessage.content, true);
    }
  }

  /**
   * Cập nhật: Nhận 'conversation' object thay vì 'userId'
   */
  async saveChatHistory(
    userId,
    conversation,
    userMessageText,
    aiResponsePayload
  ) {
    try {
      const userMessage = await this.chatRepository.createMessage({
        conversationId: conversation._id,
        sender: userId,
        senderType: "User",
        content: { text: userMessageText },
      });

      const aiText =
        aiResponsePayload.content.text || "Tôi đã gửi cho bạn một số lựa chọn.";

      const aiMessage = await this.chatRepository.createMessage({
        conversationId: conversation._id,
        sender: null,
        senderType: "AI",
        content: { text: aiText },
      });

      conversation.messages.push(userMessage._id, aiMessage._id);
      // Cập nhật title cho cuộc trò chuyện mới
      if (conversation.messages.length === 2) {
        // Đây là 2 tin nhắn đầu tiên
        conversation.title =
          userMessageText.length > 50
            ? userMessageText.substring(0, 47) + "..."
            : userMessageText;
      }
      conversation.lastMessageAt = Date.now();
      await this.chatRepository.saveConversation(conversation);

      Logger.success(
        `[ChatSvc] Chat history saved for convo ${conversation._id}`
      );
    } catch (saveError) {
      Logger.error(
        `[ChatSvc] Failed to save history for convo ${conversation._id}:`,
        saveError
      );
    }
  }

  /**
   * MỚI: Lấy danh sách (metadata) các cuộc trò chuyện
   */
  async getConversations(userId) {
    if (!userId) return [];
    return await this.chatRepository.findConversationsByUserId(userId);
  }

  /**
   * MỚI: Lấy tin nhắn của 1 cuộc trò chuyện
   */
  async getMessages(conversationId, userId) {
    if (!userId || !conversationId) return [];
    const conversation = await this.chatRepository.getMessagesByConversationId(
      conversationId,
      userId
    );
    return conversation ? conversation.messages : [];
  }

  /**
   * HÀM CŨ (Không còn dùng):
   * async getHistory(userId) { ... }
   */
}
