// apps/customer-backend/src/modules/rush/rush.routes.js
import { Router } from "express";
import { RushController } from "./rush.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const controller = new RushController();

// Tất cả các route này đều yêu cầu đăng nhập
router.use(protect);

/**
 * @route   POST /api/rush/solutions
 * @desc    Tìm các giải pháp rush order gần nhất
 * @access  Private
 * @body    { lat: number, lng: number, category?: string, deadlineHours: number }
 */
router.post("/solutions", controller.findRushSolutions);

/**
 * @route   POST /api/rush/orders
 * @desc    Tạo rush order
 * @access  Private
 * @body    {
 *   printerProfileId: string,
 *   productId: string,
 *   quantity: number,
 *   shippingAddress: object,
 *   customerNotes?: string,
 *   requiredDeadline: string (ISO date),
 *   customization?: object
 * }
 */
router.post("/orders", controller.createRushOrder);

export default router;

