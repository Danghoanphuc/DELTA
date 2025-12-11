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
      throw new ForbiddenException("Sản phẩm này không thuộc về nhà in nào.");
    }

    // BẢO MẬT: Kiểm tra quyền sở hữu
    // ✅ SỬA: Đảm bảo cả hai đều được convert sang string để so sánh
    const productPrinterId = product.printerProfileId.toString();
    const userPrinterId =
      printerProfileId?.toString() || String(printerProfileId);

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
        const embedding = await embeddingService.generateProductEmbedding(
          productData
        );
        if (embedding) {
          productData.embedding = embedding;
        }
      } catch (error) {
        // Log error but don't fail product creation
        console.error(
          "[ProductService] Failed to generate embedding:",
          error.message
        );
      }
    }

    const product = await productRepository.create(productData);

    // ✅ SYNC NGAY: Bắn lên Algolia (async, không block)
    if (product && product.isActive) {
      algoliaService
        .syncProduct(product.toObject ? product.toObject() : product)
        .catch((err) => {
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
      algoliaService
        .syncProduct(product.toObject ? product.toObject() : product)
        .catch((err) => {
          Logger.error("[ProductService] Algolia sync failed on update:", err);
        });
    } else {
      // Nếu sản phẩm bị deactivate, xóa khỏi Algolia
      algoliaService.deleteProduct(product._id.toString()).catch((err) => {
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
    algoliaService.deleteProduct(productId.toString()).catch((err) => {
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

    // ✅ FIX: Query both Product (from printers) and CatalogProduct (from admin)
    const { CatalogProduct } = await import(
      "../catalog/catalog-product.model.js"
    );

    // Filter for Product collection (printer products)
    const productFilter = {
      isDraft: false, // ✅ FIX: Exclude drafts
      $or: [
        { isActive: true },
        { isActive: { $exists: false } },
        { isActive: null },
      ],
    };

    // Filter for CatalogProduct collection (admin products)
    const catalogFilter = {
      isActive: true,
      isPublished: true,
    };

    // Add category filter
    if (category && category !== "all") {
      productFilter.category = category;
      // Note: CatalogProduct uses categoryId, not category string
      // Skip category filter for catalog products for now
    }

    // Add search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      productFilter.$or = [{ name: searchRegex }, { description: searchRegex }];
      catalogFilter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

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

    // Query both collections
    const [printerProducts, catalogProducts] = await Promise.all([
      productRepository.find(productFilter, {
        page: 1,
        limit: 100, // Get more to merge
        sort: sortOption,
      }),
      CatalogProduct.find(catalogFilter).sort(sortOption).limit(100).lean(),
    ]);

    // Merge and mark source
    const allProducts = [
      ...printerProducts.map((p) => ({ ...p, source: "printer" })),
      ...catalogProducts.map((p) => ({ ...p, source: "catalog" })),
    ];

    // Sort merged results
    allProducts.sort((a, b) => {
      if (sort === "popular") {
        return (
          (b.totalSold || 0) - (a.totalSold || 0) ||
          (b.views || 0) - (a.views || 0)
        );
      } else if (sort === "price-asc") {
        return (a.basePrice || 0) - (b.basePrice || 0);
      } else if (sort === "price-desc") {
        return (b.basePrice || 0) - (a.basePrice || 0);
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    // Paginate merged results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = allProducts.slice(startIndex, endIndex);

    // Populate printer info for printer products
    const populatedProducts = await Promise.all(
      paginatedProducts.map(async (product) => {
        if (product.source === "printer" && product.printerProfileId) {
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

    const total = allProducts.length;

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
    // ✅ FIX: Try both Product and CatalogProduct collections
    const { CatalogProduct } = await import(
      "../catalog/catalog-product.model.js"
    );

    let product = await productRepository.findById(productId);
    let source = "printer";
    let printer = null;

    // If not found in Product collection, try CatalogProduct
    if (!product) {
      product = await CatalogProduct.findById(productId).lean();
      source = "catalog";

      if (!product) {
        throw new NotFoundException("Sản phẩm", productId);
      }

      // Check if catalog product is active and published
      if (!product.isActive || !product.isPublished) {
        throw new NotFoundException("Sản phẩm", productId);
      }

      // Increment views for catalog product
      await CatalogProduct.updateOne(
        { _id: product._id },
        { $inc: { views: 1 } }
      );

      return {
        ...product,
        source,
        printer: null, // Catalog products don't have printer info
      };
    }

    // Handle printer product
    const isOwner =
      printerProfileId &&
      product.printerProfileId &&
      product.printerProfileId.toString() === printerProfileId.toString();

    if (!isOwner) {
      // Check if product is active and published
      if (product.isActive === false || product.isDraft === true) {
        throw new NotFoundException("Sản phẩm", productId);
      }

      if (
        product.isPublished === false ||
        product.healthStatus === "Inactive"
      ) {
        throw new NotFoundException("Sản phẩm", productId);
      }
    }

    // Populate printer info
    if (product.printerProfileId) {
      printer = await PrinterProfile.findById(product.printerProfileId)
        .select("businessName avatarUrl tier")
        .lean();
    }

    // Increment views
    await Product.updateOne({ _id: product._id }, { $inc: { views: 1 } });

    // Get updated product
    const updatedProduct = await productRepository.findById(productId);

    return {
      ...updatedProduct,
      source,
      printer: printer || null,
    };
  }
}

export const productService = new ProductService();
