// apps/customer-backend/src/modules/products/product.service.js
import { productRepository } from "./product.repository.js";
import { Product } from "../../shared/models/product.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

// ✅ SỬA LỖI ĐƯỜNG DẪN: Thêm "/index.js"
import {
  NotFoundException,
  ForbiddenException,
  ValidationException,
} from "../../shared/exceptions/index.js";

/**
 * Service này CHỈ dành cho Nhà in (Printer) đã xác thực
 * để quản lý sản phẩm CỦA HỌ.
 */
class ProductService {
  /**
   * Helper bảo mật: Lấy 1 SP và kiểm tra quyền sở hữu
   * @param {string} printerProfileId - ID của nhà in (từ auth)
   * @param {string} productId - ID sản phẩm cần check
   * @returns {Promise<Document<Product>>} - Trả về Mongoose Doc (để .save())
   */
  async getProductAndVerifyOwnership(printerProfileId, productId) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException("Sản phẩm", productId);
    }

    // BẢO MẬT: Kiểm tra quyền sở hữu
    if (product.printerProfileId.toString() !== printerProfileId) {
      throw new ForbiddenException(
        "Bạn không có quyền thao tác với sản phẩm này."
      );
    }

    return product;
  }

  /**
   * Lấy danh sách sản phẩm CỦA TÔI (nhà in đã đăng nhập)
   * @param {string} printerProfileId - ID của nhà in (từ auth)
   * @param {object} query - (page, limit, search)
   */
  async getMyProducts(printerProfileId, query) {
    const { page = 1, limit = 10, search } = query;

    const filter = {
      printerProfileId: printerProfileId, // Bảo mật: Chỉ lấy SP của nhà in này
    };
    if (search) {
      filter.name = new RegExp(search, "i");
    }

    const [products, total] = await Promise.all([
      productRepository.find(filter, { page: +page, limit: +limit }),
      productRepository.count(filter),
    ]);

    return {
      data: products,
      page: +page,
      limit: +limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết 1 sản phẩm CỦA TÔI
   */
  async getMyProductById(printerProfileId, productId) {
    // Dùng helper để check 404 và 403
    const product = await this.getProductAndVerifyOwnership(
      printerProfileId,
      productId
    );
    return product.toObject(); // Trả về POJO
  }

  /**
   * Tạo sản phẩm mới
   * @param {string} printerProfileId - ID của nhà in (từ auth)
   * @param {import('@printz/types').ICreateProductDto} dto - Dữ liệu từ "Hợp đồng"
   */
  async createProduct(printerProfileId, dto) {
    // 1. Kiểm tra nhà in có được phép đăng bán không
    const printer = await PrinterProfile.findById(printerProfileId);
    if (!printer || !printer.isVerified) {
      throw new ForbiddenException(
        "Hồ sơ nhà in của bạn chưa được duyệt hoặc đã bị khóa."
      );
    }

    // 2. Check Slug (giữ logic cũ của anh)
    await this.checkSlugAvailability(dto.slug);

    // 3. Gán chủ sở hữu và tạo
    const productData = {
      ...dto,
      printerProfileId: printerProfileId,
    };

    return productRepository.create(productData);
  }

  /**
   * Cập nhật sản phẩm CỦA TÔI
   */
  async updateProduct(printerProfileId, productId, dto) {
    // 1. Lấy và kiểm tra sở hữu
    const product = await this.getProductAndVerifyOwnership(
      printerProfileId,
      productId
    );

    // 2. Kiểm tra slug (nếu đổi)
    if (dto.slug && dto.slug !== product.slug) {
      await this.checkSlugAvailability(dto.slug);
    }

    // 3. Cập nhật và lưu
    // (Bỏ qua các trường "health" mà Admin quản lý)
    const { isPublished, healthStatus, stats, ...safeDto } = dto;

    Object.assign(product, safeDto);
    await product.save();
    return product;
  }

  /**
   * Xóa sản phẩm CỦA TÔI
   */
  async deleteProduct(printerProfileId, productId) {
    // 1. Lấy và kiểm tra sở hữu
    await this.getProductAndVerifyOwnership(printerProfileId, productId);

    // 2. Xóa
    await productRepository.deleteById(productId);
    return { message: "Đã xóa sản phẩm thành công." };
  }

  /**
   * Kiểm tra Slug (Giữ lại hàm này vì nó quan trọng)
   * Đây có thể là API public, nhưng service 'create' cần dùng nó
   */
  async checkSlugAvailability(slug) {
    const existing = await productRepository.findOne({ slug });
    if (existing) {
      throw new ValidationException(
        `Slug "${slug}" đã tồn tại. Vui lòng chọn slug khác.`
      );
    }
    return { isAvailable: true };
  }

  /**
   * Lấy danh sách sản phẩm CÔNG KHAI (Public API)
   * @param {object} query - (page, limit, sort, category, search)
   */
  async getAllProducts(query) {
    const { page = 1, limit = 20, sort = "created", category, search } = query;

    // Filter: Chỉ lấy sản phẩm active
    // Tạm thời đơn giản hóa để test: chỉ cần isActive không phải false
    // (Bỏ qua isPublished và healthStatus để tương thích với dữ liệu cũ)
    const baseFilter = {
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }, // Dữ liệu cũ có thể không có field này
        { isActive: null },
      ],
    };

    // Xây dựng filter với các điều kiện bổ sung
    const conditions = [baseFilter];

    // Filter theo category
    if (category && category !== "all") {
      conditions.push({ category });
    }

    // Filter theo search
    if (search) {
      conditions.push({
        $or: [
          { name: new RegExp(search, "i") },
          { description: new RegExp(search, "i") },
        ],
      });
    }

    // Nếu có nhiều điều kiện, dùng $and, nếu không thì dùng baseFilter
    const filter = conditions.length > 1 ? { $and: conditions } : baseFilter;

    // Sort options
    let sortOption = { createdAt: -1 }; // default
    if (sort === "popular") {
      sortOption = { totalSold: -1, views: -1 };
    } else if (sort === "price-asc") {
      sortOption = { basePrice: 1 };
    } else if (sort === "price-desc") {
      sortOption = { basePrice: -1 };
    } else if (sort === "created") {
      sortOption = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      productRepository.find(filter, {
        page: +page,
        limit: +limit,
        sort: sortOption,
      }),
      productRepository.count(filter),
    ]);

    // Populate printerProfileId để lấy thông tin nhà in
    const populatedProducts = await Promise.all(
      products.map(async (product) => {
        if (product.printerProfileId) {
          const printerProfile = await PrinterProfile.findById(
            product.printerProfileId
          )
            .select("businessName avatarUrl tier")
            .lean();
          return {
            ...product,
            printer: printerProfile || null,
          };
        }
        return product;
      })
    );

    return {
      data: populatedProducts,
      page: +page,
      limit: +limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết 1 sản phẩm CÔNG KHAI (Public API)
   * @param {string} productId - ID sản phẩm
   */
  async getProductById(productId) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException("Sản phẩm", productId);
    }

    // ✅ SỬA: Kiểm tra linh hoạt hơn để tương thích với dữ liệu cũ
    // Chỉ kiểm tra isActive nếu có, các field khác có thể null/undefined
    if (product.isActive === false) {
      throw new NotFoundException("Sản phẩm", productId);
    }
    
    // Nếu có isPublished và healthStatus, kiểm tra chúng
    if (product.isPublished === false || product.healthStatus === "Inactive") {
      throw new NotFoundException("Sản phẩm", productId);
    }

    // Populate printerProfileId
    let printer = null;
    if (product.printerProfileId) {
      printer = await PrinterProfile.findById(product.printerProfileId)
        .select("businessName avatarUrl tier")
        .lean();
    }

    // ✅ SỬA: Tăng views bằng updateOne để tránh validation error
    // Không dùng save() vì có thể gây validation error nếu product thiếu fields
    await Product.updateOne(
      { _id: product._id },
      { $inc: { views: 1 } }
    );

    // Lấy lại product sau khi update để có views mới nhất
    const updatedProduct = await productRepository.findById(productId);

    return {
      ...updatedProduct.toObject(),
      printer: printer || null,
    };
  }
}

export const productService = new ProductService();
