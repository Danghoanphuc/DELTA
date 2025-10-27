// src/controllers/productController.js - ✅ FIXED VERSION
import { Product } from "../models/Product.js";
import { cloudinary } from "../config/cloudinary.js";
import mongoose from "mongoose";

// --- (HÀM CÔNG KHAI - Giữ nguyên) ---
export const getAllProducts = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category && req.query.category !== "all") {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$text = {
        $search: req.query.search,
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
    }

    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case "price-asc":
          sortOption = { "pricing.0.pricePerUnit": 1 };
          break;
        case "price-desc":
          sortOption = { "pricing.0.pricePerUnit": -1 };
          break;
        case "popular":
          sortOption = { totalSold: -1, views: -1 };
          break;
      }
    }

    const products = await Product.find(filter)
      .populate({
        path: "printerId",
        select: "displayName avatarUrl",
      })
      .sort(sortOption);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("❌ Lỗi khi lấy tất cả sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ." });
    }

    const product = await Product.findById(productId).populate({
      path: "printerId",
      select: "displayName email avatarUrl printerProfile",
      populate: {
        path: "printerProfile",
        model: "PrinterProfile",
      },
    });

    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm." });
    }

    const productResponse = product.toObject();
    if (productResponse.printerId && productResponse.printerId.printerProfile) {
      productResponse.printerInfo = productResponse.printerId.printerProfile;
    }

    res.status(200).json({ success: true, product: productResponse });
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

// ✅ FIXED: Hàm tạo sản phẩm với validation và error handling cải thiện
export const createProduct = async (req, res) => {
  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ Controller createProduct ĐÃ ĐƯỢC GỌI");
    console.log("═══════════════════════════════════════════════════════");
    console.log("👤 User ID:", req.user?._id, "Role:", req.user?.role);

    // ✅ CRITICAL FIX: Kiểm tra req.body và req.files NGAY LẬP TỨC
    console.log("📦 Request Body:", req.body ? "✓ Exists" : "✗ MISSING");
    console.log(
      "📁 Request Files:",
      req.files ? `✓ ${req.files.length} files` : "✗ MISSING"
    );

    if (!req.body) {
      console.error("❌ CRITICAL: req.body is undefined!");
      return res.status(400).json({
        success: false,
        message: "Không nhận được dữ liệu từ form. Vui lòng thử lại.",
        hint: "req.body is undefined",
      });
    }

    if (!req.files || req.files.length === 0) {
      console.error("❌ CRITICAL: req.files is undefined or empty!");
      return res.status(400).json({
        success: false,
        message: "Không nhận được file ảnh. Vui lòng tải lên ít nhất 1 ảnh.",
        hint: "req.files is undefined or empty",
      });
    }

    console.log("📝 Body keys:", Object.keys(req.body));
    console.log(
      "📁 Files info:",
      req.files.map((f) => ({
        name: f.originalname,
        size: f.size,
        cloudinaryPath: f.path,
      }))
    );

    // 1. Kiểm tra vai trò
    if (req.user.role !== "printer") {
      console.error("❌ Unauthorized: User is not a printer");
      return res.status(403).json({
        success: false,
        message: "Cấm truy cập: Chỉ nhà in mới được thêm sản phẩm.",
      });
    }

    // 2. ✅ IMPROVED: Destructure với default values để tránh undefined
    const {
      name = "",
      category = "",
      description = "",
      pricing: pricingString = "[]",
      specifications: specString = "{}",
      productionTime,
      customization,
      stock,
    } = req.body;

    console.log("📋 Parsed data:");
    console.log("  - name:", name);
    console.log("  - category:", category);
    console.log("  - pricingString:", pricingString);
    console.log("  - specString:", specString);

    // 3. Parse JSON với try-catch
    let parsedSpecifications = {};
    let parsedPricing = [];

    try {
      if (specString) parsedSpecifications = JSON.parse(specString);
      if (pricingString) parsedPricing = JSON.parse(pricingString);

      console.log("✅ JSON parsed successfully");
      console.log("  - parsedPricing:", parsedPricing);
      console.log("  - parsedSpecifications:", parsedSpecifications);
    } catch (parseError) {
      console.error("❌ Lỗi parse JSON:", parseError);

      // ✅ Rollback Cloudinary nếu parse fail
      if (req.files && req.files.length > 0) {
        console.warn(
          "🗑️ Rolling back Cloudinary uploads due to parse error..."
        );
        const publicIds = req.files.map((f) => f.filename);
        cloudinary.api
          .delete_resources(publicIds)
          .catch((err) => console.error("Error rolling back:", err));
      }

      return res.status(400).json({
        success: false,
        message: "Định dạng pricing hoặc specifications không hợp lệ.",
        error: parseError.message,
      });
    }

    // 4. Xử lý ảnh từ Cloudinary
    const images = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0,
    }));
    console.log("🖼️ Processed images:", images.length);

    // 5. ✅ IMPROVED: Validation chi tiết hơn
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 5) {
      errors.push("Tên sản phẩm phải có ít nhất 5 ký tự");
    }

    if (!category || typeof category !== "string") {
      errors.push("Danh mục sản phẩm không được để trống");
    }

    if (!Array.isArray(parsedPricing) || parsedPricing.length === 0) {
      errors.push("Phải có ít nhất một mức giá");
    } else {
      parsedPricing.forEach((tier, index) => {
        if (typeof tier.minQuantity !== "number" || tier.minQuantity < 1) {
          errors.push(
            `Mức giá ${index + 1}: Số lượng tối thiểu phải lớn hơn 0`
          );
        }
        if (typeof tier.pricePerUnit !== "number" || tier.pricePerUnit < 100) {
          errors.push(`Mức giá ${index + 1}: Giá mỗi đơn vị phải ít nhất 100đ`);
        }
      });
    }

    if (errors.length > 0) {
      console.error("❌ Validation errors:", errors);

      // ✅ Rollback Cloudinary
      if (req.files && req.files.length > 0) {
        console.warn(
          "🗑️ Rolling back Cloudinary uploads due to validation errors..."
        );
        const publicIds = req.files.map((f) => f.filename);
        cloudinary.api
          .delete_resources(publicIds)
          .catch((err) => console.error("Error rolling back:", err));
      }

      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    // 6. Chuẩn bị data để lưu
    const productData = {
      printerId: req.user._id,
      name: name.trim(),
      category,
      description: description?.trim() || "",
      images: images,
      pricing: parsedPricing,
      specifications: parsedSpecifications,
      productionTime: productionTime || { min: 1, max: 3 },
      customization: customization || {},
      isActive: true,
      stock:
        typeof stock === "string" && !isNaN(parseInt(stock))
          ? parseInt(stock)
          : typeof stock === "number"
          ? stock
          : undefined,
    };

    console.log("💾 Attempting to save product to database...");

    // 7. Tạo sản phẩm
    let newProduct;
    try {
      newProduct = await Product.create(productData);
      console.log("✅ Product created successfully with ID:", newProduct._id);
    } catch (createError) {
      console.error("❌ MongoDB create error:", createError);

      // ✅ Rollback Cloudinary
      if (req.files && req.files.length > 0) {
        console.warn("🗑️ Rolling back Cloudinary uploads due to DB error...");
        const publicIds = req.files.map((f) => f.filename);
        cloudinary.api
          .delete_resources(publicIds)
          .catch((err) => console.error("Error rolling back:", err));
      }

      if (createError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Sản phẩm này đã tồn tại",
        });
      }

      throw createError;
    }

    // 8. Populate và trả về
    await newProduct.populate({
      path: "printerId",
      select: "displayName avatarUrl",
    });

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ PRODUCT CREATED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════════");

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công!",
      product: newProduct,
    });
  } catch (error) {
    console.error("═══════════════════════════════════════════════════════");
    console.error("❌ FATAL ERROR in createProduct:");
    console.error("═══════════════════════════════════════════════════════");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // ✅ Final rollback attempt
    if (req.files && req.files.length > 0 && !res.headersSent) {
      console.warn("🗑️ Final rollback: Deleting Cloudinary uploads...");
      const publicIds = req.files.map((f) => f.filename);
      cloudinary.api
        .delete_resources(publicIds)
        .catch((err) => console.error("Final rollback error:", err));
    }

    if (!res.headersSent) {
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        return res.status(400).json({
          success: false,
          message: "Dữ liệu không hợp lệ",
          errors: validationErrors,
        });
      }

      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo sản phẩm.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
};

// --- (Các hàm khác giữ nguyên) ---
export const getMyProducts = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({
        success: false,
        message: "Cấm truy cập: Chỉ nhà in mới xem được.",
      });
    }

    const printerUserId = req.user._id;
    const products = await Product.find({ printerId: printerUserId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm của nhà in:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống.",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({ success: false, message: "Cấm truy cập." });
    }

    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm." });
    }

    if (product.printerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa sản phẩm này.",
      });
    }

    const { name, category, pricing, ...otherUpdates } = req.body;
    const errors = [];

    if (name !== undefined && (!name || name.trim().length < 5))
      errors.push("Tên sản phẩm phải có ít nhất 5 ký tự");
    if (category !== undefined && !category)
      errors.push("Danh mục không được để trống");
    if (pricing !== undefined) {
      if (!Array.isArray(pricing) || pricing.length === 0) {
        errors.push("Phải có ít nhất một mức giá");
      } else {
        pricing.forEach((tier, index) => {
          if (tier.minQuantity === undefined || tier.minQuantity < 1)
            errors.push(
              `Mức giá ${index + 1}: Số lượng tối thiểu phải lớn hơn 0`
            );
          if (tier.pricePerUnit === undefined || tier.pricePerUnit < 100)
            errors.push(
              `Mức giá ${index + 1}: Giá mỗi đơn vị phải ít nhất 100đ`
            );
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu cập nhật không hợp lệ",
        errors,
      });
    }

    const allowedUpdates = [
      "name",
      "category",
      "description",
      "pricing",
      "specifications",
      "productionTime",
      "customization",
      "isActive",
      "stock",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "stock" && typeof req.body.stock === "string") {
          product.stock = !isNaN(parseInt(req.body.stock))
            ? parseInt(req.body.stock)
            : undefined;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công!",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: validationErrors,
      });
    }
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật sản phẩm.",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({ success: false, message: "Cấm truy cập." });
    }

    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm." });
    }

    if (product.printerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa sản phẩm này.",
      });
    }

    const publicIds = product.images
      ?.map((img) => img.publicId)
      .filter((id) => !!id);

    if (publicIds && publicIds.length > 0) {
      console.log(`🗑️ Đang xóa ${publicIds.length} ảnh trên Cloudinary...`);
      try {
        const result = await cloudinary.api.delete_resources(publicIds);
        console.log("✅ Kết quả xóa ảnh Cloudinary:", result);
      } catch (cloudinaryError) {
        console.error("⚠️ Lỗi xóa ảnh Cloudinary (bỏ qua):", cloudinaryError);
      }
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công!",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa sản phẩm.",
    });
  }
};
