// src/modules/chat/chat.service.js
// ✅ BÀN GIAO: Cập nhật Service để dùng hàm Phân trang

import { ChatRepository } from "./chat.repository.js";
import {
  ValidationException,
  NotFoundException, // ✅ Import NotFoundException
} from "../../shared/exceptions/index.js";
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
    // ✅ LƯU Ý: Đây là một bước TRUNG GIAN.
    // Logic handleMessage VẪN TẢI LỊCH SỬ CŨ (nếu có).
    // Chỉ có API 'getMessages' (lấy lịch sử) là được phân trang.
    // Bước tối ưu tiếp theo là cache lịch sử này (ví dụ: Redis)
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

  /**
   * ✅ ĐÍCH 1: ĐÃ LẮP RUỘT (LOGIC TỪ BÁO CÁO STRATEGIC_OPTIMIZATION_REPORT.MD)
   * Đây là logic "Aggressive" Mục Tiêu 1: Tăng Conversion Rate.
   */
  async handleFileMessage(context, fileInfo, history) {
    Logger.debug(
      `[ChatSvc] Processing file with Vision AI: ${fileInfo.fileName}`
    );
    let visionAnalysis = null;

    // BƯỚC 1: Phân tích file bằng Vision AI (nếu là ảnh/pdf)
    const isImage = fileInfo.fileType.startsWith("image/");
    const isPdf = fileInfo.fileType === "application/pdf";

    if (isImage || isPdf) {
      try {
        const analysisPrompt = `Phân tích thiết kế này dưới góc độ in ấn:
        1.  Đây là gì? (ví dụ: logo, ảnh, poster)
        2.  Mô tả ngắn (màu sắc, phong cách)
        3.  Chất lượng file? (cao/trung bình/thấp)
        4.  Gợi ý sản phẩm phù hợp để in? (ví dụ: áo thun, card visit, nón)`;
        visionAnalysis = await this.aiService.getVisionCompletion(
          fileInfo.fileUrl,
          analysisPrompt,
          context
        );
      } catch (visionError) {
        Logger.warn(
          "[ChatSvc] Vision AI analysis failed:",
          visionError.message
        );
        visionAnalysis = "Không thể phân tích file (Vision Error)";
      }
    } else {
      visionAnalysis = `File loại ${fileInfo.fileType} (${fileInfo.fileName})`;
    }

    // BƯỚC 2: Tạo "Synthetic Message" để kích hoạt AI Orchestrator
    // Đây chính là "mồi" để AI tự động dùng tool
    const syntheticMessage = `
      [NGỮ CẢNH NỘI BỘ TỪ HỆ THỐNG]
      User vừa tải lên một file.
      - Tên file: ${fileInfo.fileName}
      - Phân tích Vision AI: "${visionAnalysis || "Không có"}"

      NHIỆM VỤ CỦA BẠN (AI):
      1.  **Xác nhận:** Chào và xác nhận đã nhận được file ("Tôi thấy file logo của anh...").
      2.  **Hành động (Quan trọng):** Dựa vào phân tích Vision, hãy ngay lập tức gọi tool 'find_products' để tìm 3-5 sản phẩm phù hợp nhất để in ấn.
      3.  **Chào hàng:** Nếu tìm thấy sản phẩm, hãy CHÀO HÀNG NGAY LẬP TỨC.
          - Ví dụ: "Tôi thấy đây là logo đẹp! Anh có muốn in lên 100 áo thun cotton không? Giá chỉ từ 80k/cái, tôi có ưu đãi hôm nay..."
          - Nếu không tìm thấy, hãy hỏi user muốn làm gì.
      [HẾT NGỮ CẢNH NỘI BỘ]
    `;

    // BƯỚC 3: Gọi Orchestrator (AI tự động dùng tools)
    return await this.handleOrchestratedMessage(
      syntheticMessage,
      history,
      context
    );
  }

  /**
   * ✅ ĐÍCH 1: ĐÃ LẮP RUỘT (LOGIC ORCHESTRATOR)
   * Đây là luồng xử lý AI-Tool-AI chuẩn.
   */
  async handleOrchestratedMessage(messageText, history, context) {
    Logger.debug(`[ChatOrchestrator] Starting...`);

    // BƯỚC 1: Chuẩn bị tin nhắn và gọi AI
    const messages = ChatResponseUtil.prepareHistoryForOpenAI(history);
    messages.push({ role: "user", content: messageText });
    const toolDefinitions = this.toolService.getToolDefinitions();

    const aiResponse = await this.aiService.getCompletion(
      messages,
      toolDefinitions,
      context
    );

    const responseMessage = aiResponse.choices[0].message;

    // BƯỚC 2: Kiểm tra xem AI có muốn dùng TOOL không
    if (responseMessage.tool_calls) {
      Logger.debug(
        `[ChatOrchestrator] AI requested tool: ${responseMessage.tool_calls[0].function.name}`
      );
      messages.push(responseMessage); // Thêm lời gọi tool vào lịch sử

      // (Hiện chỉ hỗ trợ 1 tool call mỗi lượt, sẽ nâng cấp multi-turn sau)
      const toolCall = responseMessage.tool_calls[0];

      // BƯỚC 3: Thực thi Tool
      const { response, isTerminal } = await this.toolService.executeTool(
        toolCall,
        context
      );

      // Nếu tool là "terminal" (ví dụ: reorder_from_template), nó sẽ trả về payload cuối cùng
      if (isTerminal) {
        Logger.debug(`[ChatOrchestrator] Tool is terminal. Ending flow.`);
        return response;
      }

      // BƯỚC 4: Gọi AI lần 2 (với kết quả từ Tool)
      // Tool không terminal (như find_products), AI cần tóm tắt kết quả
      messages.push(response.response); // Thêm kết quả tool (dạng 'function' role)

      const finalAiResponse = await this.aiService.getCompletion(
        messages,
        toolDefinitions,
        context
      );

      Logger.debug(`[ChatOrchestrator] AI summarized tool results.`);
      return ChatResponseUtil.createTextResponse(
        finalAiResponse.choices[0].message.content,
        true
      );
    } else {
      // BƯỚC 2 (Fallback): AI trả lời thẳng (không dùng tool)
      Logger.debug(`[ChatOrchestrator] AI responded directly.`);
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

  // ============================================
  // ✅ THAY ĐỔI LOGIC LẤY TIN NHẮN
  // ============================================
  /**
   * MỚI: Lấy tin nhắn của 1 cuộc trò chuyện (có phân trang)
   * @param {string} conversationId
   * @param {string} userId
   * @param {object} query - Chứa { page, limit }
   */
  async getMessages(conversationId, userId, query) {
    if (!userId || !conversationId) {
      return { messages: [], totalPages: 0 };
    }

    // 1. Kiểm tra quyền sở hữu conversation (dùng hàm metadata mới)
    const conversation = await this.chatRepository.getConversationMetadata(
      conversationId,
      userId
    );

    if (!conversation) {
      throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
    }

    // 2. Lấy tin nhắn phân trang
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "30", 10);

    const messagesData = await this.chatRepository.getPaginatedMessages(
      conversationId,
      page,
      limit
    );

    return messagesData;
  }
}
