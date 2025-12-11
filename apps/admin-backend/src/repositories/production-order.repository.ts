// @ts-nocheck
// apps/admin-backend/src/repositories/production-order.repository.ts
// ✅ Production Order Repository
// Phase 5.1.1: Production Order Management - Data Access Layer

import mongoose from "mongoose";
import {
  ProductionOrder,
  IProductionOrder,
  PRODUCTION_ORDER_STATUS,
} from "../models/production-order.models.js";

/**
 * Production Order Repository
 * Handles all database operations for production orders
 */
export class ProductionOrderRepository {
  /**
   * Create new production order
   */
  async create(data: Partial<IProductionOrder>): Promise<IProductionOrder> {
    const productionOrder = new ProductionOrder(data);
    return await productionOrder.save();
  }

  /**
   * Find production order by ID
   */
  async findById(id: string): Promise<IProductionOrder | null> {
    return await ProductionOrder.findById(id)
      .populate("supplierId", "name contact")
      .populate("swagOrderId", "orderNumber")
      .lean();
  }

  /**
   * Find production orders by swag order
   */
  async findBySwagOrder(swagOrderId: string): Promise<IProductionOrder[]> {
    return await ProductionOrder.find({ swagOrderId })
      .populate("supplierId", "name contact")
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Find production orders by supplier
   */
  async findBySupplier(
    supplierId: string,
    options?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ): Promise<{ orders: IProductionOrder[]; total: number }> {
    const query: any = { supplierId };

    // Filter by status
    if (options?.status && options.status !== "all") {
      query.status = options.status;
    }

    // Filter by date range
    if (options?.startDate || options?.endDate) {
      query.orderedAt = {};
      if (options.startDate) query.orderedAt.$gte = options.startDate;
      if (options.endDate) query.orderedAt.$lte = options.endDate;
    }

    // Pagination
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      ProductionOrder.find(query)
        .populate("supplierId", "name contact")
        .populate("swagOrderId", "orderNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductionOrder.countDocuments(query),
    ]);

    return { orders, total };
  }

  /**
   * Find production orders by status
   */
  async findByStatus(
    status: string,
    options?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ orders: IProductionOrder[]; total: number }> {
    const query = { status };

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      ProductionOrder.find(query)
        .populate("supplierId", "name contact")
        .populate("swagOrderId", "orderNumber")
        .sort({ expectedCompletionDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductionOrder.countDocuments(query),
    ]);

    return { orders, total };
  }

  /**
   * Find delayed production orders
   */
  async findDelayed(): Promise<IProductionOrder[]> {
    return await ProductionOrder.find({
      status: {
        $in: [
          PRODUCTION_ORDER_STATUS.PENDING,
          PRODUCTION_ORDER_STATUS.IN_PRODUCTION,
        ],
      },
      expectedCompletionDate: { $lt: new Date() },
    })
      .populate("supplierId", "name contact")
      .populate("swagOrderId", "orderNumber")
      .sort({ expectedCompletionDate: 1 })
      .lean();
  }

  /**
   * Update production order status
   */
  async updateStatus(
    id: string,
    status: string,
    updatedBy: mongoose.Types.ObjectId,
    note?: string
  ): Promise<IProductionOrder | null> {
    const productionOrder = await ProductionOrder.findById(id);
    if (!productionOrder) return null;

    productionOrder.addStatusHistory(status, updatedBy, note);
    return await productionOrder.save();
  }

  /**
   * Add QC check
   */
  async addQCCheck(
    id: string,
    qcData: {
      checkedBy: mongoose.Types.ObjectId;
      passed: boolean;
      photos?: string[];
      notes?: string;
      issues?: string[];
    }
  ): Promise<IProductionOrder | null> {
    const productionOrder = await ProductionOrder.findById(id);
    if (!productionOrder) return null;

    productionOrder.addQCCheck(qcData);

    // Update status based on QC result
    if (qcData.passed) {
      productionOrder.status = PRODUCTION_ORDER_STATUS.QC_CHECK;
    } else {
      productionOrder.status = PRODUCTION_ORDER_STATUS.FAILED;
    }

    return await productionOrder.save();
  }

  /**
   * Update actual cost
   */
  async updateActualCost(
    id: string,
    actualCost: number
  ): Promise<IProductionOrder | null> {
    const productionOrder = await ProductionOrder.findById(id);
    if (!productionOrder) return null;

    productionOrder.actualCost = actualCost;
    productionOrder.calculateCostVariance();

    return await productionOrder.save();
  }

  /**
   * Mark as completed
   */
  async markAsCompleted(id: string): Promise<IProductionOrder | null> {
    return await ProductionOrder.findByIdAndUpdate(
      id,
      {
        status: PRODUCTION_ORDER_STATUS.COMPLETED,
        actualCompletionDate: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Get production statistics
   */
  async getStatistics(supplierId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    avgLeadTime: number;
    onTimeRate: number;
  }> {
    const query = supplierId ? { supplierId } : {};

    const [total, byStatus, completedOrders] = await Promise.all([
      ProductionOrder.countDocuments(query),
      ProductionOrder.aggregate([
        { $match: query },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      ProductionOrder.find({
        ...query,
        status: PRODUCTION_ORDER_STATUS.COMPLETED,
        actualCompletionDate: { $exists: true },
      })
        .select("expectedCompletionDate actualCompletionDate")
        .lean(),
    ]);

    // Calculate average lead time
    let totalLeadTime = 0;
    let onTimeCount = 0;

    completedOrders.forEach((order) => {
      if (order.actualCompletionDate && order.expectedCompletionDate) {
        const leadTime =
          (order.actualCompletionDate.getTime() - order.orderedAt.getTime()) /
          (1000 * 60 * 60 * 24); // days
        totalLeadTime += leadTime;

        if (order.actualCompletionDate <= order.expectedCompletionDate) {
          onTimeCount++;
        }
      }
    });

    const avgLeadTime =
      completedOrders.length > 0 ? totalLeadTime / completedOrders.length : 0;
    const onTimeRate =
      completedOrders.length > 0
        ? (onTimeCount / completedOrders.length) * 100
        : 0;

    // Format byStatus
    const statusMap: Record<string, number> = {};
    byStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    return {
      total,
      byStatus: statusMap,
      avgLeadTime: Math.round(avgLeadTime * 10) / 10,
      onTimeRate: Math.round(onTimeRate * 10) / 10,
    };
  }

  /**
   * Delete production order
   */
  async delete(id: string): Promise<boolean> {
    const result = await ProductionOrder.findByIdAndDelete(id);
    return !!result;
  }
}
