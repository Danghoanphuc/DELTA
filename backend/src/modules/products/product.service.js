// src/modules/products/product.service.js
import { ProductRepository } from "./product.repository.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { cloudinary } from "../../infrastructure/storage/cloudinary.config.js";
import { Logger } from "../../shared/utils/index.js";

export class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async createProduct(productData, printerId, files) {
    if (!files || files.length === 0) {
      throw new ValidationException("Phải có ít nhất 1 ảnh sản phẩm");
    }

    // ✅ LẤY taxonomyId TỪ productData
    const { name, category, pricing, taxonomyId } = productData;
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
      // Chuyển đổi pricing từ string (nếu là form-data)
      try {
        const parsedPricing =
          typeof pricing === "string" ? JSON.parse(pricing) : pricing;

        if (!Array.isArray(parsedPricing) || parsedPricing.length === 0) {
          errors.push("Định dạng pricing không hợp lệ.");
        } else {
          parsedPricing.forEach((tier, index) => {
            if (tier.minQuantity < 1) {
              errors.push(
                `Mức giá ${index + 1}: Số lượng tối thiểu phải lớn hơn 0`
              );
            }
            if (tier.pricePerUnit < 100) {
              errors.push(`Mức giá ${index + 1}: Giá phải ít nhất 100đ`);
            }
          });
          // Gán lại pricing đã parse
          productData.pricing = parsedPricing;
        }
      } catch (e) {
        errors.push("Định dạng pricing JSON không hợp lệ.");
      }
    }

    // Xử lý các trường JSON khác nếu cần (ví dụ: specifications)
    if (
      productData.specifications &&
      typeof productData.specifications === "string"
    ) {
      try {
        productData.specifications = JSON.parse(productData.specifications);
      } catch (e) {
        errors.push("Định dạng specifications JSON không hợp lệ.");
      }
    }

    if (productData.assets && typeof productData.assets === "string") {
      try {
        productData.assets = JSON.parse(productData.assets);
      } catch (e) {
        errors.push("Định dạng assets JSON không hợp lệ.");
      }
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

    // ✅ THÊM taxonomyId VÀO ĐÂY KHI TẠO
    const product = await this.productRepository.create({
      ...productData,
      taxonomyId: taxonomyId, // <--- THÊM DÒNG NÀY
      printerId,
      images,
      isActive: true,
    });

    Logger.success("Product created", { productId: product._id, printerId });

    return await product.populate("printerId", "displayName avatarUrl");
  }

  async updateProduct(productId, updateData, printerId) {
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

    const updatedProduct = await this.productRepository.update(
      productId,
      updateData
    );
    Logger.success("Product updated", { productId });

    return updatedProduct;
  }

  async deleteProduct(productId, printerId) {
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

    await this.productRepository.softDelete(productId);
    Logger.success("Product deleted", { productId });

    return { message: "Xóa sản phẩm thành công" };
  }

  async getAllProducts(filters) {
    return await this.productRepository.findWithFilters(filters);
  }

  async getProductById(productId) {
    Logger.debug(`--- Get Product By ID Service ---`);
    Logger.debug(`1. Received productId: ${productId}`);

    const product = await this.productRepository.findByIdPopulated(productId);
    Logger.debug(
      "2. Fetched product from repository:",
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
      throw new NotFoundException("Product", productId);
    }

    Logger.success("3. Product found and is active");
    return product;
  }

  async getMyProducts(printerId) {
    return await this.productRepository.findByPrinterId(printerId);
  }

  async upload3DAssets(files, body, printerId) {
    const { modelFile, dielineFile } = files;
    const { category } = body;

    if (!modelFile) {
      throw new ValidationException("Phải có file model 3D (.glb)");
    }

    // Basic validation
    if (!category) {
      throw new ValidationException("Phải chọn danh mục sản phẩm");
    }

    Logger.info(`[Service] Uploading 3D assets for printer: ${printerId}`);
    Logger.info("Model file:", modelFile[0]);
    Logger.info("Dieline file:", dielineFile ? dielineFile[0] : "N/A");

    // In a real scenario, you would process these files:
    // 1. Validate file types, sizes.
    // 2. Upload to a cloud storage (like the 'files' in createProduct).
    // 3. Create a new 'Asset' or similar entity in the database.
    // 4. Associate the asset with the printer and category.

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
