// src/modules/checkout/checkout.service.js
// ✅ GĐ 5.R2: Thêm VnPayService

import { Logger } from "../../shared/utils/index.js";
import { getStripeClient } from "../../shared/utils/stripe.js";
import { OrderService } from "../orders/order.service.js";
import { CartService } from "../cart/cart.service.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import { MASTER_ORDER_STATUS, PAYMENT_STATUS } from "@printz/types";
import {
  sendOrderConfirmationEmail,
  sendNewOrderNotification,
} from "../../infrastructure/email/email.service.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

// === Payment Services ===
import { MomoService } from "../..//shared/services/momo.service.js";

export class CheckoutService {
  constructor() {
    this.stripe = getStripeClient();
    this.orderService = new OrderService();
    this.cartService = new CartService();
    this.momoService = new MomoService();
  }

  // --- HÀM CŨ (GĐ 5.4) - GIỮ NGUYÊN ---
  createStripePaymentIntent = async (req) => {
    const user = req.user;
    const { shippingAddress, cartItems } = req.body;

    Logger.debug(
      `[CheckoutSvc] Bắt đầu createStripePaymentIntent cho user: ${user.email}`
    );

    this.#assertShippingAddress(shippingAddress);

    const validation = await this.cartService.validateCheckout(user._id);
    if (!validation.isValid) {
      throw new ValidationException(validation.message);
    }

    const cartSnapshot = await this.cartService.getCart(user._id);
    if (!cartSnapshot || !cartSnapshot.items.length) {
      Logger.warn("[CheckoutSvc] Giỏ hàng rỗng, từ chối tạo PI.");
      throw new ValidationException("Giỏ hàng rỗng.");
    }

    const sanitizedCartItems = this.#mapCartItems(cartSnapshot.items);

    // 1. Tạm tạo MasterOrder (Trạng thái PENDING)
    Logger.debug("[CheckoutSvc] Gọi OrderService.createOrder (pre-create)...");
    const masterOrder = await this.orderService.createOrder(user, {
      ...req.body,
      cartItems: sanitizedCartItems,
    });
    const totalAmount = masterOrder.totalAmount;

    // 2. Tạo PaymentIntent trên Stripe
    // (Stripe tính bằng cent/xu, VNPay cũng vậy)
    const amountInCents = Math.round(totalAmount * 100);

    Logger.debug(
      `[CheckoutSvc] Tạo PaymentIntent với số tiền: ${amountInCents} (cents)`
    );

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "vnd", // (FIXME: Cần xác nhận tiền tệ)
        automatic_payment_methods: { enabled: true },
        metadata: {
          masterOrderId: masterOrder._id.toString(),
          orderNumber: masterOrder.orderNumber,
          customerId: user.customerProfileId
            ? user.customerProfileId.toString()
            : user._id.toString(),
        },
        // (Tạm thời không thu phí tự động, chỉ giữ)
        // application_fee_amount: platformFeeInCents,
        // transfer_group: `M_ORDER_${masterOrder._id.toString()}`,
      });

      // 3. Cập nhật MasterOrder với PaymentIntent ID
      masterOrder.paymentIntentId = paymentIntent.id;
      await masterOrder.save();

      Logger.info(
        `[CheckoutSvc] Tạo PI thành công: ${paymentIntent.id} cho Order: ${masterOrder.orderNumber}`
      );

      // 4. (Xóa giỏ hàng... sau)
      // await this.cartService.clearCart(user.customerProfile);

      return {
        clientSecret: paymentIntent.client_secret,
        masterOrderId: masterOrder._id,
        totalAmount: masterOrder.totalAmount,
      };
    } catch (error) {
      Logger.error(`[CheckoutSvc] Lỗi khi tạo PaymentIntent: ${error.message}`);
      // (Xóa MasterOrder đã tạm tạo nếu lỗi?)
      throw error;
    }
  };

  // --- MoMo create payment URL ---
  createMomoPaymentUrl = async (req) => {
    const user = req.user;
    const { shippingAddress } = req.body;
    // Lấy IP thật từ các header phổ biến qua proxy/tunnel và ép IPv4
    const ipCandidates = [
      req.headers["cf-connecting-ip"],
      (req.headers["x-forwarded-for"] || "").toString().split(",")[0],
      req.headers["x-real-ip"],
      req.ip,
      req.socket?.remoteAddress,
    ];
    const rawIp =
      ipCandidates.find((v) => v && String(v).trim()) || "127.0.0.1";
    const ipv4Match = String(rawIp).match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/);
    const ipAddr = ipv4Match ? ipv4Match[0] : "127.0.0.1";

    Logger.debug(`[CheckoutSvc] Bắt đầu createMomoPaymentUrl cho user: ${user.email}`);

    this.#assertShippingAddress(shippingAddress);

    const validation = await this.cartService.validateCheckout(user._id);
    if (!validation.isValid) {
      throw new ValidationException(validation.message);
    }

    const cartSnapshot = await this.cartService.getCart(user._id);
    if (!cartSnapshot || !cartSnapshot.items.length) {
      Logger.warn("[CheckoutSvc] Giỏ hàng rỗng, từ chối tạo URL MoMo.");
      throw new ValidationException("Giỏ hàng rỗng.");
    }

    const sanitizedCartItems = this.#mapCartItems(cartSnapshot.items);

    // 1. Tạm tạo MasterOrder (Giống hệt Stripe)
    Logger.debug("[CheckoutSvc] Gọi OrderService.createOrder (pre-create)...");
    const masterOrder = await this.orderService.createOrder(user, {
      ...req.body,
      cartItems: sanitizedCartItems,
    });
    const totalAmount = masterOrder.totalAmount; // (VND)

    // 2. Gọi MomoService để tạo URL
    const orderInfo = `Thanh toan don hang ${masterOrder.orderNumber}`;
    const paymentUrl = await this.momoService.createPaymentUrl(
      masterOrder._id.toString(),
      totalAmount,
      ipAddr,
      orderInfo
    );

    // 3. (Lưu lại thông tin giao dịch nếu cần - Tạm thời bỏ qua)
    // MasterOrder đã được tạo là đủ

    Logger.info(`[CheckoutSvc] Tạo MoMo URL thành công cho Order: ${masterOrder.orderNumber}`);

    // 4. (Xóa giỏ hàng... sau)
    // await this.cartService.clearCart(user.customerProfile);

    return {
      paymentUrl: paymentUrl,
      masterOrderId: masterOrder._id,
      totalAmount: masterOrder.totalAmount,
    };
  };

  // --- COD: Tạo đơn và xác nhận đặt hàng thanh toán khi nhận hàng ---
  confirmCodOrder = async (req) => {
    const user = req.user;
    const { shippingAddress } = req.body || {};

    Logger.debug(
      `[CheckoutSvc] Bắt đầu confirmCodOrder cho user: ${user?.email || user?._id}`
    );

    // Validate địa chỉ + giỏ hàng
    this.#assertShippingAddress(shippingAddress);

    const validation = await this.cartService.validateCheckout(user._id);
    if (!validation.isValid) {
      throw new ValidationException(validation.message);
    }

    const cartSnapshot = await this.cartService.getCart(user._id);
    if (!cartSnapshot || !cartSnapshot.items.length) {
      Logger.warn("[CheckoutSvc] Giỏ hàng rỗng, từ chối đặt COD.");
      throw new ValidationException("Giỏ hàng rỗng.");
    }

    const sanitizedCartItems = this.#mapCartItems(cartSnapshot.items);

    // 1) Tạo MasterOrder (pre-create)
    const masterOrder = await this.orderService.createOrder(user, {
      ...req.body,
      cartItems: sanitizedCartItems,
    });

    // 2) Cập nhật trạng thái cho COD: chưa thanh toán nhưng vào xử lý
    masterOrder.paymentStatus = PAYMENT_STATUS.UNPAID;
    masterOrder.status = MASTER_ORDER_STATUS.PROCESSING;
    masterOrder.masterStatus = MASTER_ORDER_STATUS.PROCESSING;
    await masterOrder.save();

    // 3) Xóa giỏ hàng
    try {
      await this.cartService.clearCart(user._id);
    } catch (clearError) {
      Logger.warn(
        `[CheckoutSvc] Không thể xóa giỏ hàng cho user ${user._id}: ${clearError.message}`
      );
    }

    // 4) Gửi email
    try {
      // ✅ Gửi email xác nhận cho Customer
      await sendOrderConfirmationEmail(masterOrder.customerEmail, masterOrder);
      Logger.info(
        `[CheckoutSvc] Đã gửi email xác nhận cho Customer: ${masterOrder.customerEmail}`
      );

      // ✅ Gửi email thông báo cho TỪNG nhà in
      for (const printerOrder of masterOrder.printerOrders) {
        try {
          const printerProfile = await PrinterProfile.findById(
            printerOrder.printerProfileId
          ).populate("user", "email displayName");
          
          if (printerProfile?.user?.email) {
            await sendNewOrderNotification(
              printerProfile.user.email,
              masterOrder.toObject(),
              {
                name: masterOrder.customerName,
                email: masterOrder.customerEmail,
              }
            );
            Logger.info(
              `[CheckoutSvc] Đã gửi email thông báo cho Printer: ${printerProfile.user.email}`
            );
          }
        } catch (emailError) {
          Logger.error(
            `[CheckoutSvc] Lỗi khi gửi email cho Printer ${printerOrder.printerProfileId}:`,
            emailError
          );
        }
      }
    } catch (emailError) {
      Logger.error(
        `[CheckoutSvc] Lỗi khi gửi email cho Order ${masterOrder.orderNumber}:`,
        emailError
      );
    }

    Logger.info(
      `[CheckoutSvc] Đặt hàng COD thành công: ${masterOrder.orderNumber} (UNPAID -> PROCESSING)`
    );

    return {
      masterOrderId: masterOrder._id,
      totalAmount: masterOrder.totalAmount,
    };
  };

  #assertShippingAddress(shippingAddress) {
    if (!shippingAddress) {
      throw new ValidationException("Thiếu thông tin địa chỉ giao hàng.");
    }

    // ✅ Log để debug
    Logger.debug("[CheckoutSvc] ShippingAddress nhận được:", JSON.stringify(shippingAddress));

    const requiredFields = ["recipientName", "phone", "street", "district", "city"];
    const missing = requiredFields.filter(
      (field) => !shippingAddress[field] || shippingAddress[field].toString().trim() === ""
    );

    if (missing.length) {
      Logger.warn(`[CheckoutSvc] Thiếu fields: ${missing.join(", ")}`);
      Logger.warn(`[CheckoutSvc] Dữ liệu nhận được:`, shippingAddress);
      throw new ValidationException(
        `Thiếu thông tin giao hàng: ${missing.join(", ")}.`
      );
    }
  }

  #mapCartItems(cartItems) {
    return cartItems.map((item) => ({
      productId: item.productId.toString(),
      printerProfileId: item.printerProfileId?.toString(),
      quantity: item.quantity,
      selectedPrice: item.selectedPrice,
      customization: item.customization ?? {},
    }));
  }
}
