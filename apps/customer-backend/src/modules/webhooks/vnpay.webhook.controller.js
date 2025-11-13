// apps/customer-backend/src/modules/webhooks/vnpay.webhook.controller.js
// ✅ GĐ 5.R2: Controller mới nhận IPN từ VNPay

import { OrderService } from "../orders/order.service.js";
import { Logger } from "../../shared/utils/index.js";

export class VnPayWebhookController {
  constructor() {
    // Chúng ta cần OrderService để gọi hàm xử lý
    this.orderService = new OrderService();
  }

  /**
   * Xử lý VNPay IPN (Instant Payment Notification)
   */
  handleVnPayIPN = async (req, res) => {
    // VNPay gửi params trong query
    const vnpayQuery = req.query;
    Logger.info(`[VnPayWebhook] Nhận IPN cho TxnRef: ${vnpayQuery.vnp_TxnRef}`);

    try {
      // Giao toàn bộ logic xác thực và xử lý cho OrderService
      const result = await this.orderService.handleVnPayWebhookPayment(
        vnpayQuery
      );

      // Phản hồi cho VNPay (bắt buộc)
      Logger.info(`[VnPayWebhook] Phản hồi VNPay: ${JSON.stringify(result)}`);
      res.json(result);
    } catch (error) {
      Logger.error(
        `[VnPayWebhook] Lỗi nghiêm trọng khi xử lý IPN ${vnpayQuery.vnp_TxnRef}: ${error.message}`,
        error
      );

      // Nếu lỗi, chúng ta báo cho VNPay là (Giao dịch không tìm thấy/Lỗi)
      // để VNPay thử gửi lại
      res.json({ RspCode: "99", Message: "Unknown error" });
    }
  };

  /**
   * Xử lý VNPay Return (Khách hàng bị redirect về)
   * (Chúng ta sẽ xử lý ở GĐ 5.R3 - Frontend)
   */
  handleVnPayReturn = async (req, res) => {
    // Hàm này chỉ mang tính tham khảo
    // Logic chính sẽ nằm ở Frontend (CheckoutConfirmationPage)
    // Frontend sẽ nhận query, gọi API backend để xác thực đơn hàng
    // Tạm thời chỉ redirect về trang chủ
    Logger.debug("[VnPayReturn] Khách hàng quay về từ VNPay. Đang redirect...");
    res.redirect("/my-orders");
  };
}
