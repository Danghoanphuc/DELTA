// @ts-nocheck
/**
 * PricingRepository - Data Access Layer for Pricing Formulas
 *
 * Implements repository pattern for PricingFormula model
 * Following SOLID principles and existing codebase patterns
 *
 * Requirements: 1.4
 */

import mongoose, { FilterQuery, UpdateQuery } from "mongoose";
import { Logger } from "../utils/logger.js";
import {
  PricingFormula,
  IPricingFormula,
  IQuantityTier,
} from "../models/pricing-formula.model.js";
import {
  IRepository,
  PaginatedResult,
} from "../interfaces/repository.interface.js";

/**
 * Pricing Repository Interface
 */
export interface IPricingRepository extends IRepository<IPricingFormula> {
  findByProductType(productType: string): Promise<IPricingFormula[]>;
  findActiveFormulas(): Promise<IPricingFormula[]>;
  findActiveByProductType(productType: string): Promise<IPricingFormula | null>;
}

/**
 * PricingRepository - Data access for pricing formulas
 */
export class PricingRepository implements IPricingRepository {
  /**
   * Find pricing formula by ID
   */
  async findById(id: string): Promise<IPricingFormula | null> {
    try {
      return await PricingFormula.findById(id).lean();
    } catch (error) {
      Logger.error(`[PricingRepo] Error finding formula by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find single pricing formula by filter
   */
  async findOne(
    filter: FilterQuery<IPricingFormula>
  ): Promise<IPricingFormula | null> {
    try {
      return await PricingFormula.findOne(filter).lean();
    } catch (error) {
      Logger.error(`[PricingRepo] Error finding formula:`, error);
      throw error;
    }
  }

  /**
   * Find all pricing formulas matching filter
   */
  async find(filter: FilterQuery<IPricingFormula>): Promise<IPricingFormula[]> {
    try {
      return await PricingFormula.find(filter).lean();
    } catch (error) {
      Logger.error(`[PricingRepo] Error finding formulas:`, error);
      throw error;
    }
  }

  /**
   * Create new pricing formula
   */
  async create(data: Partial<IPricingFormula>): Promise<IPricingFormula> {
    try {
      const formula = new PricingFormula(data);
      const saved = await formula.save();
      Logger.success(`[PricingRepo] Created pricing formula: ${saved.name}`);
      return saved.toObject();
    } catch (error) {
      Logger.error(`[PricingRepo] Error creating formula:`, error);
      throw error;
    }
  }

  /**
   * Update pricing formula by ID
   */
  async update(
    id: string,
    data: UpdateQuery<IPricingFormula>
  ): Promise<IPricingFormula | null> {
    try {
      const updated = await PricingFormula.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).lean();

      if (updated) {
        Logger.success(
          `[PricingRepo] Updated pricing formula: ${updated.name}`
        );
      }
      return updated;
    } catch (error) {
      Logger.error(`[PricingRepo] Error updating formula ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete pricing formula by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await PricingFormula.findByIdAndDelete(id);
      if (result) {
        Logger.success(`[PricingRepo] Deleted pricing formula: ${result.name}`);
      }
      return !!result;
    } catch (error) {
      Logger.error(`[PricingRepo] Error deleting formula ${id}:`, error);
      throw error;
    }
  }

  /**
   * Count pricing formulas matching filter
   */
  async count(filter?: FilterQuery<IPricingFormula>): Promise<number> {
    try {
      return await PricingFormula.countDocuments(filter || {});
    } catch (error) {
      Logger.error(`[PricingRepo] Error counting formulas:`, error);
      throw error;
    }
  }

  /**
   * Find pricing formulas by product type
   * Requirements: 1.4
   */
  async findByProductType(productType: string): Promise<IPricingFormula[]> {
    try {
      return await PricingFormula.find({ productType }).lean();
    } catch (error) {
      Logger.error(
        `[PricingRepo] Error finding formulas by product type ${productType}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find all active pricing formulas
   * Requirements: 1.4
   */
  async findActiveFormulas(): Promise<IPricingFormula[]> {
    try {
      return await PricingFormula.find({ isActive: true })
        .sort({ productType: 1, name: 1 })
        .lean();
    } catch (error) {
      Logger.error(`[PricingRepo] Error finding active formulas:`, error);
      throw error;
    }
  }

  /**
   * Find active pricing formula by product type
   * Returns the first active formula for the given product type
   * Requirements: 1.4
   */
  async findActiveByProductType(
    productType: string
  ): Promise<IPricingFormula | null> {
    try {
      return await PricingFormula.findOne({
        productType,
        isActive: true,
      }).lean();
    } catch (error) {
      Logger.error(
        `[PricingRepo] Error finding active formula for ${productType}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find formulas with pagination
   */
  async findWithPagination(
    filter: FilterQuery<IPricingFormula>,
    page: number = 1,
    limit: number = 20,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<PaginatedResult<IPricingFormula>> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        PricingFormula.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("createdBy", "email name")
          .lean(),
        PricingFormula.countDocuments(filter),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      Logger.error(
        `[PricingRepo] Error finding formulas with pagination:`,
        error
      );
      throw error;
    }
  }
}

// Export singleton instance
export const pricingRepository = new PricingRepository();
