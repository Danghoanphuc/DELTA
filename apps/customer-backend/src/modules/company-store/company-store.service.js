// src/modules/company-store/company-store.service.js
// ✅ Company Store Service

import { companyStoreRepository } from "./company-store.repository.js";
import { STORE_STATUS, STORE_ACCESS } from "./company-store.model.js";

// Simple slugify function (no external dependency)
function slugify(text, options = {}) {
  const { lower = false, strict = false } = options;
  let slug = text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -

  if (strict) {
    slug = slug.replace(/[^a-zA-Z0-9-]/g, "");
  }
  if (lower) {
    slug = slug.toLowerCase();
  }
  return slug;
}

export class CompanyStoreService {
  constructor(repo = companyStoreRepository) {
    this.repo = repo;
  }

  // === CREATE STORE ===
  async createStore(organizationId, userId, data) {
    // Check if org already has a store
    const existing = await this.repo.findByOrganization(organizationId);
    if (existing) {
      throw new Error("Tổ chức đã có Company Store");
    }

    // Generate unique slug
    let slug = slugify(data.name, { lower: true, strict: true });
    let slugExists = await this.repo.checkSlugExists(slug);
    let counter = 1;
    while (slugExists) {
      slug = `${slugify(data.name, { lower: true, strict: true })}-${counter}`;
      slugExists = await this.repo.checkSlugExists(slug);
      counter++;
    }

    const storeData = {
      organization: organizationId,
      createdBy: userId,
      name: data.name,
      slug,
      tagline: data.tagline,
      description: data.description,
      branding: data.branding || {},
      access: data.access || { type: STORE_ACCESS.PRIVATE },
      settings: data.settings || {},
      status: STORE_STATUS.DRAFT,
    };

    return this.repo.create(storeData);
  }

  // === GET STORE BY SLUG (Public) ===
  async getStoreBySlug(slug, user = null, password = null) {
    const store = await this.repo.findBySlug(slug);

    if (!store) {
      throw new Error("Store không tồn tại");
    }

    // Check access
    if (!store.isAccessible(user, password)) {
      throw new Error("Bạn không có quyền truy cập store này");
    }

    // Record visit
    await this.repo.incrementStats(store._id, "totalVisitors");

    // Return public data
    return this.formatPublicStore(store);
  }

  // === GET MY STORE ===
  async getMyStore(organizationId) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) {
      return null;
    }
    return store;
  }

  // === UPDATE STORE ===
  async updateStore(organizationId, data) {
    const store = await this.repo.findByOrganization(organizationId);

    if (!store) {
      throw new Error("Store không tồn tại");
    }

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== store.slug) {
      const slugExists = await this.repo.checkSlugExists(data.slug, store._id);
      if (slugExists) {
        throw new Error("Slug đã được sử dụng");
      }
    }

    return this.repo.update(store._id, data);
  }

  // === PUBLISH/UNPUBLISH STORE ===
  async publishStore(organizationId) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) throw new Error("Store không tồn tại");

    // Validate store has products
    if (!store.products || store.products.length === 0) {
      throw new Error("Cần thêm ít nhất 1 sản phẩm trước khi publish");
    }

    return this.repo.update(store._id, { status: STORE_STATUS.ACTIVE });
  }

  async unpublishStore(organizationId) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) throw new Error("Store không tồn tại");

    return this.repo.update(store._id, { status: STORE_STATUS.PAUSED });
  }

  // === PRODUCT MANAGEMENT ===
  async addProduct(organizationId, productData) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) throw new Error("Store không tồn tại");

    return this.repo.addProduct(store._id, productData);
  }

  async updateProduct(organizationId, productId, productData) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) throw new Error("Store không tồn tại");

    return this.repo.updateProduct(store._id, productId, productData);
  }

  async removeProduct(organizationId, productId) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) throw new Error("Store không tồn tại");

    return this.repo.removeProduct(store._id, productId);
  }

  async reorderProducts(organizationId, productIds) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) throw new Error("Store không tồn tại");

    // Update sort order for each product
    const updates = productIds.map((id, index) => ({
      updateOne: {
        filter: { _id: store._id, "products._id": id },
        update: { $set: { "products.$.sortOrder": index } },
      },
    }));

    // This would need bulk write - simplified for now
    return store;
  }

  // === CATEGORY MANAGEMENT ===
  async addCategory(organizationId, categoryData) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) throw new Error("Store không tồn tại");

    // Generate slug
    categoryData.slug = slugify(categoryData.name, {
      lower: true,
      strict: true,
    });

    return this.repo.addCategory(store._id, categoryData);
  }

  async updateCategory(organizationId, categoryId, categoryData) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) throw new Error("Store không tồn tại");

    if (categoryData.name) {
      categoryData.slug = slugify(categoryData.name, {
        lower: true,
        strict: true,
      });
    }

    return this.repo.updateCategory(store._id, categoryId, categoryData);
  }

  async removeCategory(organizationId, categoryId) {
    const store = await this.repo.findByOrganization(organizationId);
    if (!store) throw new Error("Store không tồn tại");

    return this.repo.removeCategory(store._id, categoryId);
  }

  // === HELPERS ===
  formatPublicStore(store) {
    return {
      id: store._id,
      name: store.name,
      slug: store.slug,
      tagline: store.tagline,
      description: store.description,
      branding: store.branding,
      products: store.products
        .filter((p) => p.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((p) => ({
          id: p._id,
          name: p.displayName || p.name,
          description: p.displayDescription,
          image: p.displayImage,
          price: store.settings.showPrices ? p.price : null,
          compareAtPrice: store.settings.showPrices ? p.compareAtPrice : null,
          allowSizeSelection: p.allowSizeSelection,
          availableSizes: p.availableSizes,
          maxPerOrder: p.maxPerOrder,
          inStock: !p.trackInventory || p.inventoryCount > 0,
        })),
      categories: store.categories
        .filter((c) => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      organization: {
        name: store.organization?.companyName,
        logo: store.organization?.logoUrl,
      },
      settings: {
        showPrices: store.settings.showPrices,
        showInventory: store.settings.showInventory,
        enableBudget: store.settings.enableBudget,
      },
    };
  }

  // === PUBLIC STORES DIRECTORY ===
  async getPublicStores(filters = {}) {
    return this.repo.getPublicStores(filters);
  }
}

export const companyStoreService = new CompanyStoreService();
