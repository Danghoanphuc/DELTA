// src/modules/orders/order.repository.js
// NÂNG CẤP GĐ 5.4: Chuyển sang MasterOrder
import { MasterOrder } from "../../shared/models/master-order.model.js";
import mongoose from "mongoose";

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

  /**
   * ✅ FIX: Alias for findMyMasterOrders (for chat tool compatibility)
   * @param {string} customerId - ID của khách hàng
   * @param {object} options - Options như limit, sort
   * @returns {Promise<Array>} Danh sách đơn hàng
   */
  async findByCustomerId(customerId, options = {}) {
    const { limit = 10, sort = "-createdAt" } = options;
    const query = MasterOrder.find({ customerId: customerId });
    
    if (sort) {
      query.sort(sort);
    }
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query.lean();
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
    const {
      status,
      search,
      sort = "newest",
      page = 1,
      limit = 20,
    } = queryParams || {};

    // ✅ FIX: Convert printerProfileId sang ObjectId để đảm bảo query đúng
    const printerProfileObjectId = mongoose.Types.ObjectId.isValid(printerProfileId)
      ? new mongoose.Types.ObjectId(printerProfileId)
      : printerProfileId;

    // Tạo query filter
    const filter = {
      "printerOrders.printerProfileId": printerProfileObjectId,
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

    // ✅ PAGINATION: Tính skip và limit
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Đếm tổng số MasterOrder (trước khi transform)
    const totalMasterOrders = await MasterOrder.countDocuments(filter);

    // Tìm các MasterOrder có printerOrder với printerProfileId này (có pagination)
    const orders = await MasterOrder.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Transform: Lọc và map chỉ lấy printerOrder tương ứng với printerProfileId
    const printerOrders = [];
    for (const masterOrder of orders) {
      // ✅ FIX: So sánh ObjectId đúng cách
      const printerOrder = masterOrder.printerOrders.find((po) => {
        const poId = po.printerProfileId?.toString?.() || po.printerProfileId;
        const searchId = printerProfileObjectId?.toString?.() || printerProfileId?.toString?.();
        return poId === searchId;
      });
      if (printerOrder) {
        // Tạo đối tượng order đơn giản hóa cho frontend
        printerOrders.push({
          _id: masterOrder._id.toString(),  // ✅ FIX: Dùng MasterOrder._id để match với findOrderByIdForPrinter
          masterOrderId: masterOrder._id.toString(),
          printerOrderId: printerOrder._id.toString(),  // ✅ Thêm printerOrderId nếu cần
          orderNumber: masterOrder.orderNumber,
          customerName: masterOrder.customerName,
          customerEmail: masterOrder.customerEmail,
          items: printerOrder.items,
          printerTotalPrice: printerOrder.printerTotalPrice,
          printerStatus: printerOrder.printerStatus,
          // ✅ NEW: Thêm artworkStatus và printerNotes
          artworkStatus: printerOrder.artworkStatus || "pending_upload",
          printerNotes: printerOrder.printerNotes,
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

    // ✅ PAGINATION: Trả về kèm metadata
    return {
      orders: printerOrders,
      page: pageNum,
      limit: limitNum,
      total: totalMasterOrders, // Tổng số MasterOrder (có thể > số printerOrders nếu có nhiều printer trong 1 order)
      totalPages: Math.ceil(totalMasterOrders / limitNum),
    };
  }

  /**
   * Lấy chi tiết 1 đơn hàng cho Printer
   * @param {string} orderId - ID của printerOrder (hoặc masterOrderId)
   * @param {string} printerProfileId - ID của nhà in
   */
  async findOrderByIdForPrinter(orderId, printerProfileId) {
    // ✅ FIX: Validate orderId trước khi xử lý
    if (!orderId || orderId === "undefined" || orderId === "null") {
      console.error("❌ [OrderRepo] findOrderByIdForPrinter - orderId is invalid:", orderId);
      return null;
    }
    
    // ✅ FIX: Convert printerProfileId sang ObjectId để đảm bảo query đúng
    const printerProfileObjectId = mongoose.Types.ObjectId.isValid(printerProfileId)
      ? new mongoose.Types.ObjectId(printerProfileId)
      : printerProfileId;
    
    // ✅ FIX: Validate orderId trước khi convert
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error("❌ [OrderRepo] findOrderByIdForPrinter - orderId is not a valid ObjectId:", orderId);
      return null;
    }
    
    const orderObjectId = new mongoose.Types.ObjectId(orderId);

    // ✅ FIX: Tìm MasterOrder bằng MasterOrder._id (không phải printerOrders._id)
    // Printer cần xem MasterOrder chứa printerOrder của họ
    const masterOrder = await MasterOrder.findOne({
      _id: orderObjectId,  // ✅ Tìm bằng MasterOrder ID!
      "printerOrders.printerProfileId": printerProfileObjectId,
    });

    if (!masterOrder) {
      return null;
    }

    // ✅ FIX: Tìm printerOrder bằng printerProfileId (không dùng orderId nữa vì orderId là MasterOrder._id)
    const printerOrder = masterOrder.printerOrders.find(
      (po) => po.printerProfileId.toString() === printerProfileId.toString()
    );

    if (!printerOrder) {
      console.error("❌ [OrderRepo] Printer order not found for printerProfileId:", printerProfileId);
      return null;
    }

    // ✅ FIX: Transform items để match với Order type (pricePerUnit thay vì unitPrice)
    const transformedItems = (printerOrder.items || []).map((item) => ({
      productId: item.productId?.toString?.() || item.productId || "",
      productName: item.productName || "",
      quantity: item.quantity || 0,
      pricePerUnit: item.unitPrice || item.pricePerUnit || 0, // ✅ Map unitPrice -> pricePerUnit
      subtotal: item.subtotal || 0,
      customization: item.options || item.customization || {},
      productSnapshot: item.thumbnailUrl
        ? { images: [{ url: item.thumbnailUrl }] }
        : undefined,
    }));

    // Trả về đối tượng tương tự như findOrdersForPrinter nhưng format đúng cho frontend
    return {
      _id: printerOrder._id.toString(),
      masterOrderId: masterOrder._id.toString(),
      orderNumber: masterOrder.orderNumber,
      customerId: masterOrder.customerId?.toString?.() || "",
      customerName: masterOrder.customerName,
      customerEmail: masterOrder.customerEmail,
      items: transformedItems, // ✅ Items đã được transform
      // ✅ Map printerStatus -> status, printerTotalPrice -> total
      status: printerOrder.printerStatus || "pending",
      total: printerOrder.printerTotalPrice || 0,
      subtotal: printerOrder.printerTotalPrice || 0,
      shippingFee: 0,
      tax: 0,
      discount: 0,
      // Giữ lại các field gốc để backward compatibility
      printerTotalPrice: printerOrder.printerTotalPrice,
      printerStatus: printerOrder.printerStatus,
      shippingCode: printerOrder.shippingCode,
      shippedAt: printerOrder.shippedAt,
      completedAt: printerOrder.completedAt,
      createdAt: masterOrder.createdAt,
      updatedAt: masterOrder.updatedAt,
      masterStatus: masterOrder.masterStatus,
      paymentStatus: masterOrder.paymentStatus,
      paymentMethod: "cod", // Default
      payment: {
        paidAt: masterOrder.paidAt,
      },
      shippingAddress: masterOrder.shippingAddress,
      customerNotes: masterOrder.customerNotes,
    };
  }

  async save(order) {
    return await order.save();
  }
}
