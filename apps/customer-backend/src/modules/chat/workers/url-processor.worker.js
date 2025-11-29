import axios from "axios";
import { Logger } from "../../../shared/utils/index.js";
import { socketService } from "../../../infrastructure/realtime/pusher.service.js";
import { ChatAiService } from "../chat.ai.service.js";
import { r2Service } from "../r2.service.js";

const aiService = new ChatAiService();

export class UrlProcessorWorker {
  constructor() {
    try {
      socketService.initializeWorker();
    } catch (e) {}
  }

  _notifyUser(userId, event, data) {
    if (!userId) return;
    try {
      socketService.emitFromWorker(userId.toString(), event, data);
    } catch (e) {
      Logger.warn(`[UrlWorker] Socket emit failed: ${e.message}`);
    }
  }

  async _updateMessageThinking(chatRepo, messageId, thinkingText, progress) {
    try {
      await chatRepo.updateMessage(messageId, {
        content: {
          text: thinkingText,
          isThinking: true,
          progress: progress,
        },
        metadata: { status: "thinking" },
      });
    } catch (err) {
      Logger.warn(`[UrlWorker] Failed to update thinking: ${err.message}`);
    }
  }

  async processUrlJob(job) {
    const { url, conversationId, userId } = job.data;
    let messageId = null;

    try {
      const { ChatRepository } = await import("../chat.repository.js");
      const chatRepo = new ChatRepository();

      // 1. Create message
      const initialMsg = await chatRepo.createMessage({
        conversationId: conversationId,
        senderType: "AI",
        content: {
          text: `🔍 Đang truy cập liên kết ${url}...`,
          isThinking: true,
          progress: 10,
        },
        metadata: {
          source: "url-preview",
          status: "thinking",
          originalUrl: url,
        },
      });

      messageId = initialMsg._id.toString();
      const msgPayload = initialMsg.toObject
        ? initialMsg.toObject()
        : initialMsg;
      this._notifyUser(userId, "chat:message:new", msgPayload);

      // 2. Update status
      await this._updateMessageThinking(
        chatRepo,
        messageId,
        `📸 Đang đợi website tải nét căng...`,
        30
      );

      // 3. ApiFlash screenshot (BẢN CHUẨN)
      const API_KEY = process.env.APIFLASH_ACCESS_KEY;
      if (!API_KEY) throw new Error("Missing APIFLASH_ACCESS_KEY");

      // CSS này sẽ ẩn các thành phần UI rác (Header, Footer, Cookie, Popup quảng cáo)
      // Giúp ảnh chỉ tập trung vào nội dung thiết kế chính
      const cleanUpCSS = `
        header, footer, nav, 
        #onetrust-banner-sdk, .cookie-banner, 
        [role="banner"], [role="contentinfo"], 
        [class*="BottomBar"], [class*="SignUp"], 
        [aria-label="cookie"], .intercom-lightweight-app { 
          display: none !important; 
        }
        body { overflow: hidden !important; }
      `;

      const response = await axios.get(
        "https://api.apiflash.com/v1/urltoimage",
        {
          params: {
            access_key: API_KEY,
            url: url,

            // --- CẤU HÌNH CHỤP ẢNH NÉT ---
            format: "jpeg",
            quality: 100, // Max chất lượng
            width: 1920, // Full HD để AI nhìn rõ chi tiết nhỏ
            height: 1080,

            // Wait until: "network_idle" là chìa khóa. Nó đợi khi mạng "im lặng" hoàn toàn
            wait_until: "network_idle",

            // Delay: Thêm 6s "vùng đệm" để Canvas render xong hiệu ứng/ảnh nặng
            delay: 6,

            // Fresh: Bắt buộc chụp mới, không lấy ảnh cache cũ bị mờ
            fresh: true,

            // --- CẤU HÌNH DỌN RÁC UI (CROP) ---
            // Tiêm CSS để ẩn thanh công cụ, quảng cáo
            css: cleanUpCSS,

            // Tự động chặn quảng cáo & cookie banner (lớp bảo vệ 1)
            no_ads: true,
            no_cookie_banners: true,

            // Giả lập màn hình Desktop chuẩn
            user_agent:
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

            fail_on_status: "400,404,500",
          },
          responseType: "arraybuffer",
          timeout: 60000, // Tăng timeout lên 60s vì mình delay khá lâu
        }
      );

      const imageBuffer = Buffer.from(response.data);

      // 4. Update status
      await this._updateMessageThinking(
        chatRepo,
        messageId,
        "☁️ Đang lưu ảnh vào hệ thống...",
        60
      );

      const fileName = `url-preview-${Date.now()}.jpg`;
      const fileKey = `chat/url-previews/${fileName}`;

      await r2Service.uploadFile(imageBuffer, fileKey, "image/jpeg");
      const imageUrl = await r2Service.getPresignedDownloadUrl(
        fileKey,
        fileName,
        "inline"
      );

      // 5. Update status
      await this._updateMessageThinking(
        chatRepo,
        messageId,
        "🧠 AI đang phân tích thiết kế...",
        80
      );

      // 6. AI Analysis
      const base64Image = imageBuffer.toString("base64");
      const base64Url = `data:image/jpeg;base64,${base64Image}`;

      const prompt = `Phân tích thiết kế từ ảnh chụp màn hình URL: ${url}. 
      Lưu ý: Ảnh đã được lọc bỏ giao diện thừa, hãy tập trung vào phần thiết kế chính.

      Hãy đưa ra:
      - Màu sắc chủ đạo (kèm mã Hex nếu đoán được)
      - Phong cách thiết kế
      - Bố cục và typography
      - Gợi ý sản phẩm in ấn phù hợp nhất cho thiết kế này`;

      const aiAnalysis = await aiService.getVisionCompletion(
        base64Url,
        prompt,
        {}
      );

      // 7. Final Update
      const updatedMsg = await chatRepo.updateMessage(messageId, {
        type: "ai_response",
        content: {
          text: aiAnalysis,
          fileUrl: imageUrl,
          isThinking: false,
        },
        metadata: {
          source: "url-preview",
          originalUrl: url,
          status: "completed",
        },
      });

      const finalPayload = updatedMsg.toObject
        ? updatedMsg.toObject()
        : updatedMsg;
      finalPayload.isFinished = true;
      this._notifyUser(userId, "chat:message:new", finalPayload);

      return {
        success: true,
        analysis: aiAnalysis,
        imageUrl: imageUrl,
        messageId: messageId,
      };
    } catch (error) {
      Logger.error(`[UrlWorker] Job ${job?.id} failed:`, error.message);
      if (messageId) {
        // Error handling logic (giữ nguyên như cũ)
        try {
          const { ChatRepository } = await import("../chat.repository.js");
          const chatRepo = new ChatRepository();
          const errorMsg = await chatRepo.updateMessage(messageId, {
            content: {
              text: `⚠️ Không thể chụp ảnh trang web này.\nLý do: ${error.message}`,
              isThinking: false,
            },
            metadata: { status: "error", error: error.message },
          });
          const errPayload = errorMsg.toObject ? errorMsg.toObject() : errorMsg;
          errPayload.isFinished = true;
          this._notifyUser(userId, "chat:message:new", errPayload);
        } catch (dbErr) {}
      }
      throw error;
    }
  }
}

export const urlProcessorWorker = new UrlProcessorWorker();
