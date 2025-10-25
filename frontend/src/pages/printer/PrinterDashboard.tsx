// src/pages/printer/PrinterDashboard.tsx
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // 👈 Sửa đường dẫn

export function PrinterDashboard() {
  // ... (Toàn bộ code JSX từ file PrinterDashboard.tsx của bạn) ...
  // (Tôi chỉ sao chép nội dung file của bạn vào đây)
  const stats = [
    {
      title: "Doanh thu tháng này",
      value: "125,000,000 ₫",
      icon: DollarSign,
      change: "+12.5%",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Đơn hàng mới",
      value: "48",
      icon: ShoppingCart,
      change: "+8",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Sản phẩm đang bán",
      value: "156",
      icon: Package,
      change: "+12",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Khách hàng",
      value: "234",
      icon: Users,
      change: "+23",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];
  // ... (v.v... toàn bộ code) ...
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Chào mừng trở lại! Đây là tổng quan về dịch vụ in ấn của bạn.
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-none shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <h3 className="text-gray-900 mb-2">{stat.value}</h3>
                    <span className={`text-sm ${stat.color}`}>
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
        {/* ... (Phần còn lại của file PrinterDashboard.tsx) ... */}
      </div>
    </div>
  );
}
