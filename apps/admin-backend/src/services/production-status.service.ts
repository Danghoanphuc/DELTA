/**
 * Production Status Service
 *
 * Business logic for production status management
 * Handles status updates, logging, timeline, and issue reporting
 */

import {
  ProductionStatusRepository,
  StatusUpdateData,
  ProductionLogEntry,
  ProductionTimeline,
} from "../repositories/production-status.repository.js";
import { productionEventEmitter } from "./production-event-emitter.service.js";
import { Logger } from "../utils/logger.js";
import {
  NotFoundException,
  ValidationException,
} from "../shared/exceptions/index.js";
import mongoose from "mongoose";

export interface ProductionStatus {
  stage:
    | "pending"
    | "confirmed"
    | "in_production"
    | "qc_check"
    | "completed"
    | "failed";
  substage?: string;
  progress?: number;
  notes?: string;
}

export interface ScanResult {
  orderId: string;
  status: string;
  timestamp: Date;
  operatorId: string;
}

export interface ProductionIssue {
  issueType: string;
  description: string;
  reportedBy: mongoose.Types.ObjectId;
  severity?: "low" | "medium" | "high" | "critical";
}

export class ProductionStatusService {
  private repository: ProductionStatusRepository;

  constructor() {
    this.repository = new ProductionStatusRepository();
  }

  /**
   * Update production status with logging and real-time broadcast
   * @param orderId - Production order ID
   * @param status - New production status
   * @param operatorId - ID of operator making the change
   * @returns Updated production order
   */
  async updateStatus(
    orderId: string,
    status: ProductionStatus,
    operatorId: string
  ): Promise<any> {
    Logger.debug(`[ProductionStatusSvc] Updating status for order ${orderId}`);

    // Validate input
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationException("ID đơn hàng không hợp lệ");
    }

    if (!status.stage) {
      throw new ValidationException("Trạng thái sản xuất không được để trống");
    }

    if (!operatorId || !mongoose.Types.ObjectId.isValid(operatorId)) {
      throw new ValidationException("ID người vận hành không hợp lệ");
    }

    // Check if order exists
    const existingOrder = await this.repository.findById(orderId);
    if (!existingOrder) {
      throw new NotFoundException("Production Order", orderId);
    }

    // Update status via repository
    const statusUpdateData: StatusUpdateData = {
      status: status.stage,
      note: status.notes,
      updatedBy: new mongoose.Types.ObjectId(operatorId),
    };

    const updatedOrder = await this.repository.updateStatus(
      orderId,
      statusUpdateData
    );

    if (!updatedOrder) {
      throw new Error("Không thể cập nhật trạng thái đơn hàng");
    }

    // Emit real-time event
    await productionEventEmitter.emitStatusUpdate({
      orderId,
      status: status.stage,
      substage: status.substage,
      progress: status.progress,
      notes: status.notes,
      operatorId,
      timestamp: new Date(),
    });

    Logger.success(
      `[ProductionStatusSvc] Updated status for order ${orderId} to ${status.stage}`
    );

    return updatedOrder;
  }

  /**
   * Handle barcode scan at production station
   * @param barcode - Scanned barcode
   * @param stationId - Production station ID
   * @param operatorId - Operator ID
   * @returns Scan result
   */
  async scanBarcode(
    barcode: string,
    stationId: string,
    operatorId: string
  ): Promise<ScanResult> {
    Logger.debug(`[ProductionStatusSvc] Processing barcode scan: ${barcode}`);

    // Validate input
    if (!barcode || barcode.trim().length === 0) {
      throw new ValidationException("Mã vạch không được để trống");
    }

    if (!stationId || stationId.trim().length === 0) {
      throw new ValidationException("ID trạm sản xuất không được để trống");
    }

    if (!operatorId || !mongoose.Types.ObjectId.isValid(operatorId)) {
      throw new ValidationException("ID người vận hành không hợp lệ");
    }

    // TODO: Implement barcode lookup logic
    // For now, assume barcode is the order ID
    const orderId = barcode;

    // Check if order exists
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new NotFoundException("Production Order", orderId);
    }

    // Add log entry
    const logEntry: ProductionLogEntry = {
      stage: `scanned_at_${stationId}`,
      operatorId: new mongoose.Types.ObjectId(operatorId),
      stationId,
      timestamp: new Date(),
      notes: `Scanned at station ${stationId}`,
    };

    await this.repository.addLog(orderId, logEntry);

    Logger.success(
      `[ProductionStatusSvc] Barcode scan processed for order ${orderId}`
    );

    return {
      orderId,
      status: order.status,
      timestamp: new Date(),
      operatorId,
    };
  }

  /**
   * Get production timeline for an order
   * @param orderId - Production order ID
   * @returns Production timeline
   */
  async getTimeline(orderId: string): Promise<ProductionTimeline> {
    Logger.debug(`[ProductionStatusSvc] Getting timeline for order ${orderId}`);

    // Validate input
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationException("ID đơn hàng không hợp lệ");
    }

    // Get timeline from repository
    const timeline = await this.repository.getTimeline(orderId);

    if (!timeline) {
      throw new NotFoundException("Production Order", orderId);
    }

    Logger.success(
      `[ProductionStatusSvc] Retrieved timeline for order ${orderId}`
    );

    return timeline;
  }

  /**
   * Report production issue
   * @param orderId - Production order ID
   * @param issue - Issue details
   * @returns void
   */
  async reportIssue(orderId: string, issue: ProductionIssue): Promise<void> {
    Logger.debug(`[ProductionStatusSvc] Reporting issue for order ${orderId}`);

    // Validate input
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationException("ID đơn hàng không hợp lệ");
    }

    if (!issue.issueType || issue.issueType.trim().length === 0) {
      throw new ValidationException("Loại vấn đề không được để trống");
    }

    if (!issue.description || issue.description.trim().length === 0) {
      throw new ValidationException("Mô tả vấn đề không được để trống");
    }

    // Check if order exists
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new NotFoundException("Production Order", orderId);
    }

    // Emit issue event for real-time notification
    await productionEventEmitter.emitIssue({
      orderId,
      issueType: issue.issueType,
      description: issue.description,
      reportedBy: issue.reportedBy.toString(),
      timestamp: new Date(),
    });

    // TODO: Create issue record in database
    // TODO: Send notification to assigned Sales

    Logger.success(`[ProductionStatusSvc] Issue reported for order ${orderId}`);
  }
}
