/**
 * JobTicketController
 *
 * HTTP request handlers for job ticket operations
 * Handles job ticket generation, QR code scanning, and error logging
 *
 * Requirements: 6.1, 6.3, 6.5
 */

import { Request, Response, NextFunction } from "express";
import { JobTicketService } from "../services/job-ticket.service.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import { ApiResponse } from "../shared/utils/api-response.js";

export class JobTicketController {
  private jobTicketService: JobTicketService;

  constructor() {
    this.jobTicketService = new JobTicketService();
  }

  /**
   * Generate job ticket for an order
   * @route POST /api/orders/:orderId/job-ticket
   * Requirements: 6.1
   */
  generateJobTicket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;
      const { specifications } = req.body;

      const jobTicket = await this.jobTicketService.generateJobTicket({
        orderId,
        specifications,
      });

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success({ jobTicket }, "Đã tạo phiếu in thành công!")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get job ticket details
   * @route GET /api/job-tickets/:id
   */
  getJobTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const jobTicket = await this.jobTicketService.getTicket(id);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ jobTicket }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get job tickets for an order
   * @route GET /api/orders/:orderId/job-tickets
   */
  getJobTicketsByOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;

      const jobTickets = await this.jobTicketService.getTicketsByOrder(orderId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ jobTickets }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resolve QR code to job ticket
   * @route GET /api/job-tickets/qr/:code
   * Requirements: 6.3
   */
  resolveQRCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;

      const jobTicket = await this.jobTicketService.getTicketByQR(code);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ jobTicket }, "Đã tìm thấy phiếu in!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Log production error
   * @route POST /api/job-tickets/:id/errors
   * Requirements: 6.5
   */
  logProductionError = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { errorType, description, reportedBy } = req.body;

      const jobTicket = await this.jobTicketService.logProductionError(id, {
        errorType,
        description,
        reportedBy,
      });

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ jobTicket }, "Đã ghi nhận lỗi sản xuất!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add production log
   * @route POST /api/job-tickets/:id/logs
   */
  addProductionLog = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { stage, operatorId, stationId, notes } = req.body;

      const jobTicket = await this.jobTicketService.addProductionLog(id, {
        stage,
        operatorId,
        stationId,
        notes,
      });

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ jobTicket }, "Đã ghi nhận log sản xuất!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update job ticket status
   * @route PUT /api/job-tickets/:id/status
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const jobTicket = await this.jobTicketService.updateStatus(id, status);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ jobTicket }, "Đã cập nhật trạng thái phiếu in!")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark job ticket as completed
   * @route POST /api/job-tickets/:id/complete
   */
  markCompleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const jobTicket = await this.jobTicketService.markCompleted(id);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ jobTicket }, "Đã đánh dấu phiếu in hoàn thành!")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all active job tickets
   * @route GET /api/job-tickets/active
   */
  getActiveTickets = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const jobTickets = await this.jobTicketService.getActiveTickets();

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ jobTickets }));
    } catch (error) {
      next(error);
    }
  };
}
