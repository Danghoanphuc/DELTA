// src/modules/orders/order.repository.js
// NÂNG CẤP GĐ 5.4: Chuyển sang MasterOrder
import { MasterOrder } from "../../shared/models/master-order.model.js";

export class OrderRepository {
  async generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Chỉ lấy 2 số cuối
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const count = await MasterOrder.countDocuments({
      createdAt: { $gte: todayStart },
    });

    const orderIndex = (count + 1).toString().padStart(4, "0");
    // Prefix 'P' cho PrintZ, theo IOrder
    return `P-${year}${month}${day}-${orderIndex}`;
  }

  async createMasterOrder(orderData, session) {
    const masterOrder = new MasterOrder(orderData);
    if (session) {
      await masterOrder.save({ session });
    } else {
      await masterOrder.save();
    }
    return masterOrder;
  }

  async findMasterOrderById(orderId) {
    return await MasterOrder.findById(orderId);
  }

  async findMasterOrderByPaymentIntentId(paymentIntentId) {
    return await MasterOrder.findOne({ paymentIntentId: paymentIntentId });
  }

  async findMyMasterOrders(customerId) {
    return await MasterOrder.find({ customerId: customerId }).sort({
      createdAt: -1,
    });
  }

  async findMasterOrderByIdForCustomer(orderId, customerId) {
    return await MasterOrder.findOne({
      _id: orderId,
      customerId: customerId,
    });
  }

  /**
   * Lấy danh sách đơn hàng cho Printer từ mảng printerOrders trong MasterOrder
   * @param {string} printerProfileId - ID của nhà in
   * @param {object} queryParams - Các tham số lọc và sắp xếp
   */
  async findOrdersForPrinter(printerProfileId, queryParams) {
    const { status, search, sort = "newest" } = queryParams || {};

    // Tạo query filter
    const filter = {
      "printerOrders.printerProfileId": printerProfileId,
    };

    // Thêm filter theo status nếu có
    if (status && status !== "all") {
      filter["printerOrders.printerStatus"] = status;
    }

    // Thêm filter theo search nếu có
    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search, "i") },
        { customerName: new RegExp(search, "i") },
        { "printerOrders.items.productName": new RegExp(search, "i") },
      ];
    }

    // Sắp xếp
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "highest") {
      sortOption = { "printerOrders.printerTotalPrice": -1 };
    } else if (sort === "lowest") {
      sortOption = { "printerOrders.printerTotalPrice": 1 };
    }

    // Tìm các MasterOrder có printerOrder với printerProfileId này
    const orders = await MasterOrder.find(filter)
      .sort(sortOption)
      .lean();

    // Transform: Lọc và map chỉ lấy printerOrder tương ứng với printerProfileId
    const printerOrders = [];
    for (const masterOrder of orders) {
      const printerOrder = masterOrder.printerOrders.find(
        (po) => po.printerProfileId.toString() === printerProfileId.toString()
      );
      if (printerOrder) {
        // Tạo đối tượng order đơn giản hóa cho frontend
        printerOrders.push({
          _id: printerOrder._id.toString(),
          masterOrderId: masterOrder._id.toString(),
          orderNumber: masterOrder.orderNumber,
          customerName: masterOrder.customerName,
          customerEmail: masterOrder.customerEmail,
          items: printerOrder.items,
          printerTotalPrice: printerOrder.printerTotalPrice,
          printerStatus: printerOrder.printerStatus,
          shippingCode: printerOrder.shippingCode,
          shippedAt: printerOrder.shippedAt,
          completedAt: printerOrder.completedAt,
          createdAt: masterOrder.createdAt,
          updatedAt: masterOrder.updatedAt,
          // Status của master order
          masterStatus: masterOrder.masterStatus,
          paymentStatus: masterOrder.paymentStatus,
          // Shipping address
          shippingAddress: masterOrder.shippingAddress,
        });
      }
    }

    return printerOrders;
  }

  /**
   * Lấy chi tiết 1 đơn hàng cho Printer
   * @param {string} orderId - ID của printerOrder (hoặc masterOrderId)
   * @param {string} printerProfileId - ID của nhà in
   */
  async findOrderByIdForPrinter(orderId, printerProfileId) {
    // Tìm MasterOrder có printerOrder với ID này
    const masterOrder = await MasterOrder.findOne({
      "printerOrders._id": orderId,
      "printerOrders.printerProfileId": printerProfileId,
    });

    if (!masterOrder) {
      return null;
    }

    const printerOrder = masterOrder.printerOrders.find(
      (po) =>
        po._id.toString() === orderId &&
        po.printerProfileId.toString() === printerProfileId.toString()
    );

    if (!printerOrder) {
      return null;
    }

    // Trả về đối tượng tương tự như findOrdersForPrinter
    return {
      _id: printerOrder._id.toString(),
      masterOrderId: masterOrder._id.toString(),
      orderNumber: masterOrder.orderNumber,
      customerName: masterOrder.customerName,
      customerEmail: masterOrder.customerEmail,
      items: printerOrder.items,
      printerTotalPrice: printerOrder.printerTotalPrice,
      printerStatus: printerOrder.printerStatus,
      shippingCode: printerOrder.shippingCode,
      shippedAt: printerOrder.shippedAt,
      completedAt: printerOrder.completedAt,
      createdAt: masterOrder.createdAt,
      updatedAt: masterOrder.updatedAt,
      masterStatus: masterOrder.masterStatus,
      paymentStatus: masterOrder.paymentStatus,
      shippingAddress: masterOrder.shippingAddress,
      customerNotes: masterOrder.customerNotes,
    };
  }

  async save(order) {
    return await order.save();
  }
}
