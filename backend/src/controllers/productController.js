// src/controllers/productController.js - ĐÃ KHẮC PHỤC 100%
import { Product } from "../models/Product.js";

// --- (HÀM MỚI 1 - CÔNG KHAI) ---
// @desc    Lấy tất cả sản phẩm công khai (cho khách)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    // (Sau này có thể thêm filter, search, pagination tại đây)
    // Ví dụ: Lọc theo category
    const filter = { isActive: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      // Sử dụng $text search
      filter.$text = {
        $search: req.query.search,
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
    }
    const products = await Product.find(filter)
      .populate({
        path: "printerId", // Lấy thông tin nhà in
        select: "displayName avatarUrl", // Chỉ lấy 2 trường này
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả sản phẩm:", error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

// --- (HÀM MỚI 2 - CÔNG KHAI) ---
// @desc    Lấy chi tiết 1 sản phẩm (cho khách)
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "printerId",
      select: "displayName avatarUrl rating specialties", // Lấy thêm thông tin nhà in
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    // (Sau này có thể thêm logic tăng "views" tại đây)

    res.status(200).json({ product });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "ID sản phẩm không hợp lệ." });
    }
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

// --- (CÁC HÀM CŨ - CỦA NHÀ IN) - ĐÃ FIX ---

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private (Chỉ Printer)
export const createProduct = async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT REQUEST ===");
    console.log("User ID:", req.user?._id, "Role:", req.user?.role);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    // 1. Kiểm tra vai trò
    if (req.user.role !== "printer") {
      console.error("❌ Unauthorized: User is not a printer");
      return res
        .status(403)
        .json({ message: "Cấm truy cập: Chỉ nhà in mới được thêm sản phẩm." });
    }

    // 2. Lấy dữ liệu từ body
    const {
      name,
      category,
      description,
      images,
      pricing,
      specifications,
      productionTime,
      customization,
    } = req.body;

    // 3. Validation chi tiết
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push("Tên sản phẩm không được để trống");
    }

    if (!category) {
      errors.push("Danh mục sản phẩm không được để trống");
    }

    // Validate pricing array - QUAN TRỌNG!
    if (!pricing || !Array.isArray(pricing) || pricing.length === 0) {
      errors.push("Phải có ít nhất một mức giá");
    } else {
      pricing.forEach((tier, index) => {
        if (!tier.minQuantity || tier.minQuantity < 1) {
          errors.push(
            `Mức giá ${index + 1}: Số lượng tối thiểu phải lớn hơn 0`
          );
        }
        if (
          tier.pricePerUnit === undefined ||
          tier.pricePerUnit === null ||
          tier.pricePerUnit < 0
        ) {
          errors.push(
            `Mức giá ${index + 1}: Giá mỗi đơn vị phải lớn hơn hoặc bằng 0`
          );
        }
      });
    }

    if (errors.length > 0) {
      console.error("❌ Validation errors:", errors);
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: errors,
      });
    }

    // 4. Chuẩn bị data để lưu (với default values)
    const productData = {
      printerId: req.user._id,
      name: name.trim(),
      category,
      description: description?.trim() || "",
      images: Array.isArray(images) ? images : [],
      pricing: pricing,
      specifications: specifications || {},
      productionTime: productionTime || { min: 1, max: 3 },
      customization: customization || {
        allowFileUpload: true,
        acceptedFileTypes: ["pdf", "ai", "psd", "png", "jpg"],
        hasDesignService: false,
      },
      isActive: true, // Mặc định là active
      stock: 999, // Stock mặc định
    };

    console.log(
      "📦 Product data to save:",
      JSON.stringify(productData, null, 2)
    );

    // 5. Tạo sản phẩm với error handling tốt hơn
    let newProduct;
    try {
      newProduct = await Product.create(productData);
      console.log("✅ Product created successfully with ID:", newProduct._id);
    } catch (createError) {
      console.error("❌ MongoDB create error:", createError);

      // Xử lý duplicate key error
      if (createError.code === 11000) {
        return res.status(409).json({
          message: "Sản phẩm này đã tồn tại",
        });
      }

      throw createError; // Re-throw để catch block bên ngoài xử lý
    }

    // 6. Populate printer info trước khi trả về
    await newProduct.populate({
      path: "printerId",
      select: "displayName avatarUrl",
    });

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công!",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);

    // Chi tiết error nếu là validation error của Mongoose
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

    // Cast error (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo sản phẩm.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Lấy tất cả sản phẩm của nhà in
// @route   GET /api/products/my-products
// @access  Private (Chỉ Printer)
export const getMyProducts = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res
        .status(403)
        .json({ message: "Cấm truy cập: Chỉ nhà in mới xem được." });
    }

    const products = await Product.find({ printerId: req.user._id }).sort({
      createdAt: -1,
    }); // Sắp xếp mới nhất trước

    res.status(200).json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống.",
    });
  }
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Private (Chỉ Printer - owner)
export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({ message: "Cấm truy cập." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    // Kiểm tra ownership
    if (product.printerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa sản phẩm này." });
    }

    // Update các fields được gửi lên
    const allowedUpdates = [
      "name",
      "category",
      "description",
      "images",
      "pricing",
      "specifications",
      "productionTime",
      "customization",
      "isActive",
      "stock",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công!",
      product,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống.",
    });
  }
};

// @desc    Xóa sản phẩm (soft delete)
// @route   DELETE /api/products/:id
// @access  Private (Chỉ Printer - owner)
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({ message: "Cấm truy cập." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    // Kiểm tra ownership
    if (product.printerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa sản phẩm này." });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống.",
    });
  }
};
