// apps/customer-backend/src/modules/chat/workers/url-processor.worker.js
// ✅ CRITICAL FIX: Complete process isolation + Canva URL fix

import { Logger } from '../../../shared/utils/index.js';

export class UrlProcessorWorker {
  constructor() {
    this._chatRepository = null;
    this._aiService = null;
  }

  async getChatRepository() {
    if (!this._chatRepository) {
      const { ChatRepository } = await import('../chat.repository.js');
      this._chatRepository = new ChatRepository();
    }
    return this._chatRepository;
  }

  async getAiService() {
    if (!this._aiService) {
      const { ChatAiService } = await import('../chat.ai.service.js');
      this._aiService = new ChatAiService();
    }
    return this._aiService;
  }

  async processUrlJob(job) {
    const { url, conversationId, userId, message } = job.data;
    const jobStartTime = Date.now();

    Logger.info(`[URL Processor] 🚀 Bắt đầu xử lý job ${job.id} cho URL: ${url}`);
    Logger.info(`[URL Processor] 📋 Job data: conversationId=${conversationId}, userId=${userId}`);

    // ✅ CRITICAL: Job progress heartbeat
    const progressInterval = setInterval(() => {
      const elapsed = ((Date.now() - jobStartTime) / 1000).toFixed(1);
      Logger.info(`[URL Processor] 💓 Job ${job.id} đang chạy... (${elapsed}s)`);
    }, 10000); // Log mỗi 10 giây

    let jobTimeoutHandle = null;
    const jobTimeout = new Promise((_, reject) => {
      jobTimeoutHandle = setTimeout(() => {
        Logger.error(`[URL Processor] ⏱️ Job ${job.id} timeout sau 40 giây`);
        clearInterval(progressInterval);
        reject(new Error(`Job ${job.id} timeout sau 40 giây`));
      }, 40000);
    });

    try {
      Logger.info(`[URL Processor] 🔄 Bắt đầu _processUrlJobInternal cho job ${job.id}...`);
      const result = await Promise.race([
        this._processUrlJobInternal(job, url, conversationId, userId, message),
        jobTimeout
      ]);
      
      // ✅ CRITICAL: Clear timeout khi đã resolve
      if (jobTimeoutHandle) {
        clearTimeout(jobTimeoutHandle);
        jobTimeoutHandle = null;
      }
      
      clearInterval(progressInterval);
      const duration = ((Date.now() - jobStartTime) / 1000).toFixed(2);
      Logger.info(`[URL Processor] ✅ Job ${job.id} hoàn thành trong ${duration}s`);
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      const duration = ((Date.now() - jobStartTime) / 1000).toFixed(2);
      Logger.error(`[URL Processor] ❌ Job ${job.id} failed sau ${duration}s: ${error?.message || 'Unknown error'}`);
      Logger.error(`[URL Processor] Error name: ${error?.name || 'Unknown'}`);
      Logger.error(`[URL Processor] Error code: ${error?.code || 'N/A'}`);
      Logger.error(`[URL Processor] Stack:`, error?.stack || 'No stack');
      
      // ✅ CRITICAL: Log job context để debug
      Logger.error(`[URL Processor] Job context:`, {
        jobId: job.id,
        url: url,
        conversationId: conversationId,
        userId: userId,
        duration: duration
      });
      
      throw error;
    }
  }

  async _processUrlJobInternal(job, url, conversationId, userId, message) {
    let imageBuffer = null;
    let imageUrl = null;
    let aiAnalysis = null;

    try {
      // ✅ BƯỚC 1: Chụp ảnh website (ISOLATED với error isolation mạnh hơn)
      try {
        // ✅ CRITICAL FIX: Canva URL conversion logic
        let urlToCapture = url;
        if (url.includes('canva.com')) {
          // ✅ Fix: Replace chính xác /edit với /view
          urlToCapture = url.replace(/\/edit(\?|$)/, '/view$1');
          Logger.info(`[URL Processor] 🔄 Chuyển đổi Canva edit link sang view link: ${urlToCapture}`);
        }

        Logger.info(`[URL Processor] 📸 Bắt đầu chụp ảnh...`);
        
        // ✅ CRITICAL: Heartbeat logging để track progress
        const heartbeatInterval = setInterval(() => {
          Logger.info(`[URL Processor] 💓 Heartbeat: Screenshot đang xử lý...`);
        }, 5000); // Log mỗi 5 giây

        // ✅ CRITICAL: Wrap trong Promise với error handler riêng để tránh crash
        const screenshotPromise = new Promise(async (resolve, reject) => {
          let heartbeatCount = 0;
          const innerHeartbeat = setInterval(() => {
            heartbeatCount++;
            Logger.info(`[URL Processor] 💓 Inner heartbeat ${heartbeatCount}: Đang trong screenshot promise...`);
          }, 2000);

            try {
              Logger.info(`[URL Processor] 🔄 Đang import browser service...`);
              
              // ✅ CRITICAL: Wrap import trong timeout để tránh hang vô hạn
              const importPromise = import('../services/browser.service.js');
              const importTimeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Import browser service timeout sau 10s')), 10000);
              });
              
              Logger.info(`[URL Processor] 🔄 Waiting for import...`);
              const browserModule = await Promise.race([importPromise, importTimeout]);
              Logger.info(`[URL Processor] ✅ Đã import browser module thành công`);
              
              const { browserService } = browserModule;
              if (!browserService) {
                throw new Error('browserService không tồn tại trong module');
              }
              
              Logger.info(`[URL Processor] ✅ Đã lấy browserService instance, bắt đầu capture...`);
              
              const buffer = await browserService.captureScreenshot(urlToCapture, {
                timeout: 15000,
              });
              
              clearInterval(innerHeartbeat);
              Logger.info(`[URL Processor] ✅ Screenshot promise resolved với buffer size: ${buffer?.length || 0}`);
              resolve(buffer);
            } catch (error) {
            clearInterval(innerHeartbeat);
            // ✅ Catch tất cả errors (import error, capture error, etc.)
            Logger.error(`[URL Processor] ❌ Lỗi trong screenshot promise: ${error?.message || 'Unknown error'}`);
            Logger.error(`[URL Processor] Error type: ${error?.name || 'Unknown'}`);
            Logger.error(`[URL Processor] Error stack: ${error?.stack || 'No stack'}`);
            reject(error);
          }
        });

        let screenshotTimeoutHandle = null;
        const screenshotTimeout = new Promise((_, reject) => {
          screenshotTimeoutHandle = setTimeout(() => {
            Logger.error(`[URL Processor] ⏱️ Screenshot timeout sau 20s`);
            reject(new Error('Screenshot timeout 20s'));
          }, 20000);
        });

        try {
          imageBuffer = await Promise.race([screenshotPromise, screenshotTimeout]);
          
          // ✅ CRITICAL: Clear timeout khi đã resolve
          if (screenshotTimeoutHandle) {
            clearTimeout(screenshotTimeoutHandle);
            screenshotTimeoutHandle = null;
          }
          
          clearInterval(heartbeatInterval);
        } catch (raceError) {
          // ✅ CRITICAL: Clear timeout khi có error
          if (screenshotTimeoutHandle) {
            clearTimeout(screenshotTimeoutHandle);
            screenshotTimeoutHandle = null;
          }
          
          clearInterval(heartbeatInterval);
          throw raceError;
        }
        
        if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
          throw new Error('Screenshot returned invalid buffer');
        }
        
        Logger.info(`[URL Processor] ✅ Đã chụp ảnh thành công (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
      } catch (screenshotError) {
        // ✅ CRITICAL: Log chi tiết nhưng KHÔNG throw để không crash worker
        Logger.error(`[URL Processor] ❌ Lỗi chụp ảnh: ${screenshotError?.message || 'Unknown error'}`);
        Logger.error(`[URL Processor] Error name: ${screenshotError?.name || 'Unknown'}`);
        Logger.error(`[URL Processor] Stack: ${screenshotError?.stack || 'No stack'}`);
        imageBuffer = null;
        // ✅ KHÔNG throw - tiếp tục với text-only analysis
      }

      // ✅ BƯỚC 2: Upload ảnh lên R2 (ISOLATED)
      if (imageBuffer) {
        try {
          Logger.info(`[URL Processor] 📤 Bắt đầu upload ảnh lên R2...`);
          
          const uploadPromise = (async () => {
            const { r2Service } = await import('../r2.service.js');
            const fileKey = `url-preview/${userId || 'guest'}_${Date.now()}.jpg`;
            await r2Service.uploadFile(imageBuffer, fileKey, 'image/jpeg');
            return await r2Service.getPresignedDownloadUrl(fileKey, 'preview.jpg');
          })();

          const uploadTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Upload R2 timeout 10s')), 10000);
          });

          imageUrl = await Promise.race([uploadPromise, uploadTimeout]);
          Logger.info(`[URL Processor] ✅ Đã upload ảnh lên R2`);
        } catch (uploadError) {
          Logger.error(`[URL Processor] ❌ Lỗi upload R2: ${uploadError.message}`);
          imageUrl = null;
        }
      } else {
        Logger.warn(`[URL Processor] ⚠️ Không có ảnh để upload, tiếp tục với text-only analysis`);
      }

      // ✅ BƯỚC 3: AI phân tích (ISOLATED)
      try {
        const aiService = await this.getAiService();
        const context = {
          user: userId ? { _id: userId } : null,
          actorId: userId,
          actorType: userId ? "User" : "Guest",
          conversationId: conversationId,
        };

        if (imageUrl) {
          Logger.info(`[URL Processor] 🤖 Gửi ảnh cho Vision AI phân tích...`);
          const visionPrompt = `Bạn là chuyên gia tư vấn in ấn. Hãy phân tích giao diện website này và đưa ra:
1. Mô tả ngắn gọn về thiết kế (màu sắc chủ đạo, bố cục, phong cách)
2. Gợi ý 3-5 sản phẩm in ấn phù hợp nhất (ví dụ: namecard, brochure, poster, banner, v.v.)
3. Lưu ý về kỹ thuật in (nếu có)

Hãy trả lời bằng tiếng Việt, ngắn gọn và thân thiện.`;

          const visionPromise = aiService.getVisionCompletion(imageUrl, visionPrompt, context);
          const aiTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AI Vision timeout 15s')), 15000);
          });

          aiAnalysis = await Promise.race([visionPromise, aiTimeout]);
          Logger.info(`[URL Processor] ✅ Đã phân tích bằng Vision AI`);
        } else {
          Logger.info(`[URL Processor] 🤖 Phân tích URL bằng text-only AI...`);
          const textPrompt = `Người dùng đã gửi link: ${url}. Hãy tư vấn các sản phẩm in ấn phù hợp dựa trên link này. Nếu là link Canva, hãy nhắc họ cần share link ở chế độ "Bất kỳ ai có liên kết" để tôi có thể xem được.`;
          
          const history = [];
          const textPromise = aiService.getTextOnlyCompletion(textPrompt, history, context);
          const aiTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AI Text timeout 10s')), 10000);
          });

          aiAnalysis = await Promise.race([textPromise, aiTimeout]);
          Logger.info(`[URL Processor] ✅ Đã phân tích bằng Text AI`);
        }
      } catch (visionError) {
        Logger.error(`[URL Processor] ❌ Lỗi AI: ${visionError.message}`);
        aiAnalysis = "Xin lỗi, tôi không thể phân tích website này lúc này. Nếu bạn gửi link Canva, vui lòng đảm bảo link ở chế độ 'Bất kỳ ai có liên kết'. Bạn có thể mô tả lại yêu cầu in ấn của mình không?";
      }

      // ✅ BƯỚC 4: Lưu vào DB (ISOLATED)
      try {
        Logger.info(`[URL Processor] 💾 Bắt đầu lưu tin nhắn AI vào DB...`);
        const chatRepository = await this.getChatRepository();
        
        const mongoose = await import('mongoose');
        const convId = mongoose.default.Types.ObjectId.isValid(conversationId) 
          ? new mongoose.default.Types.ObjectId(conversationId)
          : conversationId;

        Logger.info(`[URL Processor] 💾 Preparing to save message to DB...`);
        Logger.info(`[URL Processor] 📋 Message data:`, {
          conversationId: convId.toString(),
          senderType: "AI",
          type: "text",
          contentTextLength: aiAnalysis?.length || 0,
          hasFileUrl: !!imageUrl,
        });
        
        const savePromise = chatRepository.createMessage({
          conversationId: convId,
          sender: null,
          senderType: "AI",
          type: "text",
          content: {
            text: aiAnalysis || "Không có nội dung",
            fileUrl: imageUrl || null,
          },
          metadata: {
            source: "url-preview",
            originalUrl: url,
            processedAt: new Date().toISOString(),
          },
        });

        let dbTimeoutHandle = null;
        const dbTimeout = new Promise((_, reject) => {
          dbTimeoutHandle = setTimeout(() => reject(new Error('Database save timeout 5s')), 5000);
        });

        let savedMessage;
        try {
          savedMessage = await Promise.race([savePromise, dbTimeout]);
          // ✅ Clear timeout khi đã resolve
          if (dbTimeoutHandle) {
            clearTimeout(dbTimeoutHandle);
            dbTimeoutHandle = null;
          }
          
          // ✅ CRITICAL: Validate message đã được lưu thành công
          if (!savedMessage || !savedMessage._id) {
            throw new Error('Message không được lưu thành công - không có _id');
          }
          
          Logger.info(`[URL Processor] ✅ Đã lưu tin nhắn AI vào DB (messageId: ${savedMessage._id.toString()})`);
          Logger.info(`[URL Processor] 📋 Message details:`, {
            messageId: savedMessage._id.toString(),
            conversationId: conversationId.toString(),
            senderType: savedMessage.senderType,
            type: savedMessage.type,
            contentText: savedMessage.content?.text?.substring(0, 50) || 'N/A',
            hasFileUrl: !!savedMessage.content?.fileUrl,
          });
        } catch (raceError) {
          // ✅ Clear timeout khi có error
          if (dbTimeoutHandle) {
            clearTimeout(dbTimeoutHandle);
            dbTimeoutHandle = null;
          }
          Logger.error(`[URL Processor] ❌ Lỗi khi lưu message vào DB: ${raceError.message}`);
          Logger.error(`[URL Processor] Error stack: ${raceError.stack || 'No stack'}`);
          throw raceError;
        }
        
        // ✅ BƯỚC 5: Socket update - Emit đầy đủ message object
        if (userId && savedMessage) {
          try {
            const socketPromise = (async () => {
              const { socketService } = await import('../../../infrastructure/realtime/socket.service.js');
              const userIdStr = typeof userId === 'string' ? userId : userId.toString();
              
              // ✅ CRITICAL: Convert message object sang plain object với đầy đủ field
              const messageObject = savedMessage.toObject ? savedMessage.toObject() : savedMessage;
              
              // ✅ CRITICAL: Đảm bảo format đúng cho frontend
              const socketMessage = {
                _id: messageObject._id?.toString() || savedMessage._id?.toString(),
                conversationId: conversationId.toString(), // ✅ Đảm bảo là string
                sender: messageObject.sender || null,
                senderType: messageObject.senderType || "AI",
                type: messageObject.type || "text",
                content: messageObject.content || {
                  text: aiAnalysis,
                  fileUrl: imageUrl || null,
                },
                metadata: messageObject.metadata || {
                  source: "url-preview",
                  originalUrl: url,
                  processedAt: new Date().toISOString(),
                },
                createdAt: messageObject.createdAt || new Date().toISOString(),
                updatedAt: messageObject.updatedAt || new Date().toISOString(),
              };
              
              Logger.info(`[URL Processor] 🔔 Emitting socket event với messageId: ${socketMessage._id}`);
              Logger.info(`[URL Processor] 🔔 Socket message format:`, {
                _id: socketMessage._id,
                conversationId: socketMessage.conversationId,
                senderType: socketMessage.senderType,
                type: socketMessage.type,
                hasContent: !!socketMessage.content,
              });
              
              // ✅ Emit cả 2 events để đảm bảo frontend nhận được
              socketService.emitToUser(userIdStr, "chat:message:new", socketMessage);
              socketService.emitToUser(userIdStr, "new_message", socketMessage); // ✅ Backup event name
              
              Logger.info(`[URL Processor] ✅ Đã emit socket events với messageId: ${socketMessage._id}`);
            })();

            let socketTimeoutHandle = null;
            const socketTimeout = new Promise((_, reject) => {
              socketTimeoutHandle = setTimeout(() => reject(new Error('Socket timeout 2s')), 2000);
            });

            try {
              await Promise.race([socketPromise, socketTimeout]);
              // ✅ Clear timeout khi đã resolve
              if (socketTimeoutHandle) {
                clearTimeout(socketTimeoutHandle);
                socketTimeoutHandle = null;
              }
            } catch (raceError) {
              // ✅ Clear timeout khi có error
              if (socketTimeoutHandle) {
                clearTimeout(socketTimeoutHandle);
                socketTimeoutHandle = null;
              }
              Logger.warn(`[URL Processor] ⚠️ Lỗi Socket (không critical): ${raceError.message}`);
            }
          } catch (socketError) {
            Logger.warn(`[URL Processor] ⚠️ Lỗi Socket (không critical): ${socketError.message}`);
          }
        }
      } catch (dbError) {
        Logger.error(`[URL Processor] ❌ Lỗi lưu DB: ${dbError.message}`);
        Logger.error(`[URL Processor] DB Error stack: ${dbError.stack || 'No stack'}`);
      }

      return {
        success: true,
        url: url,
        imageUrl: imageUrl,
        analysis: aiAnalysis,
        conversationId: conversationId,
      };

    } catch (error) {
      Logger.error(`[URL Processor] ❌ Job ${job.id} failed: ${error.message}`);
      Logger.error(`[URL Processor] Error stack: ${error.stack || 'No stack'}`);

      try {
        const chatRepository = await this.getChatRepository();
        const mongoose = await import('mongoose');
        const convId = mongoose.default.Types.ObjectId.isValid(conversationId) 
          ? new mongoose.default.Types.ObjectId(conversationId)
          : conversationId;

        await chatRepository.createMessage({
          conversationId: convId,
          sender: null,
          senderType: "AI",
          type: "text",
          content: {
            text: "Xin lỗi, tôi không thể xem website này lúc này. Nếu bạn gửi link Canva, vui lòng đảm bảo link ở chế độ 'Bất kỳ ai có liên kết'. Bạn có thể thử lại sau hoặc mô tả yêu cầu in ấn của mình không?",
          },
          metadata: {
            source: "url-preview",
            originalUrl: url,
            error: error.message,
            processedAt: new Date().toISOString(),
          },
        });

        if (userId) {
          try {
            const { socketService } = await import('../../../infrastructure/realtime/socket.service.js');
            const userIdStr = typeof userId === 'string' ? userId : userId.toString();
            socketService.emitToUser(userIdStr, "chat:message:new", {
              conversationId: conversationId,
              type: "text", // ✅ FIX: Đổi thành "text" để khớp với DB schema
              content: {
                text: "Xin lỗi, tôi không thể xem website này lúc này. Bạn có thể thử lại sau hoặc mô tả yêu cầu in ấn của mình không?",
              },
            });
          } catch (socketErr) {
            Logger.warn(`[URL Processor] ⚠️ Không thể gửi Socket event lỗi: ${socketErr.message}`);
          }
        }
      } catch (fallbackError) {
        Logger.error(`[URL Processor] ❌ Lỗi khi lưu fallback message: ${fallbackError.message}`);
      }

      throw error;
    }
  }
}

export const urlProcessorWorker = new UrlProcessorWorker();