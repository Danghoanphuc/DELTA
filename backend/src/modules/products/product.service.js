// src/modules/products/product.service.js
// ✅ BÀN GIAO: Tích hợp CacheService (P0)

import { ProductRepository } from "./product.repository.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { cloudinary } from "../../infrastructure/storage/multer.config.js";
import { Logger } from "../../shared/utils/index.js";
import crypto from "crypto"; // ✅ Import crypto để hash key

// ✅ BƯỚC 1: Import CacheService
import { CacheService } from "../../shared/services/cache.service.js";

// ✅ BƯỚC 2: Định nghĩa TTL (Time-to-Live)
const CACHE_TTL = {
  PRODUCT_DETAIL: 3600, // 1 giờ
  PRODUCT_QUERY: 600, // 10 phút
};

export class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
    // ✅ BƯỚC 3: Khởi tạo CacheService
    this.cacheService = new CacheService();
  }

  // ✅ BƯỚC 4: Helper tạo cache key cho query
  _getQueryCacheKey(filters) {
    // Sắp xếp keys để đảm bảo '{"a":1, "b":2}' giống '{"b":2, "a":1}'
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((obj, key) => {
        obj[key] = filters[key];
        return obj;
      }, {});

    const filterString = JSON.stringify(sortedFilters);
    // Dùng hash cho key dài
    const hash = crypto.createHash("sha256").update(filterString).digest("hex");
    return `products:query:${hash}`;
  }

  // ✅ BƯỚC 5: Helper xóa cache
  async _clearProductCaches(productId = null) {
    Logger.warn("[Cache Invalidate] Xóa cache Sản phẩm...");
    // Luôn xóa cache của các query (vì data đã thay đổi)
    await this.cacheService.clearByPattern("products:query:*");

    // Nếu có productId, xóa cache chi tiết của sản phẩm đó
    if (productId) {
      await this.cacheService.clear(`product:${productId}`);
    }
  }

  async createProduct(productData, printerId, files) {
    // ... (Toàn bộ logic validation giữ nguyên) ...
    if (!files || files.length === 0) {
      throw new ValidationException("Phải có ít nhất 1 ảnh sản phẩm");
    }
    const { name, category, pricing, taxonomyId, specifications, assets } =
      productData;
    const errors = [];
    if (!name || name.trim().length < 5) {
      errors.push("Tên sản phẩm phải có ít nhất 5 ký tự");
    }
    if (!category) {
      errors.push("Danh mục sản phẩm là bắt buộc");
    }
    if (!Array.isArray(pricing) || pricing.length === 0) {
      errors.push("Phải có ít nhất một mức giá");
    } else {
      pricing.forEach((tier, index) => {
        if (tier.minQuantity < 1) {
          errors.push(
            `Mức giá ${index + 1}: Số lượng tối thiểu phải lớn hơn 0`
          );
        }
        if (tier.pricePerUnit < 100) {
          errors.push(`Mức giá ${index + 1}: Giá phải ít nhất 100đ`);
        }
      });
    }
    if (errors.length > 0) {
      const publicIds = files.map((f) => f.filename);
      await cloudinary.api
        .delete_resources(publicIds)
        .catch((err) =>
          Logger.error("Failed to rollback Cloudinary uploads", err)
        );
      throw new ValidationException("Dữ liệu không hợp lệ", errors);
    }
    const images = files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0,
    }));
    // ... (Logic tạo product giữ nguyên) ...
    const product = await this.productRepository.create({
      ...productData,
      taxonomyId: taxonomyId,
      printerId,
      images,
      isActive: true,
      specifications: specifications || {},
      assets: assets || [],
    });

    Logger.success("Product created", { productId: product._id, printerId });

    // ✅ BƯỚC 6: Xóa cache query
    await this._clearProductCaches();

    return await product.populate("printerId", "displayName avatarUrl");
  }

  async updateProduct(productId, updateData, printerId) {
    // ... (Logic validation và kiểm tra quyền sở hữu giữ nguyên) ...
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }
    if (product.printerId.toString() !== printerId.toString()) {
      throw new ForbiddenException("Bạn không có quyền chỉnh sửa sản phẩm này");
    }
    const { name, category, pricing } = updateData;
    const errors = [];
    if (name !== undefined && name.trim().length < 5) {
      errors.push("Tên sản phẩm phải có ít nhất 5 ký tự");
    }
    if (category !== undefined && !category) {
      errors.push("Danh mục không được để trống");
    }
    if (pricing !== undefined) {
      if (!Array.isArray(pricing) || pricing.length === 0) {
        errors.push("Phải có ít nhất một mức giá");
      } else {
        pricing.forEach((tier, index) => {
          if (tier.minQuantity < 1) {
            errors.push(
              `Mức giá ${index + 1}: Số lượng tối thiểu phải lớn hơn 0`
            );
          }
          if (tier.pricePerUnit < 100) {
            errors.push(`Mức giá ${index + 1}: Giá phải ít nhất 100đ`);
          }
        });
      }
    }
    if (errors.length > 0) {
      throw new ValidationException("Dữ liệu cập nhật không hợp lệ", errors);
    }
    // ... (Logic update giữ nguyên) ...
    const updatedProduct = await this.productRepository.update(
      productId,
      updateData
    );
    Logger.success("Product updated", { productId });

    // ✅ BƯỚC 6: Xóa cache (chi tiết + query)
    await this._clearProductCaches(productId);

    return updatedProduct;
  }

  async deleteProduct(productId, printerId) {
    // ... (Logic kiểm tra quyền sở hữu và xóa ảnh Cloudinary giữ nguyên) ...
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException("Product", productId);
    }
    if (product.printerId.toString() !== printerId.toString()) {
      throw new ForbiddenException("Bạn không có quyền xóa sản phẩm này");
    }
    const publicIds = product.images
      ?.map((img) => img.publicId)
      .filter(Boolean);
    if (publicIds.length > 0) {
      await cloudinary.api
        .delete_resources(publicIds)
        .catch((err) =>
          Logger.error("Failed to delete Cloudinary images", err)
        );
    }
    // ... (Logic xóa giữ nguyên) ...
    await this.productRepository.softDelete(productId);
    Logger.success("Product deleted", { productId });

    // ✅ BƯỚC 6: Xóa cache (chi tiết + query)
    await this._clearProductCaches(productId);

    return { message: "Xóa sản phẩm thành công" };
  }

  /**
   * ✅ ĐÃ TÍCH HỢP CACHE (P0)
   */
  async getAllProducts(filters) {
    // 1. Tạo cache key
    const cacheKey = this._getQueryCacheKey(filters);

    // 2. Dùng getOrSet
    return await this.cacheService.getOrSet(
      cacheKey,
      CACHE_TTL.PRODUCT_QUERY,
      () => {
        // Hàm này chỉ chạy khi cache miss
        return this.productRepository.findWithFilters(filters);
      }
    );
  }

  /**
   * ✅ ĐÃ TÍCH HỢP CACHE (P0)
   */
  async getProductById(productId) {
    Logger.debug(`--- Get Product By ID Service ---`);
    Logger.debug(`1. Received productId: ${productId}`);

    // 1. Tạo cache key
    const cacheKey = `product:${productId}`;

    // 2. Dùng getOrSet
    const product = await this.cacheService.getOrSet(
      cacheKey,
      CACHE_TTL.PRODUCT_DETAIL,
      () => {
        // Hàm này chỉ chạy khi cache miss
        Logger.debug(`[Cache] Đang gọi DB cho product: ${productId}`);
        return this.productRepository.findByIdPopulated(productId);
      }
    );

    Logger.debug(
      "2. Fetched product (from cache or DB):",
      product
        ? {
            id: product._id,
            name: product.name,
            printerInfo: !!product.printerInfo,
          }
        : null
    );

    if (!product || !product.isActive) {
      Logger.error("3. Product not found or is inactive");
      // Nếu sản phẩm không tìm thấy (hoặc inactive),
      // chúng ta cũng nên xóa cache (nếu có) để tránh cache lỗi 404
      await this.cacheService.clear(cacheKey);
      throw new NotFoundException("Product", productId);
    }

    Logger.success("3. Product found and is active");
    return product;
  }

  async getMyProducts(printerId) {
    // Tạm thời KHÔNG cache hàm này
    // vì nó là dữ liệu riêng tư, có thể cache theo user
    // nhưng P0 chúng ta tập trung vào public data
    return await this.productRepository.findByPrinterId(printerId);
  }

  async upload3DAssets(files, body, printerId) {
    // ... (Logic này giữ nguyên, không cần cache) ...
    const { modelFile, dielineFile } = files;
    const { category } = body;
    if (!modelFile) {
      throw new ValidationException("Phải có file model 3D (.glb)");
    }
    if (!category) {
      throw new ValidationException("Phải chọn danh mục sản phẩm");
    }
    Logger.info(`[Service] Uploading 3D assets for printer: ${printerId}`);
    Logger.info("Model file:", modelFile[0]);
    Logger.info("Dieline file:", dielineFile ? dielineFile[0] : "N/A");
    const createdAsset = {
      id: "asset_temp_id_" + Date.now(), // Placeholder
      modelUrl: modelFile[0].path,
      dielineUrl: dielineFile ? dielineFile[0].path : null,
      category: category,
      printerId: printerId,
      createdAt: new Date(),
    };
    Logger.success("[Service] 3D assets processed successfully", createdAsset);
    return createdAsset;
  }
}
