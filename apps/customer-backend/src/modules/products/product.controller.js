// apps/customer-backend/src/modules/products/product.controller.js

import { productService } from "./product.service.js";
// ❌ Đã gỡ bỏ import asyncHandler

// (Giả định middleware 'isPrinter' đã gắn printerProfileId vào req.user.printerProfileId)

export const getMyProducts = async (req, res, next) => {
  try {
    const products = await productService.getMyProducts(
      req.user.printerProfileId,
      req.query
    );
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error); // ✅ Dùng try/catch
  }
};

export const getMyProductById = async (req, res, next) => {
  try {
    const product = await productService.getMyProductById(
      req.user.printerProfileId,
      req.params.id
    );
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error); // ✅ Dùng try/catch
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const newProduct = await productService.createProduct(
      req.user.printerProfileId,
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công.",
      data: newProduct,
    });
  } catch (error) {
    next(error); // ✅ Dùng try/catch
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await productService.updateProduct(
      req.user.printerProfileId,
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công.",
      data: updatedProduct,
    });
  } catch (error) {
    next(error); // ✅ Dùng try/catch
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(
      req.user.printerProfileId,
      req.params.id
    );
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error); // ✅ Dùng try/catch
  }
};

// === API CÔNG KHAI (PUBLIC) ===
export const checkSlugAvailability = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await productService.checkSlugAvailability(slug);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error); // ✅ Dùng try/catch
  }
};

/**
 * Lấy danh sách sản phẩm CÔNG KHAI (Public API - không cần token)
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết 1 sản phẩm CÔNG KHAI (Public API - không cần token)
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};