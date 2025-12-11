// src/modules/artworks/artwork.repository.js
// ✅ Artwork Repository - Data access layer

import { Artwork, ARTWORK_STATUS } from "./artwork.model.js";

export class ArtworkRepository {
  /**
   * Create new artwork
   */
  async create(data) {
    const artwork = new Artwork(data);
    return await artwork.save();
  }

  /**
   * Find artwork by ID
   */
  async findById(id) {
    return await Artwork.findById(id)
      .populate("uploadedBy", "displayName email")
      .populate("validatedBy", "displayName email")
      .lean();
  }

  /**
   * Find artwork by organization
   */
  async findByOrganization(organizationId, options = {}) {
    const query = {
      organization: organizationId,
      isDeleted: false,
    };

    // Filter by status
    if (options.status) {
      query.validationStatus = options.status;
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      query.tags = { $in: options.tags };
    }

    // Search by name or description
    if (options.search) {
      query.$or = [
        { fileName: new RegExp(options.search, "i") },
        { description: new RegExp(options.search, "i") },
        { tags: new RegExp(options.search, "i") },
      ];
    }

    // Pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;

    // Sort
    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder === "asc" ? 1 : -1;

    const [artworks, total] = await Promise.all([
      Artwork.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate("uploadedBy", "displayName email")
        .populate("validatedBy", "displayName email")
        .lean(),
      Artwork.countDocuments(query),
    ]);

    return {
      artworks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find artwork by status
   */
  async findByStatus(organizationId, status) {
    return await Artwork.find({
      organization: organizationId,
      validationStatus: status,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "displayName email")
      .lean();
  }

  /**
   * Find pending artworks (for validation)
   */
  async findPending(organizationId) {
    return await this.findByStatus(organizationId, ARTWORK_STATUS.PENDING);
  }

  /**
   * Update artwork
   */
  async update(id, data) {
    return await Artwork.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("uploadedBy", "displayName email")
      .populate("validatedBy", "displayName email");
  }

  /**
   * Soft delete artwork
   */
  async softDelete(id, userId) {
    return await Artwork.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
      { new: true }
    );
  }

  /**
   * Hard delete artwork (permanent)
   */
  async delete(id) {
    return await Artwork.findByIdAndDelete(id);
  }

  /**
   * Find version history
   */
  async findVersionHistory(artworkId) {
    return await Artwork.find({
      $or: [{ _id: artworkId }, { previousVersionId: artworkId }],
    })
      .sort({ version: -1 })
      .populate("uploadedBy", "displayName email")
      .lean();
  }

  /**
   * Get artwork statistics
   */
  async getStats(organizationId) {
    const stats = await Artwork.aggregate([
      {
        $match: {
          organization: organizationId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$validationStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  /**
   * Find most used artworks
   */
  async findMostUsed(organizationId, limit = 10) {
    return await Artwork.find({
      organization: organizationId,
      isDeleted: false,
      validationStatus: ARTWORK_STATUS.APPROVED,
    })
      .sort({ usageCount: -1 })
      .limit(limit)
      .populate("uploadedBy", "displayName email")
      .lean();
  }

  /**
   * Find recent artworks
   */
  async findRecent(organizationId, limit = 10) {
    return await Artwork.find({
      organization: organizationId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("uploadedBy", "displayName email")
      .lean();
  }

  /**
   * Search artworks by tags
   */
  async searchByTags(organizationId, tags) {
    return await Artwork.find({
      organization: organizationId,
      isDeleted: false,
      tags: { $in: tags },
    })
      .sort({ usageCount: -1 })
      .populate("uploadedBy", "displayName email")
      .lean();
  }

  /**
   * Get all unique tags for organization
   */
  async getAllTags(organizationId) {
    const result = await Artwork.aggregate([
      {
        $match: {
          organization: organizationId,
          isDeleted: false,
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return result.map((item) => ({
      tag: item._id,
      count: item.count,
    }));
  }
}
