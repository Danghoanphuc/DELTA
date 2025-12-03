import { type Request, type Response, type NextFunction } from "express";
import payos from "../../libs/payos.js";
import { config } from "../../config/env.config.js";
import { Logger } from "../../shared/utils/index.js";
import { MasterOrder } from "../../shared/models/master-order.model.js";
import {
  PAYMENT_STATUS,
  MASTER_ORDER_STATUS,
  SUB_ORDER_STATUS,
} from "@printz/types";
import { CartService } from "../cart/cart.service.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import {
  sendOrderConfirmationEmail,
  sendNewOrderNotification,
} from "../../infrastructure/email/index.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

const cartService = new CartService();

/**
 * Tạo link thanh toán PayOS
 * Flow: Validate cart -> Create order -> Generate PayOS link
 */
export const createPaymentLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    // ✅ Validate user exists (should be guaranteed by protect middleware)
    if (!user) {
      throw new ValidationException("Unauthorized. Please login to continue.");
    }

    const { shippingAddress } = req.body;

    Logger.debug(`[PayOS] Creating payment link for user: ${user.email}`);

    // 1. Validate shipping address
    if (!shippingAddress) {
      throw new ValidationException("Thiếu thông tin địa chỉ giao hàng.");
    }

    const requiredFields = [
      "recipientName",
      "phone",
      "street",
      "district",
      "city",
    ];
    const missing = requiredFields.filter(
      (field) =>
        !shippingAddress[field] ||
        shippingAddress[field].toString().trim() === ""
    );

    if (missing.length) {
      throw new ValidationException(
        `Thiếu thông tin giao hàng: ${missing.join(", ")}.`
      );
    }

    // 2. Validate cart
    const validation = await cartService.validateCheckout(user._id);
    if (!validation.isValid) {
      throw new ValidationException(validation.message);
    }

    const cartSnapshot = await cartService.getCart(user._id);
    if (!cartSnapshot || !cartSnapshot.items.length) {
      throw new ValidationException("Giỏ hàng rỗng.");
    }

    // 3. Map cart items
    const sanitizedCartItems = cartSnapshot.items.map((item: any) => ({
      productId: item.productId.toString(),
      printerProfileId: item.printerProfileId?.toString(),
      quantity: item.quantity,
      selectedPrice: item.selectedPrice,
      customization: item.customization ?? {},
    }));

    // 4. Create order (using OrderService)
    const { OrderService } = await import("../orders/order.service.js");
    const orderService = new OrderService();

    const masterOrder = await orderService.createOrder(user, {
      ...req.body,
      cartItems: sanitizedCartItems,
    });

    Logger.info(
      `[PayOS] Created order ${masterOrder.orderNumber} with orderCode ${masterOrder.orderCode}`
    );

    // 5. Create PayOS payment link
    const YOUR_DOMAIN = config.clientUrl;
    const totalAmount = masterOrder.totalAmount;

    const body = {
      orderCode: masterOrder.orderCode,
      amount: totalAmount,
      description: `DH ${masterOrder.orderNumber}`, // ✅ Rút ngắn để <= 25 ký tự (PayOS limit)
      items: masterOrder.printerOrders.flatMap((po: any) =>
        po.items.map((item: any) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.unitPrice,
        }))
      ),
      returnUrl: `${YOUR_DOMAIN}/checkout/success?orderId=${masterOrder._id}`,
      cancelUrl: `${YOUR_DOMAIN}/checkout/cancel`,
    };

    const paymentLinkData = await payos.paymentRequests.create(body);

    Logger.info(
      `[PayOS] Payment link created for order ${masterOrder.orderNumber}`
    );

    res.status(200).json({
      checkoutUrl: paymentLinkData.checkoutUrl,
      masterOrderId: masterOrder._id,
      orderNumber: masterOrder.orderNumber,
    });
  } catch (error: any) {
    Logger.error("[PayOS] Error creating payment link:", error);
    next(error);
  }
};

/**
 * Xử lý webhook từ PayOS
 * Cập nhật trạng thái đơn hàng và gửi email thông báo
 */
export const handlePayOSWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ FIX: Verify webhook data using correct PayOS SDK v2.0.3 method
    // PayOS webhook returns the verified data directly, not wrapped in { data: ... }
    const webhookData = await payos.webhooks.verify(req.body);

    Logger.info(
      `[PayOS Webhook] Received webhook for orderCode: ${webhookData.orderCode}`
    );

    // Kiểm tra nếu thanh toán thành công
    if (webhookData.desc === "success" || webhookData.code === "00") {
      const orderCode = webhookData.orderCode;

      // Tìm đơn hàng trong DB
      const order = await MasterOrder.findOne({ orderCode: orderCode });

      if (order) {
        Logger.info(
          `✅ [PayOS Webhook] Payment successful for OrderCode: ${orderCode} - Order: ${order.orderNumber}`
        );

        // Cập nhật trạng thái đơn hàng
        if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
          order.paymentStatus = PAYMENT_STATUS.PAID;
          order.masterStatus = MASTER_ORDER_STATUS.PAID_WAITING_FOR_PRINTER;
          order.status = MASTER_ORDER_STATUS.PAID_WAITING_FOR_PRINTER;
          order.paidAt = new Date();
          order.printerOrders?.forEach((printerOrder: any) => {
            if (printerOrder.printerStatus === SUB_ORDER_STATUS.PENDING) {
              printerOrder.printerStatus =
                SUB_ORDER_STATUS.PAID_WAITING_FOR_PRINTER;
            }
          });
          await order.save();

          Logger.info(
            `✅ [PayOS Webhook] Updated order ${order._id} status to PAID`
          );

          // Xóa giỏ hàng
          try {
            await cartService.clearCart(order.customerId);
            Logger.info(
              `✅ [PayOS Webhook] Cleared cart for user ${order.customerId}`
            );
          } catch (clearError) {
            Logger.warn(`[PayOS Webhook] Failed to clear cart:`, clearError);
          }

          // Gửi email xác nhận cho Customer
          try {
            await sendOrderConfirmationEmail(order.customerEmail, order);
            Logger.info(
              `✅ [PayOS Webhook] Sent confirmation email to ${order.customerEmail}`
            );
          } catch (emailError) {
            Logger.error(
              `[PayOS Webhook] Failed to send confirmation email:`,
              emailError
            );
          }

          // Gửi email thông báo cho từng Printer
          for (const printerOrder of order.printerOrders) {
            try {
              const printerProfile = await PrinterProfile.findById(
                printerOrder.printerProfileId
              ).populate("user", "email displayName");

              if (printerProfile?.user?.email) {
                await sendNewOrderNotification(
                  printerProfile.user.email,
                  order.toObject(),
                  {
                    name: order.customerName,
                    email: order.customerEmail,
                  }
                );
                Logger.info(
                  `✅ [PayOS Webhook] Sent notification to printer: ${printerProfile.user.email}`
                );
              }
            } catch (emailError) {
              Logger.error(
                `[PayOS Webhook] Failed to send email to printer ${printerOrder.printerProfileId}:`,
                emailError
              );
            }
          }
        } else {
          Logger.info(
            `ℹ️ [PayOS Webhook] Order ${order._id} was already paid.`
          );
        }
      } else {
        Logger.warn(
          `⚠️ [PayOS Webhook] Order not found with orderCode: ${orderCode}`
        );
      }
    } else {
      Logger.warn(
        `⚠️ [PayOS Webhook] Payment not successful. Code: ${webhookData.code}, Desc: ${webhookData.desc}`
      );
    }

    // Luôn trả về success để PayOS không retry
    res.json({ success: true });
  } catch (error: any) {
    Logger.error("❌ [PayOS Webhook] Error processing webhook:", error);
    // Trả về success=false nhưng status 200 để tránh PayOS spam retry
    res
      .status(200)
      .json({ success: false, message: "Webhook processing failed" });
  }
};
