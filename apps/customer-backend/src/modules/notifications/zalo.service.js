// src/modules/notifications/zalo.service.js
// ✅ Zalo OA Notification Service - Gửi thông báo qua Zalo

import { Logger } from "../../shared/utils/index.js";

/**
 * Zalo OA Service
 * Docs: https://developers.zalo.me/docs/api/official-account-api
 */
export class ZaloService {
  constructor() {
    this.accessToken = process.env.ZALO_OA_ACCESS_TOKEN;
    this.oaId = process.env.ZALO_OA_ID;
    this.apiUrl = "https://openapi.zalo.me/v3.0/oa";
    this.enabled = !!this.accessToken;
  }

  /**
   * Gửi tin nhắn text đơn giản
   */
  async sendTextMessage(userId, message) {
    if (!this.enabled) {
      Logger.warn("[ZaloSvc] Zalo OA not configured, skipping...");
      return { success: false, reason: "not_configured" };
    }

    try {
      const response = await fetch(`${this.apiUrl}/message/cs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: this.accessToken,
        },
        body: JSON.stringify({
          recipient: { user_id: userId },
          message: { text: message },
        }),
      });

      const data = await response.json();

      if (data.error === 0) {
        Logger.success(`[ZaloSvc] Message sent to ${userId}`);
        return { success: true, messageId: data.data?.message_id };
      } else {
        Logger.error(`[ZaloSvc] Failed: ${data.message}`);
        return { success: false, error: data.message };
      }
    } catch (error) {
      Logger.error("[ZaloSvc] Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gửi tin nhắn với template (ZNS - Zalo Notification Service)
   */
  async sendZNSMessage(phone, templateId, templateData) {
    if (!this.enabled) {
      Logger.warn("[ZaloSvc] Zalo OA not configured, skipping...");
      return { success: false, reason: "not_configured" };
    }

    try {
      // Format phone: 84xxxxxxxxx
      const formattedPhone = this.formatPhone(phone);

      const response = await fetch(
        "https://business.openapi.zalo.me/message/template",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            access_token: this.accessToken,
          },
          body: JSON.stringify({
            phone: formattedPhone,
            template_id: templateId,
            template_data: templateData,
          }),
        }
      );

      const data = await response.json();

      if (data.error === 0) {
        Logger.success(`[ZaloSvc] ZNS sent to ${formattedPhone}`);
        return { success: true, messageId: data.data?.msg_id };
      } else {
        Logger.error(`[ZaloSvc] ZNS Failed: ${data.message}`);
        return { success: false, error: data.message };
      }
    } catch (error) {
      Logger.error("[ZaloSvc] ZNS Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gửi thông báo đơn hàng mới
   */
  async sendOrderNotification(phone, orderData) {
    const { orderNumber, packName, recipientName, totalAmount } = orderData;

    // Template ID từ Zalo OA Dashboard
    const templateId = process.env.ZALO_TEMPLATE_ORDER || "default";

    return await this.sendZNSMessage(phone, templateId, {
      order_number: orderNumber,
      pack_name: packName,
      recipient_name: recipientName,
      total_amount: this.formatCurrency(totalAmount),
      order_date: new Date().toLocaleDateString("vi-VN"),
    });
  }

  /**
   * Gửi thông báo quà đã gửi
   */
  async sendShippedNotification(phone, shippingData) {
    const { orderNumber, trackingNumber, carrier, estimatedDelivery } =
      shippingData;

    const templateId = process.env.ZALO_TEMPLATE_SHIPPED || "default";

    return await this.sendZNSMessage(phone, templateId, {
      order_number: orderNumber,
      tracking_number: trackingNumber || "N/A",
      carrier: carrier || "Đối tác vận chuyển",
      estimated_delivery: estimatedDelivery || "2-3 ngày",
    });
  }

  /**
   * Gửi thông báo quà đã giao
   */
  async sendDeliveredNotification(phone, deliveryData) {
    const { orderNumber, recipientName, deliveredAt } = deliveryData;

    const templateId = process.env.ZALO_TEMPLATE_DELIVERED || "default";

    return await this.sendZNSMessage(phone, templateId, {
      order_number: orderNumber,
      recipient_name: recipientName,
      delivered_at: deliveredAt || new Date().toLocaleDateString("vi-VN"),
    });
  }

  /**
   * Gửi link self-service cho người nhận
   */
  async sendSelfServiceLink(phone, selfServiceData) {
    const { recipientName, packName, selfServiceUrl, expiryDate } =
      selfServiceData;

    const templateId = process.env.ZALO_TEMPLATE_SELF_SERVICE || "default";

    return await this.sendZNSMessage(phone, templateId, {
      recipient_name: recipientName,
      pack_name: packName,
      self_service_url: selfServiceUrl,
      expiry_date: expiryDate,
    });
  }

  /**
   * Gửi thông báo mời tham gia team
   */
  async sendTeamInviteNotification(phone, inviteData) {
    const { inviterName, organizationName, inviteUrl } = inviteData;

    const templateId = process.env.ZALO_TEMPLATE_TEAM_INVITE || "default";

    return await this.sendZNSMessage(phone, templateId, {
      inviter_name: inviterName,
      organization_name: organizationName,
      invite_url: inviteUrl,
    });
  }

  /**
   * Gửi thông báo tồn kho thấp
   */
  async sendLowStockAlert(phone, stockData) {
    const { productName, currentQuantity, threshold } = stockData;

    const templateId = process.env.ZALO_TEMPLATE_LOW_STOCK || "default";

    return await this.sendZNSMessage(phone, templateId, {
      product_name: productName,
      current_quantity: String(currentQuantity),
      threshold: String(threshold),
    });
  }

  // === HELPERS ===

  formatPhone(phone) {
    if (!phone) return "";
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, "");
    // Convert 0xxx to 84xxx
    if (cleaned.startsWith("0")) {
      cleaned = "84" + cleaned.substring(1);
    }
    // Add 84 if not present
    if (!cleaned.startsWith("84")) {
      cleaned = "84" + cleaned;
    }
    return cleaned;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  }
}

// Singleton instance
export const zaloService = new ZaloService();
