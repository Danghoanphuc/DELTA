// src/modules/orders/order.repository.js
import { Order } from "../../shared/models/order.model.js";

export class OrderRepository {
  async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const todayStart = new Date(year, date.getMonth(), day);
    const count = await Order.countDocuments({
      createdAt: { $gte: todayStart },
    });
    const orderIndex = (count + 1).toString().padStart(4, "0");
    return `DH-${year}${month}${day}-${orderIndex}`;
  }

  async create(orderData) {
    return await Order.create(orderData);
  }

  async findById(orderId) {
    return await Order.findById(orderId);
  }

  async findByCustomerId(customerId) {
    return await Order.find({ customerId: customerId })
      .populate({ path: "printerId", select: "displayName avatarUrl" })
      .sort({ createdAt: -1 });
  }

  async findByIdForCustomer(orderId) {
    return await Order.findById(orderId).populate({
      path: "printerId",
      select: "displayName avatarUrl",
    });
  }

  async findByPrinterId(printerId, query) {
    const { status, search, sort } = query;
    const filter = { printerId: printerId };

    if (status && status !== "all") {
      const validStatuses = Order.schema.path("status").enumValues;
      if (validStatuses.includes(status)) {
        filter.status = status;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "highest") sortOption = { total: -1 };
    if (sort === "lowest") sortOption = { total: 1 };

    return await Order.find(filter)
      .populate({
        path: "customerId",
        select: "displayName email phone avatarUrl",
      })
      .sort(sortOption);
  }

  async findByIdForPrinter(orderId) {
    return await Order.findById(orderId).populate({
      path: "customerId",
      select: "displayName email phone avatarUrl",
    });
  }

  async save(order) {
    return await order.save();
  }
}
