// src/modules/swag-packs/swag-pack.repository.js
// ✅ Swag Pack Repository - Data access layer

import { SwagPack } from "./swag-pack.model.js";

export class SwagPackRepository {
  /**
   * Create a new swag pack
   */
  async create(data) {
    return await SwagPack.create(data);
  }

  /**
   * Find pack by ID
   */
  async findById(id) {
    return await SwagPack.findById(id).populate("items.product");
  }

  /**
   * Find packs by organization
   */
  async findByOrganization(organizationId, options = {}) {
    const {
      status,
      type,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const query = { organization: organizationId };

    if (status && status !== "all") {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [packs, total] = await Promise.all([
      SwagPack.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("items.product", "name images")
        .lean(),
      SwagPack.countDocuments(query),
    ]);

    return {
      packs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update pack
   */
  async update(id, data) {
    return await SwagPack.findByIdAndUpdate(id, data, { new: true }).populate(
      "items.product"
    );
  }

  /**
   * Delete pack
   */
  async delete(id) {
    return await SwagPack.findByIdAndDelete(id);
  }

  /**
   * Archive pack
   */
  async archive(id) {
    return await SwagPack.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    );
  }

  /**
   * Duplicate pack
   */
  async duplicate(pack, newName) {
    const duplicateData = pack.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    duplicateData.name = newName;
    duplicateData.status = "draft";
    duplicateData.totalOrdered = 0;
    duplicateData.lastOrderedAt = null;

    return await SwagPack.create(duplicateData);
  }

  /**
   * Increment order count
   */
  async incrementOrderCount(id, quantity = 1) {
    return await SwagPack.findByIdAndUpdate(
      id,
      {
        $inc: { totalOrdered: quantity },
        $set: { lastOrderedAt: new Date() },
      },
      { new: true }
    );
  }

  /**
   * Get popular packs
   */
  async getPopularPacks(organizationId, limit = 5) {
    return await SwagPack.find({
      organization: organizationId,
      status: "active",
    })
      .sort({ totalOrdered: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Count packs by organization
   */
  async countByOrganization(organizationId, status) {
    const query = { organization: organizationId };
    if (status) query.status = status;
    return await SwagPack.countDocuments(query);
  }
}
