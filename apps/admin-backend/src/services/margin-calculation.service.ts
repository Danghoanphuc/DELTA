/**
 * Margin Calculation Service
 *
 * Tính toán margin và trigger alerts khi margin thấp:
 * - Calculate gross margin
 * - Calculate margin percentage
 * - Check margin thresholds
 * - Generate margin reports
 *
 * Requirements: 15.2, 15.3, 15.5
 */

import { SwagOrder } from "../models/swag-order.model.js";
import { Logger } from "../shared/utils/logger.js";
import {
  CostCalculationService,
  CostBreakdown,
} from "./cost-calculation.service.js";
import { ValidationException } from "../shared/exceptions.js";

export interface ProductMargin {
  productId: string;
  productName: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
  orderCount: number;
}

export interface CustomerMargin {
  organizationId: string;
  organizationName: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
  orderCount: number;
}

export interface MarginReport {
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalMargin: number;
    averageMarginPercentage: number;
    orderCount: number;
  };
  byProduct: ProductMargin[];
  byCustomer: CustomerMargin[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class MarginCalculationService {
  private readonly costCalculationService: CostCalculationService;
  private readonly LOW_MARGIN_THRESHOLD = 20; // 20%

  constructor() {
    this.costCalculationService = new CostCalculationService();
  }

  /**
   * Calculate gross margin
   * @param totalPrice - Order total price
   * @param totalCost - Order total cost
   * @returns Gross margin amount
   */
  calculateGrossMargin(totalPrice: number, totalCost: number): number {
    return totalPrice - totalCost;
  }

  /**
   * Calculate margin percentage
   * @param totalPrice - Order total price
   * @param totalCost - Order total cost
   * @returns Margin percentage
   */
  calculateMarginPercentage(totalPrice: number, totalCost: number): number {
    if (totalPrice === 0) return 0;
    return ((totalPrice - totalCost) / totalPrice) * 100;
  }

  /**
   * Check if margin is below threshold and alert
   * @param order - Swag order
   * @param costBreakdown - Cost breakdown
   * @returns Alert status
   */
  async checkMarginThreshold(
    order: any,
    costBreakdown: CostBreakdown
  ): Promise<{ shouldAlert: boolean; message?: string }> {
    const marginPercentage = costBreakdown.marginPercentage;

    if (marginPercentage < this.LOW_MARGIN_THRESHOLD) {
      const message = `Low margin alert: Order ${
        order.orderNumber
      } has ${marginPercentage.toFixed(2)}% margin (threshold: ${
        this.LOW_MARGIN_THRESHOLD
      }%)`;

      Logger.warn(`[MarginCalcSvc] ${message}`);

      // TODO: Integrate with alert service when available
      // await this.alertService.sendLowMarginAlert({
      //   orderId: order._id,
      //   orderNumber: order.orderNumber,
      //   marginPercentage,
      //   threshold: this.LOW_MARGIN_THRESHOLD,
      // });

      return { shouldAlert: true, message };
    }

    return { shouldAlert: false };
  }

  /**
   * Generate margin report by product
   * @param dateRange - Date range for report
   * @returns Margin report by product
   */
  async generateMarginReportByProduct(
    dateRange: DateRange
  ): Promise<ProductMargin[]> {
    Logger.debug(
      `[MarginCalcSvc] Generating margin report by product from ${dateRange.startDate} to ${dateRange.endDate}`
    );

    // Validate date range
    if (dateRange.startDate > dateRange.endDate) {
      throw new ValidationException("Start date phải trước end date");
    }

    const orders = await SwagOrder.find({
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      status: { $in: ["completed", "shipped", "delivered"] },
    });

    Logger.debug(`[MarginCalcSvc] Found ${orders.length} completed orders`);

    // Group by product and calculate margins
    const productMargins = new Map<string, ProductMargin>();

    for (const order of orders) {
      for (const item of order.packSnapshot.items) {
        const key = item.product.toString();

        if (!productMargins.has(key)) {
          productMargins.set(key, {
            productId: item.product,
            productName: item.name,
            revenue: 0,
            cost: 0,
            margin: 0,
            marginPercentage: 0,
            orderCount: 0,
          });
        }

        const margin = productMargins.get(key)!;
        margin.revenue += item.price * item.quantity;
        margin.cost += item.cost * item.quantity;
        margin.orderCount++;
      }
    }

    // Calculate final margins
    const results = Array.from(productMargins.values()).map((m) => ({
      ...m,
      margin: m.revenue - m.cost,
      marginPercentage:
        m.revenue > 0 ? ((m.revenue - m.cost) / m.revenue) * 100 : 0,
    }));

    // Sort by revenue descending
    results.sort((a, b) => b.revenue - a.revenue);

    Logger.success(
      `[MarginCalcSvc] Generated margin report for ${results.length} products`
    );

    return results;
  }

  /**
   * Generate margin report by customer
   * @param dateRange - Date range for report
   * @returns Margin report by customer
   */
  async generateMarginReportByCustomer(
    dateRange: DateRange
  ): Promise<CustomerMargin[]> {
    Logger.debug(
      `[MarginCalcSvc] Generating margin report by customer from ${dateRange.startDate} to ${dateRange.endDate}`
    );

    // Validate date range
    if (dateRange.startDate > dateRange.endDate) {
      throw new ValidationException("Start date phải trước end date");
    }

    const orders = await SwagOrder.find({
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      status: { $in: ["completed", "shipped", "delivered"] },
    }).populate("organization", "businessName");

    Logger.debug(`[MarginCalcSvc] Found ${orders.length} completed orders`);

    // Group by customer and calculate margins
    const customerMargins = new Map<string, CustomerMargin>();

    for (const order of orders) {
      const costBreakdown =
        await this.costCalculationService.calculateTotalCost(order);
      const key = order.organization._id.toString();

      if (!customerMargins.has(key)) {
        customerMargins.set(key, {
          organizationId: order.organization._id,
          organizationName: order.organization.businessName || "Unknown",
          revenue: 0,
          cost: 0,
          margin: 0,
          marginPercentage: 0,
          orderCount: 0,
        });
      }

      const margin = customerMargins.get(key)!;
      margin.revenue += costBreakdown.totalPrice;
      margin.cost += costBreakdown.totalCost;
      margin.orderCount++;
    }

    // Calculate final margins
    const results = Array.from(customerMargins.values()).map((m) => ({
      ...m,
      margin: m.revenue - m.cost,
      marginPercentage:
        m.revenue > 0 ? ((m.revenue - m.cost) / m.revenue) * 100 : 0,
    }));

    // Sort by revenue descending
    results.sort((a, b) => b.revenue - a.revenue);

    Logger.success(
      `[MarginCalcSvc] Generated margin report for ${results.length} customers`
    );

    return results;
  }

  /**
   * Generate complete margin report
   * @param dateRange - Date range for report
   * @returns Complete margin report
   */
  async generateMarginReport(dateRange: DateRange): Promise<MarginReport> {
    Logger.debug(
      `[MarginCalcSvc] Generating complete margin report from ${dateRange.startDate} to ${dateRange.endDate}`
    );

    const [byProduct, byCustomer] = await Promise.all([
      this.generateMarginReportByProduct(dateRange),
      this.generateMarginReportByCustomer(dateRange),
    ]);

    // Calculate summary
    const totalRevenue = byCustomer.reduce((sum, c) => sum + c.revenue, 0);
    const totalCost = byCustomer.reduce((sum, c) => sum + c.cost, 0);
    const totalMargin = totalRevenue - totalCost;
    const averageMarginPercentage =
      totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
    const orderCount = byCustomer.reduce((sum, c) => sum + c.orderCount, 0);

    const report: MarginReport = {
      summary: {
        totalRevenue,
        totalCost,
        totalMargin,
        averageMarginPercentage,
        orderCount,
      },
      byProduct,
      byCustomer,
      dateRange,
    };

    Logger.success(
      `[MarginCalcSvc] Complete margin report generated: ${orderCount} orders, ${averageMarginPercentage.toFixed(
        2
      )}% avg margin`
    );

    return report;
  }
}
