// apps/customer-backend/src/modules/printer-studio/printer-dashboard.routes.js
import express from "express";
import { WalletController } from "../wallet/wallet.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = express.Router();
const walletController = new WalletController();

/**
 * @route   GET /api/printer/dashboard-stats
 * @desc    Lấy thống kê Dashboard (Revenue, Orders, Chart Data)
 * @access  Private (Printer only)
 */
router.get("/dashboard-stats", protect, walletController.getDashboardStats);

export default router;

