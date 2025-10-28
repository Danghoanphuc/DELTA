// src/modules/printers/printer.profile.routes.js
import { Router } from "express";
import { PrinterController } from "./printer.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";

const router = Router();
const printerController = new PrinterController();

// Tất cả route này đều yêu cầu là Printer
router.use(protect, isPrinter);

/**
 * @route   GET /api/printers/my-profile
 * @desc    Get my printer profile
 * @access  Private (Printer only)
 */
router.get("/my-profile", printerController.getMyProfile);

/**
 * @route   PUT /api/printers/profile
 * @desc    Update my printer profile
 * @access  Private (Printer only)
 */
router.put("/profile", printerController.updateMyProfile);

export default router;
