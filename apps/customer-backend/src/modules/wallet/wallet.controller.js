// apps/customer-backend/src/modules/wallet/wallet.controller.js
import { WalletService } from "./wallet.service.js";

/**
 * @description Controller cho Wallet - Xử lý HTTP Requests
 */
export class WalletController {
  constructor() {
    this.walletService = new WalletService();
  }

  /**
   * GET /api/wallet/summary
   * Lấy tóm tắt ví của nhà in
   */
  getWalletSummary = async (req, res, next) => {
    try {
      const printerId = req.user.printerProfileId;

      if (!printerId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập tính năng này",
        });
      }

      const summary = await this.walletService.getWalletSummary(printerId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/wallet/transactions
   * Lấy danh sách giao dịch
   */
  getTransactions = async (req, res, next) => {
    try {
      const printerId = req.user.printerProfileId;

      if (!printerId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập tính năng này",
        });
      }

      const { page = 1, limit = 20, type = "all", startDate, endDate } = req.query;

      const filters = {
        type,
        startDate,
        endDate,
      };

      const result = await this.walletService.getTransactions(
        printerId,
        filters,
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/wallet/payout-request
   * Tạo yêu cầu rút tiền
   */
  createPayoutRequest = async (req, res, next) => {
    try {
      const printerId = req.user.printerProfileId;

      if (!printerId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập tính năng này",
        });
      }

      const { amount, bankAccountNumber, bankName } = req.body;

      // Validate input
      if (!amount || !bankAccountNumber || !bankName) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp đầy đủ thông tin",
        });
      }

      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Số tiền không hợp lệ",
        });
      }

      const result = await this.walletService.createPayoutRequest(
        printerId,
        amount,
        { bankAccountNumber, bankName }
      );

      res.status(201).json({
        success: true,
        message: "Yêu cầu rút tiền đã được gửi thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/printer/dashboard-stats
   * Lấy thống kê cho Dashboard
   */
  getDashboardStats = async (req, res, next) => {
    try {
      const printerId = req.user.printerProfileId;

      if (!printerId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập tính năng này",
        });
      }

      const stats = await this.walletService.getDashboardStats(printerId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}

