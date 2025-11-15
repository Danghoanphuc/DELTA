// src/modules/orders/order.service.js
// ✅ GĐ 5.R2: Đại phẫu thuật - Tách lõi Ghi sổ để hỗ trợ Hybrid (Stripe + VNPay)

import { OrderRepository } from "./order.repository.js";
import { productRepository } from "../products/product.repository.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { MasterOrder } from "../../shared/models/master-order.model.js";
import { User } from "../../shared/models/user.model.js";
// import { sendNewOrderNotification } from "../../infrastructure/email/email.service.js";
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import {
  MASTER_ORDER_STATUS,
  PAYMENT_STATUS,
  BalanceLedgerStatus,
  BalanceTransactionType,
} from "@printz/types";
import mongoose from "mongoose";
import { Logger } from "../../shared/utils/index.js";
import { getStripeClient } from "../../shared/utils/stripe.js";
import BalanceLedgerModel from "../../shared/models/balance-ledger.model.js";

// === DỊCH VỤ MỚI ===
import { VnPayService } from "../../shared/services/vnpay.service.js";
import { CartService } from "../cart/cart.service.js";

export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = productRepository;
    this.stripe = getStripeClient();
    this.vnPayService = new VnPayService(); // <-- KHỞI TẠO MỚI
    this.cartService = new CartService();
  }

  // (Hàm getEffectiveCommissionRate giữ nguyên)
  getEffectiveCommissionRate(printer) {
    const now = new Date();
    if (
      printer?.commissionOverride?.rate &&
      (!printer.commissionOverride.expiresAt ||
        printer.commissionOverride.expiresAt > now)
    ) {
      return printer.commissionOverride.rate;
    }
    if (printer?.standardCommissionRate && printer.standardCommissionRate > 0) {
      return printer.standardCommissionRate;
    }
    const STANDARD_COMMISSION_RATE = 0.2; // 20%
    return STANDARD_COMMISSION_RATE;
  }

  // (Hàm createOrder (pre-create) giữ nguyên)
  createOrder = async (user, orderData) => {
    Logger.debug("[OrderSvc] Bắt đầu createOrder (pre-create)...");
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { cartItems, shippingAddress, customerNotes } = orderData;
      if (!cartItems || cartItems.length === 0) {
        throw new ValidationException("Giỏ hàng không được để trống.");
      }

      if (!shippingAddress) {
        throw new ValidationException("Thiếu thông tin địa chỉ giao hàng.");
      }

      const printerGroups = new Map();
      const printerCache = new Map();
      let totalAmount = 0;
      let totalCommission = 0;
      let totalPayout = 0;
      let totalItems = 0;

      for (const item of cartItems) {
        if (!item.productId) {
          throw new ValidationException("Thiếu productId trong giỏ hàng.");
        }

        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          throw new NotFoundException(
            `Sản phẩm ID ${item.productId} không tìm thấy.`
          );
        }

        if (!product.isActive) {
          throw new ValidationException(
            `Sản phẩm ${product.name} đã bị vô hiệu hóa.`
          );
        }

        const printerProfileId = product.printerProfileId;
        if (!printerProfileId) {
          throw new ValidationException(
            `Sản phẩm ${product.name} chưa được gán nhà in hợp lệ.`
          );
        }

        let printerProfile = printerCache.get(printerProfileId.toString());
        if (!printerProfile) {
          printerProfile = await PrinterProfile.findById(printerProfileId);
          if (!printerProfile) {
            throw new ValidationException(
              `Không tìm thấy hồ sơ nhà in cho sản phẩm ${product.name}.`
            );
          }

          if (!printerProfile.isActive) {
            throw new ValidationException(
              `Nhà in ${printerProfile.businessName} đang tạm ngưng hoạt động.`
            );
          }

          printerCache.set(printerProfileId.toString(), printerProfile);
        }

        const selectedPrice = item.selectedPrice || {};
        let unitPrice = selectedPrice.pricePerUnit;

        if (!unitPrice) {
          const tier = product.pricing.find(
            (tier) =>
              item.quantity >= tier.minQuantity &&
              (!tier.maxQuantity || item.quantity <= tier.maxQuantity)
          );
          if (!tier) {
            throw new ValidationException(
              `Không tìm thấy mức giá phù hợp cho ${product.name}.`
            );
          }
          unitPrice = tier.pricePerUnit;
        }

        const subtotal = unitPrice * item.quantity;
        totalItems += item.quantity;

        const groupKey = printerProfileId.toString();
        if (!printerGroups.has(groupKey)) {
          printerGroups.set(groupKey, {
            printerProfile,
            items: [],
            subTotal: 0,
          });
        }

        const orderGroup = printerGroups.get(groupKey);
        orderGroup.items.push({
          productId: product._id,
          productName: product.name,
          thumbnailUrl:
            product.assets?.previewUrl ||
            product.assets?.modelUrl ||
            product.images?.[0] ||
            "",
          quantity: item.quantity,
          unitPrice,
          subtotal,
          designFileUrl: item.customization?.fileUrl,
          options: item.customization || {},
        });
        orderGroup.subTotal += subtotal;
      }

      const printerOrdersData = [];
      for (const [printerId, group] of printerGroups.entries()) {
        const { printerProfile, items, subTotal } = group;
        const commissionRate = this.getEffectiveCommissionRate(printerProfile);
        const commissionFee = Math.round(subTotal * commissionRate);
        const printerPayout = subTotal - commissionFee;
        totalAmount += subTotal;
        totalCommission += commissionFee;
        totalPayout += printerPayout;
        printerOrdersData.push({
          printerProfileId: printerProfile._id,
          printerBusinessName: printerProfile.businessName,
          stripeAccountId: printerProfile.stripeAccountId,
          items,
          printerTotalPrice: subTotal,
          appliedCommissionRate: commissionRate,
          commissionFee,
          printerPayout,
        });
      }

      const masterOrderData = {
        orderNumber: await this.orderRepository.generateOrderNumber(),
        customerId: user._id,
        customerName: user.displayName,
        customerEmail: user.email,
        totalAmount,
        totalItems,
        shippingAddress,
        customerNotes: customerNotes ?? "",
        status: MASTER_ORDER_STATUS.PENDING,
        masterStatus: MASTER_ORDER_STATUS.PENDING_PAYMENT,
        paymentStatus: PAYMENT_STATUS.PENDING,
        printerOrders: printerOrdersData,
        totalPrice: totalAmount,
        totalCommission,
        totalPayout,
      };
      const newMasterOrder = await this.orderRepository.createMasterOrder(
        masterOrderData,
        session
      );
      await session.commitTransaction();
      Logger.info(
        `[OrderSvc] Tạo MasterOrder (Pending) thành công: ${newMasterOrder.orderNumber}`
      );
      return newMasterOrder;
    } catch (error) {
      await session.abortTransaction();
      Logger.error(`[OrderSvc] Lỗi khi tạo (pre-create) MasterOrder:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  };

  // --- HÀM (CŨ) GĐ 5.R1 - ĐƯỢC ĐỔI TÊN ---
  /**
   * Xử lý Webhook TỪ STRIPE
   * @param {object} paymentIntent - Đối tượng PaymentIntent từ Stripe
   */
  handleStripeWebhookPayment = async (paymentIntent) => {
    Logger.debug(
      `[OrderSvc] Bắt đầu handleStripeWebhookPayment cho PI: ${paymentIntent.id}`
    );

    // 1. Tìm MasterOrder
    const order = await this.orderRepository.findMasterOrderByPaymentIntentId(
      paymentIntent.id
    );
    if (!order) {
      throw new NotFoundException(
        `Không tìm thấy MasterOrder cho PaymentIntent: ${paymentIntent.id}. (Webhook)`
      );
    }

    // 2. Kiểm tra Idempotency
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      Logger.warn(
        `[OrderSvc] MasterOrder ${order.orderNumber} (Stripe) đã được thanh toán. Bỏ qua (idempotency).`
      );
      return order;
    }

    // 3. Gọi hàm lõi
    return await this._finalizeOrderAndRecordLedger(order, "STRIPE");
  };

  // --- HÀM MỚI (GĐ 5.R2) ---
  /**
   * Xử lý Webhook (IPN) TỪ VNPAY
   * @param {object} vnpayQuery - Object query (req.query) từ VNPay IPN
   */
  handleVnPayWebhookPayment = async (vnpayQuery) => {
    Logger.debug(
      `[OrderSvc] Bắt đầu handleVnPayWebhookPayment cho TxnRef: ${vnpayQuery.vnp_TxnRef}`
    );

    // 1. Xác thực chữ ký VNPay
    const isValidSignature = this.vnPayService.verifyReturn(vnpayQuery);
    if (!isValidSignature) {
      throw new ValidationException("VNPay IPN: Chữ ký không hợp lệ.");
    }

    const masterOrderId = vnpayQuery.vnp_TxnRef;
    const vnpResponseCode = vnpayQuery.vnp_ResponseCode;

    // 2. Tìm MasterOrder
    const order = await this.orderRepository.findMasterOrderById(masterOrderId);
    if (!order) {
      throw new NotFoundException(
        `Không tìm thấy MasterOrder cho VNPay TxnRef: ${masterOrderId}. (IPN)`
      );
    }

    // 3. Kiểm tra Idempotency
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      Logger.warn(
        `[OrderSvc] MasterOrder ${order.orderNumber} (VNPay) đã được thanh toán. Bỏ qua (idempotency).`
      );
      return { RspCode: "02", Message: "Order already confirmed" }; // Mã VNPay: Đơn đã thanh toán
    }

    // 4. Kiểm tra trạng thái giao dịch VNPay
    if (vnpResponseCode !== "00") {
      // Thanh toán không thành công
      // (TODO: Cập nhật trạng thái 'Failed' cho MasterOrder?)
      Logger.warn(
        `[OrderSvc] VNPay IPN báo thất bại (${vnpResponseCode}) cho Order: ${order.orderNumber}.`
      );
      // Vẫn trả về thành công cho VNPay biết là đã nhận,
      // nhưng không ghi sổ
      return { RspCode: "00", Message: "Confirmed (Failure)" };
    }

    // 5. Giao dịch thành công (00) -> Gọi hàm lõi
    await this._finalizeOrderAndRecordLedger(order, "VNPAY");

    // 6. Trả lời VNPay
    return { RspCode: "00", Message: "Confirm Success" };
  };

  // --- HÀM LÕI (PRIVATE) MỚI (GĐ 5.R2) ---
  /**
   * (PRIVATE) Hàm lõi: Ghi sổ kế toán và Cập nhật trạng thái đơn hàng.
   * Được gọi bởi handleStripe... và handleVnPay...
   * @param {object} order - Document MasterOrder (từ Mongoose)
   * @param {'STRIPE' | 'VNPAY'} paymentGatewayType - Cổng thanh toán
   */
  _finalizeOrderAndRecordLedger = async (order, paymentGatewayType) => {
    Logger.info(
      `[OrderSvc] Bắt đầu _finalizeOrderAndRecordLedger cho Order: ${order.orderNumber} từ ${paymentGatewayType}`
    );

    // 1. Cập nhật trạng thái MasterOrder
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.status = MASTER_ORDER_STATUS.PROCESSING;
    order.masterStatus = MASTER_ORDER_STATUS.PROCESSING;
    order.paidAt = new Date();

    // 2. Logic Ghi Sổ Kế toán (GĐ 5.R1)
    const ledgerEntries = [];
    for (const subOrder of order.printerOrders) {
      const newLedgerEntry = {
        printer: subOrder.printerProfileId,
        masterOrder: order._id,
        subOrder: subOrder._id,
        amount: subOrder.printerPayout ?? 0,
        transactionType: BalanceTransactionType.SALE,
        status: BalanceLedgerStatus.UNPAID,
        paymentGateway: paymentGatewayType,
        notes: `Ghi nợ tự động từ ${paymentGatewayType} cho đơn hàng ${order.orderNumber}.`,
      };
      ledgerEntries.push(newLedgerEntry);

      // (TODO GĐ 6: Cập nhật 'OrderModel' thật)
    }

    // 3. GHI SỔ KẾ TOÁN (Ghi đồng loạt)
    try {
      await BalanceLedgerModel.insertMany(ledgerEntries);
      Logger.info(
        `[Ledger] Ghi sổ thành công cho MasterOrder: ${order._id}. Bút toán: ${ledgerEntries.length}`
      );
    } catch (error) {
      if (error.code === 11000) {
        Logger.warn(
          `[Ledger] Bút toán đã tồn tại cho MasterOrder: ${order._id}. Bỏ qua (idempotency).`
        );
      } else {
        Logger.error(
          `[Ledger] LỖI NGHIÊM TRỌNG khi ghi Sổ cái cho MasterOrder: ${order._id}`,
          error
        );
        throw new Error(`[Ledger] Ghi sổ thất bại: ${error.message}`);
      }
    }

    // 4. Lưu thay đổi của MasterOrder
    await order.save();
    try {
      await this.cartService.clearCart(order.customerId);
    } catch (clearError) {
      Logger.warn(
        `[OrderSvc] Không thể xóa giỏ hàng cho user ${order.customerId}: ${clearError.message}`
      );
    }

    // 5. Gửi email
    // (FIXME: Cần cấu hình email service)
    // await sendNewOrderConfirmation(order.customerEmail, order);
    // (TODO: Gửi email cho TỪNG nhà in)
    Logger.info(
      `[OrderSvc] Hoàn tất xử lý ${paymentGatewayType} cho Order: ${order.orderNumber}`
    );

    return order;
  };

  // --- CÁC HÀM GET (Giữ nguyên) ---
  // (getMyOrders, getOrderById, getPrinterOrders, v.v...)

  getMyOrders = async (customerId) => {
    Logger.debug(`[OrderSvc] Lấy đơn hàng cho Customer: ${customerId}`);
    return await this.orderRepository.findMyMasterOrders(customerId);
  };
  getOrderById = async (customerId, orderId) => {
    Logger.debug(
      `[OrderSvc] Lấy chi tiết đơn hàng ${orderId} cho Customer: ${customerId}`
    );
    const order = await this.orderRepository.findMasterOrderByIdForCustomer(
      orderId,
      customerId
    );
    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng.");
    }
    return order;
  };
  getPrinterOrders = async (printerUserId, queryParams) => {
    Logger.debug(`[OrderSvc] Lấy đơn hàng cho Printer: ${printerUserId}`);
    
    // Lấy printerProfileId từ User
    const user = await User.findById(printerUserId).select("printerProfileId");
    
    if (!user || !user.printerProfileId) {
      throw new NotFoundException(
        "Không tìm thấy hồ sơ nhà in cho người dùng này."
      );
    }
    
    return await this.orderRepository.findOrdersForPrinter(
      user.printerProfileId,
      queryParams
    );
  };
  getPrinterOrderById = async (printerUserId, orderId) => {
    Logger.debug(
      `[OrderSvc] Lấy chi tiết đơn hàng ${orderId} cho Printer: ${printerUserId}`
    );
    
    // Lấy printerProfileId từ User
    const user = await User.findById(printerUserId).select("printerProfileId");
    
    if (!user || !user.printerProfileId) {
      throw new NotFoundException(
        "Không tìm thấy hồ sơ nhà in cho người dùng này."
      );
    }
    
    const order = await this.orderRepository.findOrderByIdForPrinter(
      orderId,
      user.printerProfileId
    );
    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng.");
    }
    return order;
  };
  updateOrderStatusByPrinter = async (printerUserId, orderId, statusUpdate) => {
    Logger.debug(`[OrderSvc] Printer ${printerUserId} cập nhật đơn ${orderId}`);
    const printerProfileId = "TODO";
    throw new Error(
      "Chưa triển khai: updateOrderStatusByPrinter với MasterOrder"
    );
  };
}
