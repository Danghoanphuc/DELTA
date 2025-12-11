// src/repositories/organization.repository.ts
// ✅ Organization Repository - Data Access Layer

import mongoose, { FilterQuery } from "mongoose";
import { Logger } from "../shared/utils/logger.js";
import { IRepository } from "../interfaces/repository.interface";

export class OrganizationRepository implements IRepository<any> {
  private getModel() {
    try {
      return mongoose.model("OrganizationProfile");
    } catch {
      Logger.warn("[OrgRepo] Model not available");
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

  async findActive(): Promise<any[]> {
    const Model = this.getModel();
    if (!Model) return [];
    return Model.find({ status: "active" })
      .select("businessName contactEmail")
      .sort({ businessName: 1 })
      .lean();
  }
}

export const organizationRepository = new OrganizationRepository();
