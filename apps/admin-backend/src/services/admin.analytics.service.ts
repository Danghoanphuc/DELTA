// @ts-nocheck
// src/services/admin.analytics.service.ts
// ✅ Admin Analytics Service - Refactored with DIP

import mongoose from "mongoose";
import {
  SwagOrderRepository,
  swagOrderRepository,
} from "../repositories/swag-order.repository.js";
import {
  InventoryRepository,
  inventoryRepository,
} from "../repositories/inventory.repository.js";

interface DateRange {
  from: Date;
  to: Date;
}

interface AnalyticsFilters {
  dateRange?: DateRange;
  organizationId?: string;
  groupBy?: "day" | "week" | "month";
}

export class AdminAnalyticsService {
  constructor(
    private readonly orderRepo: SwagOrderRepository = swagOrderRepository,
    private readonly invRepo: InventoryRepository = inventoryRepository
  ) {}

  /**
   * Get order trends over time
   */
  async getOrderTrends(filters: AnalyticsFilters) {
    const { dateRange, organizationId, groupBy = "day" } = filters;

    const matchStage: any = {
      status: { $nin: ["draft", "cancelled"] },
    };

    if (dateRange) {
      matchStage.createdAt = {
        $gte: dateRange.from,
        $lte: dateRange.to,
      };
    }

    if (organizationId) {
      matchStage.organization = new mongoose.Types.ObjectId(organizationId);
    }

    const groupFormat = {
      day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      week: { $dateToString: { format: "%Y-W%V", date: "$createdAt" } },
      month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
    };

    const result = await this.orderRepo.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupFormat[groupBy],
          orders: { $sum: 1 },
          revenue: { $sum: "$pricing.total" },
          recipients: { $sum: "$totalRecipients" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map((item) => ({
      date: item._id,
      orders: item.orders,
      revenue: item.revenue,
      recipients: item.recipients,
    }));
  }

  /**
   * Get fulfillment performance metrics
   */
  async getFulfillmentMetrics(filters: AnalyticsFilters) {
    const { dateRange, organizationId } = filters;

    const matchStage: any = {
      status: { $in: ["shipped", "delivered"] },
    };

    if (dateRange) {
      matchStage.paidAt = {
        $gte: dateRange.from,
        $lte: dateRange.to,
      };
    }

    if (organizationId) {
      matchStage.organization = new mongoose.Types.ObjectId(organizationId);
    }

    const orders = await this.orderRepo.find(matchStage);

    let totalProcessingTime = 0;
    let totalShippingTime = 0;
    let totalDeliveryTime = 0;
    let processedCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;

    for (const order of orders as any[]) {
      if (order.paidAt && order.processedAt) {
        totalProcessingTime +=
          new Date(order.processedAt).getTime() -
          new Date(order.paidAt).getTime();
        processedCount++;
      }
      if (order.processedAt && order.shippedAt) {
        totalShippingTime +=
          new Date(order.shippedAt).getTime() -
          new Date(order.processedAt).getTime();
        shippedCount++;
      }
      if (order.paidAt && order.completedAt) {
        totalDeliveryTime +=
          new Date(order.completedAt).getTime() -
          new Date(order.paidAt).getTime();
        deliveredCount++;
      }
    }

    const msToHours = (ms: number) => Math.round(ms / (1000 * 60 * 60));

    return {
      avgProcessingTime: processedCount
        ? msToHours(totalProcessingTime / processedCount)
        : 0,
      avgShippingTime: shippedCount
        ? msToHours(totalShippingTime / shippedCount)
        : 0,
      avgDeliveryTime: deliveredCount
        ? msToHours(totalDeliveryTime / deliveredCount)
        : 0,
      totalProcessed: processedCount,
      totalShipped: shippedCount,
      totalDelivered: deliveredCount,
      fulfillmentRate: orders.length
        ? Math.round((deliveredCount / orders.length) * 100)
        : 0,
    };
  }

  /**
   * Get top organizations by order volume
   */
  async getTopOrganizations(limit = 10, dateRange?: DateRange) {
    const matchStage: any = {
      status: { $nin: ["draft", "cancelled"] },
    };

    if (dateRange) {
      matchStage.createdAt = {
        $gte: dateRange.from,
        $lte: dateRange.to,
      };
    }

    const result = await this.orderRepo.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$organization",
          orders: { $sum: 1 },
          revenue: { $sum: "$pricing.total" },
          recipients: { $sum: "$totalRecipients" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "organizationprofiles",
          localField: "_id",
          foreignField: "_id",
          as: "org",
        },
      },
      { $unwind: "$org" },
      {
        $project: {
          organizationId: "$_id",
          businessName: "$org.businessName",
          orders: 1,
          revenue: 1,
          recipients: 1,
        },
      },
    ]);

    return result;
  }

  /**
   * Get status distribution
   */
  async getStatusDistribution(dateRange?: DateRange) {
    const matchStage: any = {};
    if (dateRange) {
      matchStage.createdAt = {
        $gte: dateRange.from,
        $lte: dateRange.to,
      };
    }

    const result = await this.orderRepo.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusLabels: Record<string, string> = {
      draft: "Nháp",
      pending_info: "Chờ thông tin",
      pending_payment: "Chờ thanh toán",
      paid: "Đã thanh toán",
      processing: "Đang xử lý",
      kitting: "Đang đóng gói",
      shipped: "Đã gửi",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
      failed: "Thất bại",
    };

    return result.map((item) => ({
      status: item._id,
      label: statusLabels[item._id] || item._id,
      count: item.count,
    }));
  }

  /**
   * Get carrier performance
   */
  async getCarrierPerformance(dateRange?: DateRange) {
    const matchStage: any = {
      status: { $in: ["shipped", "delivered"] },
    };

    if (dateRange) {
      matchStage.shippedAt = {
        $gte: dateRange.from,
        $lte: dateRange.to,
      };
    }

    const result = await this.orderRepo.aggregate([
      { $match: matchStage },
      { $unwind: "$recipientShipments" },
      {
        $group: {
          _id: "$recipientShipments.carrier",
          shipments: { $sum: 1 },
          delivered: {
            $sum: {
              $cond: [
                { $eq: ["$recipientShipments.shipmentStatus", "delivered"] },
                1,
                0,
              ],
            },
          },
          failed: {
            $sum: {
              $cond: [
                { $eq: ["$recipientShipments.shipmentStatus", "failed"] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          carrier: "$_id",
          shipments: 1,
          delivered: 1,
          failed: 1,
          successRate: {
            $multiply: [{ $divide: ["$delivered", "$shipments"] }, 100],
          },
        },
      },
      { $sort: { shipments: -1 } },
    ]);

    const carrierNames: Record<string, string> = {
      ghn: "Giao Hàng Nhanh",
      ghtk: "Giao Hàng Tiết Kiệm",
      viettelpost: "Viettel Post",
      jt: "J&T Express",
      ninja: "Ninja Van",
    };

    return result.map((item) => ({
      ...item,
      carrierName: carrierNames[item.carrier] || item.carrier,
      successRate: Math.round(item.successRate),
    }));
  }

  /**
   * Get inventory alerts
   */
  async getInventoryAlerts() {
    const inventories = await this.invRepo.findAllWithOrganization();
    const alerts: any[] = [];

    for (const inv of inventories as any[]) {
      for (const item of inv.items || []) {
        if (item.status === "out_of_stock") {
          alerts.push({
            type: "out_of_stock",
            severity: "critical",
            item: item.name,
            sku: item.sku,
            quantity: item.quantity,
            organization: inv.organization?.businessName,
            organizationId: inv.organization?._id,
          });
        } else if (item.status === "low_stock") {
          alerts.push({
            type: "low_stock",
            severity: "warning",
            item: item.name,
            sku: item.sku,
            quantity: item.quantity,
            threshold: item.lowStockThreshold,
            organization: inv.organization?.businessName,
            organizationId: inv.organization?._id,
          });
        }
      }
    }

    return alerts.sort((a, b) =>
      a.severity === "critical" ? -1 : b.severity === "critical" ? 1 : 0
    );
  }

  /**
   * Export orders to CSV format
   */
  async exportOrdersCSV(filters: AnalyticsFilters): Promise<string> {
    const matchStage: any = {};
    if (filters.dateRange) {
      matchStage.createdAt = {
        $gte: filters.dateRange.from,
        $lte: filters.dateRange.to,
      };
    }
    if (filters.organizationId) {
      matchStage.organization = new mongoose.Types.ObjectId(
        filters.organizationId
      );
    }

    const result = await this.orderRepo.findWithPagination(
      matchStage,
      1,
      10000,
      { createdAt: -1 }
    );

    const headers = [
      "Mã đơn",
      "Tên đơn",
      "Tổ chức",
      "Bộ quà",
      "Số người nhận",
      "Trạng thái",
      "Tổng tiền",
      "Ngày tạo",
      "Ngày thanh toán",
      "Ngày gửi",
      "Ngày hoàn thành",
    ];

    const rows = result.data.map((order: any) => [
      order.orderNumber,
      order.name,
      order.organization?.businessName || "",
      order.swagPack?.name || order.packSnapshot?.name || "",
      order.totalRecipients,
      order.status,
      order.pricing?.total || 0,
      order.createdAt ? new Date(order.createdAt).toISOString() : "",
      order.paidAt ? new Date(order.paidAt).toISOString() : "",
      order.shippedAt ? new Date(order.shippedAt).toISOString() : "",
      order.completedAt ? new Date(order.completedAt).toISOString() : "",
    ]);

    return [headers.join(","), ...rows.map((row: any) => row.join(","))].join(
      "\n"
    );
  }
}

export const analyticsService = new AdminAnalyticsService();
