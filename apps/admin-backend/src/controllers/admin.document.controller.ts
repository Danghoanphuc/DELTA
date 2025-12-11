// apps/admin-backend/src/controllers/admin.document.controller.ts
// ✅ Document Controller - Phase 7.1.4
// HTTP handlers cho document operations

import { Request, Response, NextFunction } from "express";
import { DocumentService } from "../services/document.service";
import { Logger } from "../shared/utils/logger.js";
import { API_CODES } from "../shared/constants";

// ============================================
// DOCUMENT CONTROLLER
// ============================================

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  /**
   * Generate invoice from swag order
   * @route POST /api/admin/documents/invoice/:orderId
   * Requirements: 10.1, 10.2
   */
  generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { dueInDays } = req.body;

      Logger.debug(`[DocumentCtrl] POST /documents/invoice/${orderId}`);

      const invoice = await this.documentService.generateInvoice({
        swagOrderId: orderId,
        dueInDays,
      });

      res.status(API_CODES.CREATED).json({
        success: true,
        data: { invoice },
        message: "Đã tạo invoice thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate credit note
   * @route POST /api/admin/documents/credit-note/:invoiceId
   * Requirements: 10.3
   */
  generateCreditNote = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { invoiceId } = req.params;
      const { amount, reason } = req.body;

      Logger.debug(`[DocumentCtrl] POST /documents/credit-note/${invoiceId}`);

      const invoice = await this.documentService.generateCreditNote({
        invoiceId,
        amount,
        reason,
      });

      res.status(API_CODES.CREATED).json({
        success: true,
        data: { invoice },
        message: "Đã tạo credit note thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate delivery note
   * @route POST /api/admin/documents/delivery-note/:productionOrderId
   * Requirements: 10.4
   */
  generateDeliveryNote = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { productionOrderId } = req.params;

      Logger.debug(
        `[DocumentCtrl] POST /documents/delivery-note/${productionOrderId}`
      );

      const deliveryNote = await this.documentService.generateDeliveryNote({
        productionOrderId,
      });

      res.status(API_CODES.CREATED).json({
        success: true,
        data: { deliveryNote },
        message: "Đã tạo delivery note thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate packing slip
   * @route POST /api/admin/documents/packing-slip/:orderId/:recipientId
   * Requirements: 8.4
   */
  generatePackingSlip = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId, recipientId } = req.params;

      Logger.debug(
        `[DocumentCtrl] POST /documents/packing-slip/${orderId}/${recipientId}`
      );

      const packingSlip = await this.documentService.generatePackingSlip({
        swagOrderId: orderId,
        recipientId,
      });

      res.status(API_CODES.CREATED).json({
        success: true,
        data: { packingSlip },
        message: "Đã tạo packing slip thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all documents for an order
   * @route GET /api/admin/documents/:orderId
   * Requirements: 10.1, 10.2, 10.3, 10.4
   */
  getOrderDocuments = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;

      Logger.debug(`[DocumentCtrl] GET /documents/${orderId}`);

      const documents = await this.documentService.getOrderDocuments(orderId);

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { documents },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get invoice by ID
   * @route GET /api/admin/documents/invoice/:invoiceId
   * Requirements: 10.1
   */
  getInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { invoiceId } = req.params;

      Logger.debug(`[DocumentCtrl] GET /documents/invoice/${invoiceId}`);

      const invoice = await this.documentService.getInvoice(invoiceId);

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { invoice },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get invoices by organization
   * @route GET /api/admin/documents/invoices
   * Requirements: 10.1
   */
  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, status, paymentStatus, startDate, endDate } =
        req.query;

      Logger.debug(`[DocumentCtrl] GET /documents/invoices`);

      const invoices = await this.documentService.getInvoicesByOrganization(
        organizationId as string,
        {
          status: status as string,
          paymentStatus: paymentStatus as string,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        }
      );

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { invoices, count: invoices.length },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark invoice as paid
   * @route POST /api/admin/documents/invoice/:invoiceId/mark-paid
   * Requirements: 10.2
   */
  markInvoiceAsPaid = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { invoiceId } = req.params;
      const { paymentMethod, amount } = req.body;

      Logger.debug(
        `[DocumentCtrl] POST /documents/invoice/${invoiceId}/mark-paid`
      );

      const invoice = await this.documentService.markInvoiceAsPaid(
        invoiceId,
        paymentMethod,
        amount
      );

      res.status(API_CODES.SUCCESS).json({
        success: true,
        data: { invoice },
        message: "Đã đánh dấu invoice là đã thanh toán",
      });
    } catch (error) {
      next(error);
    }
  };
}
