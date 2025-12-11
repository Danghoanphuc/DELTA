// apps/admin-backend/src/services/production.service.ts
// ✅ Production Order Service
// Phase 5.1.2: Production Order Management - Business Logic Layer

import mongoose from "mongoose";
import { ProductionOrderRepository } from "../repositories/production-order.repository.js";
import {
  IProductionOrder,
  PRODUCTION_ORDER_STATUS,
} from "../models/production-order.models.js";
import {
  NotFoundException,
  ValidationException,
  ConflictException,
} from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.js";

/**
 * Production Order Service
 * Handles business logic for production order management
 */
export class ProductionService {
  private productionOrderRepository: ProductionOrderRepository;

  constructor() {
    this.productionOrderRepository = new ProductionOrderRepository();
  }

  /**
   * Create production orders from swag order
   * Groups items by supplier and creates separate production orders
   */
  async createProductionOrdersFromSwagOrder(
    swagOrderId: string,
    swagOrderData: {
      orderNumber: string;
      items: Array<{
        skuVariantId: mongoose.Types.ObjectId;
        sku: string;
        productName: string;
        quantity: number;
        supplierId: mongoose.Types.ObjectId;
        supplierName: string;
        supplierContact: { email: string; phone: string };
        printMethod?: string;
        printAreas?: any[];
        personalization?: any;
        unitCost: number;
        setupFee?: number;
      }>;
      specifications?: {
        printInstructions?: string;
        qualityRequirements?: string;
        packagingInstructions?: string;
        specialNotes?: string;
      };
      expectedDeliveryDate: Date;
    }
  ): Promise<IProductionOrder[]> {
    Logger.debug(
      `[ProductionSvc] Creating production orders for swag order: ${swagOrderData.orderNumber}`
    );

    // Group items by supplier
    const itemsBySupplier = new Map<string, typeof swagOrderData.items>();

    swagOrderData.items.forEach((item) => {
      const supplierId = item.supplierId.toString();
      if (!itemsBySupplier.has(supplierId)) {
        itemsBySupplier.set(supplierId, []);
      }
      itemsBySupplier.get(supplierId)!.push(item);
    });

    // Create production order for each supplier
    const productionOrders: IProductionOrder[] = [];

    for (const [supplierId, items] of itemsBySupplier.entries()) {
      const firstItem = items[0];

      // Calculate estimated cost
      const estimatedCost = items.reduce((sum, item) => {
        const itemCost = item.unitCost * item.quantity + (item.setupFee || 0);
        return sum + itemCost;
      }, 0);

      // Prepare production items
      const productionItems = items.map((item) => ({
        skuVariantId: item.skuVariantId,
        sku: item.sku,
        productName: item.productName,
        quantity: item.quantity,
        printMethod: item.printMethod || "",
        printAreas: item.printAreas || [],
        personalization: item.personalization,
        unitCost: item.unitCost,
        setupFee: item.setupFee || 0,
        totalCost: item.unitCost * item.quantity + (item.setupFee || 0),
      }));

      // Create production order
      const productionOrder = await this.productionOrderRepository.create({
        swagOrderId: new mongoose.Types.ObjectId(swagOrderId),
        swagOrderNumber: swagOrderData.orderNumber,
        supplierId: firstItem.supplierId,
        supplierName: firstItem.supplierName,
        supplierContact: firstItem.supplierContact,
        items: productionItems,
        specifications: {
          printInstructions:
            swagOrderData.specifications?.printInstructions || "",
          qualityRequirements:
            swagOrderData.specifications?.qualityRequirements || "",
          packagingInstructions:
            swagOrderData.specifications?.packagingInstructions || "",
          specialNotes: swagOrderData.specifications?.specialNotes,
        },
        orderedAt: new Date(),
        expectedCompletionDate: swagOrderData.expectedDeliveryDate,
        status: PRODUCTION_ORDER_STATUS.PENDING,
        statusHistory: [
          {
            status: PRODUCTION_ORDER_STATUS.PENDING,
            timestamp: new Date(),
            note: "Production order created",
            updatedBy: new mongoose.Types.ObjectId(), // System user
          },
        ],
        qcChecks: [],
        estimatedCost,
      });

      productionOrders.push(productionOrder);

      Logger.success(
        `[ProductionSvc] Created production order for supplier: ${firstItem.supplierName}`
      );
    }

    return productionOrders;
  }

  /**
   * Get production order by ID
   */
  async getProductionOrder(id: string): Promise<IProductionOrder> {
    const productionOrder = await this.productionOrderRepository.findById(id);

    if (!productionOrder) {
      throw new NotFoundException("Production Order", id);
    }

    return productionOrder;
  }

  /**
   * Get production orders by swag order
   */
  async getProductionOrdersBySwagOrder(
    swagOrderId: string
  ): Promise<IProductionOrder[]> {
    return await this.productionOrderRepository.findBySwagOrder(swagOrderId);
  }

  /**
   * Get production orders by supplier
   */
  async getProductionOrdersBySupplier(
    supplierId: string,
    options?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ): Promise<{ orders: IProductionOrder[]; total: number; pagination: any }> {
    const result = await this.productionOrderRepository.findBySupplier(
      supplierId,
      options
    );

    const page = options?.page || 1;
    const limit = options?.limit || 20;

    return {
      ...result,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    };
  }

  /**
   * Get production orders by status
   */
  async getProductionOrdersByStatus(
    status: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ orders: IProductionOrder[]; total: number; pagination: any }> {
    const result = await this.productionOrderRepository.findByStatus(
      status,
      options
    );

    const page = options?.page || 1;
    const limit = options?.limit || 20;

    return {
      ...result,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    };
  }

  /**
   * Get delayed production orders
   */
  async getDelayedProductionOrders(): Promise<IProductionOrder[]> {
    return await this.productionOrderRepository.findDelayed();
  }

  /**
   * Update production order status
   */
  async updateProductionStatus(
    id: string,
    status: string,
    updatedBy: mongoose.Types.ObjectId,
    note?: string
  ): Promise<IProductionOrder> {
    Logger.debug(
      `[ProductionSvc] Updating production order ${id} to ${status}`
    );

    // Validate status
    if (!Object.values(PRODUCTION_ORDER_STATUS).includes(status as any)) {
      throw new ValidationException(`Invalid production status: ${status}`);
    }

    // Get current production order
    const currentOrder = await this.getProductionOrder(id);

    // Validate status transition
    this.validateStatusTransition(currentOrder.status, status);

    // Update status
    const updatedOrder = await this.productionOrderRepository.updateStatus(
      id,
      status,
      updatedBy,
      note
    );

    if (!updatedOrder) {
      throw new NotFoundException("Production Order", id);
    }

    Logger.success(
      `[ProductionSvc] Updated production order ${id} to ${status}`
    );

    return updatedOrder;
  }

  /**
   * Perform QC check
   */
  async performQCCheck(
    id: string,
    qcData: {
      checkedBy: mongoose.Types.ObjectId;
      passed: boolean;
      photos?: string[];
      notes?: string;
      issues?: string[];
    }
  ): Promise<IProductionOrder> {
    Logger.debug(
      `[ProductionSvc] Performing QC check for production order: ${id}`
    );

    // Validate production order exists
    const productionOrder = await this.getProductionOrder(id);

    // Validate status
    if (productionOrder.status !== PRODUCTION_ORDER_STATUS.IN_PRODUCTION) {
      throw new ConflictException(
        "Production order must be in production to perform QC check"
      );
    }

    // Add QC check
    const updatedOrder = await this.productionOrderRepository.addQCCheck(
      id,
      qcData
    );

    if (!updatedOrder) {
      throw new NotFoundException("Production Order", id);
    }

    // ✅ PHASE 8.1.2: Track supplier quality
    try {
      const { SupplierService } = await import("./supplier.service.js");
      const supplierService = new SupplierService();

      await supplierService.trackQualityIssue(
        updatedOrder.supplierId.toString(),
        updatedOrder._id.toString(),
        qcData.passed
      );

      Logger.success(
        `[ProductionSvc] Tracked QC result for supplier ${updatedOrder.supplierName}`
      );
    } catch (error) {
      Logger.error(`[ProductionSvc] Failed to track supplier quality:`, error);
      // Don't fail the QC check if supplier tracking fails
    }

    Logger.success(
      `[ProductionSvc] QC check ${
        qcData.passed ? "passed" : "failed"
      } for production order: ${id}`
    );

    return updatedOrder;
  }

  /**
   * Complete production order
   */
  async completeProduction(
    id: string,
    actualCost?: number
  ): Promise<IProductionOrder> {
    Logger.debug(`[ProductionSvc] Completing production order: ${id}`);

    // Validate production order exists
    const productionOrder = await this.getProductionOrder(id);

    // Validate status
    if (productionOrder.status !== PRODUCTION_ORDER_STATUS.QC_CHECK) {
      throw new ConflictException(
        "Production order must pass QC check before completion"
      );
    }

    // Validate QC passed
    const lastQC =
      productionOrder.qcChecks[productionOrder.qcChecks.length - 1];
    if (!lastQC || !lastQC.passed) {
      throw new ConflictException("Production order must have passed QC check");
    }

    // Update actual cost if provided
    if (actualCost !== undefined) {
      await this.productionOrderRepository.updateActualCost(id, actualCost);
    }

    // Mark as completed
    const completedOrder = await this.productionOrderRepository.markAsCompleted(
      id
    );

    if (!completedOrder) {
      throw new NotFoundException("Production Order", id);
    }

    // ✅ PHASE 8.1.2: Track supplier lead time
    try {
      const { SupplierService } = await import("./supplier.service.js");
      const supplierService = new SupplierService();

      await supplierService.recordLeadTime(
        completedOrder.supplierId.toString(),
        completedOrder._id.toString(),
        completedOrder.orderedAt,
        completedOrder.expectedCompletionDate,
        completedOrder.actualCompletionDate!
      );

      Logger.success(
        `[ProductionSvc] Recorded lead time for supplier ${completedOrder.supplierName}`
      );
    } catch (error) {
      Logger.error(
        `[ProductionSvc] Failed to record supplier lead time:`,
        error
      );
      // Don't fail the completion if supplier tracking fails
    }

    Logger.success(`[ProductionSvc] Completed production order: ${id}`);

    return completedOrder;
  }

  /**
   * Get production statistics
   */
  async getProductionStatistics(supplierId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    avgLeadTime: number;
    onTimeRate: number;
  }> {
    return await this.productionOrderRepository.getStatistics(supplierId);
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): void {
    const validTransitions: Record<string, string[]> = {
      [PRODUCTION_ORDER_STATUS.PENDING]: [
        PRODUCTION_ORDER_STATUS.CONFIRMED,
        PRODUCTION_ORDER_STATUS.FAILED,
      ],
      [PRODUCTION_ORDER_STATUS.CONFIRMED]: [
        PRODUCTION_ORDER_STATUS.IN_PRODUCTION,
        PRODUCTION_ORDER_STATUS.FAILED,
      ],
      [PRODUCTION_ORDER_STATUS.IN_PRODUCTION]: [
        PRODUCTION_ORDER_STATUS.QC_CHECK,
        PRODUCTION_ORDER_STATUS.FAILED,
      ],
      [PRODUCTION_ORDER_STATUS.QC_CHECK]: [
        PRODUCTION_ORDER_STATUS.COMPLETED,
        PRODUCTION_ORDER_STATUS.IN_PRODUCTION, // Re-production if QC failed
        PRODUCTION_ORDER_STATUS.FAILED,
      ],
      [PRODUCTION_ORDER_STATUS.COMPLETED]: [],
      [PRODUCTION_ORDER_STATUS.FAILED]: [
        PRODUCTION_ORDER_STATUS.PENDING, // Retry
      ],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
