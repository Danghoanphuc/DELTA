// backend/src/routes/orderRoute.js
import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders, // <-- THÊM IMPORT NÀY
  getReceivedOrders, // <-- THÊM IMPORT NÀY
} from "../controllers/orderController.js";

const router = express.Router();

// Tất cả API đơn hàng đều yêu cầu đăng nhập
router.use(isAuthenticated);

// Định nghĩa routes
router.route("/").post(createOrder); // POST /api/orders (Khách hàng tạo đơn)

// --- (CÁC ROUTE MỚI) ---
router.route("/my-orders").get(getMyOrders); // GET /api/orders/my-orders (Customer xem đơn)

router.route("/received").get(getReceivedOrders); // GET /api/orders/received (Printer xem đơn)

export default router;
