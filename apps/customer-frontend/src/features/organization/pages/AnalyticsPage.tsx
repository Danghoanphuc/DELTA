// src/features/organization/pages/AnalyticsPage.tsx
// ✅ Analytics & Reports - Báo cáo và thống kê (VN Optimized)

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
  Download,
  Loader2,
  Gift,
  Truck,
  CheckCircle,
  PieChart,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import * as XLSX from "xlsx";
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
import { formatCurrency } from "@/shared/utils/formatCurrency";
import api from "@/shared/lib/axios";
import { SimpleBarChart, SimpleDonutChart } from "../components/SimpleBarChart";

interface AnalyticsData {
  overview: {
    totalOrders: number;
    totalRecipients: number;
    totalSpent: number;
    deliveryRate: number;
  };
  ordersByStatus: Record<
    string,
    { count: number; totalRecipients: number; totalSpent: number }
  >;
  topPacks: Array<{ name: string; count: number; recipients: number }>;
  monthlyTrend: Array<{ month: string; orders: number; spent: number }>;
  recipientStats: {
    totalActive: number;
    totalGiftsSent: number;
    avgGiftsPerRecipient: number;
  };
  inventoryStats: {
    totalSkus: number;
    totalQuantity: number;
    totalValue: number;
    lowStockCount: number;
  };
}

export function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all stats in parallel
      const [ordersRes, recipientsRes, inventoryRes, packsRes] =
        await Promise.allSettled([
          api.get("/swag-orders/stats"),
          api.get("/recipients/filters"),
          api.get("/inventory/stats"),
          api.get("/swag-packs/stats"),
        ]);

      const ordersData =
        ordersRes.status === "fulfilled" ? ordersRes.value.data?.data : {};
      const recipientsData =
        recipientsRes.status === "fulfilled"
          ? recipientsRes.value.data?.data
          : {};
      const inventoryData =
        inventoryRes.status === "fulfilled"
          ? inventoryRes.value.data?.data?.stats
          : {};
      const packsData =
        packsRes.status === "fulfilled" ? packsRes.value.data?.data : {};

      // Calculate delivery rate
      const totalDelivered =
        ordersData.byStatus?.delivered?.totalRecipients || 0;
      const totalRecipients = ordersData.totalRecipients || 0;
      const deliveryRate =
        totalRecipients > 0
          ? Math.round((totalDelivered / totalRecipients) * 100)
          : 0;

      setData({
        overview: {
          totalOrders: ordersData.totalOrders || 0,
          totalRecipients: ordersData.totalRecipients || 0,
          totalSpent: ordersData.totalSpent || 0,
          deliveryRate,
        },
        ordersByStatus: ordersData.byStatus || {},
        topPacks: packsData.popularPacks || [],
        monthlyTrend: [], // TODO: Implement monthly trend API
        recipientStats: {
          totalActive: recipientsData.totalCount || 0,
          totalGiftsSent: totalDelivered,
          avgGiftsPerRecipient:
            recipientsData.totalCount > 0
              ? Math.round((totalDelivered / recipientsData.totalCount) * 10) /
                10
              : 0,
        },
        inventoryStats: {
          totalSkus: inventoryData.totalSkus || 0,
          totalQuantity: inventoryData.totalQuantity || 0,
          totalValue: inventoryData.totalValue || 0,
          lowStockCount: inventoryData.lowStockCount || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Export Excel report
  const exportExcel = () => {
    if (!data) return;

    const timeRangeLabel =
      timeRange === "30d"
        ? "30 ngày qua"
        : timeRange === "90d"
        ? "90 ngày qua"
        : "Năm nay";

    // Sheet 1: Tổng quan
    const overviewData = [
      ["BÁO CÁO PRINTZ", "", ""],
      ["Ngày xuất:", new Date().toLocaleString("vi-VN"), ""],
      ["Khoảng thời gian:", timeRangeLabel, ""],
      ["", "", ""],
      ["TỔNG QUAN", "", ""],
      ["Chỉ số", "Giá trị", "Ghi chú"],
      ["Tổng đơn gửi quà", data.overview.totalOrders, "đơn"],
      ["Tổng người nhận", data.overview.totalRecipients, "người"],
      ["Tổng chi tiêu", data.overview.totalSpent, "VNĐ"],
      ["Tỷ lệ giao thành công", `${data.overview.deliveryRate}%`, ""],
      ["", "", ""],
      ["NGƯỜI NHẬN", "", ""],
      ["Người nhận active", data.recipientStats.totalActive, "người"],
      ["Tổng quà đã gửi", data.recipientStats.totalGiftsSent, "quà"],
      [
        "Trung bình quà/người",
        data.recipientStats.avgGiftsPerRecipient,
        "quà/người",
      ],
      ["", "", ""],
      ["TỒN KHO", "", ""],
      ["Tổng SKU", data.inventoryStats.totalSkus, "SKU"],
      ["Tổng số lượng", data.inventoryStats.totalQuantity, "sản phẩm"],
      ["Giá trị tồn kho", data.inventoryStats.totalValue, "VNĐ"],
      ["Sản phẩm sắp hết", data.inventoryStats.lowStockCount, "SKU"],
    ];

    // Sheet 2: Chi tiết theo trạng thái
    const statusLabels: Record<string, string> = {
      draft: "Nháp",
      pending_info: "Chờ thông tin",
      pending_payment: "Chờ thanh toán",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };

    const statusData = [
      ["PHÂN BỔ THEO TRẠNG THÁI", "", "", ""],
      ["Trạng thái", "Số đơn", "Người nhận", "Chi tiêu (VNĐ)"],
      ...Object.entries(data.ordersByStatus || {}).map(([status, stats]) => [
        statusLabels[status] || status,
        stats.count,
        stats.totalRecipients,
        stats.totalSpent,
      ]),
    ];

    // Sheet 3: Top Packs
    const topPacksData = [
      ["BỘ QUÀ PHỔ BIẾN", "", ""],
      ["Tên bộ quà", "Số đơn", "Người nhận"],
      ...(data.topPacks || []).map((pack) => [
        pack.name,
        pack.count,
        pack.recipients,
      ]),
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
    ws1["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Tổng quan");

    const ws2 = XLSX.utils.aoa_to_sheet(statusData);
    ws2["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Theo trạng thái");

    const ws3 = XLSX.utils.aoa_to_sheet(topPacksData);
    ws3["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Top bộ quà");

    // Download
    const fileName = `Printz_BaoCao_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export PDF (simple text version for now)
  const exportPDF = () => {
    if (!data) return;

    const timeRangeLabel =
      timeRange === "30d"
        ? "30 ngày qua"
        : timeRange === "90d"
        ? "90 ngày qua"
        : "Năm nay";

    const reportContent = `
BÁO CÁO PRINTZ
══════════════════════════════════════
Ngày xuất: ${new Date().toLocaleString("vi-VN")}
Khoảng thời gian: ${timeRangeLabel}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TỔNG QUAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Tổng đơn gửi quà: ${data.overview.totalOrders} đơn
• Tổng người nhận: ${data.overview.totalRecipients} người
• Tổng chi tiêu: ${formatCurrency(data.overview.totalSpent)}
• Tỷ lệ giao thành công: ${data.overview.deliveryRate}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NGƯỜI NHẬN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Người nhận active: ${data.recipientStats.totalActive}
• Tổng quà đã gửi: ${data.recipientStats.totalGiftsSent}
• Trung bình quà/người: ${data.recipientStats.avgGiftsPerRecipient}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TỒN KHO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Tổng SKU: ${data.inventoryStats.totalSkus}
• Tổng số lượng: ${data.inventoryStats.totalQuantity}
• Giá trị tồn kho: ${formatCurrency(data.inventoryStats.totalValue)}
• Sản phẩm sắp hết: ${data.inventoryStats.lowStockCount}

══════════════════════════════════════
Xuất bởi Printz Enterprise
    `.trim();

    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Printz_BaoCao_${
      new Date().toISOString().split("T")[0]
    }.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              Báo cáo & Thống kê
            </h1>
            <p className="text-gray-600">Tổng quan hoạt động của tổ chức</p>
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
                onClick={exportExcel}
                className="bg-green-50 hover:bg-green-100 border-green-200"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                Excel
              </Button>
              <Button variant="outline" onClick={exportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Text
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng đơn gửi quà</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {data?.overview.totalOrders || 0}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Người nhận</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {data?.overview.totalRecipients || 0}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng chi tiêu</p>
                  <h3 className="text-3xl font-bold text-orange-600">
                    {formatCurrency(data?.overview.totalSpent || 0)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Tỷ lệ giao thành công
                  </p>
                  <h3 className="text-3xl font-bold text-green-600">
                    {data?.overview.deliveryRate || 0}%
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
          {/* Order Status Breakdown with Donut Chart */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-500" />
                Phân bổ trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Donut Chart */}
              <div className="flex justify-center mb-6">
                <SimpleDonutChart
                  data={Object.entries(data?.ordersByStatus || {}).map(
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
                  centerValue={data?.overview.totalOrders || 0}
                  centerLabel="Tổng đơn"
                />
              </div>

              {/* Legend */}
              <div className="space-y-2">
                {Object.entries(data?.ordersByStatus || {}).map(
                  ([status, stats]) => {
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
                      pending_payment: "bg-orange-500",
                      processing: "bg-blue-500",
                      shipped: "bg-indigo-500",
                      delivered: "bg-green-500",
                      cancelled: "bg-red-500",
                    };
                    const total = data?.overview.totalOrders || 1;
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
                          <span className="text-gray-600">
                            {statusLabels[status] || status}
                          </span>
                        </div>
                        <span className="font-medium">
                          {stats.count} ({percent}%)
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recipient Stats */}
          <Card className="border-none shadow-sm">
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
                    {data?.recipientStats.totalActive || 0}
                  </p>
                  <p className="text-sm text-gray-600">Người nhận active</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {data?.recipientStats.totalGiftsSent || 0}
                  </p>
                  <p className="text-sm text-gray-600">Quà đã gửi</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {data?.recipientStats.avgGiftsPerRecipient || 0}
                  </p>
                  <p className="text-sm text-gray-600">TB quà/người</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Overview */}
        <Card className="border-none shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              Tổng quan tồn kho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tổng SKU</p>
                <p className="text-2xl font-bold">
                  {data?.inventoryStats.totalSkus || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tổng số lượng</p>
                <p className="text-2xl font-bold">
                  {data?.inventoryStats.totalQuantity || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Giá trị tồn kho</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data?.inventoryStats.totalValue || 0)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sắp hết hàng</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {data?.inventoryStats.lowStockCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Packs with Bar Chart */}
        {data?.topPacks && data.topPacks.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Bộ quà phổ biến nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Bar Chart */}
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

              {/* List */}
              <div className="space-y-3">
                {data.topPacks.map((pack, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{pack.name}</p>
                      <p className="text-sm text-gray-500">
                        {pack.recipients} người nhận
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{pack.count}</p>
                      <p className="text-sm text-gray-500">đơn hàng</p>
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
