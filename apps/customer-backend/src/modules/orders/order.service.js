// src/modules/orders/order.service.js
// ✅ GĐ 5.R2: Đại phẫu thuật - Tách lõi Ghi sổ để hỗ trợ nhiều cổng (Stripe + MoMo)

import crypto from "crypto";
import { OrderRepository } from "./order.repository.js";
import { productRepository } from "../products/product.repository.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { MasterOrder } from "../../shared/models/master-order.model.js";
import { User } from "../../shared/models/user.model.js";
import {
  sendNewOrderNotification,
  sendOrderConfirmationEmail,
} from "../../infrastructure/email/email.service.js";
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import {
  MASTER_ORDER_STATUS,
  PAYMENT_STATUS,
  SUB_ORDER_STATUS,
  BalanceLedgerStatus,
  BalanceTransactionType,
} from "@printz/types";
import mongoose from "mongoose";
import { Logger } from "../../shared/utils/index.js";
import { getStripeClient } from "../../shared/utils/stripe.js";
import BalanceLedgerModel from "../../shared/models/balance-ledger.model.js";
import { getRedisClient } from "../../infrastructure/cache/redis.js";

// === DỊCH VỤ MỚI ===
import { CartService } from "../cart/cart.service.js";

const ORDER_LOCK_KEY_PREFIX = "order_lock:";
const ORDER_LOCK_TTL_SECONDS = 10;

export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = productRepository;
    this.stripe = getStripeClient();
    this.cartService = new CartService();
    this.redis = getRedisClient();
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

        // === Atomic stock reservation ===
        const reservedProduct = await this.productRepository.reserveStock(
          product._id,
          item.quantity,
          session
        );
        if (!reservedProduct) {
          throw new ValidationException(
            `Sản phẩm ${product.name} vừa hết hàng hoặc không đủ số lượng.`
          );
        }

        const groupKey = printerProfileId.toString();
        if (!printerGroups.has(groupKey)) {
          printerGroups.set(groupKey, {
            printerProfile,
            items: [],
            subTotal: 0,
          });
        }

        const orderGroup = printerGroups.get(groupKey);
        // Prefer primary image if available
        const primaryImageUrl =
          (Array.isArray(product.images)
            ? product.images.find((img) => img?.isPrimary)?.url
            : undefined) || product.images?.[0]?.url || "";

        orderGroup.items.push({
          productId: product._id,
          productName: product.name,
          // Always prefer real product image; avoid using modelUrl (non-image)
          thumbnailUrl: primaryImageUrl || product.assets?.previewUrl || "",
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

      // ✅ RUSH ORDER: Lấy rush order fields từ orderData nếu có
      const isRushOrder = orderData.isRushOrder || false;
      const rushFeeAmount = orderData.rushFeeAmount || 0;
      const requiredDeadline = orderData.requiredDeadline || null;

      const masterOrderData = {
        orderNumber: await this.orderRepository.generateOrderNumber(),
        // --- PayOS Integration ---
        orderCode: Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000)),
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
        totalPrice: totalAmount + rushFeeAmount, // ✅ RUSH: Tổng giá bao gồm rush fee
        totalCommission,
        totalPayout,
        // ✅ RUSH ORDER FIELDS
        isRushOrder,
        rushFeeAmount,
        requiredDeadline,
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

  async _acquireOrderLock(orderId) {
    if (!orderId) {
      return { acquired: true };
    }

    if (!this.redis || this.redis.status !== "ready") {
      this.redis = getRedisClient();
    }

    if (!this.redis || this.redis.status !== "ready") {
      Logger.warn(
        `[OrderSvc] Redis lock không khả dụng, tiếp tục không khóa cho order ${orderId}.`
      );
      return { acquired: true };
    }

    const lockKey = `${ORDER_LOCK_KEY_PREFIX}${orderId.toString()}`;
    const lockToken = crypto.randomUUID();

    try {
      const result = await this.redis.set(
        lockKey,
        lockToken,
        "NX",
        "EX",
        ORDER_LOCK_TTL_SECONDS
      );
      return {
        acquired: result === "OK",
        lockKey,
        lockToken,
      };
    } catch (error) {
      Logger.error(
        `[OrderSvc] Không thể tạo lock Redis cho order ${orderId}:`,
        error
      );
      return { acquired: true };
    }
  }

  async _releaseOrderLock(lock) {
    if (!lock || !lock.lockKey || !lock.lockToken) {
      return;
    }
    if (!this.redis || this.redis.status !== "ready") {
      this.redis = getRedisClient();
    }
    if (!this.redis || this.redis.status !== "ready") {
      Logger.warn(
        `[OrderSvc] Redis lock không khả dụng để giải phóng ${lock.lockKey}.`
      );
      return;
    }
    try {
      const releaseScript =
        'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end';
      await this.redis.eval(
        releaseScript,
        1,
        lock.lockKey,
        lock.lockToken
      );
    } catch (error) {
      Logger.error(
        `[OrderSvc] Không thể giải phóng lock Redis ${lock.lockKey}:`,
        error
      );
    }
  }

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

    const lock = await this._acquireOrderLock(order._id);
    if (!lock.acquired) {
      Logger.warn(
        `[OrderSvc] Stripe webhook bị từ chối do lock đang tồn tại cho order ${order.orderNumber}.`
      );
      return order;
    }

    try {
      // 2. Kiểm tra Idempotency
      if (order.paymentStatus === PAYMENT_STATUS.PAID) {
        Logger.warn(
          `[OrderSvc] MasterOrder ${order.orderNumber} (Stripe) đã được thanh toán. Bỏ qua (idempotency).`
        );
        return order;
      }

      // 3. Gọi hàm lõi
      return await this._finalizeOrderAndRecordLedger(order, "STRIPE");
    } finally {
      await this._releaseOrderLock(lock);
    }
  };

  // --- HÀM MỚI: xử lý webhook từ MoMo ---
  /**
   * @param {object} payload - req.body từ MoMo IPN
   */
  handleMomoWebhookPayment = async (payload) => {
    const masterOrderId = String(payload.orderId || "");
    const resultCode = String(payload.resultCode ?? "");
    Logger.debug(`[OrderSvc] handleMomoWebhookPayment orderId=${masterOrderId} code=${resultCode}`);

    if (!masterOrderId) {
      throw new ValidationException("MoMo IPN: thiếu orderId");
    }

    const order = await this.maybeFindOrder(masterOrderId);
    if (!order) {
      throw new NotFoundException(`Không tìm thấy MasterOrder: ${masterOrderId}`);
    }

    const lock = await this._acquireOrderLock(order._id);
    if (!lock.acquired) {
      Logger.warn(
        `[OrderSvc] MoMo webhook bị từ chối do lock đang tồn tại cho order ${order.orderNumber}.`
      );
      return { resultCode: 0, message: "Order is being finalized" };
    }

    try {
      if (order.paymentStatus === PAYMENT_STATUS.PAID) {
        Logger.warn(
          `[OrderSvc] MasterOrder ${order.orderNumber} (MOMO) đã được thanh toán. Bỏ qua.`
        );
        return { resultCode: 0, message: "Order already confirmed" };
      }

      if (resultCode !== "0") {
        Logger.warn(
          `[OrderSvc] MoMo IPN thất bại (code=${resultCode}) cho ${order.orderNumber}`
        );
        return { resultCode: 0, message: "Received" };
      }

      await this._finalizeOrderAndRecordLedger(order, "MOMO");
      return { resultCode: 0, message: "Success" };
    } finally {
      await this._releaseOrderLock(lock);
    }
  };

  // helper for backward compat
  maybeFindOrder = async (id) => {
    return await this.orderRepository.findMasterOrderById(id);
  };

  /**
   * Restore inventory for every product referenced by the given master order.
   * Should be called inside the same transaction that marks a payment as failed/cancelled.
   */
  restoreStockForOrder = async (order, session) => {
    if (!order || !order.printerOrders || order.printerOrders.length === 0) {
      return;
    }

    const quantityMap = new Map();
    for (const printerOrder of order.printerOrders) {
      for (const item of printerOrder.items || []) {
        if (!item?.productId || !item?.quantity) continue;
        const key = item.productId.toString();
        quantityMap.set(key, (quantityMap.get(key) || 0) + item.quantity);
      }
    }

    if (quantityMap.size === 0) {
      return;
    }

    await Promise.all(
      [...quantityMap.entries()].map(([productId, qty]) =>
        this.productRepository.restoreStock(productId, qty, session)
      )
    );
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Cập nhật trạng thái MasterOrder
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.status = MASTER_ORDER_STATUS.PAID_WAITING_FOR_PRINTER;
      order.masterStatus = MASTER_ORDER_STATUS.PAID_WAITING_FOR_PRINTER;
      order.paidAt = new Date();

      // ✅ FIX: Cập nhật trạng thái SubOrders (PrinterOrders)
      // Map "Processing" của hệ thống -> SUB_ORDER_STATUS.CONFIRMED
      if (order.printerOrders && order.printerOrders.length > 0) {
        order.printerOrders.forEach((po) => {
          if (po.printerStatus === SUB_ORDER_STATUS.PENDING) {
            po.printerStatus = SUB_ORDER_STATUS.PAID_WAITING_FOR_PRINTER;
          }
        });
      }

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
      }

      // 3. GHI SỔ KẾ TOÁN (Ghi đồng loạt)
      // ✅ FIX: Sử dụng session transaction
      await BalanceLedgerModel.insertMany(ledgerEntries, { session });
      Logger.info(
        `[Ledger] Ghi sổ thành công cho MasterOrder: ${order._id}. Bút toán: ${ledgerEntries.length}`
      );

      // 4. Lưu thay đổi của MasterOrder
      // ✅ FIX: Sử dụng session transaction
      await order.save({ session });
      
      // Commit transaction
      await session.commitTransaction();
      
    } catch (error) {
      await session.abortTransaction();
      
      if (error.code === 11000) {
        Logger.warn(
          `[Ledger] Bút toán đã tồn tại cho MasterOrder: ${order._id}. Bỏ qua (idempotency).`
        );
        // Nếu lỗi do duplicate key (đã xử lý), ta có thể coi là thành công hoặc bỏ qua
        // Tuy nhiên vì đã abort transaction, order update cũng bị rollback.
        // Trong trường hợp này, giả sử là retry, ta cần check trạng thái ở đầu hàm webhook.
        // Nếu rơi vào đây nghĩa là race condition cực gắt.
      } else {
        Logger.error(
          `[Ledger] LỖI NGHIÊM TRỌNG khi ghi Sổ cái cho MasterOrder: ${order._id}`,
          error
        );
        throw new Error(`[Ledger] Ghi sổ thất bại: ${error.message}`);
      }
    } finally {
      session.endSession();
    }

    // 5. Xử lý Side-effects (Không nằm trong transaction DB)
    try {
      await this.cartService.clearCart(order.customerId);
    } catch (clearError) {
      Logger.warn(
        `[OrderSvc] Không thể xóa giỏ hàng cho user ${order.customerId}: ${clearError.message}`
      );
    }

    // 6. Gửi email
    try {
      // ✅ Gửi email xác nhận cho Customer
      await sendOrderConfirmationEmail(order.customerEmail, order);
      Logger.info(
        `[OrderSvc] Đã gửi email xác nhận cho Customer: ${order.customerEmail}`
      );

      // ✅ Gửi email thông báo cho TỪNG nhà in
      for (const printerOrder of order.printerOrders) {
        try {
          // Lấy email của Printer từ User model
          const printerProfile = await PrinterProfile.findById(
            printerOrder.printerProfileId
          ).populate("user", "email displayName");
          
          if (printerProfile?.user?.email) {
            // ✅ FIX: Tạo order object cho email (CHỈ chứa thông tin của printer này)
            const printerOrderForEmail = {
              ...printerOrder.toObject(),
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              shippingAddress: order.shippingAddress,
              customerNotes: order.customerNotes,
              paymentStatus: order.paymentStatus,
              createdAt: order.createdAt,
              printerProfileId: printerOrder.printerProfileId,
            };

            // ✅ FIX: Gửi PRINTERORDERFOREMAIL, không phải toàn bộ order!
            await sendNewOrderNotification(
              printerProfile.user.email,
              printerOrderForEmail,  // ✅ Chỉ gửi items của printer này!
              {
                name: order.customerName,
                email: order.customerEmail,
              }
            );
            Logger.info(
              `[OrderSvc] Đã gửi email thông báo cho Printer: ${printerProfile.user.email}`
            );
          } else {
            Logger.warn(
              `[OrderSvc] Không tìm thấy email cho Printer: ${printerOrder.printerProfileId}`
            );
          }
        } catch (emailError) {
          Logger.error(
            `[OrderSvc] Lỗi khi gửi email cho Printer ${printerOrder.printerProfileId}:`,
            emailError
          );
          // Không throw error để không ảnh hưởng đến flow chính
        }
      }
    } catch (emailError) {
      Logger.error(
        `[OrderSvc] Lỗi khi gửi email cho Order ${order.orderNumber}:`,
        emailError
      );
      // Không throw error để không ảnh hưởng đến flow chính
    }

    Logger.info(
      `[OrderSvc] Hoàn tất xử lý ${paymentGatewayType} cho Order: ${order.orderNumber}`
    );

    return order;
  };

  // --- CÁC HÀM GET (Giữ nguyên) ---
  // (getMyOrders, getOrderById, getPrinterOrders, v.v...)

  getMyOrders = async (customerId) => {
    Logger.debug(`[OrderSvc] Lấy đơn hàng cho Customer: ${customerId}`);
    const masterOrders = await this.orderRepository.findMyMasterOrders(customerId);

    const normalizeImageUrl = (url) => {
      if (!url || typeof url !== "string") return "";
      // Convert Cloudinary raw to image if possible
      return url.includes("/raw/upload/")
        ? url.replace("/raw/upload/", "/image/upload/")
        : url;
    };

    // Helper: detect non-image cloudinary paths (e.g., 3d-models)
    const looksLikeNonImage = (url) => {
      if (!url) return true;
      const lower = url.toLowerCase();
      // Heuristic: known 3d-models folder or missing common image extensions
      if (lower.includes("/3d-models/")) return true;
      return !/\.(png|jpe?g|webp|gif|svg)(\?|$)/.test(lower);
    };

    // Chuẩn hóa dữ liệu để frontend CustomerOrdersPage hiển thị đúng
    // - Map masterStatus -> status
    // - Gộp items từ tất cả printerOrders thành mảng items phẳng
    // - Giữ lại các trường cần thiết (orderNumber, totalAmount, paymentStatus, etc.)
    return masterOrders.map((mo) => {
      const flatItems =
        (mo.printerOrders || []).flatMap((po) =>
          (po.items || []).map((it) => ({
            productId: it.productId?.toString?.() || "",
            productName: it.productName,
            quantity: it.quantity,
            pricePerUnit: it.unitPrice,
            subtotal: it.subtotal,
            imageUrl: normalizeImageUrl(it.thumbnailUrl || ""),
            // thêm thumbnail nếu có
            productSnapshot: {
              images: it.thumbnailUrl ? [{ url: normalizeImageUrl(it.thumbnailUrl) }] : [],
            },
          }))
        ) || [];

      // ✅ NEW: Get printer info
      let printerInfo = null;
      if (mo.printerOrders && mo.printerOrders.length > 0) {
        const firstPrinterOrder = mo.printerOrders[0];
        if (firstPrinterOrder.printerBusinessName) {
          printerInfo = {
            _id: firstPrinterOrder.printerProfileId?.toString?.() || "",
            displayName: firstPrinterOrder.printerBusinessName || "Nhà in",
          };
        }
      }

      // ✅ FIX: Determine payment method based on order data
      let paymentMethod = "cod"; // default
      if (mo.paymentIntentId) {
        // Has Stripe PaymentIntent → Stripe
        paymentMethod = "stripe";
      } else if (mo.paymentStatus === PAYMENT_STATUS.UNPAID) {
        // No paymentIntentId + UNPAID → COD
        paymentMethod = "cod";
      } else {
        // No paymentIntentId + (PENDING or PAID) → PayOS
        paymentMethod = "payos";
      }

      return {
        _id: mo._id.toString(),
        orderNumber: mo.orderNumber,
        customerId: mo.customerId?.toString?.() || "",
        customerName: mo.customerName,
        customerEmail: mo.customerEmail,
        items: flatItems,
        shippingAddress: mo.shippingAddress,
        // Tổng tiền hiển thị
        total: mo.totalAmount,
        subtotal: mo.totalAmount, // hiện chưa tách phí ship/tax
        shippingFee: 0,
        tax: 0,
        discount: 0,
        // Map trạng thái
        status: mo.masterStatus, // FE dùng order.status
        paymentStatus: mo.paymentStatus,
        paymentMethod: paymentMethod, // ✅ FIX: Dynamic payment method
        payment: {
          paidAt: mo.paidAt,
        },
        customerNotes: mo.customerNotes,
        printerId: printerInfo, // ✅ NEW: Add printer info
        createdAt: mo.createdAt,
        updatedAt: mo.updatedAt,
      };
    });
  };
  getOrderById = async (customerId, orderId) => {
    Logger.debug(
      `[OrderSvc] Lấy chi tiết đơn hàng ${orderId} cho Customer: ${customerId}`
    );
    const mo = await this.orderRepository.findMasterOrderByIdForCustomer(
      orderId,
      customerId
    );
    if (!mo) {
      throw new NotFoundException("Không tìm thấy đơn hàng.");
    }

    const normalizeImageUrl = (url) => {
      if (!url || typeof url !== "string") return "";
      return url.includes("/raw/upload/")
        ? url.replace("/raw/upload/", "/image/upload/")
        : url;
    };

    // Chuẩn hóa giống getMyOrders
    const flatItems =
      (mo.printerOrders || []).flatMap((po) =>
        (po.items || []).map((it) => ({
          productId: it.productId?.toString?.() || "",
          productName: it.productName,
          quantity: it.quantity,
          pricePerUnit: it.unitPrice,
          subtotal: it.subtotal,
          imageUrl: normalizeImageUrl(it.thumbnailUrl || ""),
          productSnapshot: {
            images: it.thumbnailUrl ? [{ url: normalizeImageUrl(it.thumbnailUrl) }] : [],
          },
        }))
      ) || [];

    // Fallback: If any item has missing/non-image URL, try fetch product primary image
    const needsFallback = flatItems.some(
      (it) => !it.imageUrl || it.imageUrl.toLowerCase().includes("/3d-models/")
    );
    if (needsFallback) {
      const uniqueIds = [
        ...new Set(flatItems.map((it) => it.productId).filter(Boolean)),
      ];
      const idToPrimaryUrl = new Map();
      for (const pid of uniqueIds) {
        try {
          const p = await this.productRepository.findOne({ _id: pid });
          const primary =
            (Array.isArray(p?.images)
              ? p.images.find((img) => img?.isPrimary)?.url
              : undefined) || p?.images?.[0]?.url;
          if (primary) idToPrimaryUrl.set(pid, normalizeImageUrl(primary));
        } catch {}
      }
      for (const it of flatItems) {
        const fallbackUrl = idToPrimaryUrl.get(it.productId);
        if (fallbackUrl && (!it.imageUrl || it.imageUrl.toLowerCase().includes("/3d-models/"))) {
          it.imageUrl = fallbackUrl;
          it.productSnapshot = { images: [{ url: fallbackUrl }] };
        }
      }
    }

    // ✅ NEW: Get printer info from printerOrders
    let printerInfo = null;
    if (mo.printerOrders && mo.printerOrders.length > 0) {
      // If single printer, get full info
      const firstPrinterOrder = mo.printerOrders[0];
      if (firstPrinterOrder.printerBusinessName) {
        printerInfo = {
          _id: firstPrinterOrder.printerProfileId?.toString?.() || "",
          displayName: firstPrinterOrder.printerBusinessName || "Nhà in",
        };
      }
    }

      // ✅ FIX: Determine payment method based on order data
      let paymentMethod = "cod"; // default
      if (mo.paymentIntentId) {
        // Has Stripe PaymentIntent → Stripe
        paymentMethod = "stripe";
      } else if (mo.paymentStatus === PAYMENT_STATUS.UNPAID) {
        // No paymentIntentId + UNPAID → COD
        paymentMethod = "cod";
      } else {
        // No paymentIntentId + (PENDING or PAID) → PayOS
        paymentMethod = "payos";
      }

      return {
        _id: mo._id.toString(),
        orderNumber: mo.orderNumber,
        customerId: mo.customerId?.toString?.() || "",
        customerName: mo.customerName,
        customerEmail: mo.customerEmail,
        items: flatItems,
        shippingAddress: mo.shippingAddress,
        total: mo.totalAmount,
        subtotal: mo.totalAmount,
        shippingFee: 0,
        tax: 0,
        discount: 0,
        status: mo.masterStatus,
        paymentStatus: mo.paymentStatus,
        paymentMethod: paymentMethod, // ✅ FIX: Dynamic payment method
        payment: { paidAt: mo.paidAt },
        customerNotes: mo.customerNotes,
        printerId: printerInfo, // ✅ NEW: Add printer info
        createdAt: mo.createdAt,
        updatedAt: mo.updatedAt,
      };
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
    
    // ✅ PAGINATION: Repository trả về object có orders, page, totalPages
    const result = await this.orderRepository.findOrdersForPrinter(
      user.printerProfileId,
      queryParams
    );
    
    return result;
  };
  getPrinterOrderById = async (printerUserId, orderId) => {
    // ✅ FIX: Validate orderId trước khi xử lý
    if (!orderId || orderId === "undefined" || orderId === "null") {
      Logger.error(`[OrderSvc] getPrinterOrderById - Invalid orderId: ${orderId}`);
      throw new NotFoundException("Order ID không hợp lệ.");
    }
    
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
    
    // 1. Lấy printerProfileId từ User
    const user = await User.findById(printerUserId).select("printerProfileId");
    if (!user || !user.printerProfileId) {
      throw new NotFoundException("Không tìm thấy hồ sơ nhà in.");
    }
    
    const printerProfileId = user.printerProfileId;
    
    // 2. Validate orderId
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationException("Order ID không hợp lệ.");
    }
    
    // 3. Tìm MasterOrder
    const masterOrder = await MasterOrder.findOne({
      _id: orderId,
      "printerOrders.printerProfileId": printerProfileId,
    });
    
    if (!masterOrder) {
      throw new NotFoundException("Không tìm thấy đơn hàng.");
    }
    
    // 4. Tìm printerOrder tương ứng
    const printerOrder = masterOrder.printerOrders.find(
      (po) => po.printerProfileId.toString() === printerProfileId.toString()
    );
    
    if (!printerOrder) {
      throw new NotFoundException("Không tìm thấy đơn hàng của bạn.");
    }
    
    // 5. Update printerStatus with State Machine Check
    const { status } = statusUpdate;
    if (!status) {
      throw new ValidationException("Thiếu thông tin status để cập nhật.");
    }

    // ✅ FIX: State Machine Validation
    const currentStatus = printerOrder.printerStatus;
    
    // Map các chuyển đổi hợp lệ
    const VALID_TRANSITIONS = {
      [SUB_ORDER_STATUS.PENDING]: [
        SUB_ORDER_STATUS.PAID_WAITING_FOR_PRINTER,
        SUB_ORDER_STATUS.CONFIRMED,
        SUB_ORDER_STATUS.CANCELLED,
      ],
      [SUB_ORDER_STATUS.PAID_WAITING_FOR_PRINTER]: [
        SUB_ORDER_STATUS.CONFIRMED,
        SUB_ORDER_STATUS.CANCELLED,
      ],
      [SUB_ORDER_STATUS.CONFIRMED]: [SUB_ORDER_STATUS.PRINTING, SUB_ORDER_STATUS.SHIPPING],
      [SUB_ORDER_STATUS.DESIGNING]: [SUB_ORDER_STATUS.PRINTING, SUB_ORDER_STATUS.READY],
      [SUB_ORDER_STATUS.PRINTING]: [SUB_ORDER_STATUS.READY, SUB_ORDER_STATUS.SHIPPING],
      [SUB_ORDER_STATUS.READY]: [SUB_ORDER_STATUS.SHIPPING],
      [SUB_ORDER_STATUS.SHIPPING]: [SUB_ORDER_STATUS.COMPLETED],
      [SUB_ORDER_STATUS.COMPLETED]: [], // Terminal
      [SUB_ORDER_STATUS.CANCELLED]: [], // Terminal
    };

    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
    
    // Allow same status update (idempotency) or valid transition
    if (status !== currentStatus && !allowedTransitions.includes(status)) {
       throw new ValidationException(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${status}.`
      );
    }

    printerOrder.printerStatus = status;
    Logger.info(`[OrderSvc] Updated printerOrder status to: ${status}`);
    
    // 6. Update timestamps nếu cần
    if (status === SUB_ORDER_STATUS.SHIPPING) {
      printerOrder.shippedAt = new Date();
    } else if (status === SUB_ORDER_STATUS.COMPLETED) {
      printerOrder.completedAt = new Date();
    }
    
    // 7. Update masterStatus nếu TẤT CẢ printerOrders cùng status
    const allStatuses = masterOrder.printerOrders.map(po => po.printerStatus);
    const allSameStatus = allStatuses.every(s => s === status);
    
    if (allSameStatus) {
      // Map SUB_ORDER_STATUS back to MASTER_ORDER_STATUS if needed
      // Assuming they share common values like 'shipping', 'completed'
      masterOrder.masterStatus = status;
      masterOrder.status = status;
      Logger.info(`[OrderSvc] Updated masterOrder status to: ${status}`);
    }
    
    // 8. Save
    await masterOrder.save();
    
    Logger.info(
      `[OrderSvc] Printer ${printerUserId} đã cập nhật đơn ${orderId} thành công`
    );
    
    // 9. Return formatted order
    return {
      _id: masterOrder._id.toString(),
      orderNumber: masterOrder.orderNumber,
      printerStatus: printerOrder.printerStatus,
      masterStatus: masterOrder.masterStatus,
      updatedAt: masterOrder.updatedAt,
    };
  };
}
