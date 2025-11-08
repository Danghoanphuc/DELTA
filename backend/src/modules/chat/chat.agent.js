// src/modules/chat/chat.agent.js (UNCHANGED FROM PREVIOUS)
import { ChatAiService } from "./chat.ai.service.js";
import { ChatToolService } from "./chat.tools.service.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

export class ChatAgent {
  constructor() {
    this.aiService = new ChatAiService();
    this.toolService = new ChatToolService();
  }

  async run(context, history, body) {
    const { message, fileUrl, fileName, fileType } = body;
    const route = this._route(message, fileUrl);

    switch (route.name) {
      case "HANDLE_FILE":
        Logger.debug(`[ChatAgent] Routing to: HANDLE_FILE (${fileName})`);
        return this._handleFileAnalysis(context, history, {
          fileUrl,
          fileName,
          fileType,
        });

      case "HANDLE_ORCHESTRATION":
        Logger.debug(`[ChatAgent] Routing to: HANDLE_ORCHESTRATION`);
        return this._handleOrchestration(context, history, message);

      case "INVALID_INPUT":
      default:
        Logger.warn(`[ChatAgent] Routing to: INVALID_INPUT`);
        throw new ValidationException("Tin nhắn không hợp lệ.");
    }
  }

  _route(message, fileUrl) {
    if (fileUrl) {
      return { name: "HANDLE_FILE" };
    }
    if (message) {
      return { name: "HANDLE_ORCHESTRATION" };
    }
    return { name: "INVALID_INPUT" };
  }

  async _handleFileAnalysis(context, history, fileInfo) {
    let analysisResult;
    const { fileUrl, fileName, fileType } = fileInfo;
    const isImage = fileType.startsWith("image/");
    const isPdf = fileType === "application/pdf";

    if (isImage || isPdf) {
      const analysisPrompt = `
      Nhiệm vụ: Phân tích file (${fileName}) và xác định (1) Nội dung file (ví dụ: logo, thiết kế card visit, ảnh chụp) 
      và (2) Sản phẩm in ấn phù hợp nhất (ví dụ: 'áo thun', 'card visit', 'poster').
      Trả lời ngắn gọn, tập trung vào sản phẩm. Ví dụ: "Đây là thiết kế card visit 2 mặt."
      `;
      analysisResult = await this.aiService.getVisionCompletion(
        fileUrl,
        analysisPrompt,
        context
      );
    } else {
      analysisResult = `Đây là một file loại ${fileType} tên là ${fileName}.`;
    }

    Logger.debug(`[ChatAgent] Vision analysis result: ${analysisResult}`);

    const syntheticMessage = `
    Ngữ cảnh (User không thấy): Tôi vừa phân tích file user tải lên (${fileName}).
    Kết quả phân tích: "${analysisResult}".

    Nhiệm vụ của bạn: Hãy trả lời người dùng, xác nhận bạn đã "thấy" file
    và đưa ra gợi ý THÔNG MINH.
    `;

    return this._handleOrchestration(context, history, syntheticMessage);
  }

  async _handleOrchestration(context, history, messageText) {
    const messages = ChatResponseUtil.prepareHistoryForOpenAI(history);
    messages.push({ role: "user", content: messageText });

    const toolDefinitions = this.toolService.getToolDefinitions();

    // 🔥 CUỘC GỌI NÀY GIỜ ĐÃ CÓ FALLBACK TÍCH HỢP
    const aiResponse = await this.aiService.getCompletion(
      messages,
      toolDefinitions,
      context
    );
    const responseMessage = aiResponse.choices[0].message;

    // Nếu aiResponse là kết quả fallback, responseMessage.tool_calls sẽ KHÔNG TỒN TẠI
    if (responseMessage.tool_calls) {
      messages.push(responseMessage);
      const toolCall = responseMessage.tool_calls[0];
      const { response, isTerminal } = await this.toolService.executeTool(
        toolCall,
        context
      );

      if (isTerminal) {
        return response;
      }

      messages.push(response);
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
      // LUỒNG "AI TRẢ LỜI THẲNG" (HOẶC LUỒNG FALLBACK) SẼ ĐI VÀO ĐÂY
      return ChatResponseUtil.createTextResponse(responseMessage.content, true);
    }
  }
}
