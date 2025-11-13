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

  // (Các hàm findByPrinterId, findByIdForPrinter... cũ sẽ cần
  // được viết lại để query vào mảng lồng ghép, sẽ làm ở GĐ sau)

  async save(order) {
    return await order.save();
  }
}
