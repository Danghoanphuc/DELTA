/**
 * Variance Analysis Service
 *
 * So sánh actual cost vs estimated cost:
 * - Record actual costs from production orders
 * - Calculate variance
 * - Analyze variance reasons
 * - Generate variance reports
 *
 * Requirements: 15.4
 */

import { SwagOrder } from "../models/swag-order.model.js";
import { ProductionOrder } from "../models/production-order.model.js";
import { Logger } from "../shared/utils/logger.js";
import {
  NotFoundException,
  ValidationException,
  ConflictException,
} from "../shared/exceptions.js";

export interface OrderVariance {
  orderId: string;
  orderNumber: string;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  reasons: string[];
}

export interface VarianceAnalysis {
  summary: {
    totalEstimated: number;
    totalActual: number;
    totalVariance: number;
    variancePercentage: number;
    orderCount: number;
  };
  byOrder: OrderVariance[];
  reasons: string[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ActualCostBreakdown {
  materials: number;
  labor: number;
  overhead: number;
}

export class VarianceAnalysisService {
  /**
   * Record actual cost from production order
   * @param productionOrderId - Production order ID
   * @param actualCost - Actual cost incurred
   * @param costBreakdown - Optional cost breakdown
   * @param notes - Optional notes
   * @returns Updated production order
   */
  async recordActualCost(
    productionOrderId: string,
    actualCost: number,
    costBreakdown?: ActualCostBreakdown,
    notes?: string
  ): Promise<any> {
    Logger.debug(
      `[VarianceAnalysisSvc] Recording actual cost for PO ${productionOrderId}: ${actualCost}`
    );

    // Validate actual cost
    if (actualCost < 0) {
      throw new ValidationException("Actual cost không thể âm");
    }

    // Get production order
    const productionOrder = await ProductionOrder.findById(productionOrderId);

    if (!productionOrder) {
      throw new NotFoundException("Production Order", productionOrderId);
    }

    // Check if production order is completed
    if (productionOrder.status !== "completed") {
      throw new ConflictException(
        "Chỉ có thể update actual cost cho production order đã completed"
      );
    }

    // Update actual cost
    productionOrder.actualCost = actualCost;
    productionOrder.costVariance = actualCost - productionOrder.estimatedCost;

    if (costBreakdown) {
      productionOrder.actualCostBreakdown = costBreakdown;
    }

    if (notes) {
      productionOrder.costNotes = notes;
    }

    await productionOrder.save();

    Logger.success(
      `[VarianceAnalysisSvc] Recorded actual cost for PO ${productionOrderId}: ${actualCost} (variance: ${productionOrder.costVariance})`
    );

    return productionOrder;
  }

  /**
   * Calculate variance for order
   * @param orderId - Swag order ID
   * @returns Variance analysis
   */
  async calculateVariance(orderId: string): Promise<OrderVariance> {
    Logger.debug(
      `[VarianceAnalysisSvc] Calculating variance for order ${orderId}`
    );

    // Get order
    const order = await SwagOrder.findById(orderId);

    if (!order) {
      throw new NotFoundException("Swag Order", orderId);
    }

    // Get production orders
    const productionOrders = await ProductionOrder.find({
      swagOrderId: orderId,
    });

    if (productionOrders.length === 0) {
      Logger.warn(
        `[VarianceAnalysisSvc] No production orders found for order ${orderId}`
      );
      return {
        orderId,
        orderNumber: order.orderNumber,
        estimatedCost: 0,
        actualCost: 0,
        variance: 0,
        variancePercentage: 0,
        reasons: ["No production orders found"],
      };
    }

    let totalEstimated = 0;
    let totalActual = 0;

    for (const po of productionOrders) {
      totalEstimated += po.estimatedCost || 0;
      totalActual += po.actualCost || po.estimatedCost || 0; // Use estimated if actual not recorded
    }

    const variance = totalActual - totalEstimated;
    const variancePercentage =
      totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0;

    const reasons = await this.analyzeVarianceReasons(productionOrders);

    Logger.debug(
      `[VarianceAnalysisSvc] Variance for order ${orderId}: ${variance} (${variancePercentage.toFixed(
        2
      )}%)`
    );

    return {
      orderId,
      orderNumber: order.orderNumber,
      estimatedCost: totalEstimated,
      actualCost: totalActual,
      variance,
      variancePercentage,
      reasons,
    };
  }

  /**
   * Analyze reasons for cost variance
   * @param productionOrders - Production orders
   * @returns List of variance reasons
   */
  async analyzeVarianceReasons(productionOrders: any[]): Promise<string[]> {
    const reasons: string[] = [];

    for (const po of productionOrders) {
      if (!po.actualCost) {
        reasons.push(`PO ${po._id}: Actual cost not yet recorded`);
        continue;
      }

      const variance = po.actualCost - po.estimatedCost;
      const variancePercentage = (variance / po.estimatedCost) * 100;

      // Only report significant variances (> 10%)
      if (Math.abs(variancePercentage) > 10) {
        if (variance > 0) {
          reasons.push(
            `PO ${po._id}: Cost overrun of ${variancePercentage.toFixed(2)}%`
          );

          // Add specific reasons if available
          if (po.costNotes) {
            reasons.push(`  - ${po.costNotes}`);
          }

          // Analyze cost breakdown if available
          if (po.actualCostBreakdown && po.estimatedCostBreakdown) {
            const materialVariance =
              po.actualCostBreakdown.materials -
              po.estimatedCostBreakdown.materials;
            const laborVariance =
              po.actualCostBreakdown.labor - po.estimatedCostBreakdown.labor;
            const overheadVariance =
              po.actualCostBreakdown.overhead -
              po.estimatedCostBreakdown.overhead;

            if (Math.abs(materialVariance) > po.estimatedCost * 0.05) {
              reasons.push(
                `  - Material cost variance: ${materialVariance.toFixed(0)}`
              );
            }
            if (Math.abs(laborVariance) > po.estimatedCost * 0.05) {
              reasons.push(
                `  - Labor cost variance: ${laborVariance.toFixed(0)}`
              );
            }
            if (Math.abs(overheadVariance) > po.estimatedCost * 0.05) {
              reasons.push(
                `  - Overhead cost variance: ${overheadVariance.toFixed(0)}`
              );
            }
          }
        } else {
          reasons.push(
            `PO ${po._id}: Cost savings of ${Math.abs(
              variancePercentage
            ).toFixed(2)}%`
          );

          if (po.costNotes) {
            reasons.push(`  - ${po.costNotes}`);
          }
        }
      }
    }

    if (reasons.length === 0) {
      reasons.push("No significant variances detected");
    }

    return reasons;
  }

  /**
   * Generate variance report
   * @param dateRange - Date range for report
   * @returns Variance analysis report
   */
  async generateVarianceReport(
    dateRange: DateRange
  ): Promise<VarianceAnalysis> {
    Logger.debug(
      `[VarianceAnalysisSvc] Generating variance report from ${dateRange.startDate} to ${dateRange.endDate}`
    );

    // Validate date range
    if (dateRange.startDate > dateRange.endDate) {
      throw new ValidationException("Start date phải trước end date");
    }

    const orders = await SwagOrder.find({
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      status: { $in: ["completed", "shipped", "delivered"] },
    });

    Logger.debug(
      `[VarianceAnalysisSvc] Found ${orders.length} completed orders`
    );

    const variances: OrderVariance[] = [];
    let totalEstimated = 0;
    let totalActual = 0;

    for (const order of orders) {
      try {
        const variance = await this.calculateVariance(order._id.toString());
        variances.push(variance);
        totalEstimated += variance.estimatedCost;
        totalActual += variance.actualCost;
      } catch (error) {
        Logger.error(
          `[VarianceAnalysisSvc] Error calculating variance for order ${order._id}:`,
          error
        );
      }
    }

    const totalVariance = totalActual - totalEstimated;
    const variancePercentage =
      totalEstimated > 0 ? (totalVariance / totalEstimated) * 100 : 0;

    const report: VarianceAnalysis = {
      summary: {
        totalEstimated,
        totalActual,
        totalVariance,
        variancePercentage,
        orderCount: variances.length,
      },
      byOrder: variances,
      reasons: variances.flatMap((v) => v.reasons),
      dateRange,
    };

    Logger.success(
      `[VarianceAnalysisSvc] Variance report generated: ${
        variances.length
      } orders, ${variancePercentage.toFixed(2)}% variance`
    );

    return report;
  }
}
