// apps/admin-backend/src/services/dashboard.service.ts
// import { OrderModel } from "../models/order.model.js"; // TẠM ẨN
// import { UserModel } from "../models/user.model.js"; // TẠM ẨN
// import { IOrder } from "@printz/types"; // TẠM ẨN
import dayjs from "dayjs";

/**
 * Service lấy các chỉ số thống kê cho Dashboard
 */
export const getDashboardStats = async () => {
  // --- TẠM THỜI ẨN LOGIC DATABASE ---
  /*
  // 1. Đếm tổng số người dùng (Giả định UserModel đã được tạo)
  const totalUsers = await UserModel.countDocuments({
    // Lọc ra vai trò customer, loại bỏ admin/printer
    role: "customer",
  });

  // 2. Đếm tổng số đơn hàng
  const totalOrders = await OrderModel.countDocuments();

  // 3. Tính tổng doanh thu (chỉ tính các đơn đã hoàn thành)
  const revenueResult = await OrderModel.aggregate([
    {
      $match: {
        status: "Completed", // Chỉ tính doanh thu từ đơn đã hoàn thành
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // 4. Lấy dữ liệu biểu đồ 7 ngày (Phần "Toàn diện" Phúc yêu cầu)
  const today = dayjs().endOf("day");
  const sevenDaysAgo = dayjs().subtract(6, "day").startOf("day");

  // Truy vấn aggregate mạnh mẽ của MongoDB
  const weeklyRevenueData: Array<{ _id: string; total: number }> =
    await OrderModel.aggregate([
      {
        $match: {
          status: "Completed",
          createdAt: {
            $gte: sevenDaysAgo.toDate(),
            $lte: today.toDate(),
          },
        },
      },
      {
        $group: {
          // Nhóm theo ngày (định dạng YYYY-MM-DD)
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { _id: 1 }, // Sắp xếp theo ngày
      },
    ]);

  // 5. Định dạng dữ liệu biểu đồ (Chart Data Formatting)
  // Tạo một map để dễ dàng tra cứu
  const revenueMap = new Map(
    weeklyRevenueData.map((item) => [item._id, item.total])
  );
   */
  // --- KẾT THÚC TẠM ẨN ---

  // --- SỬ DỤNG DỮ LIỆU GIẢ (MOCK DATA) ĐỂ TEST FRONTEND ---

  // 1. Mock Stats
  const totalUsers = 1337;
  const totalOrders = 789;
  const totalRevenue = 123456789;

  // 2. Mock Chart Data (Tạo dữ liệu ngẫu nhiên cho 7 ngày)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = dayjs().subtract(i, "day");
    const shortName = date.format("DD/MM"); // Tên hiển thị trên biểu đồ

    // Tạo doanh thu giả ngẫu nhiên từ 1 triệu đến 5 triệu
    const mockRevenue =
      Math.floor(Math.random() * (5000000 - 1000000 + 1)) + 1000000;

    chartData.push({
      name: shortName,
      revenue: mockRevenue,
    });
  }
  // --- KẾT THÚC DỮ LIỆU GIẢ ---

  return {
    stats: {
      totalUsers,
      totalOrders,
      totalRevenue,
    },
    chartData,
  };
};
