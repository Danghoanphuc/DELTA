// src/modules/chat/chat.service.js
import { ChatRepository } from "./chat.repository.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import OpenAI from "openai";

export class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async handleMessage(userId, body) {
    const { message, latitude, longitude } = body;
    if (!message || message.trim().length === 0) {
      throw new ValidationException("Tin nhắn không được để trống");
    }

    const entities = this.analyzeMessage(message);

    const searchContext = { entities, coordinates: null };
    if (entities.criteria.includes("nearby") && latitude && longitude) {
      searchContext.coordinates = [parseFloat(longitude), parseFloat(latitude)];
    }

    const printers = await this.chatRepository.findPrinters(searchContext);
    const aiResponseText = await this.callOpenAI(message, printers);

    // Lưu trữ
    const conversation = await this.chatRepository.findOrCreateConversation(
      userId
    );
    const userMessage = await this.chatRepository.createMessage({
      conversationId: conversation._id,
      sender: userId,
      senderType: "User",
      content: { text: message },
    });
    const aiMessage = await this.chatRepository.createMessage({
      conversationId: conversation._id,
      sender: null,
      senderType: "AI",
      content: { text: aiResponseText },
    });

    conversation.messages.push(userMessage._id, aiMessage._id);
    conversation.lastMessageAt = Date.now();
    await this.chatRepository.saveConversation(conversation);

    return {
      type: "ai_response",
      content: {
        text: aiResponseText,
        entities: entities,
        printers: printers,
      },
    };
  }

  async getHistory(userId) {
    const conversation = await this.chatRepository.getHistory(userId);
    if (!conversation) {
      return [];
    }
    return conversation.messages;
  }

  // Helper functions (từ chatController cũ)
  analyzeMessage(message) {
    // ... (logic phân tích tin nhắn của bạn ở đây) ...
    const lowerMessage = message.toLowerCase();
    const entities = { product_type: null, location: null, criteria: [] };
    if (lowerMessage.includes("áo")) entities.product_type = "t-shirt";
    if (lowerMessage.includes("thủ dầu một")) entities.location = "thủ dầu một";
    if (lowerMessage.includes("rẻ")) entities.criteria.push("cheap");
    if (lowerMessage.includes("nhanh")) entities.criteria.push("fast");
    if (lowerMessage.includes("gần")) entities.criteria.push("nearby");
    return entities;
  }

  async callOpenAI(message, printers = [], history = []) {
    try {
      const printerContext =
        printers.length > 0
          ? `Đây là danh sách nhà in phù hợp: \n${JSON.stringify(printers)}`
          : "Không tìm thấy nhà in nào phù hợp.";
      const systemPrompt = `Bạn là PrintZ Assistant, trợ lý AI cho nền tảng in ấn.
${printerContext}
QUY TẮC: Luôn trả lời bằng tiếng Việt. Nếu có nhà in, hãy giới thiệu 1-2 nhà in tốt nhất. Nếu không, hãy hỏi thêm thông tin.`;

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
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error("Lỗi gọi OpenAI API:", error);
      return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
    }
  }
}
