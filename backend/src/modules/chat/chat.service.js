// src/modules/chat/chat.service.js (✅ UPDATED - GUEST SUPPORT)
import { ChatRepository } from "./chat.repository.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import OpenAI from "openai";

export class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * ✅ UPDATED: Handle message from both guests and authenticated users
   * @param {string|null} userId - User ID (null for guests)
   * @param {object} body - Request body
   * @param {boolean} isGuest - Whether user is a guest
   */
  async handleMessage(userId, body, isGuest = false) {
    const { message, latitude, longitude } = body;

    if (!message || message.trim().length === 0) {
      throw new ValidationException("Tin nhắn không được để trống");
    }

    // Analyze message for entities
    const entities = this.analyzeMessage(message);

    // Build search context
    const searchContext = { entities, coordinates: null };
    if (entities.criteria.includes("nearby") && latitude && longitude) {
      searchContext.coordinates = [parseFloat(longitude), parseFloat(latitude)];
    }

    // Find printers matching criteria
    const printers = await this.chatRepository.findPrinters(searchContext);

    // Get AI response
    const aiResponseText = await this.callOpenAI(message, printers);

    // ✅ NEW: Only save to database if user is authenticated
    if (!isGuest && userId) {
      try {
        const conversation = await this.chatRepository.findOrCreateConversation(
          userId
        );

        // Save user message
        const userMessage = await this.chatRepository.createMessage({
          conversationId: conversation._id,
          sender: userId,
          senderType: "User",
          content: { text: message },
        });

        // Save AI message
        const aiMessage = await this.chatRepository.createMessage({
          conversationId: conversation._id,
          sender: null,
          senderType: "AI",
          content: { text: aiResponseText },
        });

        // Update conversation
        conversation.messages.push(userMessage._id, aiMessage._id);
        conversation.lastMessageAt = Date.now();
        await this.chatRepository.saveConversation(conversation);

        console.log("✅ Chat messages saved to database");
      } catch (saveError) {
        console.error("❌ Error saving chat to database:", saveError);
        // Don't throw - still return AI response even if save fails
      }
    } else {
      console.log("💬 Guest chat - not saving to database");
    }

    // Return response
    return {
      type: "ai_response",
      content: {
        text: aiResponseText,
        entities: entities,
        printers: printers,
      },
    };
  }

  /**
   * Get chat history (only for authenticated users)
   */
  async getHistory(userId) {
    if (!userId) {
      return []; // No history for guests
    }

    const conversation = await this.chatRepository.getHistory(userId);
    if (!conversation) {
      return [];
    }
    return conversation.messages;
  }

  /**
   * Analyze message to extract entities
   */
  analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();
    const entities = { product_type: null, location: null, criteria: [] };

    // Product type detection
    if (lowerMessage.includes("áo")) entities.product_type = "t-shirt";
    if (lowerMessage.includes("card") || lowerMessage.includes("danh thiếp")) {
      entities.product_type = "business-card";
    }
    if (lowerMessage.includes("banner") || lowerMessage.includes("băng rôn")) {
      entities.product_type = "banner";
    }
    if (lowerMessage.includes("sticker") || lowerMessage.includes("decal")) {
      entities.product_type = "sticker";
    }

    // Location detection
    if (lowerMessage.includes("thủ dầu một")) entities.location = "thủ dầu một";
    if (
      lowerMessage.includes("sài gòn") ||
      lowerMessage.includes("hồ chí minh")
    ) {
      entities.location = "hồ chí minh";
    }
    if (lowerMessage.includes("hà nội")) entities.location = "hà nội";

    // Criteria detection
    if (lowerMessage.includes("rẻ") || lowerMessage.includes("giá tốt")) {
      entities.criteria.push("cheap");
    }
    if (lowerMessage.includes("nhanh") || lowerMessage.includes("gấp")) {
      entities.criteria.push("fast");
    }
    if (lowerMessage.includes("gần") || lowerMessage.includes("nearby")) {
      entities.criteria.push("nearby");
    }
    if (lowerMessage.includes("chất lượng") || lowerMessage.includes("tốt")) {
      entities.criteria.push("quality");
    }

    return entities;
  }

  /**
   * Call OpenAI API for chatbot response
   */
  async callOpenAI(message, printers = [], history = []) {
    try {
      const printerContext =
        printers.length > 0
          ? `Đây là danh sách nhà in phù hợp:\n${JSON.stringify(
              printers,
              null,
              2
            )}`
          : "Không tìm thấy nhà in nào phù hợp với yêu cầu này.";

      const systemPrompt = `Bạn là PrintZ Assistant, trợ lý AI thông minh cho nền tảng in ấn PrintZ.

🎯 NHIỆM VỤ CỦA BẠN:
- Tư vấn về dịch vụ in ấn (áo, banner, card, sticker, v.v.)
- Giới thiệu nhà in phù hợp với nhu cầu khách hàng
- Trả lời câu hỏi về giá cả, chất lượng, thời gian in

${printerContext}

📋 QUY TẮC TRẢ LỜI:
1. Luôn trả lời bằng tiếng Việt, thân thiện và nhiệt tình
2. Nếu có nhà in phù hợp: Giới thiệu 1-2 nhà in tốt nhất với lý do cụ thể
3. Nếu không có nhà in: Hỏi thêm thông tin (vị trí, loại sản phẩm, yêu cầu cụ thể)
4. Luôn khuyến khích người dùng đăng nhập để nhận hỗ trợ tốt hơn
5. Giữ câu trả lời ngắn gọn (3-5 câu)

💡 GỢI Ý KHI CẦN:
- "Bạn đang ở khu vực nào để tôi tìm nhà in gần nhất?"
- "Bạn cần in bao nhiêu sản phẩm và trong thời gian nào?"
- "Đăng nhập để xem giá chi tiết và đặt hàng nhanh hơn nhé!"`;

      const historyMessages = history.map((msg) => ({
        role: msg.senderType === "AI" ? "assistant" : "user",
        content: msg.content.text,
      }));

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 300, // Keep responses concise
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("❌ Lỗi gọi OpenAI API:", error);

      // Fallback response if OpenAI fails
      return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hỗ trợ qua email support@printz.vn. Cảm ơn bạn đã thông cảm! 🙏";
    }
  }
}
