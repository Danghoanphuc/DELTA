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

// ✅ RAG: Import Embedding Service
import { embeddingService } from "../../shared/services/embedding.service.js";
// ✅ Algolia: Import Algolia Service để sync
import { algoliaService } from "../../infrastructure/search/algolia.service.js";
// ✅ Logger
import { Logger } from "../../shared/utils/index.js";

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
    if (!printerProfileId) {
      throw new ForbiddenException(
        "Không tìm thấy thông tin nhà in. Vui lòng đăng nhập lại."
      );
    }

    const product = await productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException("Sản phẩm", productId);
    }

    // ✅ Kiểm tra product có printerProfileId không
    if (!product.printerProfileId) {
      throw new ForbiddenException(
        "Sản phẩm này không thuộc về nhà in nào."
      );
    }

    // BẢO MẬT: Kiểm tra quyền sở hữu
    // ✅ SỬA: Đảm bảo cả hai đều được convert sang string để so sánh
    const productPrinterId = product.printerProfileId.toString();
    const userPrinterId = printerProfileId?.toString() || String(printerProfileId);
    
    if (productPrinterId !== userPrinterId) {
      // Log để debug (chỉ trong development)
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Ownership verification failed:", {
          productId,
          productPrinterId,
          userPrinterId,
          productPrinterIdType: typeof productPrinterId,
          userPrinterIdType: typeof userPrinterId,
        });
      }
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
   * Tạo slug từ tên sản phẩm
   * @param {string} name - Tên sản phẩm
   * @returns {string} - Slug đã được chuẩn hóa
   */
  generateSlug(name) {
    if (!name) return "";
    return name
      .toLowerCase()
      .trim()
      .normalize("NFD") // Chuyển đổi ký tự có dấu thành không dấu
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
      .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/-+/g, "-") // Loại bỏ nhiều dấu gạch ngang liên tiếp
      .replace(/^-|-$/g, ""); // Loại bỏ dấu gạch ngang ở đầu và cuối
  }

  /**
   * Tạo slug unique bằng cách thêm số nếu slug đã tồn tại
   * @param {string} baseSlug - Slug gốc
   * @returns {Promise<string>} - Slug unique
   */
  async generateUniqueSlug(baseSlug) {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await productRepository.findOne({ slug });
      if (!existing) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
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

    // 2. Tạo slug nếu chưa có
    let slug = dto.slug;
    if (!slug || slug.trim() === "") {
      const baseSlug = this.generateSlug(dto.name);
      slug = await this.generateUniqueSlug(baseSlug);
    } else {
      // Nếu có slug, kiểm tra tính khả dụng
      await this.checkSlugAvailability(slug);
    }

    // 3. Gán chủ sở hữu và tạo
    const productData = {
      ...dto,
      slug: slug,
      printerProfileId: printerProfileId,
    };

    // 4. ✅ RAG: Generate embedding for semantic search
    if (embeddingService.isAvailable()) {
      try {
        const embedding = await embeddingService.generateProductEmbedding(productData);
        if (embedding) {
          productData.embedding = embedding;
        }
      } catch (error) {
        // Log error but don't fail product creation
        console.error("[ProductService] Failed to generate embedding:", error.message);
      }
    }

    const product = await productRepository.create(productData);
    
    // ✅ SYNC NGAY: Bắn lên Algolia (async, không block)
    if (product && product.isActive) {
      algoliaService.syncProduct(product.toObject ? product.toObject() : product).catch(err => {
        Logger.error("[ProductService] Algolia sync failed on create:", err);
      });
    }
    
    return product;
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

    // 4. ✅ RAG: Regenerate embedding if content fields changed
    // Only regenerate if name, description, category, or specifications changed
    const contentFieldsChanged =
      dto.name || dto.description || dto.category || dto.specifications;

    if (contentFieldsChanged && embeddingService.isAvailable()) {
      try {
        const embedding = await embeddingService.generateProductEmbedding(
          product.toObject()
        );
        if (embedding) {
          product.embedding = embedding;
        }
      } catch (error) {
        // Log error but don't fail product update
        console.error(
          "[ProductService] Failed to regenerate embedding:",
          error.message
        );
      }
    }

    await product.save();
    
    // ✅ SYNC UPDATE: Cập nhật lên Algolia (async, không block)
    if (product.isActive) {
      algoliaService.syncProduct(product.toObject ? product.toObject() : product).catch(err => {
        Logger.error("[ProductService] Algolia sync failed on update:", err);
      });
    } else {
      // Nếu sản phẩm bị deactivate, xóa khỏi Algolia
      algoliaService.deleteProduct(product._id.toString()).catch(err => {
        Logger.error("[ProductService] Algolia delete failed:", err);
      });
    }
    
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
    
    // ✅ SYNC DELETE: Xóa khỏi Algolia (async, không block)
    algoliaService.deleteProduct(productId.toString()).catch(err => {
      Logger.error("[ProductService] Algolia delete failed:", err);
    });
    
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

  // ========================================
  // ✨ SMART PIPELINE: DRAFT SYSTEM
  // ========================================

  /**
   * Tạo Draft (Partial validation)
   * @param {string} printerProfileId
   * @param {object} draftData - Partial product data
   * @returns {Promise<Product>}
   */
  async createDraft(printerProfileId, draftData) {
    if (!printerProfileId) {
      throw new ForbiddenException(
        "Không tìm thấy thông tin nhà in. Vui lòng đăng nhập lại."
      );
    }

    // ✅ FIX: Generate unique slug for draft (add timestamp to avoid duplicates)
    const baseSlug = draftData.name
      ? this.generateSlug(draftData.name)
      : `draft`;
    const slug = `${baseSlug}-${Date.now()}`;

    const product = new Product({
      printerProfileId,
      ...draftData,
      isDraft: true,
      slug,
      draftStep: draftData.draftStep || 1,
      draftLastSavedAt: new Date(),
    });

    // ✅ Skip full validation for draft
    return product.save({ validateBeforeSave: false });
  }

  /**
   * Update Draft
   * @param {string} printerProfileId
   * @param {string} productId
   * @param {object} updates
   * @returns {Promise<Product>}
   */
  async updateDraft(printerProfileId, productId, updates) {
    // ✅ FIX: Use findOneAndUpdate để tránh version conflict khi auto-save nhanh
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        printerProfileId: printerProfileId,
        isDraft: true,
      },
      {
        $set: {
          ...updates,
          draftLastSavedAt: new Date(),
        },
      },
      {
        new: true, // Return updated document
        runValidators: false, // Skip validation for draft
      }
    );

    if (!product) {
      throw new NotFoundException("Draft", productId);
    }

    return product;
  }

  /**
   * Publish Draft (Full validation)
   * @param {string} printerProfileId
   * @param {string} productId
   * @returns {Promise<Product>}
   */
  async publishDraft(printerProfileId, productId) {
    const product = await this.getProductAndVerifyOwnership(
      printerProfileId,
      productId
    );

    if (!product.isDraft) {
      throw new ValidationException("Sản phẩm đã được publish");
    }

    // ✅ Full validation
    if (!product.name || product.name.length < 5) {
      throw new ValidationException("Tên sản phẩm phải có ít nhất 5 ký tự");
    }
    if (!product.category) {
      throw new ValidationException("Vui lòng chọn danh mục sản phẩm");
    }
    if (!product.pricing || product.pricing.length === 0) {
      throw new ValidationException("Phải có ít nhất 1 bậc giá");
    }
    if (!product.images || product.images.length === 0) {
      throw new ValidationException("Phải có ít nhất 1 ảnh sản phẩm");
    }

    // Update slug if needed
    if (product.slug.startsWith("draft-")) {
      product.slug = this.generateSlug(product.name);
    }

    // Mark as published
    product.isDraft = false;
    product.isActive = true;
    product.draftStep = null;
    product.uploadStatus = "completed";

    // Generate embedding for RAG search
    await embeddingService.generateProductEmbedding(product);

    return product.save(); // ✅ Full validation
  }

  /**
   * Lấy danh sách Drafts của nhà in
   * @param {string} printerProfileId
   * @param {object} options - { page, limit }
   * @returns {Promise<Array<Product>>}
   */
  async getMyDrafts(printerProfileId, options = {}) {
    if (!printerProfileId) {
      throw new ForbiddenException(
        "Không tìm thấy thông tin nhà in. Vui lòng đăng nhập lại."
      );
    }

    const { page = 1, limit = 10 } = options;

    return productRepository.find(
      { printerProfileId, isDraft: true },
      { page, limit, sort: { draftLastSavedAt: -1 } }
    );
  }

  /**
   * Xóa Draft
   * @param {string} printerProfileId
   * @param {string} productId
   * @returns {Promise<object>}
   */
  async deleteDraft(printerProfileId, productId) {
    const product = await this.getProductAndVerifyOwnership(
      printerProfileId,
      productId
    );

    if (!product.isDraft) {
      throw new ValidationException("Chỉ có thể xóa draft");
    }

    await productRepository.deleteById(productId);
    return { message: "Đã xóa draft thành công." };
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
   * @param {string|null} printerProfileId - ID của nhà in (nếu đã authenticated) - cho phép owner truy cập dù chưa active
   */
  async getProductById(productId, printerProfileId = null) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException("Sản phẩm", productId);
    }

    // ✅ SỬA: Nếu user đã authenticated và là owner của sản phẩm, cho phép truy cập dù chưa active
    const isOwner = printerProfileId && 
                     product.printerProfileId && 
                     product.printerProfileId.toString() === printerProfileId.toString();
    
    if (!isOwner) {
      // ✅ Kiểm tra linh hoạt hơn để tương thích với dữ liệu cũ
      // Chỉ kiểm tra isActive nếu có, các field khác có thể null/undefined
      if (product.isActive === false) {
        throw new NotFoundException("Sản phẩm", productId);
      }
      
      // Nếu có isPublished và healthStatus, kiểm tra chúng
      if (product.isPublished === false || product.healthStatus === "Inactive") {
        throw new NotFoundException("Sản phẩm", productId);
      }
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
