import axios from 'axios';
import { Logger } from '../../../shared/utils/index.js';
import { socketService } from '../../../infrastructure/realtime/pusher.service.js';
import { ChatAiService } from '../chat.ai.service.js';
import { r2Service } from '../r2.service.js';

// Init services
const aiService = new ChatAiService();

export class UrlProcessorWorker {
  constructor() {
    // Init socket mode worker nếu chưa có
    try { socketService.initializeWorker(); } catch (e) {}
  }

  /**
   * Helper: Gửi thông báo socket chuẩn hóa về cho User
   */
  _notifyUser(userId, event, data) {
    if (!userId) return;
    try {
      // Nếu là event update trạng thái suy nghĩ, dùng hàm emitFromWorker
      if (event === 'ai:thinking:update') {
          socketService.emitFromWorker(userId.toString(), 'ai:thinking:update', data);
      } else {
          // Các event khác (chat message new...)
          socketService.emitFromWorker(userId.toString(), event, data);
      }
    } catch (e) {
      Logger.warn(`[UrlWorker] Socket emit failed: ${e.message}`);
    }
  }

  async processUrlJob(job) {
    const { url, conversationId, userId, thinkingMessageId } = job.data;
    const startTime = Date.now();
    Logger.info(`[UrlWorker] 🚀 Processing URL: ${url} (Job ${job.id}) via ApiFlash`);
    
    try {
      // ---------------------------------------------------------
      // 1. BẮT ĐẦU: Notify trạng thái "Đang chụp ảnh"
      // ---------------------------------------------------------
      this._notifyUser(userId, 'ai:thinking:update', { 
          icon: '📸', 
          text: 'Zin đang nhờ vệ tinh chụp ảnh website...' 
      });

      // ---------------------------------------------------------
      // 2. GỌI APIFLASH (Thay thế Puppeteer)
      // ---------------------------------------------------------
      // Access Key của Phúc
      const API_KEY = process.env.APIFLASH_ACCESS_KEY; 
      
      if (!API_KEY) {
          throw new Error("Thiếu cấu hình APIFLASH_ACCESS_KEY trong file .env");
      }
      const apiFlashUrl = `https://api.apiflash.com/v1/urltoimage`;
      
      const response = await axios.get(apiFlashUrl, {
          params: {
              access_key: API_KEY,
              url: url,
              // Cấu hình chụp ảnh đẹp
              format: 'jpeg',
              quality: 80,
              width: 1920,
              height: 1080,
              response_type: 'image', // Quan trọng: Nhận về binary data
              wait_until: 'page_loaded', // Chờ load xong hẳn mới chụp
              no_ads: true, // Chặn quảng cáo
              no_cookie_banners: true, // Chặn banner cookie khó chịu
              fail_on_status: '400,404,500' // Báo lỗi nếu web chết
          },
          responseType: 'arraybuffer' // Bắt buộc để nhận Buffer ảnh
      });
      const imageBuffer = Buffer.from(response.data);
      Logger.info(`[UrlWorker] ✅ Screenshot captured via ApiFlash (${(imageBuffer.length / 1024).toFixed(2)} KB)`);

      // ---------------------------------------------------------
      // 3. UPLOAD LÊN R2 (Lưu trữ)
      // ---------------------------------------------------------
      this._notifyUser(userId, 'ai:thinking:update', { 
          icon: '☁️', 
          text: 'Đang lưu ảnh vào đám mây...' 
      });
      
      const fileName = `url-preview-${Date.now()}.jpg`;
      const fileKey = `chat/url-previews/${fileName}`;
      
      await r2Service.uploadFile(imageBuffer, fileKey, 'image/jpeg');
      // Lấy URL public để gửi cho AI xem
      const imageUrl = await r2Service.getPresignedDownloadUrl(fileKey, fileName, 'inline');

      // ---------------------------------------------------------
      // 4. GỬI CHO AI VISION PHÂN TÍCH
      // ---------------------------------------------------------
      this._notifyUser(userId, 'ai:thinking:update', { 
          icon: '🧠', 
          text: 'AI đang phân tích thiết kế...' 
      });
      
      const prompt = `Phân tích thiết kế từ ảnh chụp màn hình URL: ${url}. Đưa ra nhận xét về màu sắc, bố cục và gợi ý sản phẩm in ấn phù hợp với phong cách này.`;
      const aiAnalysis = await aiService.getVisionCompletion(imageUrl, prompt, {});

      // ---------------------------------------------------------
      // 5. CẬP NHẬT DATABASE & HOÀN TẤT
      // ---------------------------------------------------------
      // Dynamic Import để tránh lỗi vòng lặp dependency (Circular Dependency)
      const { ChatRepository } = await import('../chat.repository.js');
      const chatRepo = new ChatRepository();
      const savedMessage = await chatRepo.updateMessage(thinkingMessageId, {
        type: "ai_response",
        content: { 
            text: aiAnalysis, 
            fileUrl: imageUrl // Đính kèm ảnh chụp được để hiển thị lên UI
        },
        metadata: { source: "url-preview", originalUrl: url, status: "completed" }
      });

      // Gửi tin nhắn hoàn chỉnh về cho User (Thay thế bong bóng thinking)
      const messagePayload = savedMessage.toObject ? savedMessage.toObject() : savedMessage;
      this._notifyUser(userId, 'chat:message:new', messagePayload); 
      
      // Gửi tín hiệu tắt bong bóng thinking
      this._notifyUser(userId, 'ai:thinking:update', { 
          type: 'thinking_done', 
          icon: '✅', 
          text: 'Đã phân tích xong!' 
      });

      Logger.info(`[UrlWorker] ✅ Job ${job.id} Done in ${((Date.now() - startTime)/1000).toFixed(2)}s`);
      return { success: true };

    } catch (error) {
      Logger.error(`[UrlWorker] ❌ Job ${job.id} Failed: ${error.message}`);
      
      // Thông báo lỗi đẹp cho User
      this._notifyUser(userId, 'ai:thinking:update', { 
          type: 'thinking_done', // Tắt thinking
          icon: '⚠️', 
          text: 'Không thể chụp ảnh trang web này.' 
      });
      
      // Cập nhật DB trạng thái lỗi
      try {
        const { ChatRepository } = await import('../chat.repository.js');
        const chatRepo = new ChatRepository();
        const errorMsg = await chatRepo.updateMessage(thinkingMessageId, {
            content: { text: "Xin lỗi, tôi không thể truy cập trang web này (có thể do tường lửa chặn hoặc link hỏng)." },
            metadata: { status: "error", error: error.message }
        });
        
        // Push message lỗi về client để thay thế bubble thinking
        this._notifyUser(userId, 'chat:message:new', errorMsg);
      } catch (dbErr) {
          Logger.error("[UrlWorker] DB Update Error:", dbErr);
      }

      throw error;
    }
  }
}

export const urlProcessorWorker = new UrlProcessorWorker();
