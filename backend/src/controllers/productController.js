// src/controllers/productController.js
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

// --- (CÁC HÀM CŨ - CỦA NHÀ IN) ---

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Private (Chỉ Printer)
export const createProduct = async (req, res) => {
  try {
    console.log("--- Hàm createProduct: Đã nhận được yêu cầu ---"); // Thêm log để xác nhận hàm được gọi
    console.log("User:", req.user?._id, "Role:", req.user?.role); // Kiểm tra user
    console.log("Request Body:", req.body); // In ra dữ liệu nhận được
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
