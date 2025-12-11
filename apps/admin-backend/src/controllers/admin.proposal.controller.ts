/**
 * ProposalController - HTTP handlers for proposal operations
 *
 * Handles proposal generation, PDF download, text summary, and order conversion
 * Following SOLID principles and existing codebase patterns
 *
 * Requirements: 2.1, 2.2, 2.5
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Logger } from "../utils/logger.js";
import {
  ProposalService,
  proposalService,
  CreateProposalData,
} from "../services/proposal.service.js";

/**
 * ProposalController - HTTP request/response handling for proposals
 */
export class ProposalController {
  private proposalService: ProposalService;

  constructor(service: ProposalService = proposalService) {
    this.proposalService = service;
  }

  /**
   * Create a new proposal
   * @route POST /api/proposals
   * Requirements: 2.1, 2.3, 2.4
   */
  createProposal = asyncHandler(async (req: Request, res: Response) => {
    const createdBy = req.admin?._id;
    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data: CreateProposalData = req.body;

    const proposal = await this.proposalService.generateProposal(
      data,
      createdBy.toString()
    );

    Logger.success(
      `[ProposalCtrl] Created proposal: ${proposal.proposalNumber}`
    );

    res.status(201).json({
      success: true,
      data: { proposal },
      message: "Đã tạo báo giá thành công!",
    });
  });

  /**
   * Get proposal details
   * @route GET /api/proposals/:id
   * Requirements: 2.1
   */
  getProposal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const proposal = await this.proposalService.getProposal(id);

    res.status(200).json({
      success: true,
      data: { proposal },
    });
  });

  /**
   * Get proposals by customer
   * @route GET /api/proposals/customer/:customerId
   */
  getProposalsByCustomer = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.params;

    const proposals = await this.proposalService.getProposalsByCustomer(
      customerId
    );

    res.status(200).json({
      success: true,
      data: { proposals, count: proposals.length },
    });
  });

  /**
   * Download proposal as PDF
   * @route GET /api/proposals/:id/pdf
   * Requirements: 2.1
   */
  downloadPDF = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const pdfBuffer = await this.proposalService.generatePDF(id);
    const proposal = await this.proposalService.getProposal(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="proposal-${proposal.proposalNumber}.pdf"`
    );
    res.send(pdfBuffer);

    Logger.success(
      `[ProposalCtrl] Downloaded PDF for proposal: ${proposal.proposalNumber}`
    );
  });

  /**
   * Get text summary for messaging
   * @route GET /api/proposals/:id/text
   * Requirements: 2.2
   */
  getTextSummary = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const textSummary = await this.proposalService.generateTextSummary(id);

    res.status(200).json({
      success: true,
      data: { textSummary },
    });
  });

  /**
   * Convert proposal to order
   * @route POST /api/proposals/:id/convert
   * Requirements: 2.5
   */
  convertToOrder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.proposalService.convertToOrder(id);

    Logger.success(
      `[ProposalCtrl] Converted proposal ${id} to order ${result.orderId}`
    );

    res.status(200).json({
      success: true,
      data: result,
      message: "Đã chuyển báo giá thành đơn hàng!",
    });
  });

  /**
   * Update proposal status
   * @route PUT /api/proposals/:id/status
   */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const proposal = await this.proposalService.updateStatus(id, status);

    res.status(200).json({
      success: true,
      data: { proposal },
      message: "Đã cập nhật trạng thái báo giá!",
    });
  });
}

// Export singleton instance
export const proposalController = new ProposalController();
