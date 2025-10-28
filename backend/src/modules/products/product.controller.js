// src/modules/products/product.controller.js
import { ProductService } from "./product.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/logger.util.js";

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
      const product = await this.productService.createProduct(
        req.body,
        req.user._id,
        req.files
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
      const product = await this.productService.updateProduct(
        req.params.id,
        req.body,
        req.user._id
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
  // THÊM PHIÊN BẢN ĐÚNG NÀY VÀO
  /**
   * Get a single product by ID
   * GET /api/products/:id
   * @access Public
   */
  // SỬA 1: Dùng arrow function để giữ 'this'
  // SỬA 2: Dùng (req, res, next)
  getProductById = async (req, res, next) => {
    try {
      // SỬA 3: Lấy 'id' từ req.params (dựa trên product.routes.js)
      const productId = req.params.id;

      Logger.debug(`[Controller] Nhận yêu cầu GET /api/products/${productId}`);

      // SỬA 4: Gọi 'this.productService' (đã có logic đúng)
      const product = await this.productService.getProductById(productId);

      // SỬA 5: Trả về JSON response
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ product }));
    } catch (error) {
      // SỬA 6: Chuyển lỗi cho middleware
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
}
