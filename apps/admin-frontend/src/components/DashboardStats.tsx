// apps/admin-frontend/src/components/DashboardStats.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode; // Sẽ thêm icon sau
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
  };
}

// Hàm format tiền tệ (Giải pháp toàn diện)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatCard
        title="Tổng Doanh Thu"
        value={formatCurrency(stats.totalRevenue)}
      />
      <StatCard title="Tổng Đơn Hàng" value={stats.totalOrders} />
      <StatCard title="Tổng Khách Hàng" value={stats.totalUsers} />
    </div>
  );
};
