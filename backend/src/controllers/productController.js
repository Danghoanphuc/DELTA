// src/controllers/productController.js
import { Product } from "../models/Product.js";

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private (Chỉ Printer)
export const createProduct = async (req, res) => {
  try {
    // 1. Kiểm tra vai trò
    if (req.user.role !== "printer") {
      return res
        .status(403)
        .json({ message: "Cấm truy cập: Chỉ nhà in mới được thêm sản phẩm." });
    }

    // 2. Lấy dữ liệu từ body (form)
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

    // 3. Tạo sản phẩm mới
    const newProduct = await Product.create({
      printerId: req.user._id, // Gán sản phẩm cho nhà in đang đăng nhập
      name,
      category,
      description,
      images,
      pricing,
      specifications,
      productionTime,
      customization,
    });

    res.status(201).json({
      message: "Tạo sản phẩm thành công!",
      product: newProduct,
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo sản phẩm." });
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

    const products = await Product.find({ printerId: req.user._id });

    res.status(200).json({ products });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

// ... (Bạn có thể thêm updateProduct và deleteProduct ở đây sau) ...
