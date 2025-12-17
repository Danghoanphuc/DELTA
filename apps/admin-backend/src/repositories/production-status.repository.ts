// @ts-nocheck
/**
 * Production Status Repository
 *
 * Data access layer for production order status management
 * Handles status updates, logging, and timeline queries
 */

import {
  ProductionOrder,
  IProductionOrder,
} from "../models/production-order.model.js";
import mongoose from "mongoose";

export interface StatusUpdateData {
  status: string;
  note?: string;
  updatedBy: mongoose.Types.ObjectId;
}

export interface ProductionLogEntry {
  stage: string;
  operatorId: mongoose.Types.ObjectId;
  stationId?: string;
  timestamp: Date;
  notes?: string;
}

export interface TimelineStage {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: mongoose.Types.ObjectId;
}

export interface ProductionTimeline {
  orderId: string;
  stages: TimelineStage[];
  currentStage: string;
  estimatedCompletion?: Date;
}

export class ProductionStatusRepository {
  /**
   * Update production order status
   * @param orderId - Production order ID
   * @param data - Status update data
   * @returns Updated production order
   */
  async updateStatus(
    orderId: string,
    data: StatusUpdateData
  ): Promise<IProductionOrder | null> {
    const order = await ProductionOrder.findById(orderId);

    if (!order) {
      return null;
    }

    // Update status
    order.status = data.status;

    // Add to status history
    order.statusHistory.push({
      status: data.status,
      timestamp: new Date(),
      note: data.note,
      updatedBy: data.updatedBy,
    });

    return await order.save();
  }

  /**
   * Add production log entry
   * @param orderId - Production order ID
   * @param logEntry - Log entry data
   * @returns Updated production order
   */
  async addLog(
    orderId: string,
    logEntry: ProductionLogEntry
  ): Promise<IProductionOrder | null> {
    const order = await ProductionOrder.findById(orderId);

    if (!order) {
      return null;
    }

    // Add log to status history
    order.statusHistory.push({
      status: logEntry.stage,
      timestamp: logEntry.timestamp,
      note: logEntry.notes,
      updatedBy: logEntry.operatorId,
    });

    return await order.save();
  }

  /**
   * Get production timeline for an order
   * @param orderId - Production order ID
   * @returns Production timeline with all stages
   */
  async getTimeline(orderId: string): Promise<ProductionTimeline | null> {
    const order = await ProductionOrder.findById(orderId).lean();

    if (!order) {
      return null;
    }

    // Sort status history by timestamp
    const stages = order.statusHistory
      .map((entry) => ({
        status: entry.status,
        timestamp: entry.timestamp,
        note: entry.note,
        updatedBy: entry.updatedBy,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return {
      orderId: order._id.toString(),
      stages,
      currentStage: order.status,
      estimatedCompletion: order.expectedCompletionDate,
    };
  }

  /**
   * Find production order by ID
   * @param orderId - Production order ID
   * @returns Production order
   */
  async findById(orderId: string): Promise<IProductionOrder | null> {
    return await ProductionOrder.findById(orderId).lean();
  }

  /**
   * Find production orders by status
   * @param status - Production status
   * @returns Array of production orders
   */
  async findByStatus(status: string): Promise<IProductionOrder[]> {
    return await ProductionOrder.find({ status }).lean();
  }

  /**
   * Find production orders by swag order ID
   * @param swagOrderId - Swag order ID
   * @returns Array of production orders
   */
  async findBySwagOrder(swagOrderId: string): Promise<IProductionOrder[]> {
    return await ProductionOrder.find({ swagOrderId }).lean();
  }
}
