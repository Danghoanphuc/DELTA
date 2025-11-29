// apps/customer-backend/src/modules/chat/chat.ai.service.js
// ✅ AI Service: Wrapper cho OpenAI API (Chat Completion & Vision)

import OpenAI from "openai";
import { config } from "../../config/env.config.js";
import { Logger } from "../../shared/utils/index.js";

export class ChatAiService {
  constructor() {
    if (!config.apiKeys?.openai) {
      Logger.warn("[ChatAiService] OPENAI_API_KEY is not configured.");
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: config.apiKeys.openai,
      });
    }

    this.model = "gpt-4o-mini"; // Model mặc định
    this.visionModel = "gpt-4o"; // Model cho Vision
  }

  /**
   * Get Chat Completion với tools support
   * @param {Array} messages - Array of message objects
   * @param {Array} tools - Tool definitions (optional)
   * @param {Object} context - Context object (optional)
   * @param {Function} onToken - Callback for streaming tokens (optional)
   * @returns {Promise<Object>} OpenAI response
   */
  async getCompletion(messages, tools = [], context = {}, onToken = null) {
    if (!this.openai) {
      throw new Error("OpenAI API key is not configured");
    }

    try {
      const requestOptions = {
        model: this.model,
        messages: messages,
        temperature: 0.7,
      };

      // Thêm tools nếu có
      if (tools && tools.length > 0) {
        requestOptions.tools = tools;
        requestOptions.tool_choice = "auto";
      }

      // Streaming nếu có callback
      if (onToken) {
        requestOptions.stream = true;

        const stream = await this.openai.chat.completions.create(
          requestOptions
        );
        let fullContent = "";

        let buffer = "";
        const BATCH_SIZE = 10; // Tăng lên 10 chars để giảm số lần emit

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta;
          if (delta?.content) {
            fullContent += delta.content;
            buffer += delta.content;

            // 🎯 SIMPLE CHUNKING: Emit mỗi 10 chars hoặc khi gặp newline
            // Frontend sẽ xử lý việc tìm safe breakpoint
            if (buffer.length >= BATCH_SIZE || delta.content.includes("\n")) {
              Logger.info(
                `[AI] Sending chunk: "${buffer.substring(0, 20)}..." (${
                  buffer.length
                } chars)`
              );
              onToken(buffer);
              buffer = "";
            }
          }
        }

        // Emit phần còn lại
        if (buffer) {
          onToken(buffer);
        }

        // Trả về format giống non-streaming response
        return {
          choices: [
            {
              message: {
                role: "assistant",
                content: fullContent,
              },
            },
          ],
        };
      }

      // Non-streaming
      const response = await this.openai.chat.completions.create(
        requestOptions
      );
      return response;
    } catch (error) {
      Logger.error("[ChatAiService] getCompletion error:", error);
      throw error;
    }
  }

  /**
   * Get Completion với custom prompt (không dùng tools)
   * @param {Array} messages - Array of message objects
   * @param {String} customPrompt - Custom system prompt
   * @returns {Promise<Object>} OpenAI response
   */
  async getCompletionWithCustomPrompt(messages, customPrompt) {
    if (!this.openai) {
      throw new Error("OpenAI API key is not configured");
    }

    try {
      // Thêm custom prompt vào messages
      const messagesWithPrompt = [
        ...messages,
        { role: "system", content: customPrompt },
      ];

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: messagesWithPrompt,
        temperature: 0.7,
      });

      return response;
    } catch (error) {
      Logger.error(
        "[ChatAiService] getCompletionWithCustomPrompt error:",
        error
      );
      throw error;
    }
  }

  /**
   * Get Vision Completion (Phân tích ảnh)
   * @param {String} imageUrl - URL của ảnh cần phân tích
   * @param {String} prompt - Prompt cho AI
   * @param {Object} context - Context object (optional)
   * @returns {Promise<String>} Analysis text
   */
  async getVisionCompletion(imageUrl, prompt, context = {}) {
    if (!this.openai) {
      throw new Error("OpenAI API key is not configured");
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.visionModel,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const analysis =
        response.choices[0]?.message?.content || "Không thể phân tích ảnh này.";
      return analysis;
    } catch (error) {
      Logger.error("[ChatAiService] getVisionCompletion error:", error);
      throw error;
    }
  }
}
