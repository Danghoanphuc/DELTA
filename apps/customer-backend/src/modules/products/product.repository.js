// apps/customer-backend/src/modules/products/product.repository.js
import { Product } from "../../shared/models/product.model.js";

class ProductRepository {
  /**
   * Truy vấn "đọc" (read-only), dùng .lean() để trả về POJO
   */
  async find(filter, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    return Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
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
}

export const productRepository = new ProductRepository();
