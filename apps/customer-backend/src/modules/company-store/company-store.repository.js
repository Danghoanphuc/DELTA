// src/modules/company-store/company-store.repository.js
// ✅ Company Store Repository

import { CompanyStore, STORE_STATUS } from "./company-store.model.js";

export class CompanyStoreRepository {
  async create(data) {
    const store = new CompanyStore(data);
    return store.save();
  }

  async findById(id) {
    return CompanyStore.findById(id)
      .populate("organization", "companyName logoUrl")
      .populate("createdBy", "firstName lastName email");
  }

  async findBySlug(slug) {
    return CompanyStore.findOne({ slug, status: STORE_STATUS.ACTIVE }).populate(
      "organization",
      "companyName logoUrl brandColor"
    );
  }

  async findByOrganization(organizationId) {
    return CompanyStore.findOne({ organization: organizationId });
  }

  async update(id, data) {
    return CompanyStore.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return CompanyStore.findByIdAndDelete(id);
  }

  async checkSlugExists(slug, excludeId = null) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const exists = await CompanyStore.findOne(query);
    return !!exists;
  }

  async addProduct(storeId, productData) {
    return CompanyStore.findByIdAndUpdate(
      storeId,
      { $push: { products: productData } },
      { new: true }
    );
  }

  async updateProduct(storeId, productId, productData) {
    return CompanyStore.findOneAndUpdate(
      { _id: storeId, "products._id": productId },
      { $set: { "products.$": { ...productData, _id: productId } } },
      { new: true }
    );
  }

  async removeProduct(storeId, productId) {
    return CompanyStore.findByIdAndUpdate(
      storeId,
      { $pull: { products: { _id: productId } } },
      { new: true }
    );
  }

  async addCategory(storeId, categoryData) {
    return CompanyStore.findByIdAndUpdate(
      storeId,
      { $push: { categories: categoryData } },
      { new: true }
    );
  }

  async updateCategory(storeId, categoryId, categoryData) {
    return CompanyStore.findOneAndUpdate(
      { _id: storeId, "categories._id": categoryId },
      { $set: { "categories.$": { ...categoryData, _id: categoryId } } },
      { new: true }
    );
  }

  async removeCategory(storeId, categoryId) {
    return CompanyStore.findByIdAndUpdate(
      storeId,
      { $pull: { categories: { _id: categoryId } } },
      { new: true }
    );
  }

  async incrementStats(storeId, field, amount = 1) {
    const update = {};
    update[`stats.${field}`] = amount;
    return CompanyStore.findByIdAndUpdate(storeId, { $inc: update });
  }

  async getPublicStores(filters = {}) {
    const query = {
      status: STORE_STATUS.ACTIVE,
      "access.type": "public",
    };

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [stores, total] = await Promise.all([
      CompanyStore.find(query)
        .select(
          "name slug tagline branding.logoUrl branding.heroImageUrl stats"
        )
        .sort({ "stats.totalOrders": -1 })
        .skip(skip)
        .limit(limit),
      CompanyStore.countDocuments(query),
    ]);

    return {
      stores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const companyStoreRepository = new CompanyStoreRepository();
