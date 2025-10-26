// backend/src/controllers/orderController.js (ĐÃ SỬA LỖI)
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private (Chỉ Customer)
export const createOrder = async (req, res) => {
  try {
    const customerId = req.user._id;

    // 1. Lấy thông tin từ body
    const { printerId, items, shippingAddress, paymentMethod } = req.body;

    if (!printerId || !items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng." });
    }

    // 2. Tính toán tổng tiền (ví dụ đơn giản)
    let subtotal = 0;
    for (const item of items) {
      // (Trong tương lai, chúng ta nên xác thực giá bằng cách truy vấn Product.findById(item.productId))
      subtotal += item.pricePerUnit * item.quantity;
    }

    const shippingFee = 30000; // Tạm thời
    const total = subtotal + shippingFee;

    // 3. Tạo đơn hàng
    const newOrder = await Order.create({
      customerId,
      printerId,
      items,
      shippingAddress,
      payment: {
        method: paymentMethod || "cod",
        status: "pending",
      },
      subtotal,
      shippingFee,
      total,
      status: "pending", // Trạng thái đầu tiên
      statusHistory: [
        {
          status: "pending",
          note: "Khách hàng vừa đặt đơn hàng.",
          updatedBy: customerId,
        },
      ],
    });

    console.log(`✅ Đơn hàng mới được tạo: ${newOrder._id}`);

    res.status(201).json({
      message: "Đặt hàng thành công!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo đơn hàng." });
  }
};

// @desc    Lấy đơn hàng của TÔI (Customer)
// @route   GET /api/orders/my-orders
// @access  Private (Chỉ Customer)
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user._id;

    const orders = await Order.find({ customerId: customerId })
      .populate({
        path: "printerId",
        select: "displayName avatarUrl", // Chỉ lấy thông tin cần thiết của nhà in
      })
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng của tôi:", error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

// @desc    Lấy đơn hàng ĐÃ NHẬN (Printer)
// @route   GET /api/orders/received
// @access  Private (Chỉ Printer)
export const getReceivedOrders = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({ message: "Cấm truy cập." });
    }
    const printerId = req.user._id;

    const orders = await Order.find({ printerId: printerId })
      .populate({
        path: "customerId",
        select: "displayName email phone avatarUrl", // Lấy thông tin khách hàng
      })
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json({ orders });
  } catch (error) {
    // <--- LỖI Ở ĐÂY, ĐÃ THÊM DẤU {
    console.error("Lỗi khi lấy đơn hàng đã nhận:", error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  } // <--- VÀ DẤU }
};
