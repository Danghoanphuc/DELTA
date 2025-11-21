// apps/customer-backend/src/modules/wallet/wallet.repository.js
import BalanceLedgerModel from "../../shared/models/balance-ledger.model.js";
import { MasterOrder } from "../../shared/models/master-order.model.js";
import mongoose from "mongoose";

/**
 * @description Repository cho Wallet - Xử lý các truy vấn Database liên quan đến tài chính
 */
export class WalletRepository {
  /**
   * Tính toán số dư khả dụng (Available Balance)
   * @param {string} printerId - ID của nhà in
   * @param {mongoose.ClientSession} session - Session cho transaction (optional)
   * @returns {Promise<number>}
   */
  async calculateAvailableBalance(printerId, session = null) {
    const query = [
      {
        $match: {
          printer: new mongoose.Types.ObjectId(printerId),
          status: "PAID", // Chỉ tính các giao dịch đã thanh toán
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ];

    const options = session ? { session } : {};
    const result = await BalanceLedgerModel.aggregate(query, options);

    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Tính toán số dư đang chờ xử lý (Pending Balance)
   * @param {string} printerId - ID của nhà in
   * @returns {Promise<number>}
   */
  async calculatePendingBalance(printerId) {
    const result = await BalanceLedgerModel.aggregate([
      {
        $match: {
          printer: new mongoose.Types.ObjectId(printerId),
          status: { $in: ["UNPAID", "PENDING"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Tính tổng doanh thu (All-time)
   * @param {string} printerId - ID của nhà in
   * @returns {Promise<number>}
   */
  async calculateTotalRevenue(printerId) {
    const result = await BalanceLedgerModel.aggregate([
      {
        $match: {
          printer: new mongoose.Types.ObjectId(printerId),
          transactionType: "SALE",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Lấy ngày rút tiền gần nhất
   * @param {string} printerId - ID của nhà in
   * @returns {Promise<Date|null>}
   */
  async getLastPayoutDate(printerId) {
    const lastPayout = await BalanceLedgerModel.findOne({
      printer: printerId,
      transactionType: "PAYOUT",
      status: "PAID",
    })
      .sort({ paidAt: -1 })
      .select("paidAt");

    return lastPayout?.paidAt || null;
  }

  /**
   * Lấy danh sách giao dịch có phân trang và filter
   * @param {string} printerId - ID của nhà in
   * @param {Object} filters - Bộ lọc
   * @param {number} page - Trang hiện tại
   * @param {number} limit - Số item mỗi trang
   * @returns {Promise<{transactions: Array, total: number}>}
   */
  async getTransactions(printerId, filters = {}, page = 1, limit = 20) {
    const query = { printer: printerId };

    // Filter by transaction type
    if (filters.type && filters.type !== "all") {
      query.transactionType = filters.type;
    }

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      BalanceLedgerModel.find(query)
        .populate("masterOrder", "orderNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BalanceLedgerModel.countDocuments(query),
    ]);

    return { transactions, total };
  }

  /**
   * Tạo yêu cầu rút tiền (Payout Request) với ACID Transaction
   * @param {string} printerId - ID của nhà in
   * @param {number} amount - Số tiền rút
   * @param {Object} bankInfo - Thông tin ngân hàng
   * @returns {Promise<Object>}
   */
  async createPayoutRequest(printerId, amount, bankInfo) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Tính available balance trong transaction
      const availableBalance = await this.calculateAvailableBalance(
        printerId,
        session
      );

      // 2. Validate số dư
      if (amount > availableBalance) {
        throw new Error(
          `Số dư không đủ. Số dư khả dụng: ${availableBalance.toLocaleString("vi-VN")} ₫`
        );
      }

      if (amount < 100000) {
        throw new Error("Số tiền rút tối thiểu là 100,000 ₫");
      }

      // 3. Tạo ledger entry
      const ledgerEntry = await BalanceLedgerModel.create(
        [
          {
            printer: printerId,
            // Không cần masterOrder và subOrder cho PAYOUT
            masterOrder: new mongoose.Types.ObjectId("000000000000000000000000"),
            subOrder: new mongoose.Types.ObjectId("000000000000000000000000"),
            amount: -amount, // Số âm
            transactionType: "PAYOUT",
            status: "PENDING",
            paymentGateway: "MANUAL",
            notes: `Rút tiền về ${bankInfo.bankName} - STK: ${bankInfo.bankAccountNumber}`,
          },
        ],
        { session }
      );

      // 4. Commit transaction
      await session.commitTransaction();

      return ledgerEntry[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Lấy dữ liệu biểu đồ doanh thu (7 ngày gần nhất)
   * @param {string} printerId - ID của nhà in
   * @returns {Promise<Array>}
   */
  async getRevenueChartData(printerId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const chartData = await BalanceLedgerModel.aggregate([
      {
        $match: {
          printer: new mongoose.Types.ObjectId(printerId),
          transactionType: "SALE",
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
        },
      },
    ]);

    // Fill missing dates with 0
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const existingData = chartData.find((d) => d.date === dateString);
      result.push({
        date: dateString,
        revenue: existingData ? existingData.revenue : 0,
      });
    }

    return result;
  }

  /**
   * Đếm tổng số đơn hàng của nhà in
   * @param {string} printerId - ID của nhà in
   * @returns {Promise<number>}
   */
  async countTotalOrders(printerId) {
    return await MasterOrder.countDocuments({
      "printerOrders.printerProfileId": printerId,
    });
  }

  /**
   * Đếm số đơn hàng đang hoạt động (Active)
   * @param {string} printerId - ID của nhà in
   * @returns {Promise<number>}
   */
  async countActiveOrders(printerId) {
    return await MasterOrder.countDocuments({
      "printerOrders.printerProfileId": printerId,
      "printerOrders.printerStatus": {
        $nin: ["completed", "cancelled"],
      },
    });
  }

  /**
   * Tính tăng trưởng doanh thu so với tháng trước
   * @param {string} printerId - ID của nhà in
   * @returns {Promise<string>}
   */
  async calculateRevenueGrowth(printerId) {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonth, lastMonth] = await Promise.all([
      BalanceLedgerModel.aggregate([
        {
          $match: {
            printer: new mongoose.Types.ObjectId(printerId),
            transactionType: "SALE",
            createdAt: { $gte: startOfThisMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      BalanceLedgerModel.aggregate([
        {
          $match: {
            printer: new mongoose.Types.ObjectId(printerId),
            transactionType: "SALE",
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const thisMonthRevenue = thisMonth.length > 0 ? thisMonth[0].total : 0;
    const lastMonthRevenue = lastMonth.length > 0 ? lastMonth[0].total : 0;

    if (lastMonthRevenue === 0) {
      return thisMonthRevenue > 0 ? "+100%" : "0%";
    }

    const growth =
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    const sign = growth >= 0 ? "+" : "";
    return `${sign}${growth.toFixed(1)}%`;
  }
}

