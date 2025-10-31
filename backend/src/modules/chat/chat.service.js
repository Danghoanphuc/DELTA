// src/modules/chat/chat.service.js (🔥 REFACTORED - CLEANED)
import { ChatRepository } from "./chat.repository.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

// Import các service con đã được tách ra
import { ChatAiService } from "./chat.ai.service.js";
import { ChatToolService } from "./chat.tools.service.js";
import { ChatResponseUtil } from "./chat.response.util.js";

export class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();

    // Inject các service con
    this.aiService = new ChatAiService();
    this.toolService = new ChatToolService();
    // ChatResponseUtil là static, không cần 'new'
  }

  /**
   * Hàm "router" chính (Không đổi)
   */
  async handleMessage(userId, body, isGuest = false) {
    const { message, fileUrl, fileName, fileType, latitude, longitude } = body;
    let responsePayload;

    // 1. Tải lịch sử chat
    let history = [];
    if (!isGuest && userId) {
      try {
        const conversation = await this.chatRepository.getHistory(userId);
        if (conversation && conversation.messages) {
          history = conversation.messages;
        }
      } catch (historyError) {
        Logger.error(
          `[ChatSvc] Lỗi khi tải lịch sử cho user ${userId}`,
          historyError
        );
      }
    }

    try {
      if (fileUrl) {
        // --- LUỒNG 1: Xử lý File Upload ---
        Logger.debug(`[ChatSvc] Handling file upload: ${fileName}`);
        responsePayload = await this.handleFileMessage(
          userId,
          { fileUrl, fileName, fileType },
          history
        );
      } else if (message) {
        // --- LUỒNG 2: Xử lý tin nhắn văn bản (DO AI ĐIỀU PHỐI) ---
        Logger.debug(`[ChatSvc] Handling orchestrated message: ${message}`);
        const context = { userId, isGuest, latitude, longitude };
        responsePayload = await this.handleOrchestratedMessage(
          message,
          history,
          context
        );
      } else {
        throw new ValidationException("Tin nhắn không hợp lệ.");
      }

      // 3. Lưu lịch sử chat
      if (!isGuest && userId) {
        await this.saveChatHistory(
          userId,
          message || `Đã tải lên: ${fileName}`,
          responsePayload
        );
      }

      return responsePayload;
    } catch (error) {
      Logger.error("[ChatSvc] Fatal error in handleMessage:", error);
      return ChatResponseUtil.createTextResponse(
        "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau."
      );
    }
  }

  /**
   * Luồng 1: Xử lý tin nhắn có file (Đã cập nhật)
   */
  async handleFileMessage(userId, fileInfo, history) {
    const prompt = `Người dùng vừa tải lên file tên là "${fileInfo.fileName}" (loại: ${fileInfo.fileType}). 
       Hãy hỏi họ muốn làm gì với file này (ví dụ: in file này lên áo, hay in file PDF này).
       File URL (chỉ để tham khảo, không hiện cho user): ${fileInfo.fileUrl}`;

    // Gọi AI Service
    const aiResponseText = await this.aiService.getTextOnlyCompletion(
      prompt,
      history
    );

    const quickReplies = [
      {
        text: "In file này lên áo",
        payload: `in file ${fileInfo.fileName} lên áo`,
      },
      { text: "In file PDF này", payload: `in file PDF ${fileInfo.fileName}` },
      { text: "Không, cảm ơn", payload: "cancel" },
    ];

    return {
      type: "text",
      content: { text: aiResponseText },
      quickReplies: quickReplies,
    };
  }

  /**
   * Luồng 2: Bộ não AI điều phối (Đã cập nhật)
   */
  async handleOrchestratedMessage(messageText, history, context) {
    // 1. Chuẩn bị tin nhắn
    const messages = ChatResponseUtil.prepareHistoryForOpenAI(history);
    messages.push({ role: "user", content: messageText });

    // 2. Lấy định nghĩa tools
    const toolDefinitions = this.toolService.getToolDefinitions();

    // 3. Gọi AI (Lần 1)
    const aiResponse = await this.aiService.getCompletion(
      messages,
      toolDefinitions
    );
    const responseMessage = aiResponse.choices[0].message;

    // 4. KIỂM TRA NẾU AI MUỐN DÙNG CÔNG CỤ
    if (responseMessage.tool_calls) {
      messages.push(responseMessage); // Thêm yêu cầu của AI vào ngữ cảnh

      // 5. Thực thi công cụ (chỉ xử lý 1 tool call đầu tiên cho đơn giản)
      const toolCall = responseMessage.tool_calls[0];
      const { response, isTerminal } = await this.toolService.executeTool(
        toolCall,
        context
      );

      // Nếu tool là "terminal" (như find_products), trả về ngay
      if (isTerminal) {
        return response;
      }

      // 6. Nếu tool là "RAG" (như find_printers), gọi lại AI
      messages.push(response.response); // Thêm kết quả của tool vào ngữ cảnh

      const finalAiResponse = await this.aiService.getCompletion(
        messages,
        toolDefinitions
      );
      return ChatResponseUtil.createTextResponse(
        finalAiResponse.choices[0].message.content,
        true // Thêm quick replies mặc định
      );
    } else {
      // 7. AI TRẢ LỜI THẲNG
      return ChatResponseUtil.createTextResponse(
        responseMessage.content,
        true // Thêm quick replies mặc định
      );
    }
  }

  /**
   * Quản lý lịch sử (Không đổi)
   */
  async saveChatHistory(userId, userMessageText, aiResponsePayload) {
    try {
      const conversation = await this.chatRepository.findOrCreateConversation(
        userId
      );

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
      conversation.lastMessageAt = Date.now();
      await this.chatRepository.saveConversation(conversation);

      Logger.success(`[ChatSvc] Chat history saved for user ${userId}`);
    } catch (saveError) {
      Logger.error(
        `[ChatSvc] Failed to save history for user ${userId}:`,
        saveError
      );
    }
  }

  /**
   * Quản lý lịch sử (Không đổi)
   */
  async getHistory(userId) {
    if (!userId) return [];
    const conversation = await this.chatRepository.getHistory(userId);
    return conversation ? conversation.messages : [];
  }
}
