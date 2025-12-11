// apps/admin-backend/src/services/document.service.ts
// ✅ Document Service - Phase 7.1
// Generate invoices, credit notes, delivery notes, packing slips

import {
  Invoice,
  INVOICE_STATUS,
  PAYMENT_STATUS,
} from "../models/invoice.models.js";
import { SwagOrder } from "../models/swag-order.model.js";
import { ProductionOrder } from "../models/production-order.model.js";
import { OrganizationProfile } from "../models/organization.model.js";
import { Logger } from "../shared/utils/logger.js";
import {
  NotFoundException,
  ValidationException,
  ConflictException,
} from "../shared/exceptions/index.js";

// ============================================
// INTERFACES
// ============================================

export interface GenerateInvoiceData {
  swagOrderId: string;
  dueInDays?: number; // Default: 30 days
}

export interface GenerateCreditNoteData {
  invoiceId: string;
  amount: number;
  reason: string;
}

export interface GenerateDeliveryNoteData {
  productionOrderId: string;
}

export interface GeneratePackingSlipData {
  swagOrderId: string;
  recipientId: string;
}

// ============================================
// DOCUMENT SERVICE
// ============================================

export class DocumentService {
  /**
   * Generate invoice from swag order
   * Requirements: 10.1, 10.2
   */
  async generateInvoice(data: GenerateInvoiceData) {
    Logger.debug(
      `[DocumentSvc] Generating invoice for order ${data.swagOrderId}`
    );

    try {
      // Get swag order
      const order = await SwagOrder.findById(data.swagOrderId)
        .populate("organization")
        .populate("swagPack")
        .lean();

      if (!order) {
        throw new NotFoundException("Swag Order", data.swagOrderId);
      }

      // Check if invoice already exists
      const existingInvoice = await Invoice.findOne({
        swagOrderId: data.swagOrderId,
      });

      if (existingInvoice) {
        throw new ConflictException(
          `Invoice already exists: ${existingInvoice.invoiceNumber}`
        );
      }

      // Get organization billing info
      const organization = await OrganizationProfile.findById(
        order.organization
      ).lean();

      if (!organization) {
        throw new NotFoundException("Organization", order.organization);
      }

      // Generate invoice number
      const invoiceNumber = await Invoice.generateInvoiceNumber();

      // Calculate line items
      const lineItems = [];

      // Add swag pack items
      if (order.packSnapshot && order.packSnapshot.items) {
        for (const item of order.packSnapshot.items) {
          const quantity = item.quantity * order.totalRecipients;
          const unitPrice = item.unitPrice || 0;
          const amount = quantity * unitPrice;
          const taxRate = 10; // 10% VAT (Vietnam)
          const taxAmount = amount * (taxRate / 100);

          lineItems.push({
            description: `${item.productName} x ${item.quantity} (${order.totalRecipients} recipients)`,
            quantity,
            unitPrice,
            amount,
            taxRate,
            taxAmount,
          });
        }
      }

      // Add shipping cost
      if (order.shippingCost && order.shippingCost > 0) {
        lineItems.push({
          description: "Shipping Cost",
          quantity: 1,
          unitPrice: order.shippingCost,
          amount: order.shippingCost,
          taxRate: 10,
          taxAmount: order.shippingCost * 0.1,
        });
      }

      // Add kitting fee
      if (order.pricing?.kittingFee && order.pricing.kittingFee > 0) {
        lineItems.push({
          description: "Kitting & Packaging Fee",
          quantity: 1,
          unitPrice: order.pricing.kittingFee,
          amount: order.pricing.kittingFee,
          taxRate: 10,
          taxAmount: order.pricing.kittingFee * 0.1,
        });
      }

      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = lineItems.reduce(
        (sum, item) => sum + item.taxAmount,
        0
      );
      const discountAmount = order.pricing?.discount || 0;
      const total = subtotal + taxAmount - discountAmount;

      // Set dates
      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (data.dueInDays || 30));

      // Create invoice
      const invoice = await Invoice.create({
        invoiceNumber,
        swagOrderId: order._id,
        swagOrderNumber: order.orderNumber,
        organizationId: order.organization,
        billingInfo: {
          businessName: organization.businessName || organization.displayName,
          taxCode: organization.taxCode || "N/A",
          address: organization.address || "N/A",
          email: organization.email || "N/A",
          phone: organization.phone || "N/A",
        },
        lineItems,
        subtotal,
        taxAmount,
        discountAmount,
        total,
        paymentStatus:
          order.paymentStatus === "paid"
            ? PAYMENT_STATUS.PAID
            : PAYMENT_STATUS.UNPAID,
        paymentMethod: order.paymentMethod,
        paidAmount: order.paymentStatus === "paid" ? total : 0,
        paidAt: order.paidAt,
        issueDate,
        dueDate,
        status:
          order.paymentStatus === "paid"
            ? INVOICE_STATUS.PAID
            : INVOICE_STATUS.SENT,
      });

      // Update swag order with invoice reference
      await SwagOrder.findByIdAndUpdate(order._id, {
        "documents.invoice": invoice._id,
        "documents.invoiceNumber": invoiceNumber,
      });

      Logger.success(
        `[DocumentSvc] Generated invoice ${invoiceNumber} for order ${order.orderNumber}`
      );

      return invoice;
    } catch (error) {
      Logger.error(`[DocumentSvc] Error generating invoice:`, error);
      throw error;
    }
  }

  /**
   * Generate credit note for refund
   * Requirements: 10.3
   */
  async generateCreditNote(data: GenerateCreditNoteData) {
    Logger.debug(
      `[DocumentSvc] Generating credit note for invoice ${data.invoiceId}`
    );

    try {
      // Get invoice
      const invoice = await Invoice.findById(data.invoiceId);

      if (!invoice) {
        throw new NotFoundException("Invoice", data.invoiceId);
      }

      // Validate amount
      if (data.amount <= 0) {
        throw new ValidationException("Credit note amount must be positive");
      }

      const remainingBalance = invoice.getRemainingBalance();
      if (data.amount > remainingBalance) {
        throw new ValidationException(
          `Credit note amount (${data.amount}) exceeds remaining balance (${remainingBalance})`
        );
      }

      // Generate credit note number
      const creditNoteNumber = `CN-${invoice.invoiceNumber}-${
        invoice.creditNotes.length + 1
      }`;

      // Add credit note to invoice
      invoice.addCreditNote(creditNoteNumber, data.amount, data.reason);

      await invoice.save();

      Logger.success(
        `[DocumentSvc] Generated credit note ${creditNoteNumber} for invoice ${invoice.invoiceNumber}`
      );

      return invoice;
    } catch (error) {
      Logger.error(`[DocumentSvc] Error generating credit note:`, error);
      throw error;
    }
  }

  /**
   * Generate delivery note for supplier
   * Requirements: 10.4
   */
  async generateDeliveryNote(data: GenerateDeliveryNoteData) {
    Logger.debug(
      `[DocumentSvc] Generating delivery note for production order ${data.productionOrderId}`
    );

    try {
      // Get production order
      const productionOrder = await ProductionOrder.findById(
        data.productionOrderId
      )
        .populate("swagOrderId")
        .lean();

      if (!productionOrder) {
        throw new NotFoundException("Production Order", data.productionOrderId);
      }

      // Generate delivery note data
      const deliveryNote = {
        deliveryNoteNumber: `DN-${
          productionOrder.swagOrderNumber
        }-${productionOrder._id.toString().slice(-6)}`,
        productionOrderId: productionOrder._id,
        swagOrderNumber: productionOrder.swagOrderNumber,
        supplier: {
          name: productionOrder.supplierName,
          contact: productionOrder.supplierContact,
        },
        items: productionOrder.items.map((item) => ({
          sku: item.sku,
          productName: item.productName,
          quantity: item.quantity,
          printMethod: item.printMethod,
          printAreas: item.printAreas,
          personalization: item.personalization,
        })),
        specifications: productionOrder.specifications,
        expectedCompletionDate: productionOrder.expectedCompletionDate,
        generatedAt: new Date(),
      };

      // Update swag order with delivery note reference
      await SwagOrder.findByIdAndUpdate(productionOrder.swagOrderId, {
        $push: {
          "documents.deliveryNotes": {
            supplier: productionOrder.supplierId,
            url: "", // Will be set after PDF generation
            generatedAt: new Date(),
          },
        },
      });

      Logger.success(
        `[DocumentSvc] Generated delivery note ${deliveryNote.deliveryNoteNumber}`
      );

      return deliveryNote;
    } catch (error) {
      Logger.error(`[DocumentSvc] Error generating delivery note:`, error);
      throw error;
    }
  }

  /**
   * Generate packing slip for recipient
   * Requirements: 8.4
   */
  async generatePackingSlip(data: GeneratePackingSlipData) {
    Logger.debug(
      `[DocumentSvc] Generating packing slip for order ${data.swagOrderId}, recipient ${data.recipientId}`
    );

    try {
      // Get swag order
      const order = await SwagOrder.findById(data.swagOrderId)
        .populate("swagPack")
        .lean();

      if (!order) {
        throw new NotFoundException("Swag Order", data.swagOrderId);
      }

      // Find recipient
      const recipient = order.recipientShipments?.find(
        (r: any) => r.recipient.toString() === data.recipientId
      );

      if (!recipient) {
        throw new NotFoundException("Recipient", data.recipientId);
      }

      // Generate packing slip data
      const packingSlip = {
        packingSlipNumber: `PS-${order.orderNumber}-${data.recipientId.slice(
          -6
        )}`,
        orderNumber: order.orderNumber,
        recipient: {
          name: `${recipient.recipientInfo.firstName} ${recipient.recipientInfo.lastName}`,
          email: recipient.recipientInfo.email,
          phone: recipient.recipientInfo.phone,
          address: recipient.shippingAddress,
        },
        items:
          order.packSnapshot?.items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            image: item.productImage,
          })) || [],
        generatedAt: new Date(),
      };

      // Update swag order with packing slip reference
      await SwagOrder.findByIdAndUpdate(order._id, {
        $push: {
          "documents.packingSlips": {
            recipient: data.recipientId,
            url: "", // Will be set after PDF generation
            generatedAt: new Date(),
          },
        },
      });

      Logger.success(
        `[DocumentSvc] Generated packing slip ${packingSlip.packingSlipNumber}`
      );

      return packingSlip;
    } catch (error) {
      Logger.error(`[DocumentSvc] Error generating packing slip:`, error);
      throw error;
    }
  }

  /**
   * Get all documents for an order
   * Requirements: 10.1, 10.2, 10.3, 10.4
   */
  async getOrderDocuments(orderId: string) {
    Logger.debug(`[DocumentSvc] Getting documents for order ${orderId}`);

    try {
      const order = await SwagOrder.findById(orderId).lean();

      if (!order) {
        throw new NotFoundException("Swag Order", orderId);
      }

      // Get invoice
      const invoice = await Invoice.findOne({ swagOrderId: orderId }).lean();

      return {
        invoice,
        packingSlips: order.documents?.packingSlips || [],
        deliveryNotes: order.documents?.deliveryNotes || [],
      };
    } catch (error) {
      Logger.error(`[DocumentSvc] Error getting order documents:`, error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string) {
    const invoice = await Invoice.findById(invoiceId).lean();

    if (!invoice) {
      throw new NotFoundException("Invoice", invoiceId);
    }

    return invoice;
  }

  /**
   * Get invoices by organization
   */
  async getInvoicesByOrganization(
    organizationId: string,
    filters: {
      status?: string;
      paymentStatus?: string;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ) {
    return await Invoice.findByOrganization(organizationId as any, filters);
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(
    invoiceId: string,
    paymentMethod: string,
    amount?: number
  ) {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundException("Invoice", invoiceId);
    }

    invoice.markAsPaid(paymentMethod, amount);
    await invoice.save();

    Logger.success(
      `[DocumentSvc] Marked invoice ${invoice.invoiceNumber} as paid`
    );

    return invoice;
  }
}
