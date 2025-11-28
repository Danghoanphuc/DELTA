import axios from 'axios';
import { Logger } from '../../../shared/utils/index.js';
import { socketService } from '../../../infrastructure/realtime/pusher.service.js';
import { ChatAiService } from '../chat.ai.service.js';
import { r2Service } from '../r2.service.js';

const aiService = new ChatAiService();

export class UrlProcessorWorker {
  constructor() {
    try { socketService.initializeWorker(); } catch (e) {}
  }

  _notifyUser(userId, event, data) {
    if (!userId) return;
    try {
      socketService.emitFromWorker(userId.toString(), event, data);
    } catch (e) {
      Logger.warn(`[UrlWorker] Socket emit failed: ${e.message}`);
    }
  }

  /**
   * Update message with thinking state
   */
  async _updateMessageThinking(chatRepo, messageId, thinkingText, progress) {
    try {
      await chatRepo.updateMessage(messageId, {
        content: { 
          text: thinkingText,
          isThinking: true,
          progress: progress
        },
        metadata: { status: 'thinking' }
      });
    } catch (err) {
      Logger.warn(`[UrlWorker] Failed to update thinking: ${err.message}`);
    }
  }

  async processUrlJob(job) {
    const { url, conversationId, userId } = job.data;
    
    let messageId = null;
    
    try {
      const { ChatRepository } = await import('../chat.repository.js');
      const chatRepo = new ChatRepository();
      
      // ✅ 1. Create SINGLE message with initial thinking
      const initialMsg = await chatRepo.createMessage({
        conversationId: conversationId,
        senderType: "AI",
        content: { 
          text: `🔍 Đang chuẩn bị phân tích ${url}...`,
          isThinking: true,
          progress: 10
        },
        metadata: { 
          source: "url-preview", 
          status: "thinking", 
          originalUrl: url 
        }
      });
      
      messageId = initialMsg._id.toString();
      
      // Emit NEW message
      const msgPayload = initialMsg.toObject ? initialMsg.toObject() : initialMsg;
      this._notifyUser(userId, 'chat:message:new', msgPayload);
      
      // ✅ 2. Update: Đang chụp ảnh
      await this._updateMessageThinking(
        chatRepo, 
        messageId, 
        `📸 Đang chụp ảnh website ${url}...`,
        30
      );
      
      this._notifyUser(userId, 'chat:message:updated', {
        _id: messageId,
        conversationId: conversationId,
        content: {
          text: `📸 Đang chụp ảnh website ${url}...`,
          isThinking: true,
          progress: 30
        }
      });

      // ✅ 3. ApiFlash screenshot
      const API_KEY = process.env.APIFLASH_ACCESS_KEY;
      if (!API_KEY) throw new Error("Missing APIFLASH_ACCESS_KEY");
      
      const response = await axios.get('https://api.apiflash.com/v1/urltoimage', {
        params: {
          access_key: API_KEY,
          url: url,
          format: 'jpeg',
          quality: 80,
          width: 1920,
          height: 1080,
          response_type: 'image',
          wait_until: 'page_loaded',
          no_ads: true,
          no_cookie_banners: true,
          fail_on_status: '400,404,500'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      const imageBuffer = Buffer.from(response.data);

      // ✅ 4. Update: Đang lưu ảnh
      await this._updateMessageThinking(
        chatRepo,
        messageId,
        '☁️ Đang lưu ảnh...',
        50
      );
      
      this._notifyUser(userId, 'chat:message:updated', {
        _id: messageId,
        conversationId: conversationId,
        content: {
          text: '☁️ Đang lưu ảnh...',
          isThinking: true,
          progress: 50
        }
      });
      
      const fileName = `url-preview-${Date.now()}.jpg`;
      const fileKey = `chat/url-previews/${fileName}`;
      
      await r2Service.uploadFile(imageBuffer, fileKey, 'image/jpeg');
      const imageUrl = await r2Service.getPresignedDownloadUrl(fileKey, fileName, 'inline');

      // ✅ 5. Update: Đang phân tích
      await this._updateMessageThinking(
        chatRepo,
        messageId,
        '🧠 Đang phân tích thiết kế...',
        70
      );
      
      this._notifyUser(userId, 'chat:message:updated', {
        _id: messageId,
        conversationId: conversationId,
        content: {
          text: '🧠 Đang phân tích thiết kế...',
          isThinking: true,
          progress: 70
        }
      });
      
      // ✅ 6. AI analysis
      const base64Image = imageBuffer.toString('base64');
      const base64Url = `data:image/jpeg;base64,${base64Image}`;
      
      const prompt = `Phân tích thiết kế từ ảnh chụp màn hình URL: ${url}. 

Hãy đưa ra:
- Màu sắc chủ đạo
- Phong cách thiết kế (tối giản, hiện đại, cổ điển...)
- Bố cục và cấu trúc
- Gợi ý sản phẩm in ấn phù hợp (card visit, tờ rơi, áo thun...)`;

      const aiAnalysis = await aiService.getVisionCompletion(base64Url, prompt, {});

      // ✅ 7. FINAL update - replace thinking with result
      const updatedMsg = await chatRepo.updateMessage(messageId, {
        type: "ai_response",
        content: { 
          text: aiAnalysis,
          fileUrl: imageUrl,
          isThinking: false
        },
        metadata: { 
          source: "url-preview", 
          originalUrl: url, 
          status: "completed" 
        }
      });

      // ✅ 8. Emit FINAL message
      const finalPayload = updatedMsg.toObject ? updatedMsg.toObject() : updatedMsg;
      this._notifyUser(userId, 'chat:message:updated', finalPayload);

      return { 
        success: true, 
        analysis: aiAnalysis,
        imageUrl: imageUrl,
        messageId: messageId
      };

    } catch (error) {
      Logger.error(`[UrlWorker] Job ${job?.id} failed:`, error.message);
      
      // ✅ Update message with error
      if (messageId) {
        try {
          const { ChatRepository } = await import('../chat.repository.js');
          const chatRepo = new ChatRepository();
          
          const errorMsg = await chatRepo.updateMessage(messageId, {
            content: { 
              text: `Xin lỗi, tôi không thể truy cập trang web này. 

Có thể do:
- Link không tồn tại hoặc đã hết hạn
- Website chặn truy cập tự động
- Kết nối mạng không ổn định

Bạn vui lòng thử lại với link khác nhé!`,
              isThinking: false
            },
            metadata: { 
              status: "error", 
              error: error.message 
            }
          });
          
          const errPayload = errorMsg.toObject ? errorMsg.toObject() : errorMsg;
          this._notifyUser(userId, 'chat:message:updated', errPayload);
        } catch (dbErr) {
          Logger.error("[UrlWorker] DB update failed:", dbErr.message);
        }
      }

      throw error;
    }
  }
}

export const urlProcessorWorker = new UrlProcessorWorker();
