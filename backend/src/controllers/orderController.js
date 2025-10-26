// backend/src/controllers/orderController.js (ĐÃ CẬP NHẬT)
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js"; // <-- Thêm User model
import { sendNewOrderNotification } from "../libs/email.js"; // <-- Thêm hàm email mới

// Hàm tạo mã đơn hàng (ví dụ đơn giản)
const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  // Đếm số đơn hàng trong ngày để tạo số thứ tự
  const todayStart = new Date(year, date.getMonth(), day);
  const count = await Order.countDocuments({ createdAt: { $gte: todayStart } });
  const orderIndex = (count + 1).toString().padStart(4, "0");
  return `DH-${year}${month}${day}-${orderIndex}`;
};

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private (Chỉ Customer)
export const createOrder = async (req, res) => {
  try {
    const customerId = req.user._id;
    const customerName = req.user.displayName;
    const customerEmail = req.user.email;

    // 1. Lấy thông tin từ body (từ CheckoutPage)
    const {
      items: orderItemsPayload,
      shippingAddress,
      paymentMethod,
      customerNotes,
    } = req.body;

    if (
      !orderItemsPayload ||
      orderItemsPayload.length === 0 ||
      !shippingAddress
    ) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng." });
    }

    let subtotal = 0;
    let printerId = null; // Giả định chỉ có 1 nhà in cho đơn hàng này
    const processedItems = [];

    // 2. Xử lý từng item trong giỏ hàng
    for (const itemPayload of orderItemsPayload) {
      const product = await Product.findById(itemPayload.productId).populate(
        "printerId"
      ); // Populate để lấy thông tin nhà in

      if (!product || !product.printerId) {
        console.error(
          `Lỗi: Không tìm thấy sản phẩm hoặc nhà in cho productId ${itemPayload.productId}`
        );
        return res
          .status(400)
          .json({ message: `Sản phẩm ${itemPayload.productId} không hợp lệ.` });
      }

      // Lấy printerId từ sản phẩm đầu tiên (cần logic phức tạp hơn nếu nhiều nhà in)
      if (!printerId) {
        printerId = product.printerId._id; // Lấy ID của nhà in
      } else if (printerId.toString() !== product.printerId._id.toString()) {
        // Xử lý trường hợp giỏ hàng có sản phẩm từ nhiều nhà in khác nhau (tạm thời báo lỗi)
        return res
          .status(400)
          .json({
            message: "Hiện tại chỉ hỗ trợ đặt hàng từ một nhà in duy nhất.",
          });
      }

      const itemSubtotal = itemPayload.pricePerUnit * itemPayload.quantity;
      subtotal += itemSubtotal;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: itemPayload.quantity,
        pricePerUnit: itemPayload.pricePerUnit,
        specifications: product.specifications, // Lưu snapshot thông số lúc đặt
        customization: itemPayload.customization,
        subtotal: itemSubtotal,
      });
    }

    if (!printerId) {
      return res.status(400).json({ message: "Không xác định được nhà in." });
    }

    // 3. Tính toán tổng tiền
    const shippingFee = 30000; // Phí ship tạm thời
    const total = subtotal + shippingFee;
    const orderNumber = await generateOrderNumber(); // Tạo mã đơn hàng

    // 4. Tạo đơn hàng trong DB
    const newOrder = await Order.create({
      orderNumber, // Thêm mã đơn hàng
      customerId,
      printerId,
      items: processedItems,
      shippingAddress,
      payment: {
        method: paymentMethod || "cod", // 'cash' đổi thành 'cod' cho phù hợp enum
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
        },
      ],
      customerNotes, // Thêm ghi chú của khách
    });

    console.log(
      `✅ Đơn hàng mới [${orderNumber}] được tạo cho nhà in ${printerId}`
    );

    // 5. Gửi email thông báo cho nhà in
    try {
      const printerUser = await User.findById(printerId);
      if (printerUser && printerUser.email) {
        await sendNewOrderNotification(printerUser.email, newOrder, {
          name: customerName,
          email: customerEmail,
        });
        console.log(
          `✅ Đã gửi email thông báo đơn hàng mới đến ${printerUser.email}`
        );
      } else {
        console.warn(
          `⚠️ Không tìm thấy email cho nhà in ${printerId} để gửi thông báo.`
        );
      }
    } catch (emailError) {
      console.error(
        ` Lỗi khi gửi email thông báo đơn hàng ${orderNumber} cho nhà in ${printerId}:`,
        emailError
      );
      // Không nên dừng lại nếu gửi mail lỗi, chỉ log lại
    }

    res.status(201).json({
      message: "Đặt hàng thành công!",
      order: newOrder, // Trả về thông tin đơn hàng đã tạo
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
        select: "displayName avatarUrl",
      })
      .sort({ createdAt: -1 });

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
        select: "displayName email phone avatarUrl",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng đã nhận:", error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
};
