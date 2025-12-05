// src/repositories/swag-order.repository.ts
// ✅ SwagOrder Repository - Data Access Layer

import mongoose, { FilterQuery } from "mongoose";
import { Logger } from "../utils/logger";
import {
  IOrderRepository,
  PaginatedResult,
} from "../interfaces/repository.interface";

export class SwagOrderRepository implements IOrderRepository<any> {
  private getModel() {
    try {
      return mongoose.model("SwagOrder");
    } catch {
      Logger.warn("[SwagOrderRepo] Model not available");
      return null;
    }
  }

  async findById(id: string): Promise<any | null> {
    const Model = this.getModel();
    if (!Model) return null;
    return Model.findById(id).lean();
  }

  async findOne(filter: FilterQuery<any>): Promise<any | null> {
    const Model = this.getModel();
    if (!Model) return null;
    return Model.findOne(filter).lean();
  }

  async find(filter: FilterQuery<any>): Promise<any[]> {
    const Model = this.getModel();
    if (!Model) return [];
    return Model.find(filter).lean();
  }

  async create(data: Partial<any>): Promise<any> {
    const Model = this.getModel();
    if (!Model) throw new Error("Model not available");
    const doc = new Model(data);
    return doc.save();
  }

  async update(id: string, data: any): Promise<any | null> {
    const Model = this.getModel();
    if (!Model) return null;
    return Model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const Model = this.getModel();
    if (!Model) return false;
    const result = await Model.findByIdAndDelete(id);
    return !!result;
  }

  async count(filter?: FilterQuery<any>): Promise<number> {
    const Model = this.getModel();
    if (!Model) return 0;
    return Model.countDocuments(filter || {});
  }

  async findWithPagination(
    filter: FilterQuery<any>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<PaginatedResult<any>> {
    const Model = this.getModel();
    if (!Model) {
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const [data, total] = await Promise.all([
      Model.find(filter)
        .populate("organization", "businessName")
        .populate("swagPack", "name")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Model.countDocuments(filter),
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
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    const Model = this.getModel();
    if (!Model) return [];
    return Model.aggregate(pipeline);
  }

  async findByIdWithPopulate(id: string): Promise<any | null> {
    const Model = this.getModel();
    if (!Model) return null;
    return Model.findById(id)
      .populate("organization", "businessName contactEmail contactPhone")
      .populate("swagPack", "name items")
      .populate("createdBy", "displayName email")
      .lean();
  }

  async findByIdForUpdate(id: string): Promise<any | null> {
    const Model = this.getModel();
    if (!Model) return null;
    return Model.findById(id);
  }

  async findByStatus(statuses: string[], limit = 50): Promise<any[]> {
    const Model = this.getModel();
    if (!Model) return [];
    return Model.find({ status: { $in: statuses } })
      .populate("organization", "businessName")
      .populate("swagPack", "name")
      .sort({ paidAt: 1 })
      .limit(limit)
      .lean();
  }
}

export const swagOrderRepository = new SwagOrderRepository();
