// src/modules/products/product.repository.js
import { Product } from "../../shared/models/product.model.js";

/**
 * ProductRepository - Handles all database operations for products
 * Follows Repository Pattern for clean separation of data access logic
 */
export class ProductRepository {
  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @returns {Promise<Object>} Created product
   */
  async create(productData) {
    return await Product.create(productData);
  }

  /**
   * Find product by ID (basic)
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Product or null
   */
  async findById(productId) {
    return await Product.findById(productId);
  }

  /**
   * Find product by ID with printer information populated and transformed
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Transformed product with printerInfo
   */
  async findByIdPopulated(productId) {
    const productDoc = await Product.findById(productId).populate({
      path: "printerId",
      select: "displayName email avatarUrl printerProfile",
      populate: {
        path: "printerProfile",
        model: "PrinterProfile",
      },
    });

    if (!productDoc) {
      return null;
    }

    // Convert to plain object to allow modification
    const product = productDoc.toObject();

    // Manually hoist the nested printerProfile to the top-level printerInfo
    if (product.printerId && product.printerId.printerProfile) {
      product.printerInfo = product.printerId.printerProfile;
    }

    return product;
  }

  /**
   * Find all products by printer ID
   * @param {string} printerId - Printer's user ID
   * @returns {Promise<Array>} Array of products
   */
  async findByPrinterId(printerId) {
    return await Product.find({ printerId }).sort({ createdAt: -1 });
  }

  /**
   * Find products with filters and transform them to include printerInfo
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Transformed products
   */
  async findWithFilters(filters) {
    const safeFilters = filters || {};
    const { category, search, sort } = safeFilters;

    const query = {};
    query.isActive = safeFilters.isActive === undefined ? true : safeFilters.isActive === "true";

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search, $caseSensitive: false, $diacriticSensitive: false };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { "pricing.0.pricePerUnit": 1 };
    if (sort === "price-desc") sortOption = { "pricing.0.pricePerUnit": -1 };
    if (sort === "popular") sortOption = { totalSold: -1, views: -1 };

    const productDocs = await Product.find(query)
      .populate({
        path: "printerId",
        select: "displayName avatarUrl printerProfile",
        populate: {
          path: "printerProfile",
          model: "PrinterProfile",
        },
      })
      .sort(sortOption);

    // Transform all products in the list to match the desired frontend structure
    const products = productDocs.map(doc => {
      const product = doc.toObject();
      if (product.printerId && product.printerId.printerProfile) {
        product.printerInfo = product.printerId.printerProfile;
      }
      return product;
    });

    return products;
  }

  /**
   * Update product by ID
   * @param {string} productId - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated product
   */
  async update(productId, updateData) {
    return await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Soft delete product (set isActive = false)
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Updated product
   */
  async softDelete(productId) {
    return await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Hard delete product (remove from database)
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Deleted product
   */
  async hardDelete(productId) {
    return await Product.findByIdAndDelete(productId);
  }
}
