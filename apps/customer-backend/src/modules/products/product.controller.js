// apps/customer-backend/src/modules/products/product.controller.js

import { productService } from "./product.service.js";
import { ValidationException } from "../../shared/exceptions/index.js";
// ❌ Đã gỡ bỏ import asyncHandler

// (Giả định middleware 'isPrinter' đã gắn printerProfileId vào req.user.printerProfileId)

export const getMyProducts = async (req, res, next) => {
  try {
    // Kiểm tra printerProfileId
    if (!req.user.printerProfileId) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản này chưa có hồ sơ nhà in.",
      });
    }

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
    // ✅ Parse productData từ FormData nếu có
    // Multer đã parse FormData vào req.body, nhưng productData là JSON string
    let productData = req.body;
    
    // Kiểm tra nếu có field productData (từ FormData)
    if (req.body && req.body.productData) {
      if (typeof req.body.productData === "string") {
        try {
          productData = JSON.parse(req.body.productData);
        } catch (e) {
          return next(
            new ValidationException("Dữ liệu productData không phải là JSON hợp lệ.")
          );
        }
      } else {
        // Nếu đã là object (có thể do middleware khác parse)
        productData = req.body.productData;
      }
    } else if (!req.body || Object.keys(req.body).length === 0) {
      // Nếu req.body rỗng hoặc undefined
      return next(
        new ValidationException("Không có dữ liệu sản phẩm được gửi lên.")
      );
    }

    // ✅ Lưu thông tin files nếu có (từ multer)
    if (req.files && req.files.length > 0) {
      // Files đã được upload lên Cloudinary bởi multer
      // Chuyển đổi thành mảng images với format { url, isPrimary }
      productData.images = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename || file.originalname,
        isPrimary: index === 0, // Ảnh đầu tiên là ảnh bìa
      }));
    }

    const newProduct = await productService.createProduct(
      req.user.printerProfileId,
      productData
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
    // ✅ Parse productData từ FormData nếu có
    let productData = req.body;
    
    // Kiểm tra nếu có field productData (từ FormData)
    if (req.body && req.body.productData) {
      if (typeof req.body.productData === "string") {
        try {
          productData = JSON.parse(req.body.productData);
        } catch (e) {
          return next(
            new ValidationException("Dữ liệu productData không phải là JSON hợp lệ.")
          );
        }
      } else {
        // Nếu đã là object (có thể do middleware khác parse)
        productData = req.body.productData;
      }
    }

    // ✅ Lưu thông tin files nếu có (từ multer)
    if (req.files && req.files.length > 0) {
      // Chuyển đổi thành mảng images với format { url, isPrimary }
      // Nếu đã có images trong productData, merge với images mới
      const existingImages = productData.images || [];
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename || file.originalname,
        isPrimary: index === 0 && existingImages.length === 0, // Ảnh đầu tiên là ảnh bìa nếu chưa có
      }));
      productData.images = [...existingImages, ...newImages];
    }

    const updatedProduct = await productService.updateProduct(
      req.user.printerProfileId,
      req.params.id,
      productData
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
 * Lấy chi tiết 1 sản phẩm CÔNG KHAI (Public API - optionalAuth cho phép owner truy cập dù chưa active)
 */
export const getProductById = async (req, res, next) => {
  try {
    // ✅ Kiểm tra nếu id là "my-products", gọi next() để tiếp tục đến route protected
    // Route này được đặt trước protected router nên cần skip nếu là "my-products"
    if (req.params.id === "my-products") {
      // Gọi next() để Express tiếp tục tìm route khác (route protected /my-products)
      return next();
    }
    
    // ✅ Lấy printerProfileId từ req.user nếu đã authenticated (từ optionalAuth middleware)
    const printerProfileId = req.user?.printerProfileId || null;
    const product = await productService.getProductById(req.params.id, printerProfileId);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};