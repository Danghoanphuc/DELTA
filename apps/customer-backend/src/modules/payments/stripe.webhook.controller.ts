// apps/customer-backend/src/modules/payments/stripe.webhook.controller.ts
// ✅ BẢN VÁ: Thêm đuôi .js cho TẤT CẢ imports

import { Request, Response } from "express";
import Stripe from "stripe";
import {
  getStripeClient,
  getStripeWebhookSecret,
} from "../../shared/utils/stripe.js"; // THÊM .js
import { Logger } from "../../shared/utils/index.js"; // THÊM .js
import { OrderService } from "../orders/order.service.js"; // THÊM .js
import { StripeOnboardingService } from "../../shared/services/stripe.onboarding.service.js"; // THÊM .js

export class StripeWebhookController {
  private stripe: Stripe;
  private webhookSecret: string;
  private orderService: OrderService;
  private stripeOnboardingService: StripeOnboardingService;

  constructor() {
    this.stripe = getStripeClient();
    this.webhookSecret = getStripeWebhookSecret();

    this.orderService = new OrderService();
    this.stripeOnboardingService = new StripeOnboardingService();

    Logger.info("[StripeWebhookController] Khởi tạo thành công.");
  }

  // Xử lý tất cả Stripe Webhooks
  public handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body, // (Sử dụng raw body, middleware đã xử lý)
        sig,
        this.webhookSecret
      );
    } catch (err: any) {
      Logger.error(`[StripeWebhook] Lỗi xác thực Webhook: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    Logger.debug(`[StripeWebhook] Nhận sự kiện: ${event.type}`);

    // Xử lý sự kiện
    try {
      switch (event.type) {
        // === GĐ 5.3: Onboarding ===
        case "account.updated":
          const account = event.data.object as Stripe.Account;
          await this.stripeOnboardingService.handleAccountUpdate(account);
          break;

        // === GĐ 5.4 / 5.R: Thanh toán ===
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          Logger.info(
            `[StripeWebhook] PaymentIntent Succeeded: ${paymentIntent.id}`
          );

          await this.orderService.handleStripeWebhookPayment(paymentIntent);
          break;

        case "payment_intent.payment_failed":
          const piFailed = event.data.object as Stripe.PaymentIntent;
          Logger.warn(`[StripeWebhook] PaymentIntent Failed: ${piFailed.id}`);
          // (TODO: Xử lý logic thất bại, ví dụ: cập nhật MasterOrder)
          break;

        default:
          Logger.debug(`[StripeWebhook] Sự kiện chưa xử lý: ${event.type}`);
      }
    } catch (error: any) {
      Logger.error(
        `[StripeWebhook] Lỗi khi xử lý sự kiện ${event.type}: ${error.message}`,
        error
      );
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    // Phản hồi 200 OK cho Stripe
    res.json({ received: true });
  };
}
