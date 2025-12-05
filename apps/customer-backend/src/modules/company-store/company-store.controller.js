// src/modules/company-store/company-store.controller.js
// ✅ Company Store Controller

import { companyStoreService } from "./company-store.service.js";

export class CompanyStoreController {
  // === PUBLIC: Get store by slug ===
  async getPublicStore(req, res) {
    try {
      const { slug } = req.params;
      const password = req.query.password || req.body.password;
      const user = req.user || null;

      const store = await companyStoreService.getStoreBySlug(
        slug,
        user,
        password
      );
      res.json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PUBLIC: Get public stores directory ===
  async getPublicStores(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      };

      const result = await companyStoreService.getPublicStores(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Create store ===
  async createStore(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const userId = req.user._id;

      const store = await companyStoreService.createStore(
        organizationId,
        userId,
        req.body
      );
      res.status(201).json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Get my store ===
  async getMyStore(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const store = await companyStoreService.getMyStore(organizationId);
      res.json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Update store ===
  async updateStore(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const store = await companyStoreService.updateStore(
        organizationId,
        req.body
      );
      res.json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Publish store ===
  async publishStore(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const store = await companyStoreService.publishStore(organizationId);
      res.json({
        success: true,
        data: store,
        message: "Store đã được publish",
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Unpublish store ===
  async unpublishStore(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const store = await companyStoreService.unpublishStore(organizationId);
      res.json({
        success: true,
        data: store,
        message: "Store đã được tạm dừng",
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Add product ===
  async addProduct(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const store = await companyStoreService.addProduct(
        organizationId,
        req.body
      );
      res.json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Update product ===
  async updateProduct(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const { productId } = req.params;
      const store = await companyStoreService.updateProduct(
        organizationId,
        productId,
        req.body
      );
      res.json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Remove product ===
  async removeProduct(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const { productId } = req.params;
      const store = await companyStoreService.removeProduct(
        organizationId,
        productId
      );
      res.json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Add category ===
  async addCategory(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const store = await companyStoreService.addCategory(
        organizationId,
        req.body
      );
      res.json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Update category ===
  async updateCategory(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const { categoryId } = req.params;
      const store = await companyStoreService.updateCategory(
        organizationId,
        categoryId,
        req.body
      );
      res.json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // === PRIVATE: Remove category ===
  async removeCategory(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const { categoryId } = req.params;
      const store = await companyStoreService.removeCategory(
        organizationId,
        categoryId
      );
      res.json({ success: true, data: store });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const companyStoreController = new CompanyStoreController();
