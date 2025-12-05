// src/repositories/inventory.repository.ts
// ✅ Inventory Repository - Data Access Layer

import mongoose, { FilterQuery } from "mongoose";
import { Logger } from "../utils/logger";
import { IInventoryRepository } from "../interfaces/repository.interface";

export class InventoryRepository implements IInventoryRepository<any> {
  private getModel() {
    try {
      return mongoose.model("Inventory");
    } catch {
      Logger.warn("[InventoryRepo] Model not available");
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

  async findByOrganization(organizationId: string): Promise<any[]> {
    const Model = this.getModel();
    if (!Model) return [];
    return Model.find({
      organization: new mongoose.Types.ObjectId(organizationId),
    })
      .populate("organization", "businessName")
      .lean();
  }

  async findAllWithOrganization(): Promise<any[]> {
    const Model = this.getModel();
    if (!Model) return [];
    return Model.find().populate("organization", "businessName").lean();
  }

  async findItemById(
    itemId: string
  ): Promise<{ inventory: any; itemIndex: number } | null> {
    const Model = this.getModel();
    if (!Model) return null;

    const inventory = await Model.findOne({ "items._id": itemId });
    if (!inventory) return null;

    const itemIndex = inventory.items.findIndex(
      (i: any) => i._id.toString() === itemId
    );
    if (itemIndex === -1) return null;

    return { inventory, itemIndex };
  }

  async updateItem(
    inventoryId: string,
    itemIndex: number,
    update: any
  ): Promise<any | null> {
    const Model = this.getModel();
    if (!Model) return null;

    const inventory = await Model.findById(inventoryId);
    if (!inventory) return null;

    Object.assign(inventory.items[itemIndex], update);
    await inventory.save();

    return inventory.items[itemIndex];
  }
}

export const inventoryRepository = new InventoryRepository();
