// @ts-nocheck
/**
 * JobTicketService
 *
 * Business logic for job ticket operations
 * Handles job ticket generation, QR code creation, and error logging
 *
 * Requirements: 6.1, 6.2, 6.3, 6.5
 */

import QRCode from "qrcode";
import { Types } from "mongoose";
import { JobTicketRepository } from "../repositories/job-ticket.repository.js";
import { AssetRepository } from "../repositories/asset.repository.js";
import { JobTicket, IJobTicket } from "../models/job-ticket.model.js";
import {
  NotFoundException,
  ValidationException,
} from "../shared/exceptions/index.js";
import { Logger } from "../utils/logger.js";

export interface GenerateJobTicketData {
  orderId: string;
  specifications: {
    productType: string;
    size: {
      width: number;
      height: number;
      unit: string;
    };
    paperType: string;
    quantity: number;
    printSides: "single" | "double";
    colors: number;
    finishingOptions: string[];
    specialInstructions: string;
  };
}

export interface ProductionErrorData {
  errorType: string;
  description: string;
  reportedBy: string;
}

export class JobTicketService {
  private jobTicketRepository: JobTicketRepository;
  private assetRepository: AssetRepository;

  constructor() {
    this.jobTicketRepository = new JobTicketRepository();
    this.assetRepository = new AssetRepository();
  }

  /**
   * Generate a job ticket for an order
   * Requirements: 6.1, 6.2
   */
  async generateJobTicket(data: GenerateJobTicketData): Promise<IJobTicket> {
    Logger.debug(
      `[JobTicketSvc] Generating job ticket for order: ${data.orderId}`
    );

    // Validation
    if (!data.orderId) {
      throw new ValidationException("Order ID là bắt buộc");
    }

    if (!data.specifications) {
      throw new ValidationException("Thông số kỹ thuật là bắt buộc");
    }

    // Validate specifications completeness
    const { specifications } = data;
    if (!specifications.productType) {
      throw new ValidationException("Loại sản phẩm là bắt buộc");
    }
    if (!specifications.paperType) {
      throw new ValidationException("Loại giấy là bắt buộc");
    }
    if (!specifications.quantity || specifications.quantity < 1) {
      throw new ValidationException("Số lượng phải lớn hơn 0");
    }
    if (
      !specifications.size ||
      !specifications.size.width ||
      !specifications.size.height
    ) {
      throw new ValidationException("Kích thước là bắt buộc");
    }

    // Get FINAL assets for the order
    const assets = await this.assetRepository.findByOrder(data.orderId);
    const finalAssets = assets.filter((asset) => asset.status === "final");

    if (finalAssets.length === 0) {
      throw new ValidationException(
        "Không có file FINAL nào cho đơn hàng này. Vui lòng đánh dấu ít nhất một file là FINAL trước khi tạo phiếu in."
      );
    }

    // Generate unique ticket ID
    const ticketId = await JobTicket.generateTicketId();

    // Generate QR code
    const qrCode = await this.generateQRCode(ticketId);
    const qrCodeUrl = await this.generateQRCodeDataURL(ticketId);

    // Create job ticket
    const jobTicket = await this.jobTicketRepository.create({
      ticketId,
      orderId: new Types.ObjectId(data.orderId),
      qrCode,
      qrCodeUrl,
      specifications: {
        ...specifications,
        finishingOptions: specifications.finishingOptions || [],
        specialInstructions: specifications.specialInstructions || "",
      },
      assets: finalAssets.map((asset) => asset._id),
      status: "active",
      productionLogs: [],
      productionErrors: [],
      generatedAt: new Date(),
    });

    Logger.success(
      `[JobTicketSvc] Generated job ticket: ${jobTicket.ticketId} for order ${data.orderId}`
    );

    return jobTicket;
  }

  /**
   * Generate QR code string for a ticket
   * Requirements: 6.2
   */
  private async generateQRCode(ticketId: string): Promise<string> {
    // Generate a unique QR code string that includes the ticket ID
    // This will be used to look up the ticket
    const qrCodeData = `PRINTZ-JT-${ticketId}-${Date.now()}`;
    return qrCodeData;
  }

  /**
   * Generate QR code as data URL for display/printing
   * Requirements: 6.2
   */
  private async generateQRCodeDataURL(ticketId: string): Promise<string> {
    try {
      // Generate QR code as data URL
      const qrCodeData = `PRINTZ-JT-${ticketId}`;
      const dataURL = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 300,
        margin: 2,
      });
      return dataURL;
    } catch (error) {
      Logger.error(`[JobTicketSvc] Failed to generate QR code:`, error);
      throw new Error("Không thể tạo mã QR");
    }
  }

  /**
   * Get job ticket by QR code
   * Requirements: 6.3
   */
  async getTicketByQR(qrCode: string): Promise<IJobTicket> {
    Logger.debug(`[JobTicketSvc] Looking up ticket by QR code: ${qrCode}`);

    if (!qrCode) {
      throw new ValidationException("Mã QR là bắt buộc");
    }

    const ticket = await this.jobTicketRepository.findByQR(qrCode);

    if (!ticket) {
      throw new NotFoundException("Job Ticket", qrCode);
    }

    Logger.debug(`[JobTicketSvc] Found ticket: ${ticket.ticketId}`);
    return ticket;
  }

  /**
   * Get job ticket by ID
   */
  async getTicket(ticketId: string): Promise<IJobTicket> {
    Logger.debug(`[JobTicketSvc] Getting ticket: ${ticketId}`);

    if (!ticketId) {
      throw new ValidationException("Ticket ID là bắt buộc");
    }

    const ticket = await this.jobTicketRepository.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException("Job Ticket", ticketId);
    }

    return ticket;
  }

  /**
   * Get all job tickets for an order
   */
  async getTicketsByOrder(orderId: string): Promise<IJobTicket[]> {
    Logger.debug(`[JobTicketSvc] Getting tickets for order: ${orderId}`);

    if (!orderId) {
      throw new ValidationException("Order ID là bắt buộc");
    }

    const tickets = await this.jobTicketRepository.findByOrder(orderId);
    return tickets;
  }

  /**
   * Log production error for accountability
   * Requirements: 6.5
   */
  async logProductionError(
    ticketId: string,
    errorData: ProductionErrorData
  ): Promise<IJobTicket> {
    Logger.debug(
      `[JobTicketSvc] Logging error for ticket: ${ticketId}, type: ${errorData.errorType}`
    );

    // Validation
    if (!ticketId) {
      throw new ValidationException("Ticket ID là bắt buộc");
    }

    if (!errorData.errorType) {
      throw new ValidationException("Loại lỗi là bắt buộc");
    }

    if (!errorData.description) {
      throw new ValidationException("Mô tả lỗi là bắt buộc");
    }

    if (!errorData.reportedBy) {
      throw new ValidationException("Người báo cáo là bắt buộc");
    }

    // Get ticket
    const ticket = await this.jobTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException("Job Ticket", ticketId);
    }

    // Add error to ticket
    const updatedTicket = await this.jobTicketRepository.addProductionError(
      ticketId,
      {
        errorType: errorData.errorType,
        description: errorData.description,
        reportedBy: new Types.ObjectId(errorData.reportedBy),
      }
    );

    if (!updatedTicket) {
      throw new Error("Không thể ghi nhận lỗi sản xuất");
    }

    Logger.success(
      `[JobTicketSvc] Logged error for ticket ${ticketId}: ${errorData.errorType}`
    );

    return updatedTicket;
  }

  /**
   * Add production log entry
   */
  async addProductionLog(
    ticketId: string,
    logData: {
      stage: string;
      operatorId: string;
      stationId: string;
      notes?: string;
    }
  ): Promise<IJobTicket> {
    Logger.debug(
      `[JobTicketSvc] Adding production log for ticket: ${ticketId}, stage: ${logData.stage}`
    );

    // Validation
    if (!ticketId) {
      throw new ValidationException("Ticket ID là bắt buộc");
    }

    if (!logData.stage) {
      throw new ValidationException("Giai đoạn sản xuất là bắt buộc");
    }

    if (!logData.operatorId) {
      throw new ValidationException("Operator ID là bắt buộc");
    }

    if (!logData.stationId) {
      throw new ValidationException("Station ID là bắt buộc");
    }

    // Get ticket
    const ticket = await this.jobTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException("Job Ticket", ticketId);
    }

    // Add log
    const updatedTicket = await this.jobTicketRepository.addProductionLog(
      ticketId,
      {
        stage: logData.stage,
        operatorId: new Types.ObjectId(logData.operatorId),
        stationId: logData.stationId,
        notes: logData.notes,
      }
    );

    if (!updatedTicket) {
      throw new Error("Không thể ghi nhận log sản xuất");
    }

    Logger.success(
      `[JobTicketSvc] Added production log for ticket ${ticketId}: ${logData.stage}`
    );

    return updatedTicket;
  }

  /**
   * Update job ticket status
   */
  async updateStatus(ticketId: string, status: string): Promise<IJobTicket> {
    Logger.debug(
      `[JobTicketSvc] Updating ticket ${ticketId} status to: ${status}`
    );

    if (!ticketId) {
      throw new ValidationException("Ticket ID là bắt buộc");
    }

    if (!status) {
      throw new ValidationException("Trạng thái là bắt buộc");
    }

    const ticket = await this.jobTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException("Job Ticket", ticketId);
    }

    const updatedTicket = await this.jobTicketRepository.updateStatus(
      ticketId,
      status
    );

    if (!updatedTicket) {
      throw new Error("Không thể cập nhật trạng thái phiếu in");
    }

    Logger.success(
      `[JobTicketSvc] Updated ticket ${ticketId} status to: ${status}`
    );

    return updatedTicket;
  }

  /**
   * Mark job ticket as completed
   */
  async markCompleted(ticketId: string): Promise<IJobTicket> {
    Logger.debug(`[JobTicketSvc] Marking ticket ${ticketId} as completed`);

    if (!ticketId) {
      throw new ValidationException("Ticket ID là bắt buộc");
    }

    const ticket = await this.jobTicketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException("Job Ticket", ticketId);
    }

    const updatedTicket = await this.jobTicketRepository.markCompleted(
      ticketId
    );

    if (!updatedTicket) {
      throw new Error("Không thể đánh dấu phiếu in hoàn thành");
    }

    Logger.success(`[JobTicketSvc] Marked ticket ${ticketId} as completed`);

    return updatedTicket;
  }

  /**
   * Get all active job tickets
   */
  async getActiveTickets(): Promise<IJobTicket[]> {
    Logger.debug(`[JobTicketSvc] Getting all active tickets`);
    const tickets = await this.jobTicketRepository.findActive();
    return tickets;
  }
}
