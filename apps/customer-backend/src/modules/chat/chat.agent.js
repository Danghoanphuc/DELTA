import { ChatAiService } from "./chat.ai.service.js";
import { ChatToolService } from "./chat.tools.service.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { Logger } from "../../shared/utils/index.js";

// 🧠 TỪ ĐIỂN SUY NGHĨ: Map tool name -> Câu nói thân thiện
const THOUGHT_DICTIONARY = {
  find_products: {
    icon: "🔍",
    texts: [
      "Zin đang rà soát kho sản phẩm...",
      "Đang tìm kiếm mẫu in phù hợp cho bạn...",
      "Chờ chút, Zin đang tra cứu danh mục..."
    ]
  },
  find_printers: {
    icon: "🏭",
    texts: [
      "Đang kết nối với mạng lưới nhà in...",
      "Để Zin tìm xem nhà in nào gần bạn nhất...",
      "Đang lọc các nhà in uy tín..."
    ]
  },
  get_recent_orders: {
    icon: "📦",
    texts: [
      "Đang lục lại hồ sơ đơn hàng cũ...",
      "Zin đang kiểm tra lịch sử giao dịch..."
    ]
  },
  suggest_value_added_services: {
    icon: "✨",
    texts: [
      "Đang tính toán các phương án tối ưu...",
      "Zin đang nghĩ thêm vài ý tưởng hay ho cho bạn..."
    ]
  }
};

export class ChatAgent {
  constructor() {
    this.aiService = new ChatAiService();
    this.toolService = new ChatToolService();
  }

  // Helper: Chọn ngẫu nhiên câu thoại để không nhàm chán
  _getRandomThought(toolName) {
    const entry = THOUGHT_DICTIONARY[toolName];
    if (!entry) return { icon: "🤔", text: "Zin đang suy nghĩ..." };
    const randomText = entry.texts[Math.floor(Math.random() * entry.texts.length)];
    return { icon: entry.icon, text: randomText };
  }

  async run(context, history, message, systemOverride = null, onStream = null) {
    const userId = context.actorId;
    
    // 1. Prepare Messages
    let messages = ChatResponseUtil.prepareHistoryForOpenAI(history);
    if (systemOverride) messages.push({ role: "system", content: systemOverride });
    messages.push({ role: "user", content: message });

    // 📣 THÔNG BÁO: Bắt đầu suy nghĩ
    if (onStream) onStream({ type: "thinking", icon: "⚡", text: "Zin đang đọc yêu cầu..." });

    // 2. Call AI (Lần 1: Quyết định Tool)
    const toolDefinitions = this.toolService.getToolDefinitions();
    const aiResponse = await this.aiService.getCompletion(messages, toolDefinitions, context);
    const responseMessage = aiResponse.choices[0].message;

    // 3. Handle Tool Usage
    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      const toolName = toolCall.function.name;
      
      // 📣 THÔNG BÁO: Humanized Thought trước khi chạy Tool
      const thought = this._getRandomThought(toolName);
      if (onStream) {
        onStream({ 
          type: "thinking_update", // Event riêng để FE update bubble
          icon: thought.icon, 
          text: thought.text 
        });
      }

      Logger.info(`[ChatAgent] 🛠️ Executing: ${toolName}`);
      messages.push(responseMessage); 

      // Execute Tool
      const { response, isTerminal } = await this.toolService.executeTool(toolCall, context);

      // Xử lý Rich UI (Product Selection...)
      if (response && typeof response === "object" && response.type && ["product_selection", "printer_selection", "order_selection"].includes(response.type)) {
         // 📣 THÔNG BÁO: Đã tìm thấy
         if (onStream) onStream({ type: "thinking_done", icon: "✅", text: "Đã tìm thấy kết quả!" });
         
         // Generate short text summary using AI
         const summaryPrompt = "Hãy tạo một câu giới thiệu ngắn gọn (1 câu) cho các kết quả tìm kiếm này.";
         const summaryRes = await this.aiService.getCompletionWithCustomPrompt(messages, summaryPrompt);
         response.content.text = summaryRes.choices[0].message.content;
         return response; 
      }

      if (isTerminal) return response;

      // Feed tool result back to AI
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: typeof response === "string" ? response : JSON.stringify(response)
      });

      // 📣 THÔNG BÁO: Tổng hợp câu trả lời
      if (onStream) onStream({ type: "thinking_update", icon: "✍️", text: "Đang tổng hợp thông tin..." });

      // Final Answer (Streamed)
      // Lưu ý: Hàm getCompletion cần hỗ trợ callback onToken
      const finalRes = await this.aiService.getCompletion(messages, [], context, (token) => {
          if (onStream) onStream({ type: "text_stream", text: token });
      });
      
      return ChatResponseUtil.createTextResponse(finalRes.choices[0].message.content, true);
    }

    // 4. No Tool -> Direct Answer (Streamed)
    if (onStream && responseMessage.content) {
       onStream({ type: "text_stream", text: responseMessage.content });
    }

    return ChatResponseUtil.createTextResponse(responseMessage.content, true);
  }
}