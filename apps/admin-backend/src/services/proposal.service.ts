/**
 * ProposalService - Proposal Generation Service
 *
 * Business logic for generating professional proposals with customer snapshot
 * Implements 1-Click Proposal Generation feature
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import mongoose, { Types } from "mongoose";
import { Logger } from "../utils/logger.js";
import {
  ProposalRepository,
  proposalRepository,
} from "../repositories/proposal.repository.js";
import {
  Proposal,
  IProposal,
  PROPOSAL_STATUS,
} from "../models/proposal.model.js";
import { OrganizationProfile } from "../models/organization.model.js";
import {
  ValidationException,
  NotFoundException,
  ConflictException,
} from "../shared/exceptions.js";
import { ProductSpecification, PricingResult } from "./pricing.service.js";
import { generatePDFFromHTML } from "../utils/pdf-generator.js";
import {
  renderTemplate,
  formatCurrency,
  formatDate,
} from "../utils/template-renderer.js";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Create proposal data interface
 */
export interface CreateProposalData {
  customerId: string;
  items: Array<{
    productType: string;
    name: string;
    specifications: ProductSpecification;
    pricing: PricingResult;
  }>;
  terms?: string;
  validityDays?: number;
  dealPrice?: number;
  salesCost?: number;
}

/**
 * ProposalService - Proposal generation and management
 */
export class ProposalService {
  private repository: ProposalRepository;

  constructor(repository: ProposalRepository = proposalRepository) {
    this.repository = repository;
  }

  /**
   * Generate a new proposal
   * Requirements: 2.1, 2.3, 2.4 - Auto-populate customer details, include specifications and pricing, generate unique number
   *
   * @param data - Proposal creation data
   * @param createdBy - ID of user creating the proposal
   * @returns Generated proposal
   */
  async generateProposal(
    data: CreateProposalData,
    createdBy: string
  ): Promise<IProposal> {
    Logger.debug(
      `[ProposalSvc] Generating proposal for customer: ${data.customerId}`
    );

    // Validate input
    this.validateProposalData(data);

    // Fetch customer details from database
    const customer = await OrganizationProfile.findById(data.customerId).lean();
    if (!customer) {
      throw new NotFoundException("Customer", data.customerId);
    }

    // Generate unique proposal number
    const proposalNumber = await (Proposal as any).generateProposalNumber();
    Logger.debug(`[ProposalSvc] Generated proposal number: ${proposalNumber}`);

    // Create customer snapshot
    const customerSnapshot = {
      customerId: new Types.ObjectId(data.customerId),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.billingInfo?.companyName || customer.name,
      address: this.formatAddress(customer.address),
      taxCode: customer.billingInfo?.taxId,
    };

    // Transform items to proposal items
    const proposalItems = data.items.map((item) => ({
      productType: item.productType,
      name: item.name,
      specifications: {
        size: item.specifications.size,
        paperType: item.specifications.paperType,
        quantity: item.specifications.quantity,
        printSides: item.specifications.printSides,
        colors: item.specifications.colors,
        finishingOptions: item.specifications.finishingOptions,
      },
      unitPrice: item.pricing.sellingPrice / item.specifications.quantity,
      quantity: item.specifications.quantity,
      totalPrice: item.pricing.sellingPrice,
    }));

    // Calculate total pricing
    const totalPricing = this.calculateTotalPricing(data.items);

    // Calculate validity date
    const validityDays = data.validityDays || 30; // Default 30 days
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    // Default terms if not provided
    const terms =
      data.terms ||
      `
Điều khoản thanh toán:
- Thanh toán 50% trước khi sản xuất
- Thanh toán 50% còn lại khi giao hàng

Thời gian sản xuất: 5-7 ngày làm việc kể từ khi nhận đủ thông tin và thanh toán

Báo giá có hiệu lực trong ${validityDays} ngày kể từ ngày phát hành
    `.trim();

    // Create proposal
    const proposalData: Partial<IProposal> = {
      proposalNumber,
      customerId: new Types.ObjectId(data.customerId),
      customerSnapshot,
      items: proposalItems,
      pricing: totalPricing,
      dealPrice: data.dealPrice,
      salesCost: data.salesCost,
      terms,
      validUntil,
      status: PROPOSAL_STATUS.DRAFT,
      createdBy: new Types.ObjectId(createdBy),
    };

    // Calculate actual margin if deal price is provided
    if (data.dealPrice && data.salesCost !== undefined) {
      proposalData.actualMargin = this.calculateActualMargin(
        data.dealPrice,
        totalPricing.costPrice,
        data.salesCost
      );
    }

    const proposal = await this.repository.create(proposalData);

    Logger.success(
      `[ProposalSvc] Generated proposal: ${proposal.proposalNumber}`
    );

    return proposal;
  }

  /**
   * Validate proposal data
   */
  private validateProposalData(data: CreateProposalData): void {
    if (!data.customerId || data.customerId.trim().length === 0) {
      throw new ValidationException("Customer ID không được để trống");
    }

    if (!data.items || data.items.length === 0) {
      throw new ValidationException("Proposal phải có ít nhất một sản phẩm");
    }

    // Validate each item
    for (const item of data.items) {
      if (!item.productType || item.productType.trim().length === 0) {
        throw new ValidationException("Loại sản phẩm không được để trống");
      }

      if (!item.name || item.name.trim().length === 0) {
        throw new ValidationException("Tên sản phẩm không được để trống");
      }

      if (!item.specifications || !item.specifications.quantity) {
        throw new ValidationException("Thông số sản phẩm không hợp lệ");
      }

      if (!item.pricing) {
        throw new ValidationException("Giá sản phẩm không hợp lệ");
      }
    }

    // Validate deal price and sales cost if provided
    if (data.dealPrice !== undefined && data.dealPrice < 0) {
      throw new ValidationException("Deal price không được âm");
    }

    if (data.salesCost !== undefined && data.salesCost < 0) {
      throw new ValidationException("Sales cost không được âm");
    }
  }

  /**
   * Format address from address object
   */
  private formatAddress(address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }): string {
    if (!address) return "";

    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  }

  /**
   * Calculate total pricing from items
   */
  private calculateTotalPricing(items: CreateProposalData["items"]): {
    costPrice: number;
    sellingPrice: number;
    profitMargin: number;
    marginPercentage: number;
  } {
    let totalCostPrice = 0;
    let totalSellingPrice = 0;

    for (const item of items) {
      totalCostPrice += item.pricing.costPrice;
      totalSellingPrice += item.pricing.sellingPrice;
    }

    const profitMargin = totalSellingPrice - totalCostPrice;
    const marginPercentage = (profitMargin / totalCostPrice) * 100;

    return {
      costPrice: totalCostPrice,
      sellingPrice: totalSellingPrice,
      profitMargin,
      marginPercentage: Math.round(marginPercentage * 100) / 100,
    };
  }

  /**
   * Calculate actual margin for multi-tier pricing
   */
  private calculateActualMargin(
    dealPrice: number,
    costPrice: number,
    salesCost: number
  ) {
    const grossProfit = dealPrice - costPrice;
    const actualProfit = grossProfit - salesCost;
    const marginPercentage = (actualProfit / costPrice) * 100;

    return {
      dealPrice,
      costPrice,
      salesCost,
      grossProfit,
      actualProfit,
      marginPercentage: Math.round(marginPercentage * 100) / 100,
    };
  }

  /**
   * Get proposal by ID
   */
  async getProposal(id: string): Promise<IProposal> {
    const proposal = await this.repository.findById(id);
    if (!proposal) {
      throw new NotFoundException("Proposal", id);
    }
    return proposal;
  }

  /**
   * Get proposals by customer
   */
  async getProposalsByCustomer(customerId: string): Promise<IProposal[]> {
    return this.repository.findByCustomer(customerId);
  }

  /**
   * Update proposal status
   */
  async updateStatus(id: string, status: string): Promise<IProposal> {
    // Validate status
    if (!Object.values(PROPOSAL_STATUS).includes(status as any)) {
      throw new ValidationException(`Invalid status: ${status}`);
    }

    const updated = await this.repository.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException("Proposal", id);
    }

    Logger.success(
      `[ProposalSvc] Updated proposal ${updated.proposalNumber} status to ${status}`
    );

    return updated;
  }

  /**
   * Get proposal by proposal number
   */
  async getProposalByNumber(proposalNumber: string): Promise<IProposal> {
    const proposal = await this.repository.findByProposalNumber(proposalNumber);
    if (!proposal) {
      throw new NotFoundException("Proposal", proposalNumber);
    }
    return proposal;
  }

  /**
   * Generate PDF for proposal using Puppeteer
   * Requirements: 2.1 - Include customer info, specifications, pricing, terms
   *
   * Uses HTML template with Tailwind CSS for professional, maintainable PDF generation
   */
  async generatePDF(proposalId: string): Promise<Buffer> {
    Logger.debug(`[ProposalSvc] Generating PDF for proposal: ${proposalId}`);

    const proposal = await this.getProposal(proposalId);

    // Load HTML template
    const templatePath = path.join(
      process.cwd(),
      "src/templates/invoice-template.html"
    );
    const template = await fs.readFile(templatePath, "utf-8");

    // Prepare template data
    const templateData = {
      proposalNumber: proposal.proposalNumber,
      date: formatDate(proposal.createdAt),
      validUntil: formatDate(proposal.validUntil),

      // Customer information
      customerCompany:
        proposal.customerSnapshot.company || proposal.customerSnapshot.name,
      customerName: proposal.customerSnapshot.name,
      customerEmail: proposal.customerSnapshot.email || "N/A",
      customerPhone: proposal.customerSnapshot.phone || "N/A",
      customerAddress: proposal.customerSnapshot.address || "N/A",
      customerTaxCode: proposal.customerSnapshot.taxCode || "",

      // Items with formatted data
      items: proposal.items.map((item) => ({
        name: item.name,
        productType: item.productType,
        specifications: {
          sizeFormatted: `${item.specifications.size?.width}×${
            item.specifications.size?.height
          } ${item.specifications.size?.unit || "mm"}`,
          paperType: item.specifications.paperType,
          quantity: item.specifications.quantity,
          printSides: item.specifications.printSides,
          colors: item.specifications.colors,
          finishingOptions:
            item.specifications.finishingOptions &&
            item.specifications.finishingOptions.length > 0,
          finishingOptionsFormatted:
            item.specifications.finishingOptions?.join(", ") || "",
        },
        unitPriceFormatted: formatCurrency(item.unitPrice),
        quantity: item.quantity,
        totalPriceFormatted: formatCurrency(item.totalPrice),
      })),

      // Pricing
      showDealPrice: !!proposal.dealPrice,
      dealPriceFormatted: proposal.dealPrice
        ? formatCurrency(proposal.dealPrice)
        : "",
      sellingPriceFormatted: formatCurrency(proposal.pricing.sellingPrice),

      // Terms
      terms: proposal.terms,
    };

    // Render template with data
    const html = renderTemplate(template, templateData);

    // Generate PDF using Puppeteer
    const pdfBuffer = await generatePDFFromHTML(html, {
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    Logger.success(
      `[ProposalSvc] Generated PDF for proposal: ${proposal.proposalNumber}`
    );

    return pdfBuffer;
  }

  /**
   * Generate text summary for Zalo/messaging
   * Requirements: 2.2 - Create concise, copy-paste friendly format
   */
  async generateTextSummary(proposalId: string): Promise<string> {
    const proposal = await this.getProposal(proposalId);

    const summary = `
📋 *BÁO GIÁ ${proposal.proposalNumber}*

👤 *Khách hàng:* ${
      proposal.customerSnapshot.company || proposal.customerSnapshot.name
    }
📞 *Liên hệ:* ${proposal.customerSnapshot.phone || "N/A"}

📦 *Sản phẩm:*
${proposal.items
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} - ${item.quantity} cái
   ${item.specifications.size?.width}x${item.specifications.size?.height}${
        item.specifications.size?.unit || "mm"
      } | ${item.specifications.paperType}
   💰 ${item.totalPrice.toLocaleString("vi-VN")} VND`
  )
  .join("\n\n")}

💵 *Tổng giá:* ${(
      proposal.dealPrice || proposal.pricing.sellingPrice
    ).toLocaleString("vi-VN")} VND

📅 *Hiệu lực đến:* ${new Date(proposal.validUntil).toLocaleDateString("vi-VN")}

${proposal.terms.split("\n").slice(0, 3).join("\n")}
    `.trim();

    return summary;
  }

  /**
   * Convert proposal to order
   * Requirements: 2.5 - Create order from proposal data, link to original proposal
   */
  async convertToOrder(proposalId: string): Promise<{ orderId: string }> {
    const proposal = await this.getProposal(proposalId);

    // Check if already converted
    if (proposal.status === PROPOSAL_STATUS.CONVERTED) {
      throw new ConflictException(
        `Proposal ${proposal.proposalNumber} đã được chuyển thành đơn hàng`
      );
    }

    // Check if expired
    if (new Date() > new Date(proposal.validUntil)) {
      throw new ConflictException(
        `Proposal ${proposal.proposalNumber} đã hết hạn`
      );
    }

    // In production, this would create an actual order in the order system
    // For now, we'll just update the proposal status and return a mock order ID
    const orderId = new mongoose.Types.ObjectId();

    await this.repository.update(proposalId, {
      status: PROPOSAL_STATUS.CONVERTED,
      convertedToOrderId: orderId,
    });

    Logger.success(
      `[ProposalSvc] Converted proposal ${proposal.proposalNumber} to order ${orderId}`
    );

    return { orderId: orderId.toString() };
  }
}

// Export singleton instance
export const proposalService = new ProposalService();
