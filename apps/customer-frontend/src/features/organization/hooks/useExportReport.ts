// src/features/organization/hooks/useExportReport.ts
// ✅ SOLID - Export report hook

import * as XLSX from "xlsx";
import { formatCurrency } from "@/shared/utils/formatCurrency";

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

export function useExportReport() {
  const getTimeRangeLabel = (timeRange: string) => {
    switch (timeRange) {
      case "30d":
        return "30 ngày qua";
      case "90d":
        return "90 ngày qua";
      case "year":
        return "Năm nay";
      default:
        return "30 ngày qua";
    }
  };

  const exportExcel = (data: AnalyticsData, timeRange: string) => {
    if (!data) return;

    const timeRangeLabel = getTimeRangeLabel(timeRange);

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

  const exportPDF = (data: AnalyticsData, timeRange: string) => {
    if (!data) return;

    const timeRangeLabel = getTimeRangeLabel(timeRange);

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

  return {
    exportExcel,
    exportPDF,
  };
}
