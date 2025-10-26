// backend/src/controllers/orderController.js (ĐÃ CẬP NHẬT HOÀN CHỈNH)
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { sendNewOrderNotification } from "../libs/email.js";
import mongoose from "mongoose"; // Thêm import mongoose

// --- HÀM HELPER (generateOrderNumber - giữ nguyên) ---
const generateOrderNumber = async () => {
  // ... (code giữ nguyên)
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const todayStart = new Date(year, date.getMonth(), day);
  const count = await Order.countDocuments({ createdAt: { $gte: todayStart } });
  const orderIndex = (count + 1).toString().padStart(4, "0");
  return `DH-${year}${month}${day}-${orderIndex}`;
};

// --- HÀM CREATE ORDER (Cập nhật: Thêm printerName) ---
export const createOrder = async (req, res) => {
  try {
    const customerId = req.user._id;
    const customerName = req.user.displayName;
    const customerEmail = req.user.email;
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
    let printerId = null;
    let printerName = null; // Biến để lưu tên nhà in
    const processedItems = [];

    for (const itemPayload of orderItemsPayload) {
      // Populate printerId và lấy cả displayName của printer
      const product = await Product.findById(itemPayload.productId).populate({
        path: "printerId",
        select: "displayName", // Lấy displayName
      });

      if (!product || !product.printerId) {
        console.error(
          `Lỗi: Không tìm thấy sản phẩm hoặc nhà in cho productId ${itemPayload.productId}`
        );
        return res
          .status(400)
          .json({ message: `Sản phẩm ${itemPayload.productId} không hợp lệ.` });
      }

      if (!printerId) {
        printerId = product.printerId._id;
        printerName = product.printerId.displayName; // Lưu tên nhà in
      } else if (printerId.toString() !== product.printerId._id.toString()) {
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
        printerId: product.printerId._id, // Lưu ID nhà in cho item
        printerName: product.printerId.displayName, // *** LƯU TÊN NHÀ IN VÀO ITEM ***
        quantity: itemPayload.quantity,
        pricePerUnit: itemPayload.pricePerUnit,
        specifications: product.specifications,
        customization: itemPayload.customization,
        subtotal: itemSubtotal,
        // Thêm productSnapshot nếu cần thiết
        productSnapshot: {
          images: product.images, // Lưu ảnh sản phẩm lúc đặt
          specifications: product.specifications,
        },
      });
    }

    if (!printerId) {
      return res.status(400).json({ message: "Không xác định được nhà in." });
    }

    const shippingFee = 30000;
    const total = subtotal + shippingFee;
    const orderNumber = await generateOrderNumber();

    const newOrder = await Order.create({
      orderNumber,
      customerId,
      customerName, // Lưu tên khách hàng
      customerEmail, // Lưu email khách hàng
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
          timestamp: new Date(), // Sửa: Dùng new Date()
        },
      ],
      customerNotes,
    });

    console.log(
      `✅ Đơn hàng mới [${orderNumber}] được tạo cho nhà in ${printerId}`
    );

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
    }

    res.status(201).json({
      message: "Đặt hàng thành công!",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo đơn hàng." });
  }
};

// --- HÀM GET MY ORDERS (Customer - giữ nguyên) ---
export const getMyOrders = async (req, res) => {
  // ... (code giữ nguyên)
  try {
    const customerId = req.user._id;
    const orders = await Order.find({ customerId: customerId })
      .populate({ path: "printerId", select: "displayName avatarUrl" })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders }); // Thêm success: true
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng của tôi:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

// --- (HÀM MỚI 1): Lấy đơn hàng NHÀ IN đã nhận ---
// @desc    Lấy đơn hàng ĐÃ NHẬN (Printer) - Thay thế /received
// @route   GET /api/orders/printer/my-orders
// @access  Private (Chỉ Printer)
export const getPrinterOrders = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({ success: false, message: "Cấm truy cập." });
    }
    const printerId = req.user._id;

    // --- Logic Filtering, Searching, Sorting ---
    const { status, search, sort } = req.query;
    const filter = { printerId: printerId };

    // Lọc theo trạng thái
    if (status && status !== "all") {
      // Validate status enum (lấy từ Order model)
      const validStatuses = Order.schema.path("status").enumValues;
      if (validStatuses.includes(status)) {
        filter.status = status;
      } else {
        console.warn(`Trạng thái lọc không hợp lệ: ${status}`);
      }
    }

    // Tìm kiếm (mã đơn, tên khách, email khách)
    if (search) {
      const searchRegex = new RegExp(search, "i"); // Case-insensitive
      filter.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex }, // Cần đảm bảo customerName được lưu khi tạo đơn
        { customerEmail: searchRegex }, // Cần đảm bảo customerEmail được lưu khi tạo đơn
      ];
    }

    // Sắp xếp
    let sortOption = { createdAt: -1 }; // Mặc định: mới nhất trước
    if (sort) {
      switch (sort) {
        case "oldest":
          sortOption = { createdAt: 1 };
          break;
        case "highest":
          sortOption = { total: -1 };
          break;
        case "lowest":
          sortOption = { total: 1 };
          break;
        // case 'newest': // Mặc định đã là newest
        // default:
        //     sortOption = { createdAt: -1 };
      }
    }
    // --- Kết thúc Logic Filtering ---

    const orders = await Order.find(filter)
      .populate({
        path: "customerId", // Giữ lại populate customer nếu cần hiển thị tên/email ở list
        select: "displayName email phone avatarUrl",
      })
      .sort(sortOption);

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng nhà in:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

// --- (HÀM MỚI 2): Lấy chi tiết 1 đơn hàng cho Nhà in ---
// @desc    Lấy chi tiết 1 đơn hàng (Printer View)
// @route   GET /api/orders/printer/:orderId
// @access  Private (Chỉ Printer - owner)
export const getPrinterOrderById = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({ success: false, message: "Cấm truy cập." });
    }
    const printerId = req.user._id;
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID đơn hàng không hợp lệ." });
    }

    const order = await Order.findById(orderId).populate({
      path: "customerId",
      select: "displayName email phone avatarUrl",
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    // Kiểm tra ownership
    if (order.printerId.toString() !== printerId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Bạn không có quyền xem đơn hàng này.",
        });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết đơn hàng (printer):", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

// --- (HÀM MỚI 3): Cập nhật trạng thái đơn hàng bởi Nhà in ---
// @desc    Cập nhật trạng thái đơn hàng (Printer)
// @route   PUT /api/orders/printer/:orderId/status
// @access  Private (Chỉ Printer - owner)
export const updateOrderStatusByPrinter = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({ success: false, message: "Cấm truy cập." });
    }
    const printerId = req.user._id;
    const { orderId } = req.params;
    const { status: newStatus, note } = req.body; // Lấy trạng thái mới từ body

    // --- Validation ---
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID đơn hàng không hợp lệ." });
    }

    const validStatuses = Order.schema.path("status").enumValues;
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái mới không hợp lệ." });
    }

    // --- Tìm đơn hàng và kiểm tra ownership ---
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng." });
    }
    if (order.printerId.toString() !== printerId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Bạn không có quyền cập nhật đơn hàng này.",
        });
    }

    // --- Validate Status Transition ---
    const currentStatus = order.status;
    const allowedTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["printing", "cancelled"], // Cho phép hủy sau khi xác nhận
      printing: ["shipping", "cancelled"], // Cho phép hủy khi đang in
      shipping: ["completed", "cancelled"], // Cho phép hủy khi đang giao (cân nhắc)
      completed: [], // Không chuyển từ completed
      cancelled: [], // Không chuyển từ cancelled
      refunded: [], // Không chuyển từ refunded
    };

    if (
      !allowedTransitions[currentStatus] ||
      !allowedTransitions[currentStatus].includes(newStatus)
    ) {
      console.warn(
        `⚠️ Chuyển trạng thái không hợp lệ: Từ ${currentStatus} sang ${newStatus}`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: `Không thể chuyển trạng thái từ '${currentStatus}' sang '${newStatus}'.`,
        });
    }

    // --- Cập nhật trạng thái và lịch sử ---
    order.status = newStatus;
    const historyEntry = {
      status: newStatus,
      note: note || `Nhà in cập nhật trạng thái thành ${newStatus}.`, // Ghi chú mặc định nếu không có
      updatedBy: printerId,
      timestamp: new Date(), // Sửa: Dùng new Date()
    };
    order.statusHistory.push(historyEntry);

    // Cập nhật thời gian hoàn thành nếu trạng thái là 'completed'
    if (newStatus === "completed") {
      order.completedAt = new Date();
      if (order.payment.method === "cod") {
        // Nếu là COD, đánh dấu đã thanh toán khi hoàn thành
        order.payment.status = "paid";
        order.payment.paidAt = new Date();
      }
    }

    await order.save();

    console.log(
      `✅ Nhà in ${printerId} cập nhật đơn hàng ${orderId} thành ${newStatus}`
    );

    // TODO: Gửi email thông báo cho khách hàng về việc cập nhật trạng thái (nếu cần)

    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật trạng thái đơn hàng thành công!",
        order,
      });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái đơn hàng (printer):", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

// --- (HÀM MỚI 4 - Thêm sau nếu cần): Lấy chi tiết đơn hàng cho Customer ---
// @desc    Lấy chi tiết 1 đơn hàng (Customer View)
// @route   GET /api/orders/:orderId
// @access  Private (Chỉ Customer - owner)
export const getOrderById = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID đơn hàng không hợp lệ." });
    }

    const order = await Order.findById(orderId).populate({
      path: "printerId",
      select: "displayName avatarUrl", // Chỉ lấy thông tin cần thiết của nhà in
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    // Kiểm tra ownership
    if (order.customerId.toString() !== customerId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Bạn không có quyền xem đơn hàng này.",
        });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết đơn hàng (customer):", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};
