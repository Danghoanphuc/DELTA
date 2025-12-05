// src/modules/redemption/redemption.controller.js
// ✅ Redemption Link Controller

import { redemptionService } from "./redemption.service.js";

export class RedemptionController {
  // === PUBLIC: Get link by token ===
  async getPublicLink(req, res) {
    try {
      const { token } = req.params;
      const link = await redemptionService.getLinkByToken(token);
      res.json({ success: true, data: link });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PUBLIC: Redeem link ===
  async redeemLink(req, res) {
    try {
      const { token } = req.params;
      const metadata = {
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
      };

      const result = await redemptionService.redeemLink(
        token,
        req.body,
        metadata
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Create link ===
  async createLink(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const userId = req.user._id;

      const link = await redemptionService.createLink(
        organizationId,
        userId,
        req.body
      );
      res.status(201).json({ success: true, data: link });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Get all links ===
  async getLinks(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const filters = {
        status: req.query.status,
        search: req.query.search,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      };

      const result = await redemptionService.getLinksByOrganization(
        organizationId,
        filters
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Get link detail ===
  async getLinkDetail(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const { id } = req.params;

      const link = await redemptionService.getLinkDetail(id, organizationId);
      res.json({ success: true, data: link });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Update link ===
  async updateLink(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const { id } = req.params;

      const link = await redemptionService.updateLink(
        id,
        organizationId,
        req.body
      );
      res.json({ success: true, data: link });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Delete link ===
  async deleteLink(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const { id } = req.params;

      await redemptionService.deleteLink(id, organizationId);
      res.json({ success: true, message: "Đã xóa link" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Duplicate link ===
  async duplicateLink(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const userId = req.user._id;
      const { id } = req.params;

      const link = await redemptionService.duplicateLink(
        id,
        organizationId,
        userId
      );
      res.json({ success: true, data: link });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Get stats ===
  async getStats(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const dateRange = {
        from: req.query.from,
        to: req.query.to,
      };

      const stats = await redemptionService.getStats(organizationId, dateRange);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const redemptionController = new RedemptionController();
