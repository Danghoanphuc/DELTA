// apps/customer-backend/src/modules/wallet/wallet.service.js
import { WalletRepository } from "./wallet.repository.js";

/**
 * @description Service cho Wallet - Business Logic Layer
 */
export class WalletService {
  constructor() {
    this.walletRepository = new WalletRepository();
  }

  /**
   * Lấy tóm tắt ví (Wallet Summary)
   * @param {string} printerId - ID của nhà in
   * @returns {Promise<Object>}
   */
  async getWalletSummary(printerId) {
    const [
      availableBalance,
      pendingBalance,
      totalRevenue,
      lastPayoutDate,
    ] = await Promise.all([
      this.walletRepository.calculateAvailableBalance(printerId),
      this.walletRepository.calculatePendingBalance(printerId),
      this.walletRepository.calculateTotalRevenue(printerId),
      this.walletRepository.getLastPayoutDate(printerId),
    ]);

    return {
      availableBalance,
      pendingBalance,
      totalRevenue,
      lastPayoutDate,
      nextPayoutEligible: availableBalance >= 100000, // Minimum 100k VND
    };
  }

  /**
   * Lấy danh sách giao dịch
   * @param {string} printerId - ID của nhà in
   * @param {Object} filters - Bộ lọc
   * @param {number} page - Trang hiện tại
   * @param {number} limit - Số item mỗi trang
   * @returns {Promise<Object>}
   */
  async getTransactions(printerId, filters = {}, page = 1, limit = 20) {
    // Validate date range (max 1 year)
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const diffInDays = (end - start) / (1000 * 60 * 60 * 24);

      if (diffInDays > 365) {
        throw new Error("Khoảng thời gian tối đa là 1 năm");
      }
    }

    const { transactions, total } = await this.walletRepository.getTransactions(
      printerId,
      filters,
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    return {
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Tạo yêu cầu rút tiền
   * @param {string} printerId - ID của nhà in
   * @param {number} amount - Số tiền rút
   * @param {Object} bankInfo - Thông tin ngân hàng
   * @returns {Promise<Object>}
   */
  async createPayoutRequest(printerId, amount, bankInfo) {
    // Validate bank info
    if (!bankInfo.bankAccountNumber || !bankInfo.bankName) {
      throw new Error("Thông tin ngân hàng không hợp lệ");
    }

    // Validate bank account number (6-20 digits)
    const accountNumberRegex = /^\d{6,20}$/;
    if (!accountNumberRegex.test(bankInfo.bankAccountNumber)) {
      throw new Error("Số tài khoản ngân hàng phải từ 6-20 chữ số");
    }

    const ledgerEntry = await this.walletRepository.createPayoutRequest(
      printerId,
      amount,
      bankInfo
    );

    return {
      transactionId: ledgerEntry._id,
      amount: ledgerEntry.amount,
      status: ledgerEntry.status,
      estimatedProcessingTime: "1-3 ngày làm việc",
      createdAt: ledgerEntry.createdAt,
    };
  }

  /**
   * Lấy thống kê Dashboard
   * @param {string} printerId - ID của nhà in
   * @returns {Promise<Object>}
   */
  async getDashboardStats(printerId) {
    const [
      totalRevenue,
      totalOrders,
      activeOrders,
      revenueGrowth,
      revenueChart,
    ] = await Promise.all([
      this.walletRepository.calculateTotalRevenue(printerId),
      this.walletRepository.countTotalOrders(printerId),
      this.walletRepository.countActiveOrders(printerId),
      this.walletRepository.calculateRevenueGrowth(printerId),
      this.walletRepository.getRevenueChartData(printerId),
    ]);

    const completedOrders = totalOrders - activeOrders;

    return {
      totalRevenue,
      totalOrders,
      activeOrders,
      completedOrders,
      revenueGrowth,
      revenueChart,
    };
  }
}

