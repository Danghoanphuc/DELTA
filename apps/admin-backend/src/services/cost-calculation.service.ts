/**
 * Cost Calculation Service
 *
 * Tính toán tất cả cost components cho đơn hàng POD:
 * - Base product costs
 * - Customization costs (print, embroidery, etc.)
 * - Operational costs (kitting, packaging, shipping)
 * - Total cost breakdown
 *
 * Requirements: 15.1
 */

import { SwagOrder } from "../models/swag-order.model.js";
import { SkuVariant } from "../models/sku-variant.model.js";
import { Logger } from "../shared/utils/logger.js";
import {
  NotFoundException,
  ValidationException,
} from "../shared/exceptions.js";

export interface CostBreakdown {
  orderId: string;
  baseProductsCost: number;
  customizationCost: number;
  setupFees: number;
  kittingFee: number;
  packagingCost: number;
  shippingCost: number;
  handlingFee: number;
  totalCost: number;
  totalPrice: number;
  grossMargin: number;
  marginPercentage: number;
}

export class CostCalculationService {
  // Constants
  private readonly KITTING_FEE_PER_RECIPIENT = 10000; // 10k VND per recipient
  private readonly PACKAGING_COST_PER_PACKAGE = 5000; // 5k VND per package
  private readonly HANDLING_FEE_PERCENTAGE = 0.05; // 5% of total price
  private readonly SHIPPING_BASE_COST = 30000; // 30k VND base shipping

  /**
   * Calculate base product costs
   * @param order - Swag order
   * @returns Base products cost
   */
  async calculateProductCost(order: any): Promise<number> {
    Logger.debug(
      `[CostCalcSvc] Calculating product cost for order: ${order.orderNumber}`
    );

    let totalCost = 0;

    for (const item of order.packSnapshot.items) {
      // Get variant to get cost
      const variant = await SkuVariant.findById(item.variantId);

      if (!variant) {
        Logger.warn(
          `[CostCalcSvc] Variant not found: ${item.variantId}, using item cost`
        );
        totalCost += (item.cost || 0) * item.quantity;
        continue;
      }

      totalCost += variant.cost * item.quantity;
    }

    Logger.debug(`[CostCalcSvc] Base products cost: ${totalCost}`);
    return totalCost;
  }

  /**
   * Calculate customization costs (print, embroidery, etc.)
   * @param order - Swag order
   * @returns Customization cost including setup fees
   */
  async calculateCustomizationCost(order: any): Promise<number> {
    Logger.debug(
      `[CostCalcSvc] Calculating customization cost for order: ${order.orderNumber}`
    );

    let totalCost = 0;
    const setupFees = new Set<string>(); // Track unique setup fees

    for (const item of order.packSnapshot.items) {
      if (item.customization) {
        // Setup fees (one-time per print method)
        if (item.customization.printMethod && item.customization.setupFee) {
          const setupKey = `${item.product}-${item.customization.printMethod}`;
          if (!setupFees.has(setupKey)) {
            totalCost += item.customization.setupFee;
            setupFees.add(setupKey);
          }
        }

        // Unit cost per item
        if (item.customization.unitCost) {
          totalCost += item.customization.unitCost * item.quantity;
        }

        // Additional print areas
        if (
          item.customization.printAreas &&
          Array.isArray(item.customization.printAreas)
        ) {
          for (const area of item.customization.printAreas) {
            if (area.cost) {
              totalCost += area.cost * item.quantity;
            }
          }
        }
      }
    }

    Logger.debug(`[CostCalcSvc] Customization cost: ${totalCost}`);
    return totalCost;
  }

  /**
   * Extract setup fees from order
   * @param order - Swag order
   * @returns Total setup fees
   */
  extractSetupFees(order: any): number {
    let totalSetupFees = 0;
    const setupFees = new Set<string>();

    for (const item of order.packSnapshot.items) {
      if (item.customization?.setupFee && item.customization?.printMethod) {
        const setupKey = `${item.product}-${item.customization.printMethod}`;
        if (!setupFees.has(setupKey)) {
          totalSetupFees += item.customization.setupFee;
          setupFees.add(setupKey);
        }
      }
    }

    return totalSetupFees;
  }

  /**
   * Calculate shipping cost based on recipients and weight
   * @param order - Swag order
   * @returns Estimated shipping cost
   */
  async calculateShippingCost(order: any): Promise<number> {
    const recipientCount = order.recipients?.length || 1;

    // Base cost + per recipient cost
    const shippingCost = this.SHIPPING_BASE_COST + recipientCount * 20000;

    Logger.debug(
      `[CostCalcSvc] Shipping cost for ${recipientCount} recipients: ${shippingCost}`
    );
    return shippingCost;
  }

  /**
   * Calculate operational costs (kitting, packaging, shipping, handling)
   * @param order - Swag order
   * @returns Operational cost
   */
  async calculateOperationalCost(order: any): Promise<number> {
    Logger.debug(
      `[CostCalcSvc] Calculating operational cost for order: ${order.orderNumber}`
    );

    const recipientCount = order.recipients?.length || 1;

    const kittingFee = recipientCount * this.KITTING_FEE_PER_RECIPIENT;
    const packagingCost = recipientCount * this.PACKAGING_COST_PER_PACKAGE;
    const shippingCost = await this.calculateShippingCost(order);
    const handlingFee = order.totalPrice * this.HANDLING_FEE_PERCENTAGE;

    const totalOperationalCost =
      kittingFee + packagingCost + shippingCost + handlingFee;

    Logger.debug(`[CostCalcSvc] Operational cost breakdown:`, {
      kittingFee,
      packagingCost,
      shippingCost,
      handlingFee,
      total: totalOperationalCost,
    });

    return totalOperationalCost;
  }

  /**
   * Calculate total cost for order with complete breakdown
   * @param order - Swag order
   * @returns Complete cost breakdown
   */
  async calculateTotalCost(order: any): Promise<CostBreakdown> {
    Logger.debug(
      `[CostCalcSvc] Calculating total cost for order: ${order.orderNumber}`
    );

    // Validate order
    if (!order) {
      throw new ValidationException("Order không được để trống");
    }

    if (!order.packSnapshot?.items || order.packSnapshot.items.length === 0) {
      throw new ValidationException("Order phải có ít nhất 1 item");
    }

    // Calculate all cost components
    const baseProductsCost = await this.calculateProductCost(order);
    const customizationCost = await this.calculateCustomizationCost(order);
    const setupFees = this.extractSetupFees(order);

    const recipientCount = order.recipients?.length || 1;
    const kittingFee = recipientCount * this.KITTING_FEE_PER_RECIPIENT;
    const packagingCost = recipientCount * this.PACKAGING_COST_PER_PACKAGE;
    const shippingCost = await this.calculateShippingCost(order);
    const handlingFee = order.totalPrice * this.HANDLING_FEE_PERCENTAGE;

    const totalCost =
      baseProductsCost +
      customizationCost +
      kittingFee +
      packagingCost +
      shippingCost +
      handlingFee;
    const grossMargin = order.totalPrice - totalCost;
    const marginPercentage =
      order.totalPrice > 0 ? (grossMargin / order.totalPrice) * 100 : 0;

    const breakdown: CostBreakdown = {
      orderId: order._id.toString(),
      baseProductsCost,
      customizationCost,
      setupFees,
      kittingFee,
      packagingCost,
      shippingCost,
      handlingFee,
      totalCost,
      totalPrice: order.totalPrice,
      grossMargin,
      marginPercentage,
    };

    Logger.success(
      `[CostCalcSvc] Total cost calculated: ${totalCost} (margin: ${marginPercentage.toFixed(
        2
      )}%)`
    );

    return breakdown;
  }

  /**
   * Get cost breakdown for order by ID
   * @param orderId - Order ID
   * @returns Cost breakdown
   */
  async getCostBreakdown(orderId: string): Promise<CostBreakdown> {
    const order = await SwagOrder.findById(orderId);

    if (!order) {
      throw new NotFoundException("Swag Order", orderId);
    }

    return await this.calculateTotalCost(order);
  }
}
