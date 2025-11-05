// src/modules/products/product.controller.js
// ✅ BẢN VÁ FULL 100%: Sửa lỗi 400 / ECONNRESET (Xử lý FormData)

import { ProductService } from "./product.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/logger.util.js";
// ✅ BỔ SUNG: Import exception
import { ValidationException } from "../../shared/exceptions/index.js";

/**
 * ProductController - Handles HTTP requests for products
 * Thin layer that delegates to service
 */
export class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Create a new product
   * POST /api/products
   * @access Private (Printer only)
   */
  createProduct = async (req, res, next) => {
    try {
      // ==================================================
      // ✅✅✅ SỬA LỖI 400 / ECONNRESET TẠI ĐÂY ✅✅✅
      // ==================================================
      // 1. Kiểm tra file (từ multer)
      //    (Service cũng sẽ kiểm tra, nhưng controller kiểm tra trước
      //     để phản hồi lỗi nhanh hơn nếu backend của anh yêu cầu)
      if (!req.files || req.files.length === 0) {
        // Lỗi này đã được backend của anh báo: "Phải có ít nhất 1 ảnh sản phẩm"
        throw new ValidationException("Phải có ít nhất 1 ảnh sản phẩm");
      }

      // 2. Kiểm tra và "giải nén" productData
      if (!req.body.productData) {
        throw new ValidationException("Thiếu dữ liệu 'productData' JSON.");
      }

      let productData;
      try {
        productData = JSON.parse(req.body.productData);
      } catch (e) {
        throw new ValidationException(
          "Dữ liệu 'productData' JSON không hợp lệ."
        );
      }
      // ==================================================

      // 3. Gọi service với dữ liệu đã "sạch"
      const product = await this.productService.createProduct(
        productData, // ✅ Đã là object
        req.user._id,
        req.files // ✅ Là mảng file
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ product }, "Tạo sản phẩm thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing product
   * PUT /api/products/:id
   * @access Private (Printer only - owner)
   */
  updateProduct = async (req, res, next) => {
    try {
      // ✅ ÁP DỤNG LOGIC "GIẢI NÉN" TƯƠNG TỰ CHO UPDATE

      let productData;

      if (req.body.productData) {
        // Flow 1: Gửi bằng FormData (khi có upload file ảnh mới)
        try {
          productData = JSON.parse(req.body.productData);
        } catch (e) {
          throw new ValidationException(
            "Dữ liệu 'productData' JSON không hợp lệ."
          );
        }
      } else {
        // Flow 2: Gửi bằng JSON (khi chỉ cập nhật text, không có file)
        productData = req.body;
      }

      // req.files (từ multer) có thể là undefined (nếu không upload ảnh mới)
      // Service sẽ xử lý việc này.

      const product = await this.productService.updateProduct(
        req.params.id,
        productData, // ✅ Đã là object
        req.user._id,
        req.files // ✅ Là mảng file (hoặc undefined)
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ product }, "Cập nhật sản phẩm thành công!")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a product
   * DELETE /api/products/:id
   * @access Private (Printer only - owner)
   */
  deleteProduct = async (req, res, next) => {
    try {
      await this.productService.deleteProduct(req.params.id, req.user._id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Xóa sản phẩm thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all products (with filters)
   * GET /api/products?category=...&search=...&sort=...
   * @access Public
   */
  getAllProducts = async (req, res, next) => {
    try {
      const products = await this.productService.getAllProducts(req.query);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ products }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single product by ID
   * GET /api/products/:id
   * @access Public
   */
  getProductById = async (req, res, next) => {
    try {
      const productId = req.params.id;
      Logger.debug(`[Controller] Nhận yêu cầu GET /api/products/${productId}`);
      const product = await this.productService.getProductById(productId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ product }));
    } catch (error) {
      Logger.error(`[Controller] Lỗi trong getProductById: ${error.message}`);
      next(error);
    }
  };

  /**
   * Get all products of the authenticated printer
   * GET /api/products/my-products
   * @access Private (Printer only)
   */
  getMyProducts = async (req, res, next) => {
    try {
      // ✅ SỬA LỖI 404: Gọi service (đã được sửa)
      const products = await this.productService.getMyProducts(req.user._id);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          products,
          count: products.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload 3D assets (GLB model and Dieline SVG)
   * POST /api/products/upload-3d-assets
   * @access Private (Printer only)
   */
  upload3DAssets = async (req, res, next) => {
    try {
      Logger.info("[Controller] Received request to upload 3D assets");
      const asset = await this.productService.upload3DAssets(
        req.files,
        req.body,
        req.user._id
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ asset }, "Tải lên 3D assets thành công!"));
    } catch (error) {
      next(error);
    }
  };
}
