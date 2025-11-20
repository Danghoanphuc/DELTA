// src/pages/printer/PrinterDashboard.tsx
import {
  Package,
  ShoppingCart,
  DollarSign,
  CheckCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { usePrinterStats } from "@/features/printer/hooks/usePrinterStats";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function PrinterDashboard() {
  const { data: stats, isLoading, error } = usePrinterStats();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Không thể tải dữ liệu</p>
          <p className="text-sm text-gray-500">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      change: stats?.revenueGrowth || "0%",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tổng đơn hàng",
      value: stats?.totalOrders.toString() || "0",
      icon: ShoppingCart,
      change: `${stats?.activeOrders || 0} đang xử lý`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Đơn đang xử lý",
      value: stats?.activeOrders.toString() || "0",
      icon: Package,
      change: "Cần xử lý",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Đơn hoàn thành",
      value: stats?.completedOrders.toString() || "0",
      icon: CheckCircle,
      change: "Đã giao",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  // Format chart data for display
  const chartData = stats?.revenueChart.map((item) => ({
    date: format(new Date(item.date), "dd/MM", { locale: vi }),
    revenue: item.revenue,
  })) || [];

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Chào mừng trở lại! Đây là tổng quan về dịch vụ in ấn của bạn.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="border-none shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </h3>
                    <span className={`text-sm font-medium ${stat.color}`}>
                      {stat.change}
                    </span>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon className={stat.color} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <CardTitle>Doanh thu 7 ngày gần nhất</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(value) =>
                    `${(value / 1000000).toFixed(1)}M`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Doanh thu",
                  ]}
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
