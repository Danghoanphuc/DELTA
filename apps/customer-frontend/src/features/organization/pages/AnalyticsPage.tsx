// src/features/organization/pages/AnalyticsPage.tsx
// ✅ SOLID Refactored - Analytics & Reports

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
  Gift,
  CheckCircle,
  PieChart,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { useAnalytics, useExportReport } from "../hooks";
import { SimpleBarChart, SimpleDonutChart } from "../components/SimpleBarChart";

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const { data, isLoading } = useAnalytics(timeRange);
  const { exportExcel, exportPDF } = useExportReport();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C63321]" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAF8]">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#C63321]" />
              Báo cáo & Thống kê
            </h1>
            <p className="text-[#57534E]">Tổng quan hoạt động của tổ chức</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">30 ngày qua</SelectItem>
                <SelectItem value="90d">90 ngày qua</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => exportExcel(data, timeRange)}
                className="bg-green-50 hover:bg-green-100 border-green-200"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => exportPDF(data, timeRange)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Text
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#57534E] mb-1">
                    Tổng đơn gửi quà
                  </p>
                  <h3 className="text-3xl font-bold text-[#1C1917]">
                    {data.overview.totalOrders}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#FFF5F3] flex items-center justify-center">
                  <Gift className="w-6 h-6 text-[#C63321]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#57534E] mb-1">Người nhận</p>
                  <h3 className="text-3xl font-bold text-[#1C1917]">
                    {data.overview.totalRecipients}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#57534E] mb-1">Tổng chi tiêu</p>
                  <h3 className="text-3xl font-bold text-[#C63321]">
                    {formatCurrency(data.overview.totalSpent)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#57534E] mb-1">
                    Tỷ lệ giao thành công
                  </p>
                  <h3 className="text-3xl font-bold text-green-600">
                    {data.overview.deliveryRate}%
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Breakdown */}
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#C63321]" />
                Phân bổ trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <SimpleDonutChart
                  data={Object.entries(data.ordersByStatus).map(
                    ([status, stats]) => {
                      const statusColors: Record<string, string> = {
                        draft: "#9ca3af",
                        pending_info: "#eab308",
                        pending_payment: "#f97316",
                        processing: "#3b82f6",
                        shipped: "#6366f1",
                        delivered: "#22c55e",
                        cancelled: "#ef4444",
                      };
                      return {
                        label: status,
                        value: stats.count,
                        color: statusColors[status] || "#9ca3af",
                      };
                    }
                  )}
                  size={160}
                  centerValue={data.overview.totalOrders}
                  centerLabel="Tổng đơn"
                />
              </div>

              <div className="space-y-2">
                {Object.entries(data.ordersByStatus).map(([status, stats]) => {
                  const statusLabels: Record<string, string> = {
                    draft: "Nháp",
                    pending_info: "Chờ thông tin",
                    pending_payment: "Chờ thanh toán",
                    processing: "Đang xử lý",
                    shipped: "Đang giao",
                    delivered: "Đã giao",
                    cancelled: "Đã hủy",
                  };
                  const statusColors: Record<string, string> = {
                    draft: "bg-gray-500",
                    pending_info: "bg-yellow-500",
                    pending_payment: "bg-[#C63321]",
                    processing: "bg-blue-500",
                    shipped: "bg-indigo-500",
                    delivered: "bg-green-500",
                    cancelled: "bg-red-500",
                  };
                  const total = data.overview.totalOrders || 1;
                  const percent = Math.round((stats.count / total) * 100);

                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${statusColors[status]}`}
                        />
                        <span className="text-[#57534E]">
                          {statusLabels[status] || status}
                        </span>
                      </div>
                      <span className="font-medium">
                        {stats.count} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recipient Stats */}
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Thống kê người nhận
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {data.recipientStats.totalActive}
                  </p>
                  <p className="text-sm text-[#57534E]">Người nhận active</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {data.recipientStats.totalGiftsSent}
                  </p>
                  <p className="text-sm text-[#57534E]">Quà đã gửi</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {data.recipientStats.avgGiftsPerRecipient}
                  </p>
                  <p className="text-sm text-[#57534E]">TB quà/người</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Overview */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              Tổng quan tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#FAFAF8] rounded-lg">
                <p className="text-sm text-[#57534E] mb-1">Tổng SKU</p>
                <p className="text-2xl font-bold">
                  {data.inventoryStats.totalSkus}
                </p>
              </div>
              <div className="p-4 bg-[#FAFAF8] rounded-lg">
                <p className="text-sm text-[#57534E] mb-1">Tổng số lượng</p>
                <p className="text-2xl font-bold">
                  {data.inventoryStats.totalQuantity}
                </p>
              </div>
              <div className="p-4 bg-[#FAFAF8] rounded-lg">
                <p className="text-sm text-[#57534E] mb-1">Giá trị tồn kho</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.inventoryStats.totalValue)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-[#57534E] mb-1">Sắp hết hàng</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {data.inventoryStats.lowStockCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Packs */}
        {data.topPacks && data.topPacks.length > 0 && (
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#C63321]" />
                Bộ quà phổ biến nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <SimpleBarChart
                  data={data.topPacks.slice(0, 5).map((pack) => ({
                    label:
                      pack.name.length > 10
                        ? pack.name.substring(0, 10) + "..."
                        : pack.name,
                    value: pack.count,
                  }))}
                  height={150}
                  formatValue={(v) => `${v} đơn`}
                />
              </div>

              <div className="space-y-3">
                {data.topPacks.map((pack, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-[#FAFAF8] rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FFF5F3] flex items-center justify-center font-bold text-[#C63321]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1C1917]">{pack.name}</p>
                      <p className="text-sm text-[#78716C]">
                        {pack.recipients} người nhận
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#C63321]">{pack.count}</p>
                      <p className="text-sm text-[#78716C]">đơn hàng</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
