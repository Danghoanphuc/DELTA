// @ts-nocheck
/**
 * Supplier Service
 * Handles supplier management and performance tracking
 *
 * Phase 8.1.2: Supplier Performance Tracking
 */

import { Supplier } from "../models/catalog.models.js";
import { ProductionOrder } from "../models/production-order.models.js";
import { Logger } from "../shared/utils/logger.js";
import {
  NotFoundException,
  ValidationException,
} from "../shared/exceptions/index.js";
import mongoose from "mongoose";

// ============================================
// INTERFACES
// ============================================

export interface SupplierPerformanceMetrics {
  supplierId: string;
  supplierName: string;
  supplierCode: string;

  // Delivery Performance
  totalOrders: number;
  completedOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimeDeliveryRate: number;

  // Quality Performance
  totalQCChecks: number;
  passedQCChecks: number;
  failedQCChecks: number;
  qualityScore: number;

  // Lead Time Performance
  averageLeadTime: number;
  minLeadTime: number;
  maxLeadTime: number;

  // Cost Performance
  averageCost: number;
  totalSpent: number;

  // Last Updated
  lastUpdated: Date;
}

export interface LeadTimeRecord {
  productionOrderId: string;
  productionOrderNumber: string;
  orderedAt: Date;
  expectedCompletionDate: Date;
  actualCompletionDate: Date;
  leadTimeDays: number;
  wasOnTime: boolean;
}

export interface SupplierComparison {
  supplierId: string;
  supplierName: string;
  onTimeRate: number;
  qualityScore: number;
  averageLeadTime: number;
  averageCost: number;
  totalOrders: number;
  rating: number;
}

// ============================================
// SUPPLIER SERVICE
// ============================================

export class SupplierService {
  /**
   * Get supplier performance metrics
   */
  async getSupplierPerformance(
    supplierId: string
  ): Promise<SupplierPerformanceMetrics> {
    Logger.debug(
      `[SupplierSvc] Getting performance for supplier: ${supplierId}`
    );

    // Get supplier
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new NotFoundException("Supplier", supplierId);
    }

    // Update metrics if stale (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (
      !supplier.performanceMetrics.lastUpdated ||
      supplier.performanceMetrics.lastUpdated < oneHourAgo
    ) {
      await supplier.updatePerformanceMetrics();
      await supplier.save();
    }

    return {
      supplierId: supplier._id.toString(),
      supplierName: supplier.name,
      supplierCode: supplier.code,
      ...supplier.performanceMetrics.toObject(),
    };
  }

  /**
   * Get lead time history for supplier
   */
  async getLeadTimeHistory(supplierId: string): Promise<LeadTimeRecord[]> {
    Logger.debug(`[SupplierSvc] Getting lead time history for: ${supplierId}`);

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new NotFoundException("Supplier", supplierId);
    }

    // Get production order numbers
    const productionOrderIds = supplier.leadTimeHistory.map(
      (h) => h.productionOrderId
    );
    const productionOrders = await ProductionOrder.find({
      _id: { $in: productionOrderIds },
    }).select("productionOrderNumber");

    const orderNumberMap = new Map(
      productionOrders.map((o) => [o._id.toString(), o.productionOrderNumber])
    );

    return supplier.leadTimeHistory.map((record) => ({
      productionOrderId: record.productionOrderId.toString(),
      productionOrderNumber:
        orderNumberMap.get(record.productionOrderId.toString()) || "N/A",
      orderedAt: record.orderedAt,
      expectedCompletionDate: record.expectedCompletionDate,
      actualCompletionDate: record.actualCompletionDate,
      leadTimeDays: record.leadTimeDays,
      wasOnTime: record.wasOnTime,
    }));
  }

  /**
   * Record lead time when production order completes
   */
  async recordLeadTime(
    supplierId: string,
    productionOrderId: string,
    orderedAt: Date,
    expectedDate: Date,
    actualDate: Date
  ): Promise<void> {
    Logger.debug(
      `[SupplierSvc] Recording lead time for supplier ${supplierId}, order ${productionOrderId}`
    );

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new NotFoundException("Supplier", supplierId);
    }

    await supplier.recordLeadTime(
      new mongoose.Types.ObjectId(productionOrderId),
      orderedAt,
      expectedDate,
      actualDate
    );

    Logger.success(
      `[SupplierSvc] Recorded lead time for supplier ${supplier.name}`
    );
  }

  /**
   * Update supplier rating
   */
  async updateSupplierRating(
    supplierId: string,
    rating: number
  ): Promise<void> {
    Logger.debug(`[SupplierSvc] Updating rating for supplier: ${supplierId}`);

    // Validate rating
    if (rating < 0 || rating > 5) {
      throw new ValidationException("Rating must be between 0 and 5");
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new NotFoundException("Supplier", supplierId);
    }

    supplier.rating = rating;
    await supplier.save();

    Logger.success(
      `[SupplierSvc] Updated rating for ${supplier.name} to ${rating}`
    );
  }

  /**
   * Track quality issue from QC check
   */
  async trackQualityIssue(
    supplierId: string,
    productionOrderId: string,
    passed: boolean
  ): Promise<void> {
    Logger.debug(
      `[SupplierSvc] Tracking QC result for supplier ${supplierId}: ${
        passed ? "PASSED" : "FAILED"
      }`
    );

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      throw new NotFoundException("Supplier", supplierId);
    }

    // Update metrics
    await supplier.updatePerformanceMetrics();

    Logger.success(
      `[SupplierSvc] Tracked QC result for supplier ${supplier.name}`
    );
  }

  /**
   * Compare suppliers by performance
   */
  async compareSuppliers(
    supplierIds?: string[]
  ): Promise<SupplierComparison[]> {
    Logger.debug(`[SupplierSvc] Comparing suppliers`);

    // Build query
    const query: any = { isActive: true };
    if (supplierIds && supplierIds.length > 0) {
      query._id = { $in: supplierIds };
    }

    // Get suppliers
    const suppliers = await Supplier.find(query).sort({
      "performanceMetrics.onTimeDeliveryRate": -1,
    });

    // Update stale metrics
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const supplier of suppliers) {
      if (
        !supplier.performanceMetrics.lastUpdated ||
        supplier.performanceMetrics.lastUpdated < oneHourAgo
      ) {
        await supplier.updatePerformanceMetrics();
      }
    }

    return suppliers.map((supplier) => ({
      supplierId: supplier._id.toString(),
      supplierName: supplier.name,
      onTimeRate: supplier.performanceMetrics.onTimeDeliveryRate,
      qualityScore: supplier.performanceMetrics.qualityScore,
      averageLeadTime: supplier.performanceMetrics.averageLeadTime,
      averageCost: supplier.performanceMetrics.averageCost,
      totalOrders: supplier.performanceMetrics.totalOrders,
      rating: supplier.rating,
    }));
  }

  /**
   * Get top performing suppliers
   */
  async getTopSuppliers(limit: number = 10): Promise<SupplierComparison[]> {
    Logger.debug(`[SupplierSvc] Getting top ${limit} suppliers`);

    const suppliers = await Supplier.find({ isActive: true })
      .sort({
        "performanceMetrics.onTimeDeliveryRate": -1,
        "performanceMetrics.qualityScore": -1,
      })
      .limit(limit);

    return suppliers.map((supplier) => ({
      supplierId: supplier._id.toString(),
      supplierName: supplier.name,
      onTimeRate: supplier.performanceMetrics.onTimeDeliveryRate,
      qualityScore: supplier.performanceMetrics.qualityScore,
      averageLeadTime: supplier.performanceMetrics.averageLeadTime,
      averageCost: supplier.performanceMetrics.averageCost,
      totalOrders: supplier.performanceMetrics.totalOrders,
      rating: supplier.rating,
    }));
  }

  /**
   * Get suppliers with low performance
   */
  async getLowPerformingSuppliers(
    onTimeThreshold: number = 80,
    qualityThreshold: number = 90
  ): Promise<SupplierComparison[]> {
    Logger.debug(`[SupplierSvc] Getting low performing suppliers`);

    const suppliers = await Supplier.find({
      isActive: true,
      $or: [
        { "performanceMetrics.onTimeDeliveryRate": { $lt: onTimeThreshold } },
        { "performanceMetrics.qualityScore": { $lt: qualityThreshold } },
      ],
    });

    return suppliers.map((supplier) => ({
      supplierId: supplier._id.toString(),
      supplierName: supplier.name,
      onTimeRate: supplier.performanceMetrics.onTimeDeliveryRate,
      qualityScore: supplier.performanceMetrics.qualityScore,
      averageLeadTime: supplier.performanceMetrics.averageLeadTime,
      averageCost: supplier.performanceMetrics.averageCost,
      totalOrders: supplier.performanceMetrics.totalOrders,
      rating: supplier.rating,
    }));
  }

  /**
   * Refresh all supplier metrics
   */
  async refreshAllMetrics(): Promise<void> {
    Logger.debug(`[SupplierSvc] Refreshing all supplier metrics`);

    const suppliers = await Supplier.find({ isActive: true });

    for (const supplier of suppliers) {
      await supplier.updatePerformanceMetrics();
    }

    Logger.success(
      `[SupplierSvc] Refreshed metrics for ${suppliers.length} suppliers`
    );
  }
}
