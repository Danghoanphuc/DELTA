// apps/customer-backend/src/infrastructure/notifications/novu.service.ts
// ✅ Novu Service - Notification Trigger (Fixed)

import { Novu } from "@novu/node";
import { Logger } from "../../shared/utils/index.js";

class NovuService {
  private novu: Novu | null;

  constructor() {
    try {
      if (process.env.NOVU_API_KEY) {
        this.novu = new Novu(process.env.NOVU_API_KEY);
        Logger.info("[Novu] Service initialized");
      } else {
        Logger.warn(
          "[Novu] NOVU_API_KEY is missing, notifications will be disabled"
        );
        this.novu = null;
      }
    } catch (error: any) {
      console.error("[Novu] Initialization error:", error);
      Logger.error("[Novu] Initialization error:", error);
      this.novu = null;
    }
  }

  /**
   * Identify Subscriber (Tạo hoặc cập nhật user trên Novu)
   * Bước này cực kỳ quan trọng để tránh lỗi "Subscriber not found"
   */
  private async _ensureSubscriber(userId: string | number): Promise<void> {
    if (!this.novu) return;
    try {
      // Tự động đăng ký subscriber với ID là userId của mình
      // Bạn có thể thêm email/phone/avatar vào đây nếu muốn
      await this.novu.subscribers.identify(userId.toString(), {
        firstName: "User",
        lastName: userId.toString().slice(-4), // Tên tạm: User 1234
      });
    } catch (error: any) {
      Logger.warn(
        `[Novu] Identify subscriber failed (non-critical): ${error.message}`
      );
    }
  }

  /**
   * Trigger notification generic
   */
  async trigger(
    workflowId: string,
    subscriberId: string | number,
    payload: Record<string, any> = {}
  ): Promise<void> {
    if (!this.novu || !subscriberId) {
      Logger.warn(`[Novu] Cannot trigger ${workflowId} - Missing Setup`);
      return;
    }

    try {
      // ✅ BƯỚC 1: Đảm bảo Subscriber tồn tại trước khi gửi
      await this._ensureSubscriber(subscriberId);

      // ✅ BƯỚC 2: Gửi thông báo
      await this.novu.trigger(workflowId, {
        to: {
          subscriberId: subscriberId.toString(),
        },
        payload: payload,
      });
      Logger.info(`[Novu] ✅ Triggered ${workflowId} for ${subscriberId}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      Logger.error(`[Novu] ❌ Trigger failed for ${workflowId}:`, errorMessage);

      if (
        error.response?.status === 422 ||
        errorMessage.includes("workflow_not_found")
      ) {
        Logger.warn(
          `[Novu] Workflow "${workflowId}" not found/invalid in Novu dashboard.`
        );
      }
    }
  }

  /**
   * Trigger chat notification
   * ✅ Payload khớp với Workflow Novu: sen, senderName, messages, conversationId
   * ✅ Workflow Identifier: chat-notification-fct4
   */
  async triggerChatNotification(
    userId: string | number,
    message: string,
    conversationId?: string | number,
    senderName: string = "Ai đó"
  ): Promise<void> {
    try {
      return await this.trigger("chat-notification-fct4", userId, {
        sen: message || "Tin nhắn mới", // ✅ Field "sen" theo workflow
        senderName: senderName,
        messages: message || "Đã gửi tệp đính kèm", // ✅ Field "messages" theo workflow
        conversationId: conversationId?.toString(),
        url: `/chat/${conversationId}`, // Link để user click vào
      });
    } catch (error: any) {
      Logger.warn(`[Novu] Chat notification failed:`, error.message);
    }
  }

  /**
   * Trigger order notification
   */
  async triggerOrderNotification(
    userId: string | number,
    orderData: {
      orderId?: string | number;
      orderNumber?: string;
      status?: string;
      total?: number;
    }
  ): Promise<void> {
    return this.trigger("order-notification", userId, {
      orderId: orderData.orderId?.toString(),
      orderNumber: orderData.orderNumber,
      status: orderData.status,
      total: orderData.total,
    });
  }

  /**
   * Trigger delivery thread notification
   * ✅ Notify participants when new message is posted in delivery thread
   *
   * FALLBACK: Uses 'chat-notification-fct4' workflow if 'delivery-thread-message' not found
   * TODO: Create dedicated 'delivery-thread-message' workflow in Novu Dashboard
   */
  async triggerDeliveryThreadNotification(
    recipientId: string,
    recipientModel: string,
    threadId: string,
    orderNumber: string,
    senderName: string,
    senderRole: string,
    messagePreview: string,
    checkinId?: string | null
  ): Promise<void> {
    try {
      Logger.debug(
        `[Novu] Triggering delivery-thread notification for ${recipientId} (${recipientModel})`
      );

      // ✅ Use dedicated workflow (created via setup script)
      const workflowId = "delivery-thread-message";

      // ✅ FIX: Different URL for admin vs customer
      const url =
        recipientModel === "User"
          ? `/admin/delivery-threads/${threadId}` // Admin URL
          : `/delivery-threads/${threadId}`; // Customer URL

      return await this.trigger(workflowId, recipientId, {
        threadId: threadId,
        orderNumber: orderNumber,
        senderName: senderName,
        senderRole: senderRole,
        messagePreview: messagePreview,
        checkinId: checkinId || "",
        url: url,
      });
    } catch (error: any) {
      Logger.warn(`[Novu] Delivery thread notification failed:`, error.message);
    }
  }
}

export const novuService = new NovuService();
