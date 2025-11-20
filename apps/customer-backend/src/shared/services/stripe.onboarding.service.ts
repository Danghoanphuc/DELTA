// apps/customer-backend/src/shared/services/stripe.onboarding.service.ts
// ✅ BẢN VÁ TỔNG THỂ (Lượt 40): Sửa lỗi Type-Safety (TS2693)

import Stripe from "stripe";
import mongoose from "mongoose";
import { config } from "../../config/env.config.js";
import {
  getStripeClient,
  getStripeWebhookSecret,
} from "../../shared/utils/stripe.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { NotFoundException } from "../../shared/exceptions/index.js";
import { Logger } from "../utils/index.js";

// ✅ SỬA LỖI (TS2693):
// Import Hợp đồng (type) StripeAccountStatus và (interface) IPrinterProfile
import {
  StripeAccountStatus, // Đây là Type Alias (File 1)
  IPrinterProfile,
  IPrinterProfileWithUser,
} from "@printz/types";

export class StripeOnboardingService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = getStripeClient();
    this.webhookSecret = getStripeWebhookSecret();
    Logger.info("[StripeOnboardingService] Khởi tạo.");
  }

  // Hàm private: Ép kiểu Mongoose Document sang IPrinterProfile
  private async getPrinter(
    printerProfileId: string
  ): Promise<IPrinterProfileWithUser & mongoose.Document> {
    const printer = (await PrinterProfile.findById(
      printerProfileId
    ).populate("user")) as unknown as IPrinterProfileWithUser & mongoose.Document;
    if (!printer) {
      throw new NotFoundException("Không tìm thấy hồ sơ nhà in.");
    }
    return printer;
  }

  private createOrRetrieveAccount = async (
    printerProfileId: string
  ): Promise<Stripe.Account> => {
    const printer = await this.getPrinter(printerProfileId);

    if (printer.stripeAccountId) {
      try {
        const account = await this.stripe.accounts.retrieve(
          printer.stripeAccountId
        );
        return account;
      } catch (error: any) {
        Logger.warn(
          `[StripeOnboarding] Không thể retrieve Stripe ID ${printer.stripeAccountId}. Tạo ID mới. Lỗi: ${error.message}`
        );
        // (Xóa ID cũ nếu không hợp lệ)
        printer.stripeAccountId = undefined;
        // ✅ SỬA LỖI (TS2693): Dùng string literal (chuỗi)
        printer.stripeAccountStatus = "ONBOARDING_REQUIRED";
        await printer.save();
      }
    }

    // Tạo Account mới
    const account = await this.stripe.accounts.create({
      type: "express",
      country: "VN",
      email: printer.user.email,
      business_type: "individual",
      business_profile: {
        name: printer.businessName,
      },
    });

    printer.stripeAccountId = account.id;
    // ✅ SỬA LỖI (TS2693): Dùng string literal (chuỗi)
    printer.stripeAccountStatus = "ONBOARDING_REQUIRED";
    await printer.save();

    return account;
  };

  public createAccountLink = async (
    printerProfileId: string,
    platform: "desktop" | "mobile"
  ): Promise<Stripe.AccountLink> => {
    const account = await this.createOrRetrieveAccount(printerProfileId);

    const returnUrl = `${config.serverUrl}/api/printer-stripe/onboarding-return`;
    const refreshUrl = `${config.serverUrl}/api/printer-stripe/onboarding-refresh`;

    return this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
      collect: "eventually_due",
    });
  };

  public retrieveAccount = async (
    printerProfileId: string
  ): Promise<Stripe.Account> => {
    const printer = await this.getPrinter(printerProfileId);
    if (!printer.stripeAccountId) {
      throw new NotFoundException("Nhà in chưa liên kết Stripe.");
    }
    return this.stripe.accounts.retrieve(printer.stripeAccountId);
  };

  public handleAccountUpdate = async (
    account: Stripe.Account
  ): Promise<void> => {
    const printer = (await PrinterProfile.findOne({
      stripeAccountId: account.id,
    })) as unknown as IPrinterProfile & mongoose.Document;

    if (!printer) {
      Logger.warn(
        `[StripeWebhook] Nhận update cho Account ${account.id} nhưng không tìm thấy Printer nào. Bỏ qua.`
      );
      return;
    }

    // ✅ SỬA LỖI (TS2693): Dùng string literal (chuỗi)
    let status: StripeAccountStatus = "ONBOARDING_REQUIRED";

    if (account.charges_enabled) {
      status = "ACTIVE";
    } else if (account.requirements?.disabled_reason) {
      status = "RESTRICTED";
    } else if (account.details_submitted) {
      status = "PENDING_VERIFICATION";
    }

    printer.stripeAccountStatus = status;
    await printer.save();

    Logger.info(
      `[StripeWebhook] Cập nhật trạng thái Stripe cho ${printer.businessName} (ID: ${printer._id}) thành: ${status}`
    );
  };
}
