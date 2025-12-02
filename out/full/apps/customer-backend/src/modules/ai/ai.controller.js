// apps/customer-backend/src/modules/ai/ai.controller.js
// ✨ SMART PIPELINE: AI Generation (Zin Integration)

import { ApiResponse } from "../../shared/utils/api-response.util.js";
import { API_CODES } from "../../shared/constants/api-codes.constants.js";
import { ValidationException } from "../../shared/exceptions/ValidationException.js";
import { Logger } from "../../shared/utils/index.js";

// ❌ DO NOT import OpenAI at top level - causes Sentry ESM hook issues
// ❌ import OpenAI from "openai";
// ✅ Use dynamic import in methods instead

let openaiInstance = null;

async function getOpenAI() {
  if (!openaiInstance) {
    const { default: OpenAI } = await import("openai");
    openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiInstance;
}

export class AIController {
  /**
   * POST /api/ai/generate-text
   * Generate product description hoặc tags
   */
  generateText = async (req, res, next) => {
    try {
      const { intent, context } = req.body;
      // intent: 'description' | 'tags' | 'seo-title'
      // context: { productName, category, assetName, ... }

      if (!intent || !context) {
        throw new ValidationException(
          "Missing required fields: intent, context"
        );
      }

      let prompt = "";

      if (intent === "description") {
        prompt = `Bạn là chuyên gia viết mô tả sản phẩm in ấn tại Việt Nam.
Viết mô tả sản phẩm hấp dẫn, chuyên nghiệp cho:
- Tên sản phẩm: ${context.productName}
- Loại: ${context.category || "Sản phẩm in ấn"}
- Phôi: ${context.assetName || ""}

Yêu cầu:
- 150-200 từ
- Nhấn mạnh chất lượng, ứng dụng, lợi ích
- Tone: Chuyên nghiệp, thân thiện
- Kết thúc bằng call-to-action ngắn gọn

Mô tả (chỉ trả về nội dung, không thêm tiêu đề):`;
      } else if (intent === "tags") {
        prompt = `Tạo 5-8 tags (từ khóa) cho sản phẩm in ấn:
- Tên: ${context.productName}
- Loại: ${context.category || "Sản phẩm in ấn"}

Yêu cầu:
- Tiếng Việt
- Ngắn gọn (1-3 từ mỗi tag)
- Liên quan đến sản phẩm, ứng dụng, ngành nghề

Trả về JSON array: ["tag1", "tag2", ...]`;
      } else if (intent === "seo-title") {
        prompt = `Tạo tiêu đề SEO-friendly cho sản phẩm in ấn:
- Tên gốc: ${context.productName}
- Loại: ${context.category || ""}

Yêu cầu:
- 50-60 ký tự
- Bao gồm từ khóa chính
- Hấp dẫn, dễ đọc

Chỉ trả về tiêu đề, không giải thích:`;
      } else {
        throw new ValidationException(
          `Invalid intent: ${intent}. Must be 'description', 'tags', or 'seo-title'`
        );
      }

      Logger.info(`[AI] Generating ${intent} for: ${context.productName}`);

      const openai = await getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Nhanh, rẻ (~ $0.15/1M tokens)
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      let result = completion.choices[0].message.content.trim();

      // Parse JSON nếu là tags
      if (intent === "tags") {
        try {
          result = JSON.parse(result);
        } catch (e) {
          // Fallback: split by comma
          result = result
            .replace(/[\[\]"]/g, "")
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
        }
      }

      Logger.info(`[AI] Generated ${intent} successfully`);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { intent, generated: result, model: "gpt-4o-mini" },
            "AI generation successful"
          )
        );
    } catch (error) {
      Logger.error("[AI] Generation failed:", error);
      next(error);
    }
  };

  /**
   * POST /api/ai/generate-stream
   * Streaming response (cho real-time typing effect)
   */
  generateTextStream = async (req, res, next) => {
    try {
      const { intent, context } = req.body;

      if (!intent || !context) {
        throw new ValidationException(
          "Missing required fields: intent, context"
        );
      }

      // (Tương tự prompt ở trên)
      let prompt = "";
      if (intent === "description") {
        prompt = `Bạn là chuyên gia viết mô tả sản phẩm in ấn tại Việt Nam.
Viết mô tả sản phẩm hấp dẫn, chuyên nghiệp cho:
- Tên sản phẩm: ${context.productName}
- Loại: ${context.category || "Sản phẩm in ấn"}
- Phôi: ${context.assetName || ""}

Yêu cầu:
- 150-200 từ
- Nhấn mạnh chất lượng, ứng dụng, lợi ích
- Tone: Chuyên nghiệp, thân thiện
- Kết thúc bằng call-to-action ngắn gọn

Mô tả:`;
      } else {
        throw new ValidationException(
          "Streaming chỉ hỗ trợ intent='description'"
        );
      }

      Logger.info(`[AI] Streaming ${intent} for: ${context.productName}`);

      // Set headers cho Server-Sent Events
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

      const openai = await getOpenAI();
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();

      Logger.info(`[AI] Streaming completed for: ${context.productName}`);
    } catch (error) {
      Logger.error("[AI] Streaming failed:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  };
}
