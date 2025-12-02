import { Logger } from "../../shared/utils/index.js";
import { getStripeClient } from "../../shared/utils/stripe.js";
import { OrderService } from "../orders/order.service.js";
import { CartService } from "../cart/cart.service.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import {
  sendOrderConfirmationEmail,
  sendNewOrderNotification,
} from "../../infrastructure/email/email.service.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { MomoService } from "../../infrastructure/payment/momo.client.js";

const MASTER_ORDER_STATUS = {
  PENDING: "pending",
  PENDING_PAYMENT: "pending_payment",
  PAID_WAITING_FOR_PRINTER: "paid_waiting_for_printer",
  PROCESSING: "processing",
  SHIPPING: "shipping",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  UNPAID: "unpaid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export class CheckoutService {
  constructor() {
    this.stripe = getStripeClient();
    this.orderService = new OrderService();
    this.cartService = new CartService();
    this.momoService = new MomoService();
  }

  createStripePaymentIntent = async (req) => {
    const user = req.user;
    const { shippingAddress, cartItems } = req.body;
    Logger.debug(`[CheckoutSvc] Create Stripe PI for user: ${user.email}`);
    this.#assertShippingAddress(shippingAddress);
    const validation = await this.cartService.validateCheckout(user._id);
    if (!validation.isValid) throw new ValidationException(validation.message);
    const cartSnapshot = await this.cartService.getCart(user._id);
    if (!cartSnapshot || !cartSnapshot.items.length)
      throw new ValidationException("Giỏ hàng rỗng.");
    const sanitizedCartItems = this.#mapCartItems(cartSnapshot.items);

    // ✅ Transform shippingAddress to include GPS coordinates
    const transformedAddress = this.#transformShippingAddress(shippingAddress);

    const masterOrder = await this.orderService.createOrder(user, {
      ...req.body,
      shippingAddress: transformedAddress,
      cartItems: sanitizedCartItems,
    });

    const totalAmount = masterOrder.totalAmount;
    const amountInCents = Math.round(totalAmount * 100);
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "vnd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        masterOrderId: masterOrder._id.toString(),
        orderNumber: masterOrder.orderNumber,
        customerId: user.customerProfileId
          ? user.customerProfileId.toString()
          : user._id.toString(),
      },
    });
    masterOrder.paymentIntentId = paymentIntent.id;
    await masterOrder.save();
    return {
      clientSecret: paymentIntent.client_secret,
      masterOrderId: masterOrder._id,
      totalAmount: masterOrder.totalAmount,
    };
  };

  createMomoPaymentUrl = async (req) => {
    /* (Logic MoMo tương tự) */ return {};
  };

  confirmCodOrder = async (req) => {
    const user = req.user;
    const { shippingAddress } = req.body || {};
    this.#assertShippingAddress(shippingAddress);
    const validation = await this.cartService.validateCheckout(user._id);
    if (!validation.isValid) throw new ValidationException(validation.message);
    const cartSnapshot = await this.cartService.getCart(user._id);
    if (!cartSnapshot || !cartSnapshot.items.length)
      throw new ValidationException("Giỏ hàng rỗng.");
    const sanitizedCartItems = this.#mapCartItems(cartSnapshot.items);

    // ✅ Transform shippingAddress to include GPS coordinates
    const transformedAddress = this.#transformShippingAddress(shippingAddress);

    const masterOrder = await this.orderService.createOrder(user, {
      ...req.body,
      shippingAddress: transformedAddress,
      cartItems: sanitizedCartItems,
    });

    masterOrder.paymentStatus = PAYMENT_STATUS.UNPAID;
    masterOrder.status = MASTER_ORDER_STATUS.PROCESSING;
    masterOrder.masterStatus = MASTER_ORDER_STATUS.PROCESSING;
    await masterOrder.save();
    await this.cartService.clearCart(user._id);
    await sendOrderConfirmationEmail(masterOrder.customerEmail, masterOrder);
    return {
      masterOrderId: masterOrder._id,
      totalAmount: masterOrder.totalAmount,
    };
  };

  #assertShippingAddress(shippingAddress) {
    if (!shippingAddress)
      throw new ValidationException("Thiếu địa chỉ giao hàng.");
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

  /**
   * Transform shippingAddress to include GPS coordinates in GeoJSON format
   * @param {Object} shippingAddress - Address from frontend
   * @returns {Object} Transformed address with location field
   */
  #transformShippingAddress(shippingAddress) {
    const transformed = {
      recipientName: shippingAddress.recipientName,
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      ward: shippingAddress.ward,
      district: shippingAddress.district,
      city: shippingAddress.city,
      notes: shippingAddress.notes || "",
    };

    // ✅ Add GPS coordinates if available (from Goong.io detection)
    if (shippingAddress.coordinates) {
      const { lat, lng } = shippingAddress.coordinates;
      if (lat && lng) {
        transformed.location = {
          type: "Point",
          coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
        };
        Logger.info(
          `[CheckoutSvc] 📍 GPS coordinates saved: [${lng}, ${lat}] for ${shippingAddress.city}`
        );
      }
    }

    return transformed;
  }
}
