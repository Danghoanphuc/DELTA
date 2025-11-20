// apps/customer-backend/src/modules/wallet/wallet.routes.js
import express from "express";
import { WalletController } from "./wallet.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = express.Router();
const walletController = new WalletController();

/**
 * @route   GET /api/wallet/summary
 * @desc    Lấy tóm tắt ví (Available Balance, Pending Balance, Total Revenue)
 * @access  Private (Printer only)
 */
router.get("/summary", protect, walletController.getWalletSummary);

/**
 * @route   GET /api/wallet/transactions
 * @desc    Lấy danh sách giao dịch có phân trang
 * @access  Private (Printer only)
 * @query   page, limit, type, startDate, endDate
 */
router.get("/transactions", protect, walletController.getTransactions);

/**
 * @route   POST /api/wallet/payout-request
 * @desc    Tạo yêu cầu rút tiền
 * @access  Private (Printer only)
 * @body    { amount, bankAccountNumber, bankName }
 */
router.post(
  "/payout-request",
  protect,
  walletController.createPayoutRequest
);

export default router;

