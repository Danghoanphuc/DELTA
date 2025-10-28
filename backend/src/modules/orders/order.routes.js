// src/modules/orders/order.routes.js
import { Router } from "express";
import { OrderController } from "./order.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";

const router = Router();
const orderController = new OrderController();

router.use(protect);

// === CUSTOMER ROUTES ===
router.post("/", orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);
router.get("/:orderId", orderController.getOrderById);

// === PRINTER ROUTES ===
router.get("/printer/my-orders", isPrinter, orderController.getPrinterOrders);
router.get("/printer/:orderId", isPrinter, orderController.getPrinterOrderById);
router.put(
  "/printer/:orderId/status",
  isPrinter,
  orderController.updateOrderStatusByPrinter
);

export default router;
