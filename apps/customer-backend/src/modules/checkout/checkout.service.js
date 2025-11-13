// src/modules/checkout/checkout.service.js
// ✅ GĐ 5.R2: Thêm VnPayService

import { Logger } from "../../shared/utils/index.js";
import { getStripeClient } from "../../shared/utils/stripe.js";
import { OrderService } from "../orders/order.service.js";
import { CartService } from "../cart/cart.service.js";
import {
  ValidationException,
} from "../../shared/exceptions/index.js";

// === IMPORTS MỚI ===
import { VnPayService } from "../../shared/services/vnpay.service.js";

export class CheckoutService {
  constructor() {
    this.stripe = getStripeClient();
    this.orderService = new OrderService();
    this.cartService = new CartService();
    this.vnPayService = new VnPayService(); // <-- KHỞI TẠO MỚI
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

  // --- HÀM MỚI (GĐ 5.R2) ---
  /**
   * Tạo URL thanh toán VNPay
   * @param {object} req - Request object
   */
  createVnPayPaymentUrl = async (req) => {
    const user = req.user;
    const { shippingAddress } = req.body;
    const ipAddr = req.ip;

    Logger.debug(
      `[CheckoutSvc] Bắt đầu createVnPayPaymentUrl cho user: ${user.email}`
    );

    this.#assertShippingAddress(shippingAddress);

    const validation = await this.cartService.validateCheckout(user._id);
    if (!validation.isValid) {
      throw new ValidationException(validation.message);
    }

    const cartSnapshot = await this.cartService.getCart(user._id);
    if (!cartSnapshot || !cartSnapshot.items.length) {
      Logger.warn("[CheckoutSvc] Giỏ hàng rỗng, từ chối tạo URL VNPay.");
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

    // 2. Gọi VnPayService để tạo URL
    const orderInfo = `Thanh toan don hang ${masterOrder.orderNumber}`;

    const paymentUrl = this.vnPayService.createPaymentUrl(
      masterOrder._id.toString(),
      totalAmount,
      ipAddr,
      orderInfo
    );

    // 3. (Lưu lại thông tin giao dịch VNPAY nếu cần - Tạm thời bỏ qua)
    // MasterOrder đã được tạo là đủ

    Logger.info(
      `[CheckoutSvc] Tạo VNPay URL thành công cho Order: ${masterOrder.orderNumber}`
    );

    // 4. (Xóa giỏ hàng... sau)
    // await this.cartService.clearCart(user.customerProfile);

    return {
      paymentUrl: paymentUrl,
      masterOrderId: masterOrder._id,
      totalAmount: masterOrder.totalAmount,
    };
  };

  #assertShippingAddress(shippingAddress) {
    if (!shippingAddress) {
      throw new ValidationException("Thiếu thông tin địa chỉ giao hàng.");
    }

    const requiredFields = ["recipientName", "phone", "street", "district", "city"];
    const missing = requiredFields.filter(
      (field) => !shippingAddress[field] || shippingAddress[field].toString().trim() === ""
    );

    if (missing.length) {
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
