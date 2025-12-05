// src/modules/redemption/redemption.repository.js
// ✅ Redemption Link Repository

import { RedemptionLink, REDEMPTION_STATUS } from "./redemption.model.js";

export class RedemptionRepository {
  async create(data) {
    const link = new RedemptionLink(data);
    return link.save();
  }

  async findById(id) {
    return RedemptionLink.findById(id)
      .populate("organization", "companyName logoUrl")
      .populate("createdBy", "firstName lastName email");
  }

  async findByToken(token) {
    return RedemptionLink.findOne({ token }).populate(
      "organization",
      "companyName logoUrl brandColor"
    );
  }

  async findByShortCode(shortCode) {
    return RedemptionLink.findOne({
      shortCode: shortCode.toUpperCase(),
    }).populate("organization", "companyName logoUrl brandColor");
  }

  async findByOrganization(organizationId, filters = {}) {
    const query = { organization: organizationId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { campaign: { $regex: filters.search, $options: "i" } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      RedemptionLink.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "firstName lastName"),
      RedemptionLink.countDocuments(query),
    ]);

    return {
      links,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id, data) {
    return RedemptionLink.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return RedemptionLink.findByIdAndDelete(id);
  }

  async addRedemption(linkId, entryData) {
    const link = await RedemptionLink.findById(linkId);
    if (!link) throw new Error("Link không tồn tại");
    return link.addRedemption(entryData);
  }

  async recordView(linkId, isUnique = false) {
    return RedemptionLink.findByIdAndUpdate(linkId, {
      $inc: {
        "stats.views": 1,
        ...(isUnique && { "stats.uniqueViews": 1 }),
      },
    });
  }

  async getStats(organizationId, dateRange) {
    const match = { organization: organizationId };

    if (dateRange?.from) {
      match.createdAt = { $gte: new Date(dateRange.from) };
    }
    if (dateRange?.to) {
      match.createdAt = { ...match.createdAt, $lte: new Date(dateRange.to) };
    }

    const stats = await RedemptionLink.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalLinks: { $sum: 1 },
          totalViews: { $sum: "$stats.views" },
          totalRedemptions: { $sum: "$currentRedemptions" },
          activeLinks: {
            $sum: {
              $cond: [{ $eq: ["$status", REDEMPTION_STATUS.PENDING] }, 1, 0],
            },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalLinks: 0,
        totalViews: 0,
        totalRedemptions: 0,
        activeLinks: 0,
      }
    );
  }

  async expireOldLinks() {
    return RedemptionLink.updateMany(
      {
        status: REDEMPTION_STATUS.PENDING,
        expiresAt: { $lt: new Date() },
      },
      { status: REDEMPTION_STATUS.EXPIRED }
    );
  }
}

export const redemptionRepository = new RedemptionRepository();
