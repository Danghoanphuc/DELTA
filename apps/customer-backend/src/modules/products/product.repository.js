// apps/customer-backend/src/modules/products/product.repository.js
// ✅ Product Repository - Data access layer for products

import { Product } from "../../shared/models/product.model.js";
import { Logger } from "../../shared/utils/index.js";

class ProductRepository {
  /**
   * Find product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Product|null>}
   */
  async findById(id) {
    try {
      return await Product.findById(id).lean();
    } catch (error) {
      Logger.error(`[ProductRepo] Error finding product by ID: ${id}`, error);
      return null;
    }
  }

  /**
   * Find product by ID with full details (not lean)
   * @param {string} id - Product ID
   * @returns {Promise<Product|null>}
   */
  async findByIdFull(id) {
    try {
      return await Product.findById(id);
    } catch (error) {
      Logger.error(`[ProductRepo] Error finding product: ${id}`, error);
      return null;
    }
  }

  /**
   * Find products by IDs
   * @param {string[]} ids - Array of product IDs
   * @returns {Promise<Product[]>}
   */
  async findByIds(ids) {
    try {
      return await Product.find({ _id: { $in: ids } }).lean();
    } catch (error) {
      Logger.error(`[ProductRepo] Error finding products by IDs`, error);
      return [];
    }
  }

  /**
   * Find active products by IDs
   * @param {string[]} ids - Array of product IDs
   * @returns {Promise<Product[]>}
   */
  async findActiveByIds(ids) {
    try {
      return await Product.find({
        _id: { $in: ids },
        isActive: true,
      }).lean();
    } catch (error) {
      Logger.error(`[ProductRepo] Error finding active products`, error);
      return [];
    }
  }

  /**
   * Find products by printer profile ID
   * @param {string} printerProfileId - Printer profile ID
   * @param {object} options - Query options
   * @returns {Promise<{products: Product[], total: number}>}
   */
  async findByPrinterProfile(printerProfileId, options = {}) {
    try {
      const { page = 1, limit = 20, isActive = true } = options;
      const skip = (page - 1) * limit;

      const query = { printerProfileId };
      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const [products, total] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query),
      ]);

      return { products, total };
    } catch (error) {
      Logger.error(`[ProductRepo] Error finding products by printer`, error);
      return { products: [], total: 0 };
    }
  }

  /**
   * Create a new product
   * @param {object} data - Product data
   * @returns {Promise<Product>}
   */
  async create(data) {
    const product = new Product(data);
    return await product.save();
  }

  /**
   * Update product by ID
   * @param {string} id - Product ID
   * @param {object} data - Update data
   * @returns {Promise<Product|null>}
   */
  async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Delete product by ID
   * @param {string} id - Product ID
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Soft delete (deactivate) product
   * @param {string} id - Product ID
   * @returns {Promise<Product|null>}
   */
  async softDelete(id) {
    return await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }
}

// Export singleton instance
export const productRepository = new ProductRepository();
export { ProductRepository };
