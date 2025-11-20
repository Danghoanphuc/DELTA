// src/modules/chat/chat.agent.js
import { ChatAiService } from "./chat.ai.service.js";
import { ChatToolService } from "./chat.tools.service.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { Logger } from "../../shared/utils/index.js";

export class ChatAgent {
  constructor() {
    this.aiService = new ChatAiService();
    this.toolService = new ChatToolService();
  }

  /**
   * Hàm điều phối chính (Main Entry Point)
   * @param {Object} context - User context
   * @param {Array} history - Lịch sử chat
   * @param {String} message - Tin nhắn user
   * @param {String} systemOverride - (Optional) Chỉ thị hệ thống (ví dụ Vision result)
   */
  async run(context, history, message, systemOverride = null) {
    Logger.debug(
      `[ChatAgent] 🧠 Processing message: "${message.substring(0, 50)}..."`
    );

    // 1. Chuẩn bị Messages cho OpenAI
    const messages = ChatResponseUtil.prepareHistoryForOpenAI(history);

    // Nếu có system override (từ Vision AI), chèn vào đầu
    if (systemOverride) {
      messages.push({ role: "system", content: systemOverride });
    }

    messages.push({ role: "user", content: message });

    // 2. Lấy Tool Definitions
    const toolDefinitions = this.toolService.getToolDefinitions();

    // 3. Gọi AI lần 1 (Decision making)
    const aiResponse = await this.aiService.getCompletion(
      messages,
      toolDefinitions,
      context
    );
    const responseMessage = aiResponse.choices[0].message;

    // 4. Kiểm tra xem AI có muốn dùng Tool không
    if (responseMessage.tool_calls) {
      Logger.info(
        `[ChatAgent] 🛠️ Tool usage detected: ${responseMessage.tool_calls[0].function.name}`
      );

      // Push "intent" của AI vào history ảo
      messages.push(responseMessage);

      const toolCall = responseMessage.tool_calls[0];

      // Thực thi Tool
      const { response, isTerminal } = await this.toolService.executeTool(
        toolCall,
        context
      );

      // Nếu Tool là Terminal (kết thúc luôn flow), trả về luôn
      if (isTerminal) {
        return response;
      }

      // Nếu không, đưa kết quả Tool lại cho AI
      messages.push(response.response); // response.response là message role='tool'

      // Gọi AI lần 2 (Summarize result)
      const finalAiResponse = await this.aiService.getCompletion(
        messages,
        toolDefinitions, // Vẫn đưa tools vào phòng khi AI muốn gọi tiếp (multi-step)
        context
      );

      return ChatResponseUtil.createTextResponse(
        finalAiResponse.choices[0].message.content,
        true
      );
    }

    // 5. Không dùng Tool -> Trả lời thẳng
    return ChatResponseUtil.createTextResponse(responseMessage.content, true);
  }
}
