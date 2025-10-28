// src/modules/orders/order.service.js
import { OrderRepository } from "./order.repository.js";
import { ProductRepository } from "../products/product.repository.js";
import { UserRepository } from "../users/user.repository.js";
import { sendNewOrderNotification } from "../../libs/email.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { Order } from "../../shared/models/order.model.js"; // Cần để lấy enum
import mongoose from "mongoose";

export class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
    this.userRepository = new UserRepository();
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
    } = customer;

    if (
      !orderItemsPayload ||
      orderItemsPayload.length === 0 ||
      !shippingAddress
    ) {
      throw new ValidationException("Thiếu thông tin đơn hàng.");
    }

    let subtotal = 0;
    let printerId = null;
    const processedItems = [];

    for (const itemPayload of orderItemsPayload) {
      const product = await this.productRepository.findById(
        itemPayload.productId
      );

      if (!product || !product.printerId) {
        throw new ValidationException(
          `Sản phẩm ${itemPayload.productId} không hợp lệ.`
        );
      }

      if (!printerId) {
        printerId = product.printerId;
      } else if (printerId.toString() !== product.printerId.toString()) {
        throw new ValidationException("Chỉ hỗ trợ đặt hàng từ một nhà in.");
      }

      const itemSubtotal = itemPayload.pricePerUnit * itemPayload.quantity;
      subtotal += itemSubtotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        printerId: product.printerId,
        quantity: itemPayload.quantity,
        pricePerUnit: itemPayload.pricePerUnit,
        specifications: product.specifications,
        customization: itemPayload.customization,
        subtotal: itemSubtotal,
        productSnapshot: {
          images: product.images,
          specifications: product.specifications,
        },
      });
    }

    if (!printerId) {
      throw new ValidationException("Không xác định được nhà in.");
    }

    const shippingFee = 30000; // Hardcode
    const total = subtotal + shippingFee;
    const orderNumber = await this.orderRepository.generateOrderNumber();

    const newOrderData = {
      orderNumber,
      customerId,
      customerName,
      customerEmail,
      printerId,
      items: processedItems,
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

    try {
      const printerUser = await this.userRepository.findById(printerId);
      if (printerUser && printerUser.email) {
        await sendNewOrderNotification(printerUser.email, newOrder, {
          name: customerName,
          email: customerEmail,
        });
      }
    } catch (emailError) {
      console.error(`Lỗi gửi email cho nhà in ${printerId}:`, emailError);
      // Không ném lỗi, chỉ log
    }

    return newOrder;
  }

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

    // (Bạn có thể thêm logic validate chuyển trạng thái ở đây)

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
