// src/modules/redemption/redemption.service.js
// ✅ Redemption Link Service

import { redemptionRepository } from "./redemption.repository.js";
import {
  RedemptionLink,
  REDEMPTION_STATUS,
  LINK_TYPE,
} from "./redemption.model.js";
import { SwagOrderService } from "../swag-orders/swag-order.service.js";

// Create instance
const swagOrderService = new SwagOrderService();

export class RedemptionService {
  constructor(repo = redemptionRepository) {
    this.repo = repo;
  }

  // === CREATE LINK ===
  async createLink(organizationId, userId, data) {
    // Generate short code if requested
    let shortCode = null;
    if (data.generateShortCode) {
      shortCode = await RedemptionLink.generateShortCode();
    }

    const linkData = {
      organization: organizationId,
      createdBy: userId,
      name: data.name,
      description: data.description,
      type: data.type || LINK_TYPE.SINGLE,
      maxRedemptions: data.maxRedemptions || 1,
      items: data.items || [],
      branding: data.branding || {},
      settings: data.settings || {},
      expiresAt: data.expiresAt,
      campaign: data.campaign,
      source: data.source,
      tags: data.tags || [],
      shortCode,
    };

    return this.repo.create(linkData);
  }

  // === GET LINK BY TOKEN (Public) ===
  async getLinkByToken(token) {
    const link = await this.repo.findByToken(token);

    if (!link) {
      throw new Error("Link không tồn tại");
    }

    // Check if can redeem
    if (!link.canRedeem()) {
      if (link.isExpired) {
        throw new Error("Link đã hết hạn");
      }
      if (link.status === REDEMPTION_STATUS.REDEEMED) {
        throw new Error("Link đã được sử dụng");
      }
      throw new Error("Link không khả dụng");
    }

    // Record view
    await this.repo.recordView(link._id, true);

    // Return public data only
    return {
      id: link._id,
      name: link.name,
      description: link.description,
      items: link.items,
      branding: link.branding,
      settings: {
        requirePhone: link.settings.requirePhone,
        requireAddress: link.settings.requireAddress,
        customFields: link.settings.customFields,
      },
      organization: {
        name: link.organization?.companyName,
        logo: link.organization?.logoUrl,
      },
      expiresAt: link.expiresAt,
      remainingRedemptions: link.remainingRedemptions,
    };
  }

  // === REDEEM LINK ===
  async redeemLink(token, redemptionData, metadata = {}) {
    const link = await this.repo.findByToken(token);

    if (!link) {
      throw new Error("Link không tồn tại");
    }

    if (!link.canRedeem()) {
      throw new Error("Link không thể redeem");
    }

    // Validate required fields
    if (link.settings.requirePhone && !redemptionData.phone) {
      throw new Error("Vui lòng nhập số điện thoại");
    }

    if (link.settings.requireAddress && !redemptionData.shippingAddress?.city) {
      throw new Error("Vui lòng nhập địa chỉ giao hàng");
    }

    // Create redemption entry
    const entry = {
      firstName: redemptionData.firstName,
      lastName: redemptionData.lastName,
      email: redemptionData.email,
      phone: redemptionData.phone,
      shippingAddress: redemptionData.shippingAddress,
      selections: redemptionData.selections || [],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    };

    // Add redemption to link
    const savedEntry = await link.addRedemption(entry);

    // Auto-create order if enabled
    let order = null;
    if (link.settings.autoCreateOrder) {
      try {
        order = await this.createOrderFromRedemption(link, savedEntry);

        // Update entry with order ID
        await RedemptionLink.updateOne(
          { _id: link._id, "redemptions._id": savedEntry._id },
          { $set: { "redemptions.$.orderId": order._id } }
        );
      } catch (err) {
        console.error("[RedemptionService] Error creating order:", err);
      }
    }

    // TODO: Send notifications (email, Zalo)

    return {
      success: true,
      message: "Đã xác nhận thông tin thành công!",
      redemptionId: savedEntry._id,
      orderId: order?._id,
    };
  }

  // === CREATE ORDER FROM REDEMPTION ===
  async createOrderFromRedemption(link, entry) {
    // Build order items from selections
    const orderItems = entry.selections.map((sel, idx) => {
      const item = link.items[sel.itemIndex];
      return {
        product: item.product,
        swagPack: item.swagPack,
        name: item.name,
        quantity: sel.quantity || item.quantity,
        selectedSize: sel.selectedSize,
        selectedColor: sel.selectedColor,
        notes: sel.notes,
      };
    });

    // Create recipient data
    const recipient = {
      firstName: entry.firstName,
      lastName: entry.lastName,
      email: entry.email,
      phone: entry.phone,
      address: entry.shippingAddress,
    };

    // Create order via swag order service
    const orderData = {
      organization: link.organization,
      type: "redemption",
      source: "redemption_link",
      sourceId: link._id,
      recipients: [recipient],
      items: orderItems,
      notes: `Từ Redemption Link: ${link.name}`,
    };

    return swagOrderService.createOrder(orderData);
  }

  // === GET LINKS BY ORG ===
  async getLinksByOrganization(organizationId, filters = {}) {
    return this.repo.findByOrganization(organizationId, filters);
  }

  // === GET LINK DETAIL ===
  async getLinkDetail(linkId, organizationId) {
    const link = await this.repo.findById(linkId);

    if (!link) {
      throw new Error("Link không tồn tại");
    }

    if (link.organization._id.toString() !== organizationId.toString()) {
      throw new Error("Không có quyền truy cập");
    }

    return link;
  }

  // === UPDATE LINK ===
  async updateLink(linkId, organizationId, data) {
    const link = await this.repo.findById(linkId);

    if (!link) {
      throw new Error("Link không tồn tại");
    }

    if (link.organization._id.toString() !== organizationId.toString()) {
      throw new Error("Không có quyền truy cập");
    }

    // Don't allow updating certain fields after redemptions
    if (link.currentRedemptions > 0) {
      delete data.items;
      delete data.type;
      delete data.maxRedemptions;
    }

    return this.repo.update(linkId, data);
  }

  // === DELETE LINK ===
  async deleteLink(linkId, organizationId) {
    const link = await this.repo.findById(linkId);

    if (!link) {
      throw new Error("Link không tồn tại");
    }

    if (link.organization._id.toString() !== organizationId.toString()) {
      throw new Error("Không có quyền truy cập");
    }

    // Soft delete - just mark as cancelled
    return this.repo.update(linkId, { status: REDEMPTION_STATUS.CANCELLED });
  }

  // === GET STATS ===
  async getStats(organizationId, dateRange) {
    return this.repo.getStats(organizationId, dateRange);
  }

  // === DUPLICATE LINK ===
  async duplicateLink(linkId, organizationId, userId) {
    const original = await this.repo.findById(linkId);

    if (!original) {
      throw new Error("Link không tồn tại");
    }

    if (original.organization._id.toString() !== organizationId.toString()) {
      throw new Error("Không có quyền truy cập");
    }

    const newData = {
      name: `${original.name} (Copy)`,
      description: original.description,
      type: original.type,
      maxRedemptions: original.maxRedemptions,
      items: original.items,
      branding: original.branding,
      settings: original.settings,
      campaign: original.campaign,
      tags: original.tags,
    };

    return this.createLink(organizationId, userId, newData);
  }
}

export const redemptionService = new RedemptionService();
