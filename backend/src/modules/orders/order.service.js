// src/modules/orders/order.service.js (✅ REFACTORED - SỬ DỤNG PRICING UTIL)
import { OrderRepository } from "./order.repository.js";
import { ProductRepository } from "../products/product.repository.js";
import { UserRepository } from "../users/user.repository.js";
// import { DesignRepository } from "../designs/design.repository.js";
import { sendNewOrderNotification } from "../../infrastructure/email/email.service.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { Order } from "../../shared/models/order.model.js";
import mongoose from "mongoose";
import { Logger } from "../../shared/utils/index.js";
// ✅ ĐÍCH 1: Import hàm pricing-util dùng chung
import { findBestPriceTier } from "../../shared/utils/pricing.util.js";

export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
    this.userRepository = new UserRepository();
    // this.designRepository = new DesignRepository();
  }

  // ❌ ĐÍCH 1: GỠ BỎ HÀM "findBestPriceTier" CỤC BỘ Ở ĐÂY
  // (Đã gỡ bỏ)

  /**
   * (Helper tính phí customization - giữ nguyên)
   */
  async calculateCustomizationCost(customization) {
    if (!customization || !customization.customizedDesignId) {
      return 0;
    }
    try {
      // TODO: Logic thực tế
      const decalCount = 5; // Giả lập
      const costPerDecal = 5000;
      return decalCount * costPerDecal;
    } catch (error) {
      Logger.error("Lỗi tính chi phí customization:", error);
      return 0;
    }
  }

  async createOrder(customer, orderData) {
    const {
      items: orderItemsPayload,
      shippingAddress,
      paymentMethod,
      customerNotes,
    } = orderData;

    const {
      _id: customerId,
      displayName: customerName,
      email: customerEmail,
      role: customerRole, // Thông tin từ AI
    } = customer;

    if (
      !orderItemsPayload ||
      orderItemsPayload.length === 0 ||
      !shippingAddress
    ) {
      throw new ValidationException("Thiếu thông tin đơn hàng.");
    }

    // (Giải quyết N+1)
    const productIds = orderItemsPayload.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // (Hỗ trợ Đa nhà in)
    const itemsByPrinter = new Map();

    for (const itemPayload of orderItemsPayload) {
      const product = productMap.get(itemPayload.productId.toString());
      if (!product || !product.printerId) {
        throw new ValidationException(
          `Sản phẩm ${itemPayload.productId} không hợp lệ.`
        );
      }

      // (An toàn giá)
      const { quantity } = itemPayload;

      // ✅ ĐÍCH 1: SỬ DỤNG HÀM TỪ UTIL DÙNG CHUNG
      const priceTier = findBestPriceTier(product.pricing, quantity);

      if (!priceTier) {
        throw new ValidationException(
          `Không tìm thấy bậc giá phù hợp cho sản phẩm ${product.name} với số lượng ${quantity}.`
        );
      }
      const trustedPricePerUnit = priceTier.pricePerUnit;
      const customizationCostPerUnit = await this.calculateCustomizationCost(
        itemPayload.customization
      );
      const finalPricePerUnit = trustedPricePerUnit + customizationCostPerUnit;

      let itemSubtotal = finalPricePerUnit * quantity;

      // (Logic "Phá Silo" - Áp dụng chiết khấu)
      if (customerRole === "business_owner") {
        const discountRate = 0.05; // 5%
        itemSubtotal -= itemSubtotal * discountRate;
        Logger.info(
          `[OrderSvc] Áp dụng chiết khấu 5% (Role: ${customerRole}) cho item ${product.name}.`
        );
      }

      const processedItem = {
        productId: product._id,
        productName: product.name,
        printerId: product.printerId,
        quantity: itemPayload.quantity,
        pricePerUnit: finalPricePerUnit,
        specifications: product.specifications,
        customization: itemPayload.customization,
        subtotal: itemSubtotal,
        productSnapshot: {
          images: product.images,
          specifications: product.specifications,
        },
      };

      // (Phân nhóm nhà in)
      const printerIdStr = product.printerId.toString();
      if (!itemsByPrinter.has(printerIdStr)) {
        itemsByPrinter.set(printerIdStr, []);
      }
      itemsByPrinter.get(printerIdStr).push(processedItem);
    }

    // (Tạo đơn hàng con)
    const createdOrders = [];
    for (const [printerId, printerItems] of itemsByPrinter.entries()) {
      const subtotal = printerItems.reduce(
        (acc, item) => acc + item.subtotal,
        0
      );
      const shippingFee = 30000;
      const total = subtotal + shippingFee;
      const orderNumber = await this.orderRepository.generateOrderNumber();

      const newOrderData = {
        orderNumber,
        customerId,
        customerName,
        customerEmail,
        printerId: new mongoose.Types.ObjectId(printerId),
        items: printerItems,
        shippingAddress,
        payment: {
          method: paymentMethod || "cod",
          status: "pending",
        },
        subtotal,
        shippingFee,
        total,
        status: "pending",
        statusHistory: [
          {
            status: "pending",
            note: "Khách hàng vừa đặt đơn hàng.",
            updatedBy: customerId,
            timestamp: new Date(),
          },
        ],
        customerNotes,
      };

      const newOrder = await this.orderRepository.create(newOrderData);
      createdOrders.push(newOrder);

      // (Gửi email)
      try {
        const printerUser = await this.userRepository.findById(printerId);
        if (printerUser && printerUser.email) {
          await sendNewOrderNotification(printerUser.email, newOrder, {
            name: customerName,
            email: customerEmail,
          });
        }
      } catch (emailError) {
        Logger.error(`Lỗi gửi email cho nhà in ${printerId}:`, emailError);
      }
    }

    return createdOrders;
  }

  // ... (Các hàm getMyOrders, getOrderById, v.v... giữ nguyên)

  async getMyOrders(customerId) {
    return await this.orderRepository.findByCustomerId(customerId);
  }

  async getOrderById(customerId, orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationException("ID đơn hàng không hợp lệ.");
    }
    const order = await this.orderRepository.findByIdForCustomer(orderId);
    if (!order) {
      throw new NotFoundException("Order", orderId);
    }
    if (order.customerId.toString() !== customerId.toString()) {
      throw new ForbiddenException("Bạn không có quyền xem đơn hàng này.");
    }
    return order;
  }

  async getPrinterOrders(printerId, query) {
    return await this.orderRepository.findByPrinterId(printerId, query);
  }

  async getPrinterOrderById(printerId, orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationException("ID đơn hàng không hợp lệ.");
    }
    const order = await this.orderRepository.findByIdForPrinter(orderId);
    if (!order) {
      throw new NotFoundException("Order", orderId);
    }
    if (order.printerId.toString() !== printerId.toString()) {
      throw new ForbiddenException("Bạn không có quyền xem đơn hàng này.");
    }
    return order;
  }

  async updateOrderStatusByPrinter(printerId, orderId, body) {
    const { status: newStatus, note } = body;
    const validStatuses = Order.schema.path("status").enumValues;
    if (!newStatus || !validStatuses.includes(newStatus)) {
      throw new ValidationException("Trạng thái mới không hợp lệ.");
    }

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException("Order", orderId);
    }
    if (order.printerId.toString() !== printerId.toString()) {
      throw new ForbiddenException("Bạn không có quyền cập nhật đơn hàng này.");
    }

    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      note: note || `Nhà in cập nhật trạng thái.`,
      updatedBy: printerId,
      timestamp: new Date(),
    });

    if (newStatus === "completed") {
      order.completedAt = new Date();
      if (order.payment.method === "cod") {
        order.payment.status = "paid";
        order.payment.paidAt = new Date();
      }
    }

    return await this.orderRepository.save(order);
  }
}
