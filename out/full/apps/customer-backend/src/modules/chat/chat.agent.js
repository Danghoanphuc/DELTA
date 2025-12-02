import { ChatAiService } from "./chat.ai.service.js";
import { ChatToolService } from "./chat.tools.service.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { Logger } from "../../shared/utils/index.js";

// 🔥 1. ĐỊNH NGHĨA "NÃO BỘ" CHO AI (SYSTEM PROMPT)
// Đây là bản chỉ đạo nghệ thuật giúp AI biết cách hành xử
const DEFAULT_SYSTEM_PROMPT = `
BẠN LÀ: Trợ lý AI chuyên nghiệp của Printz - Nền tảng in ấn trực tuyến (Web2Print).
NHIỆM VỤ: Hỗ trợ khách hàng tìm sản phẩm in, tìm nhà in uy tín, và theo dõi đơn hàng.

QUY TẮC SỬ DỤNG CÔNG CỤ (TOOLS) - BẮT BUỘC:
1. Khi khách hỏi về "nhà in", "tiệm in", "in ở đâu", "địa chỉ in" -> BẮT BUỘC gọi tool: 'find_printers'.
2. Khi khách hỏi về "sản phẩm", "giá in", "in danh thiếp", "in áo", "tờ rơi"... -> BẮT BUỘC gọi tool: 'find_products'.
3. Khi khách hỏi "đơn hàng của tôi", "lịch sử mua", "tình trạng đơn" -> BẮT BUỘC gọi tool: 'get_recent_orders'.
4. Khi khách gửi link website hoặc hỏi về thiết kế từ link -> BẮT BUỘC gọi tool: 'browse_page'.
5. Khi khách cần tư vấn dịch vụ thêm (giao nhanh, thiết kế hộ) -> Gọi tool: 'suggest_value_added_services'.

CẤM KỴ:
- KHÔNG ĐƯỢC trả lời "Tôi không biết" hoặc "Tôi không có thông tin" về sản phẩm/nhà in khi CHƯA gọi tool.
- KHÔNG ĐƯỢC tự bịa đặt giá cả hoặc thông tin nhà in. Chỉ sử dụng dữ liệu từ tool trả về.

PHONG CÁCH TRẢ LỜI:
- Ngắn gọn, súc tích (dưới 3 câu).
- Luôn mời gọi hành động (Call to action): "Bạn có muốn xem chi tiết không?", "Mời bạn chọn bên dưới".
- Nếu tool trả về danh sách (JSON), chỉ cần nói câu dẫn dắt: "Dưới đây là các lựa chọn phù hợp nhất cho bạn:", hệ thống sẽ tự hiển thị giao diện thẻ (Carousel).
`;

export class ChatAgent {
  constructor() {
    this.aiService = new ChatAiService();
    this.toolService = new ChatToolService();
  }

  async run(context, history, message, systemOverride = null, onStream = null) {
    const userId = context.actorId;

    // 2. Prepare Messages
    let messages = ChatResponseUtil.prepareHistoryForOpenAI(history);

    // 🔥 3. TIÊM PROMPT VÀO CONTEXT
    // Nếu service không truyền override, ta dùng bản mặc định "xịn sò" ở trên
    const systemPrompt = systemOverride || DEFAULT_SYSTEM_PROMPT;
    messages.push({ role: "system", content: systemPrompt });

    messages.push({ role: "user", content: message });

    // 4. Call AI (Lần 1: Quyết định Tool)
    const toolDefinitions = this.toolService.getToolDefinitions();
    // ... (Phần code bên dưới giữ nguyên không đổi) ...

    // Nếu có onStream, stream ngay từ đầu
    const aiResponse = await this.aiService.getCompletion(
      messages,
      toolDefinitions,
      context,
      onStream && toolDefinitions.length === 0 ? onStream : null
    );
    const responseMessage = aiResponse.choices[0].message;

    // ... (Giữ nguyên logic xử lý tool calls như cũ) ...

    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      const toolName = toolCall.function.name;

      Logger.info(`[ChatAgent] 🛠️ AI quyết định dùng tool: ${toolName}`);

      // Add assistant message with tool_calls
      messages.push(responseMessage);

      const { response, isTerminal } = await this.toolService.executeTool(
        toolCall,
        context
      );

      // ✅ FIX: Add tool response message (required by OpenAI)
      const toolResponseContent =
        typeof response === "string" ? response : JSON.stringify(response);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolResponseContent,
      });

      // Nếu trả về Carousel, AI sẽ tóm tắt ngắn gọn
      if (
        response &&
        typeof response === "object" &&
        ["product_selection", "printer_selection", "order_selection"].includes(
          response.type
        )
      ) {
        // ✅ Ensure content object exists
        if (!response.content) {
          response.content = {};
        }

        // Gọi AI để tạo câu dẫn dắt (chỉ nếu chưa có text)
        if (!response.content.text) {
          const summaryPrompt =
            "Hãy viết 1 câu ngắn gọn (dưới 15 từ) mời khách hàng xem danh sách kết quả bên dưới.";

          messages.push({ role: "user", content: summaryPrompt });

          const summaryRes = await this.aiService.getCompletion(
            messages,
            [], // No tools for summary
            context,
            null // No streaming
          );

          response.content.text = summaryRes.choices[0].message.content;
        }

        Logger.info(
          `[ChatAgent] Returning ${response.type} with ${
            response.content.orders?.length ||
            response.content.products?.length ||
            response.content.printers?.length ||
            0
          } items`
        );
        return response;
      }

      // Nếu không phải carousel, gọi AI để tạo response tự nhiên
      if (
        typeof response === "object" &&
        response.type !== "HIDDEN_PROCESSING"
      ) {
        const finalResponse = await this.aiService.getCompletion(
          messages,
          [],
          context,
          onStream
        );
        return ChatResponseUtil.createTextResponse(
          finalResponse.choices[0].message.content,
          true
        );
      }

      // Nếu là string hoặc HIDDEN_PROCESSING, return trực tiếp
      if (typeof response === "string") {
        return ChatResponseUtil.createTextResponse(response, true);
      }

      return response;
    }

    return ChatResponseUtil.createTextResponse(responseMessage.content, true);
  }
}
