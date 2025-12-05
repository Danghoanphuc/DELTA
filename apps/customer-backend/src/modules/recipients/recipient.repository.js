// src/modules/recipients/recipient.repository.js
// ✅ Recipient Repository - Data access layer

import { Recipient } from "./recipient.model.js";
import { Logger } from "../../shared/utils/index.js";

export class RecipientRepository {
  /**
   * Create a new recipient
   */
  async create(data) {
    return await Recipient.create(data);
  }

  /**
   * Create multiple recipients (bulk import)
   */
  async createMany(recipients) {
    return await Recipient.insertMany(recipients, { ordered: false });
  }

  /**
   * Find recipient by ID
   */
  async findById(id) {
    return await Recipient.findById(id);
  }

  /**
   * Find recipient by organization and email
   */
  async findByOrgAndEmail(organizationId, email) {
    return await Recipient.findOne({
      organization: organizationId,
      email: email.toLowerCase(),
    });
  }

  /**
   * Find all recipients for an organization with filters
   */
  async findByOrganization(organizationId, options = {}) {
    const {
      status = "active",
      tags,
      department,
      search,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const query = { organization: organizationId };

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Tags filter
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Department filter
    if (department) {
      query["customFields.department"] = department;
    }

    // Search filter (name or email)
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [recipients, total] = await Promise.all([
      Recipient.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Recipient.countDocuments(query),
    ]);

    return {
      recipients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update recipient
   */
  async update(id, data) {
    return await Recipient.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Delete recipient (soft delete - archive)
   */
  async archive(id) {
    return await Recipient.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    );
  }

  /**
   * Hard delete recipient
   */
  async delete(id) {
    return await Recipient.findByIdAndDelete(id);
  }

  /**
   * Get unique tags for organization
   */
  async getUniqueTags(organizationId) {
    return await Recipient.distinct("tags", {
      organization: organizationId,
      status: "active",
    });
  }

  /**
   * Get unique departments for organization
   */
  async getUniqueDepartments(organizationId) {
    return await Recipient.distinct("customFields.department", {
      organization: organizationId,
      status: "active",
      "customFields.department": { $ne: null },
    });
  }

  /**
   * Count recipients by organization
   */
  async countByOrganization(organizationId, status = "active") {
    const query = { organization: organizationId };
    if (status !== "all") {
      query.status = status;
    }
    return await Recipient.countDocuments(query);
  }

  /**
   * Bulk update recipients by IDs
   */
  async bulkUpdate(ids, updateData) {
    return await Recipient.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );
  }

  /**
   * Bulk archive recipients
   */
  async bulkArchive(ids) {
    return await Recipient.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "archived" } }
    );
  }
}
