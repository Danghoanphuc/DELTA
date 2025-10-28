// src/modules/products/product.controller.js
import { ProductService } from "./product.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

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

  /**
   * Get a single product by ID
   * GET /api/products/:id
   * @access Public
   */
  async getProductById(productId) {
    Logger.debug(`--- Get Product By ID Service ---`);
    Logger.debug(`1. Received productId: ${productId}`);

    // ✅ Thêm try...catch để bắt lỗi populate từ repository
    let product;
    try {
      product = await this.productRepository.findByIdPopulated(productId);
    } catch (repoError) {
      Logger.error(`Error in findByIdPopulated for ${productId}:`, repoError);
      throw repoError; // Ném lại lỗi để controller bắt
    }

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

    // ✅ KIỂM TRA QUAN TRỌNG: Nếu product là null hoặc không active -> Ném lỗi 404
    if (!product || !product.isActive) {
      Logger.warn(`Product ${productId} not found or inactive.`);
      throw new NotFoundException("Sản phẩm", productId); // Ném lỗi 404
    }

    Logger.success("3. Product found and is active");
    return product; // Chỉ trả về khi hợp lệ
  }
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
