// backend/src/routes/orderRoute.js (ĐÃ CẬP NHẬT HOÀN CHỈNH)
import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders, // Customer get their orders
  getOrderById, // Customer get specific order detail
  getPrinterOrders, // Printer get their received orders
  getPrinterOrderById, // Printer get specific order detail
  updateOrderStatusByPrinter, // Printer update order status
} from "../controllers/orderController.js";

const router = express.Router();

// Tất cả API đơn hàng đều yêu cầu đăng nhập
router.use(isAuthenticated);

// === CUSTOMER ROUTES ===
router.post("/", createOrder); // POST /api/orders (Customer tạo đơn)
router.get("/my-orders", getMyOrders); // GET /api/orders/my-orders (Customer xem đơn của mình)
router.get("/:orderId", getOrderById); // GET /api/orders/:orderId (Customer xem chi tiết đơn)
// Lưu ý: Route động /:orderId phải đặt sau /my-orders và /printer/.. để tránh trùng khớp sai

// === PRINTER ROUTES ===
router.get("/printer/my-orders", getPrinterOrders); // GET /api/orders/printer/my-orders (Printer xem đơn đã nhận)
router.get("/printer/:orderId", getPrinterOrderById); // GET /api/orders/printer/:orderId (Printer xem chi tiết đơn)
router.put("/printer/:orderId/status", updateOrderStatusByPrinter); // PUT /api/orders/printer/:orderId/status (Printer cập nhật trạng thái)

// Xóa route /received không còn dùng nữa
// router.route("/received").get(getReceivedOrders);

export default router;
