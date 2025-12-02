// apps/customer-backend/src/modules/payments/momo/momo.controller.js
import { Logger } from "../../../shared/utils/index.js";
import { OrderService } from "../../orders/order.service.js";
import { MomoService } from "../../../infrastructure/payment/momo.client.js";

export class MomoController {
  constructor() {
    this.orderService = new OrderService();
    this.momoService = new MomoService();
  }

  // MoMo IPN
  handleMomoIPN = async (req, res) => {
    const payload = req.body || {};
    Logger.info("[MoMoWebhook] Nhận IPN");
    Logger.debug("[MoMoWebhook] Body:", JSON.stringify(payload));

    // Verify signature
    const ok = this.momoService.verifySignature(payload);
    if (!ok) {
      Logger.warn("[MoMoWebhook] Invalid signature");
      return res.json({ resultCode: 5, message: "Invalid signature" });
    }

    const { orderId, resultCode } = payload;
    if (!orderId) {
      return res.json({ resultCode: 6, message: "Missing orderId" });
    }

    try {
      if (String(resultCode) === "0") {
        // success
        const order = await this.orderService.handleVnPayWebhookPayment
          ? await this.orderService.handleVnPayWebhookPayment({ vnp_TxnRef: orderId, vnp_ResponseCode: "00" })
          : await this.orderService._finalizeOrderAndRecordLedger(
              await this.orderService.orderRepository.findMasterOrderById(orderId),
              "MOMO"
            );
        Logger.info(`[MoMoWebhook] Đã xác nhận thanh toán cho order ${orderId}`);
      } else {
        Logger.warn(`[MoMoWebhook] resultCode=${resultCode} cho order ${orderId}`);
      }
      return res.json({ resultCode: 0, message: "Success" });
    } catch (e) {
      Logger.error("[MoMoWebhook] Error:", e);
      return res.json({ resultCode: 7, message: "Server error" });
    }
  };

  // Return URL (optional)
  handleMomoReturn = async (req, res) => {
    Logger.info("[MoMoReturn] User returned from MoMo");
    res.redirect("/my-orders");
  };
}

