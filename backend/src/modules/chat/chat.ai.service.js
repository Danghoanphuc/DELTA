// src/modules/chat/chat.ai.service.js (NEW FILE)
import OpenAI from "openai";
import { Logger } from "../../shared/utils/index.js";
import { ChatResponseUtil } from "./chat.response.util.js"; // Sẽ tạo ở bước 3

export class ChatAiService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Gọi AI với khả năng điều phối (tools)
   */
  async getCompletion(messagesHistory, tools = []) {
    const systemPrompt = `Bạn là PrintZ Assistant, trợ lý AI thông minh cho nền tảng in ấn.
    - Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
    - Sử dụng lịch sử chat (nếu có) để hiểu ngữ cảnh.
    - CHỈ SỬ DỤNG các công cụ được cung cấp ('functions') để tìm thông tin về nhà in ('find_printers'), sản phẩm ('find_products'), hoặc đơn hàng ('get_recent_orders').
    - Đừng tự bịa ra thông tin. Nếu công cụ trả về "không có kết quả", hãy thông báo cho người dùng một cách lịch sự.
    - KHÔNG bao giờ đề cập đến "Slash Commands" hay "công cụ". Đối với người dùng, bạn chỉ đang "tìm kiếm" thông tin cho họ.
    - Khi 'find_printers' trả về kết quả, hãy tóm tắt ngắn gọn 1-2 nhà in nổi bật (nếu có) trong câu trả lời.`;

    const finalMessages = [
      { role: "system", content: systemPrompt },
      ...messagesHistory,
    ];

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: finalMessages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
        temperature: 0.5,
        max_tokens: 350,
      });

      return completion; // Trả về toàn bộ object response
    } catch (error) {
      Logger.error("❌ Lỗi gọi OpenAI API:", error);
      return this._createErrorCompletion(
        "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
      );
    }
  }

  /**
   * Gọi AI đơn giản (chỉ văn bản)
   */
  async getTextOnlyCompletion(prompt, history = []) {
    try {
      const systemPrompt = `Bạn là PrintZ Assistant, trợ lý AI thông minh.
      - Luôn trả lời bằng tiếng Việt, thân thiện.
      - ${prompt}`; // Prompt cụ thể từ service

      const historyMessages = ChatResponseUtil.prepareHistoryForOpenAI(history);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: "..." }, // Chỉ cần kích hoạt system prompt
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      Logger.error("❌ Lỗi gọi OpenAI (TextOnly) API:", error);
      return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
    }
  }

  /**
   * Helper tạo object lỗi giả lập
   */
  _createErrorCompletion(errorMessage) {
    return {
      choices: [
        {
          message: {
            role: "assistant",
            content: errorMessage,
          },
        },
      ],
    };
  }
}
