// src/modules/products/product.repository.js
import { Product } from "../../shared/models/product.model.js";
import mongoose from "mongoose";
import { Logger } from "../../shared/utils/index.js";

export class ProductRepository {
  // (Hàm _transformProduct giữ nguyên)
  _transformProduct(productDoc) {
    if (!productDoc) return null;
    const product = productDoc.toObject();
    if (product.printerId && product.printerId.printerProfileId) {
      product.printerInfo = product.printerId.printerProfileId;
    } else {
      Logger.warn(
        `[Repo.Transform] Product ${product._id} missing populated printerProfileId`
      );
    }
    if (product.printerId) {
      delete product.printerId.printerProfileId;
    }
    return product;
  }

  /**
   * ✅ ĐÃ TỐI ƯU:
   * Populate 'printerProfileId' nhưng loại trừ các trường "nặng".
   */
  _getPopulateConfig() {
    return {
      path: "printerId", // 1. Populate User
      select: "displayName email avatarUrl printerProfileId",
      populate: {
        path: "printerProfileId", // 2. Populate PrinterProfile
        model: "PrinterProfile",
        // 3. CHỈ ĐỊNH CÁC TRƯỜNG "NHẸ" (Tối ưu tốc độ)
        // Bằng cách dùng dấu "-", ta loại bỏ các trường nặng
        select: "-factoryImages -factoryVideoUrl",
      },
    };
  }

  // (Các hàm create, findById, findByPrinterId, ... giữ nguyên)
  // ...
  async create(productData) {
    return await Product.create(productData);
  }

  async findById(productId) {
    return await Product.findById(productId);
  }

  async findByIdPopulated(productId) {
    Logger.debug(`[Repo.findByIdPopulated] Finding product by: ${productId}`);
    const isObjectId = mongoose.Types.ObjectId.isValid(productId);
    const query = isObjectId ? { _id: productId } : { taxonomyId: productId };
    const productDoc = await Product.findOne(query).populate(
      this._getPopulateConfig()
    );
    return this._transformProduct(productDoc);
  }

  async findByPrinterId(printerId) {
    return await Product.find({ printerId }).sort({ createdAt: -1 });
  }

  async findWithFilters(filters) {
    Logger.debug(
      "[Repo.findWithFilters] Finding products with filters:",
      filters
    );
    const safeFilters = filters || {};
    const { category, search, sort } = safeFilters;
    const query = {};
    query.isActive =
      safeFilters.isActive === undefined
        ? true
        : safeFilters.isActive === "true";
    if (category && category !== "all") {
      query.category = category;
    }
    if (search) {
      query.$text = {
        $search: search,
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
    }
    let sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { "pricing.0.pricePerUnit": 1 };
    if (sort === "price-desc") sortOption = { "pricing.0.pricePerUnit": -1 };
    if (sort === "popular") sortOption = { totalSold: -1, views: -1 };

    const productDocs = await Product.find(query)
      .populate(this._getPopulateConfig()) // <- Đã dùng config tối ưu
      .sort(sortOption);

    Logger.debug(
      `[Repo.findWithFilters] Found ${productDocs.length} documents.`
    );
    const products = productDocs.map((doc) => this._transformProduct(doc));
    Logger.debug(
      `[Repo.findWithFilters] Transformed ${products.length} products.`
    );
    return products;
  }

  async update(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async softDelete(productId) {
    return await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );
  }

  async hardDelete(productId) {
    return await Product.findByIdAndDelete(productId);
  }

  async findByIds(productIds) {
    return await Product.find({ _id: { $in: productIds } });
  }
}
