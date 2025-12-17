// apps/customer-backend/src/modules/products/product.repository.js
import { Product } from "../../shared/models/product.model.js";

class ProductRepository {
  /**
   * Truy vấn "đọc" (read-only), dùng .lean() để trả về POJO
   */
  async find(filter, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    console.log("[ProductRepository.find] Filter:", JSON.stringify(filter));
    console.log("[ProductRepository.find] Options:", { page, limit, sort });
    const results = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    console.log("[ProductRepository.find] Results:", results.length);
    return results;
  }

  /**
   * Đếm tài liệu
   */
  async count(filter) {
    return Product.countDocuments(filter);
  }

  /**
   * Lấy một bản ghi (dùng cho update/delete)
   * KHÔNG DÙNG .lean() để trả về Mongoose Document (cho phép .save())
   */
  async findById(id) {
    return Product.findById(id);
  }

  /**
   * Lấy một bản ghi (dùng để đọc)
   * DÙNG .lean()
   */
  async findOne(filter) {
    return Product.findOne(filter).lean();
  }

  /**
   * Tạo mới
   */
  async create(productData) {
    const product = new Product(productData);
    return product.save();
  }

  /**
   * Cập nhật (đã được .save() ở service)
   */
  // (Chúng ta sẽ dùng save() trong service, nên hàm updateById có thể không cần)

  /**
   * Xóa
   */
  async deleteById(id) {
    return Product.findByIdAndDelete(id);
  }

  /**
   * Atomic stock reservation using MongoDB findOneAndUpdate (within transaction session)
   * Ensures we only decrement when sufficient inventory is available.
   */
  async reserveStock(productId, quantity, session) {
    if (!quantity || quantity <= 0) {
      return null;
    }

    return Product.findOneAndUpdate(
      {
        _id: productId,
        isActive: true,
        stock: { $gte: quantity },
      },
      {
        $inc: {
          stock: -quantity,
          totalSold: quantity,
        },
      },
      {
        new: true,
        session,
      }
    );
  }

  /**
   * Restore stock + roll back totalSold when an order fails.
   */
  async restoreStock(productId, quantity, session) {
    if (!quantity || quantity <= 0) {
      return;
    }

    await Product.updateOne(
      { _id: productId },
      {
        $inc: {
          stock: quantity,
          totalSold: -quantity,
        },
      },
      { session }
    );
  }
}

export const productRepository = new ProductRepository();
