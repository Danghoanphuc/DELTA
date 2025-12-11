/**
 * Analytics Service
 *
 * Handles analytics and reporting for:
 * - Product performance
 * - Supplier metrics
 * - Order trends
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

import { Logger } from "../shared/utils/logger.js";
import { ValidationException } from "../shared/exceptions/index.js";
import { SwagOrder } from "../models/swag-order.model.js";
import { ProductionOrder } from "../models/production-order.model.js";
import { SkuVariant } from "../models/sku-variant.model.js";
import { Supplier } from "../models/supplier.model.js";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ProductAnalytics {
  topProducts: Array<{
    productId: string;
    productName: string;
    sku: string;
    totalSold: number;
    totalRevenue: number;
    averagePrice: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    orderCount: number;
    percentage: number;
  }>;
  slowMovingInventory: Array<{
    variantId: string;
    sku: string;
    productName: string;
    onHand: number;
    lastSoldDate: Date | null;
    daysSinceLastSale: number;
  }>;
}

export interface SupplierAnalytics {
  suppliers: Array<{
    supplierId: string;
    supplierName: string;
    onTimeDeliveryRate: number;
    qualityScore: number;
    averageLeadTime: number;
    totalOrders: number;
    averageCost: number;
  }>;
}

export interface OrderAnalytics {
  volumeTrends: Array<{
    period: string;
    orderCount: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  revenueTrends: Array<{
    period: string;
    revenue: number;
    growth: number;
  }>;
  averageOrderValue: {
    current: number;
    previous: number;
    change: number;
  };
}

export class AnalyticsService {
  /**
   * Get product analytics
   * Requirements: 13.1, 13.4
   */
  async getProductAnalytics(
    organizationId: string,
    dateRange: DateRange,
    options: {
      topN?: number;
      slowMovingThreshold?: number;
    } = {}
  ): Promise<ProductAnalytics> {
    Logger.debug(
      `[AnalyticsSvc] Getting product analytics for org: ${organizationId}`
    );

    const { topN = 10, slowMovingThreshold = 90 } = options;

    // Validate date range
    if (dateRange.startDate > dateRange.endDate) {
      throw new ValidationException("Start date must be before end date");
    }

    // Get top selling products
    const topProducts = await this.getTopSellingProducts(
      organizationId,
      dateRange,
      topN
    );

    // Get revenue by category
    const revenueByCategory = await this.getRevenueByCategory(
      organizationId,
      dateRange
    );

    // Get slow-moving inventory
    const slowMovingInventory = await this.getSlowMovingInventory(
      organizationId,
      slowMovingThreshold
    );

    Logger.success(`[AnalyticsSvc] Product analytics retrieved successfully`);

    return {
      topProducts,
      revenueByCategory,
      slowMovingInventory,
    };
  }

  /**
   * Get supplier analytics
   * Requirements: 13.2
   */
  async getSupplierAnalytics(
    organizationId: string,
    dateRange: DateRange
  ): Promise<SupplierAnalytics> {
    Logger.debug(
      `[AnalyticsSvc] Getting supplier analytics for org: ${organizationId}`
    );

    // Get all suppliers with their performance metrics
    const suppliers = await ProductionOrder.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: "$supplierId",
          supplierName: { $first: "$supplierName" },
          totalOrders: { $sum: 1 },
          onTimeOrders: {
            $sum: {
              $cond: [
                { $lte: ["$actualCompletionDate", "$expectedCompletionDate"] },
                1,
                0,
              ],
            },
          },
          passedQC: {
            $sum: {
              $cond: [{ $eq: ["$qcChecks.passed", true] }, 1, 0],
            },
          },
          totalLeadTime: {
            $sum: {
              $subtract: ["$actualCompletionDate", "$orderedAt"],
            },
          },
          totalCost: { $sum: "$actualCost" },
        },
      },
      {
        $project: {
          supplierId: "$_id",
          supplierName: 1,
          totalOrders: 1,
          onTimeDeliveryRate: {
            $multiply: [{ $divide: ["$onTimeOrders", "$totalOrders"] }, 100],
          },
          qualityScore: {
            $multiply: [{ $divide: ["$passedQC", "$totalOrders"] }, 100],
          },
          averageLeadTime: {
            $divide: ["$totalLeadTime", "$totalOrders"],
          },
          averageCost: {
            $divide: ["$totalCost", "$totalOrders"],
          },
        },
      },
      {
        $sort: { onTimeDeliveryRate: -1 },
      },
    ]);

    Logger.success(
      `[AnalyticsSvc] Supplier analytics retrieved: ${suppliers.length} suppliers`
    );

    return { suppliers };
  }

  /**
   * Get order analytics
   * Requirements: 13.3
   */
  async getOrderAnalytics(
    organizationId: string,
    dateRange: DateRange,
    groupBy: "day" | "week" | "month" = "month"
  ): Promise<OrderAnalytics> {
    Logger.debug(
      `[AnalyticsSvc] Getting order analytics for org: ${organizationId}`
    );

    // Get volume trends
    const volumeTrends = await this.getOrderVolumeTrends(
      organizationId,
      dateRange,
      groupBy
    );

    // Get revenue trends
    const revenueTrends = await this.getRevenueTrends(
      organizationId,
      dateRange,
      groupBy
    );

    // Calculate average order value
    const averageOrderValue = await this.getAverageOrderValue(
      organizationId,
      dateRange
    );

    Logger.success(`[AnalyticsSvc] Order analytics retrieved successfully`);

    return {
      volumeTrends,
      revenueTrends,
      averageOrderValue,
    };
  }

  /**
   * Export analytics report
   * Requirements: 13.5
   */
  async exportReport(
    organizationId: string,
    reportType: "products" | "suppliers" | "orders",
    dateRange: DateRange,
    format: "csv" | "excel" = "csv"
  ): Promise<{ data: string; filename: string }> {
    Logger.debug(
      `[AnalyticsSvc] Exporting ${reportType} report for org: ${organizationId}`
    );

    let data: any;
    let filename: string;

    switch (reportType) {
      case "products":
        data = await this.getProductAnalytics(organizationId, dateRange);
        filename = `product-analytics-${Date.now()}.${format}`;
        break;

      case "suppliers":
        data = await this.getSupplierAnalytics(organizationId, dateRange);
        filename = `supplier-analytics-${Date.now()}.${format}`;
        break;

      case "orders":
        data = await this.getOrderAnalytics(organizationId, dateRange);
        filename = `order-analytics-${Date.now()}.${format}`;
        break;

      default:
        throw new ValidationException(`Invalid report type: ${reportType}`);
    }

    // Convert to CSV format
    const csvData = this.convertToCSV(data);

    Logger.success(`[AnalyticsSvc] Report exported: ${filename}`);

    return {
      data: csvData,
      filename,
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async getTopSellingProducts(
    organizationId: string,
    dateRange: DateRange,
    topN: number
  ) {
    return await SwagOrder.aggregate([
      {
        $match: {
          organization: organizationId,
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          },
          status: { $in: ["completed", "shipped", "delivered"] },
        },
      },
      { $unwind: "$packSnapshot.items" },
      {
        $group: {
          _id: "$packSnapshot.items.product",
          productName: { $first: "$packSnapshot.items.name" },
          sku: { $first: "$packSnapshot.items.sku" },
          totalSold: { $sum: "$packSnapshot.items.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: [
                "$packSnapshot.items.quantity",
                "$packSnapshot.items.price",
              ],
            },
          },
        },
      },
      {
        $project: {
          productId: "$_id",
          productName: 1,
          sku: 1,
          totalSold: 1,
          totalRevenue: 1,
          averagePrice: {
            $divide: ["$totalRevenue", "$totalSold"],
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: topN },
    ]);
  }

  private async getRevenueByCategory(
    organizationId: string,
    dateRange: DateRange
  ) {
    const results = await SwagOrder.aggregate([
      {
        $match: {
          organization: organizationId,
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          },
          status: { $in: ["completed", "shipped", "delivered"] },
        },
      },
      { $unwind: "$packSnapshot.items" },
      {
        $group: {
          _id: "$packSnapshot.items.category",
          revenue: {
            $sum: {
              $multiply: [
                "$packSnapshot.items.quantity",
                "$packSnapshot.items.price",
              ],
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          revenue: 1,
          orderCount: 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Calculate percentages
    const totalRevenue = results.reduce((sum, item) => sum + item.revenue, 0);

    return results.map((item) => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    }));
  }

  private async getSlowMovingInventory(
    organizationId: string,
    thresholdDays: number
  ) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

    // Get variants with their last sale date
    const variants = await SkuVariant.aggregate([
      {
        $match: {
          "inventory.onHand": { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "swagorders",
          let: { variantId: "$_id" },
          pipeline: [
            { $unwind: "$packSnapshot.items" },
            {
              $match: {
                $expr: { $eq: ["$packSnapshot.items.variant", "$$variantId"] },
                status: { $in: ["completed", "shipped", "delivered"] },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { createdAt: 1 } },
          ],
          as: "lastSale",
        },
      },
      {
        $project: {
          variantId: "$_id",
          sku: 1,
          productName: "$name",
          onHand: "$inventory.onHand",
          lastSoldDate: { $arrayElemAt: ["$lastSale.createdAt", 0] },
          daysSinceLastSale: {
            $cond: {
              if: { $gt: [{ $size: "$lastSale" }, 0] },
              then: {
                $divide: [
                  {
                    $subtract: [
                      new Date(),
                      { $arrayElemAt: ["$lastSale.createdAt", 0] },
                    ],
                  },
                  86400000, // milliseconds in a day
                ],
              },
              else: 999, // Never sold
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { lastSoldDate: { $lt: thresholdDate } },
            { lastSoldDate: null },
          ],
        },
      },
      { $sort: { daysSinceLastSale: -1 } },
      { $limit: 50 },
    ]);

    return variants;
  }

  private async getOrderVolumeTrends(
    organizationId: string,
    dateRange: DateRange,
    groupBy: "day" | "week" | "month"
  ) {
    const groupFormat = this.getDateGroupFormat(groupBy);

    return await SwagOrder.aggregate([
      {
        $match: {
          organization: organizationId,
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          },
        },
      },
      {
        $group: {
          _id: groupFormat,
          orderCount: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          period: "$_id",
          orderCount: 1,
          revenue: 1,
          averageOrderValue: {
            $divide: ["$revenue", "$orderCount"],
          },
        },
      },
      { $sort: { period: 1 } },
    ]);
  }

  private async getRevenueTrends(
    organizationId: string,
    dateRange: DateRange,
    groupBy: "day" | "week" | "month"
  ) {
    const groupFormat = this.getDateGroupFormat(groupBy);

    const trends = await SwagOrder.aggregate([
      {
        $match: {
          organization: organizationId,
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          },
          status: { $in: ["completed", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate growth rates
    return trends.map((trend, index) => {
      const previousRevenue =
        index > 0 ? trends[index - 1].revenue : trend.revenue;
      const growth =
        previousRevenue > 0
          ? ((trend.revenue - previousRevenue) / previousRevenue) * 100
          : 0;

      return {
        period: trend._id,
        revenue: trend.revenue,
        growth,
      };
    });
  }

  private async getAverageOrderValue(
    organizationId: string,
    dateRange: DateRange
  ) {
    // Current period
    const currentStats = await SwagOrder.aggregate([
      {
        $match: {
          organization: organizationId,
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          },
          status: { $in: ["completed", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    // Previous period (same duration)
    const duration =
      dateRange.endDate.getTime() - dateRange.startDate.getTime();
    const previousStart = new Date(dateRange.startDate.getTime() - duration);
    const previousEnd = dateRange.startDate;

    const previousStats = await SwagOrder.aggregate([
      {
        $match: {
          organization: organizationId,
          createdAt: {
            $gte: previousStart,
            $lt: previousEnd,
          },
          status: { $in: ["completed", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const current =
      currentStats[0]?.orderCount > 0
        ? currentStats[0].totalRevenue / currentStats[0].orderCount
        : 0;

    const previous =
      previousStats[0]?.orderCount > 0
        ? previousStats[0].totalRevenue / previousStats[0].orderCount
        : 0;

    const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return { current, previous, change };
  }

  private getDateGroupFormat(groupBy: "day" | "week" | "month") {
    switch (groupBy) {
      case "day":
        return {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
      case "week":
        return {
          $dateToString: { format: "%Y-W%V", date: "$createdAt" },
        };
      case "month":
        return {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion
    // In production, use a proper CSV library
    const rows: string[] = [];

    if (data.topProducts) {
      rows.push("Top Products");
      rows.push("Product Name,SKU,Total Sold,Total Revenue,Average Price");
      data.topProducts.forEach((product: any) => {
        rows.push(
          `${product.productName},${product.sku},${product.totalSold},${product.totalRevenue},${product.averagePrice}`
        );
      });
      rows.push("");
    }

    if (data.suppliers) {
      rows.push("Supplier Performance");
      rows.push(
        "Supplier Name,On-Time Rate,Quality Score,Avg Lead Time,Total Orders,Avg Cost"
      );
      data.suppliers.forEach((supplier: any) => {
        rows.push(
          `${supplier.supplierName},${supplier.onTimeDeliveryRate}%,${supplier.qualityScore}%,${supplier.averageLeadTime},${supplier.totalOrders},${supplier.averageCost}`
        );
      });
      rows.push("");
    }

    if (data.volumeTrends) {
      rows.push("Order Volume Trends");
      rows.push("Period,Order Count,Revenue,Average Order Value");
      data.volumeTrends.forEach((trend: any) => {
        rows.push(
          `${trend.period},${trend.orderCount},${trend.revenue},${trend.averageOrderValue}`
        );
      });
    }

    return rows.join("\n");
  }
}
