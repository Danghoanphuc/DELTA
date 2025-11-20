// src/modules/chat/chat.ai.service.js (✅ UPDATED - GRACEFUL FALLBACK)
import OpenAI from "openai";
import { Logger } from "../../shared/utils/index.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { config } from "../../config/env.config.js";

export class ChatAiService {
  constructor() {
    this.openai = new OpenAI({ apiKey: config.apiKeys.openai });
  }

  /**
   * 🧠 NÂNG CẤP: XUẤT NGỮ CẢNH + CHIẾN THUẬT BÁN HÀNG THEO VAI TRÒ (MỤC TIÊU 3)
   */
  _buildUserContextPrompt(context) {
    if (context.actorType === "User" && context.user) {
      const { displayName, email, role } = context.user;

      // --- TẠO CHIẾN THUẬT BÁN HÀNG DỰA TRÊN VAI TRÒ ---
      const roleTactics = {
        designer: `
        [CHIẾN THUẬT BÁN HÀNG CHO DESIGNER]
        - Người này là designer chuyên nghiệp. Họ quan tâm đến:
          • Chất lượng in (DPI, màu CMYK, giấy cao cấp)
          • Mockup 3D để preview
          • File nguồn (AI, PSD) để chỉnh sửa
        - Chiến thuật: Đề xuất 'suggest_value_added_services' với role='designer'
        - Tone: Chuyên nghiệp, kỹ thuật, tôn trọng.
        `,
        business_owner: `
        [CHIẾN THUẬT BÁN HÀNG CHO CHU DOANH NGHIỆP]
        - Người này quản lý doanh nghiệp. Họ cần:
          • Tốc độ (giao hỏa tốc 2h)
          • Số lượng lớn, giá tốt
          • Giao hàng tận nơi, đóng gói chuyên nghiệp
        - Chiến thuật: Đề xuất 'suggest_value_added_services' với role='business_owner'
        - Tone: Thực tế, hiệu quả, tập trung vào ROI.
        `,
        customer: `
        [CHIẾN THUẬT BÁN HÀNG CHO KHÁCH HÀNG THÔNG THƯỜNG]
        - Đây là khách hàng cá nhân. Họ cần:
          • Giá cả hợp lý
          • Chất lượng đảm bảo
          • Giao hàng miễn phí, bảo hành
        - Chiến thuật: Đề xuất 'suggest_value_added_services' với role='customer'
        - Tone: Thân thiện, dễ hiểu, hỗ trợ nhiệt tình.
        `,
      };

      const userTactic = roleTactics[role] || roleTactics.customer;

      return `---
NGỮ CẢNH NGƯỜI DÙNG HIỆN TẠI (KHÔNG TIẾT LỘ CHO HỌ):
- Tên: ${displayName || "Chưa có"}
- Email: ${email || "Chưa có"}
- Vai trò: ${role || "customer"}
${userTactic}
---`;
    }
    return `---
NGỮ CẢNH NGƯỜI DÙNG HIỆN TẠI:
- Đây là một khách vãng lai (GUEST).
- Chiến thuật: Không thể dùng tools cần đăng nhập. Tập trung vào việc GIỚI THIỆU sản phẩm và KHƯYếN KHÍCH đăng ký.
---`;
  }

  /**
   * 🔥 ĐÃ NÂNG CẤP VỚI CƠ CHẾ "GRACEFUL FALLBACK"
   * Cố gắng gọi với Tool, nếu lỗi (do quyền), tự động gọi lại không có Tool.
   */
  async getCompletion(messagesHistory, tools = [], context = {}) {
    const baseSystemPrompt = `Bạn là PrintZ Assistant, trợ lý AI thông minh...
    - Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.
    - CHỈ SỬ DỤNG các công cụ ('functions') nếu có.
    - KHÔNG bao giờ đề cập đến "công cụ".`;

    const contextualPrompt = this._buildUserContextPrompt(context);
    const finalSystemPrompt = `${baseSystemPrompt}\n${contextualPrompt}`;
    const finalMessages = [
      { role: "system", content: finalSystemPrompt },
      ...messagesHistory,
    ];

    // --- BƯỚC 1: CỐ GẮNG GỌI VỚI TOOL (HAPPY PATH) ---
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: finalMessages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
        temperature: 0.5,
        max_tokens: 350,
      });

      // THÀNH CÔNG: Trả về kết quả (có thể có tool_calls)
      return completion;
    } catch (toolError) {
      // --- BƯỚC 2: LỖI (CÓ THỂ DO TOOL) -> KÍCH HOẠT FALLBACK ---
      Logger.warn(
        `[ChatAiSvc] Lỗi khi gọi AI (có thể do Tool): ${toolError.message}. Kích hoạt fallback (không-tool)...`
      );

      // GỌI LẠI, NHƯNG "NGU HƠN" (KHÔNG CÓ TOOL)
      try {
        // Tạo một System Prompt mới, ra lệnh cho AI không dùng tool
        const fallbackSystemPrompt = `${finalSystemPrompt}\n---
        LƯU Ý QUAN TRỌNG: Nỗ lực sử dụng công cụ (tool) đã thất bại.
        NHIỆM VỤ CỦA BẠN: BỎ QUA HOÀN TOÀN việc sử dụng công cụ.
        Chỉ trả lời bằng văn bản thuần túy, thân thiện.
        Nếu người dùng yêu cầu 'tìm kiếm' (như tìm nhà in), hãy lịch sự nói rằng 
        bạn chưa thể thực hiện chức năng tìm kiếm lúc này, nhưng bạn vẫn có thể trò chuyện.
        ---`;

        const fallbackMessages = [
          { role: "system", content: fallbackSystemPrompt }, // Ghi đè system prompt
          ...messagesHistory, // Giữ nguyên lịch sử user
        ];

        const fallbackCompletion = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: fallbackMessages,
          tools: undefined, // 🔥 TẮT TOOL
          tool_choice: undefined, // 🔥 TẮT TOOL
          temperature: 0.7, // Tăng temp để trả lời sáng tạo hơn
          max_tokens: 350,
        });

        // Trả về kết quả (chắc chắn không có tool_calls)
        // Agent sẽ tự động đi vào luồng "AI TRẢ LỜI THẲNG"
        return fallbackCompletion;
      } catch (fallbackError) {
        // --- BƯỚC 3: LỖI LẦN 2 (LỖI THỰC SỰ) ---
        // Nếu lần 2 cũng lỗi (ví dụ: mất mạng, API key sai thật)
        Logger.error("❌ Lỗi gọi OpenAI (Fallback) API:", fallbackError);
        return this._createErrorCompletion(
          "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
        );
      }
    }
  }

  /**
   * (Hàm Vision giữ nguyên như ở lượt trước)
   */
  async getVisionCompletion(fileUrl, analysisPrompt, context = {}) {
    try {
      const contextualPrompt = this._buildUserContextPrompt(context);
      const systemPrompt = `Bạn là một chuyên gia phân tích thiết kế in ấn.
      ${contextualPrompt}
      ${analysisPrompt}`;

      const userMessage = {
        role: "user",
        content: [
          { type: "text", text: "Phân tích file sau:" },
          {
            type: "image_url",
            image_url: { url: fileUrl, detail: "auto" },
          },
        ],
      };

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, userMessage],
        temperature: 0.3,
        max_tokens: 250,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      Logger.error("❌ Lỗi gọi OpenAI (Vision) API:", error);
      return "Lỗi phân tích nội dung file.";
    }
  }

  /**
   * (Hàm getTextOnlyCompletion được giữ lại để dự phòng)
   */
  async getTextOnlyCompletion(prompt, history = [], context = {}) {
    try {
      const contextualPrompt = this._buildUserContextPrompt(context);
      const systemPrompt = `Bạn là một chuyên gia phân tích.
      ${contextualPrompt}
      ${prompt}`;

      const historyMessages = ChatResponseUtil.prepareHistoryForOpenAI(history);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: "..." },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });
      return completion.choices[0].message.content;
    } catch (error) {
      Logger.error("❌ Lỗi gọi OpenAI (TextOnly) API:", error);
      return "Lỗi phân tích nội dung.";
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
