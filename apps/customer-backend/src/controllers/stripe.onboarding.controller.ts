// apps/customer-backend/src/controllers/stripe.onboarding.controller.ts
// ✅ BẢN VÁ: Thêm đuôi .js cho TẤT CẢ imports

import { Request, Response } from "express";
import { config } from "../config/env.config.js"; // THÊM .js
import { Logger } from "../shared/utils/index.js"; // THÊM .js
import { StripeOnboardingService } from "../shared/services/stripe.onboarding.service.js"; // THÊM .js
import { OrderService } from "../modules/orders/order.service.js"; // THÊM .js

export class StripeOnboardingController {
  private stripeOnboardingService: StripeOnboardingService;
  private orderService: OrderService; // (Dù chưa dùng, vẫn giữ)

  constructor() {
    this.stripeOnboardingService = new StripeOnboardingService();
    this.orderService = new OrderService();
    Logger.info("[StripeOnboardingController] Khởi tạo thành công.");
  }

  // Tạo link Onboarding
  public createAccountLink = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { platform } = req.body;
      const printerProfileId = (req as any).user.printerProfile; // Từ middleware protect/isPrinter

      const accountLink = await this.stripeOnboardingService.createAccountLink(
        printerProfileId,
        platform
      );

      res.status(200).json({ url: accountLink.url });
    } catch (error: any) {
      Logger.error("[StripeOnboardingController] Lỗi tạo Account Link:", error);
      res.status(500).json({ message: error.message });
    }
  };

  // Xử lý khi Stripe redirect về (Return URL)
  public handleOnboardingReturn = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const printerProfileId = (req as any).user.printerProfile;

      const account = await this.stripeOnboardingService.retrieveAccount(
        printerProfileId
      );

      // (Logic kiểm tra account... đã được chuyển sang Webhook)

      Logger.info(
        `[StripeOnboardingController] User ${printerProfileId} quay về từ Stripe.`
      );

      // Chuyển hướng về trang quản lý thanh toán của Printer
      res.redirect(`${config.clientUrl}/printer/dashboard?tab=account`);
    } catch (error: any) {
      Logger.error("[StripeOnboardingController] Lỗi xử lý Return URL:", error);
      res.redirect(
        `${config.clientUrl}/printer/dashboard?tab=account&error=true`
      );
    }
  };
}
