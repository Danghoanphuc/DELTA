// src/controllers/productController.js
import { Product } from "../models/Product.js";
import { cloudinary } from "../config/cloudinary.js"; // Import cấu hình Cloudinary
import mongoose from "mongoose";

// --- (HÀM CÔNG KHAI - Lấy tất cả sản phẩm cho khách) ---
export const getAllProducts = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category && req.query.category !== "all") {
      // Thêm kiểm tra 'all'
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$text = {
        $search: req.query.search,
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
    }

    // Sắp xếp
    let sortOption = { createdAt: -1 }; // Mặc định: mới nhất
    if (req.query.sort) {
      switch (req.query.sort) {
        case "price-asc":
          // Sắp xếp theo giá thấp nhất của bậc giá đầu tiên (cần cải thiện nếu muốn chính xác hơn)
          sortOption = { "pricing.0.pricePerUnit": 1 };
          break;
        case "price-desc":
          sortOption = { "pricing.0.pricePerUnit": -1 };
          break;
        case "popular":
          sortOption = { totalSold: -1, views: -1 }; // Ví dụ sắp xếp theo bán chạy/lượt xem
          break;
        // case 'newest': // Mặc định
        // default:
        //   sortOption = { createdAt: -1 };
      }
    }

    const products = await Product.find(filter)
      .populate({
        path: "printerId",
        select: "displayName avatarUrl",
      })
      .sort(sortOption); // Áp dụng sắp xếp

    res.status(200).json({ success: true, products }); // Thêm success: true
  } catch (error) {
    console.error("❌ Lỗi khi lấy tất cả sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống." }); // Thêm success: false
  }
};

// --- (HÀM CÔNG KHAI - Lấy chi tiết 1 sản phẩm cho khách) ---
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ." });
    }

    // Populate cả printerProfile để lấy thông tin chi tiết hơn
    const product = await Product.findById(productId).populate({
      path: "printerId", // User model của nhà in
      select: "displayName email avatarUrl printerProfile", // Lấy thêm ID profile
      populate: {
        path: "printerProfile", // Populate tiếp profile từ User
        model: "PrinterProfile", // Chỉ định model
        // select: 'businessName shopAddress rating totalReviews specialties' // Chọn các trường cần thiết từ Profile
      },
    });

    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm." });
    }

    // Map dữ liệu printer profile vào response cho tiện frontend
    const productResponse = product.toObject(); // Chuyển Mongoose doc thành object thường
    if (productResponse.printerId && productResponse.printerId.printerProfile) {
      productResponse.printerInfo = productResponse.printerId.printerProfile;
      // Không cần trả về lồng nhau nữa
      // delete productResponse.printerId.printerProfile;
    }

    // (Tùy chọn: Tăng lượt xem)
    // await Product.findByIdAndUpdate(productId, { $inc: { views: 1 } });

    res.status(200).json({ success: true, product: productResponse }); // Thêm success: true
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error);
    // Bỏ kiểm tra error.kind
    res.status(500).json({ success: false, message: "Lỗi hệ thống." });
  }
};

// --- (HÀM NHÀ IN - Tạo sản phẩm mới với Cloudinary) ---
export const createProduct = async (req, res) => {
  try {
    console.log("✅✅✅ Controller createProduct ĐÃ ĐƯỢC GỌI ✅✅✅");
    console.log("User ID:", req.user?._id, "Role:", req.user?.role);
    console.log("Request Body (AFTER Multer):", req.body); // Xem body sau khi multer xử lý
    console.log("Request Files (AFTER Multer):", req.files); // Xem files sau khi multer xử lý

    // 1. Kiểm tra vai trò
    if (req.user.role !== "printer") {
      console.error("❌ Unauthorized: User is not a printer");
      return res.status(403).json({
        success: false,
        message: "Cấm truy cập: Chỉ nhà in mới được thêm sản phẩm.",
      });
    }

    // 2. Lấy dữ liệu từ body và Parse JSON
    const {
      name,
      category,
      description,
      pricing: pricingString,
      specifications: specString,
      productionTime,
      customization,
      stock, // Lấy stock nếu có
    } = req.body;

    let parsedSpecifications = {};
    let parsedPricing = [];

    try {
      if (specString) parsedSpecifications = JSON.parse(specString);
      if (pricingString) parsedPricing = JSON.parse(pricingString);
    } catch (e) {
      console.error("❌ Lỗi parse JSON:", e);
      return res.status(400).json({
        success: false,
        message: "Định dạng pricing hoặc specifications không hợp lệ.",
      });
    }

    // 3. Xử lý ảnh từ req.files (Cloudinary cung cấp)
    if (!req.files || req.files.length === 0) {
      console.error("❌ Validation error: No images uploaded");
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng tải lên ít nhất 1 ảnh." });
    }

    const images = req.files.map((file, index) => ({
      url: file.path, // secure_url từ Cloudinary
      publicId: file.filename, // public_id từ Cloudinary
      isPrimary: index === 0,
    }));
    console.log("🖼️ Processed images from Cloudinary:", images);

    // 4. Validation chi tiết
    const errors = [];
    if (!name || name.trim().length < 5)
      errors.push("Tên sản phẩm phải có ít nhất 5 ký tự"); // Sửa validation
    if (!category) errors.push("Danh mục sản phẩm không được để trống");
    if (
      !parsedPricing ||
      !Array.isArray(parsedPricing) ||
      parsedPricing.length === 0
    ) {
      errors.push("Phải có ít nhất một mức giá");
    } else {
      parsedPricing.forEach((tier, index) => {
        // Sửa validation cho chặt chẽ hơn
        if (tier.minQuantity === undefined || tier.minQuantity < 1)
          errors.push(
            `Mức giá ${index + 1}: Số lượng tối thiểu phải lớn hơn 0`
          );
        if (tier.pricePerUnit === undefined || tier.pricePerUnit < 100)
          errors.push(`Mức giá ${index + 1}: Giá mỗi đơn vị phải ít nhất 100đ`);
      });
    }

    if (errors.length > 0) {
      console.error("❌ Validation errors:", errors);
      // Nếu có ảnh đã upload, cần xóa đi (rollback)
      if (req.files && req.files.length > 0) {
        console.warn("Rollback Cloudinary upload due to validation errors...");
        const publicIds = req.files.map((f) => f.filename);
        cloudinary.api
          .delete_resources(publicIds)
          .catch((err) =>
            console.error("Error rolling back Cloudinary upload:", err)
          );
      }
      return res
        .status(400)
        .json({ success: false, message: "Dữ liệu không hợp lệ", errors });
    }

    // 5. Chuẩn bị data để lưu
    const productData = {
      printerId: req.user._id, // QUAN TRỌNG: Gán đúng ID nhà in
      name: name.trim(),
      category,
      description: description?.trim() || "",
      images: images,
      pricing: parsedPricing,
      specifications: parsedSpecifications,
      productionTime: productionTime || { min: 1, max: 3 },
      customization: customization || {},
      isActive: true, // Mặc định là active khi tạo mới
      stock:
        typeof stock === "string" && !isNaN(parseInt(stock))
          ? parseInt(stock)
          : typeof stock === "number"
          ? stock
          : undefined, // Parse stock, nếu ko có thì là undefined (không giới hạn)
    };

    console.log(
      "📦 Product data to save:",
      JSON.stringify(productData, null, 2)
    );

    // 6. Tạo sản phẩm
    let newProduct;
    try {
      newProduct = await Product.create(productData);
      console.log("✅ Product created successfully with ID:", newProduct._id);
    } catch (createError) {
      console.error("❌ MongoDB create error:", createError);
      // Rollback Cloudinary upload
      if (req.files && req.files.length > 0) {
        console.warn("Rollback Cloudinary upload due to DB create error...");
        const publicIds = req.files.map((f) => f.filename);
        cloudinary.api
          .delete_resources(publicIds)
          .catch((err) =>
            console.error("Error rolling back Cloudinary upload:", err)
          );
      }
      if (createError.code === 11000)
        return res
          .status(409)
          .json({ success: false, message: "Sản phẩm này đã tồn tại" });
      throw createError; // Để catch bên ngoài xử lý
    }

    // 7. Populate và trả về
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
    console.error("❌ Error creating product (outer catch):", error);
    // Đảm bảo rollback nếu lỗi xảy ra ở đây mà ảnh đã upload
    if (req.files && req.files.length > 0 && !res.headersSent) {
      // Check headersSent để tránh lỗi double response
      console.warn(
        "Outer Catch Rollback: Deleting uploaded Cloudinary images..."
      );
      const publicIds = req.files.map((f) => f.filename);
      cloudinary.api
        .delete_resources(publicIds)
        .catch((err) =>
          console.error(
            "Outer Catch: Error rolling back Cloudinary upload:",
            err
          )
        );
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
      if (error.name === "CastError") {
        return res
          .status(400)
          .json({ success: false, message: "ID không hợp lệ" });
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

// --- (HÀM NHÀ IN - Lấy sản phẩm của tôi) ---
export const getMyProducts = async (req, res) => {
  try {
    if (req.user.role !== "printer") {
      return res.status(403).json({
        success: false,
        message: "Cấm truy cập: Chỉ nhà in mới xem được.",
      });
    }

    // Lấy ID nhà in từ user đã được xác thực
    const printerUserId = req.user._id;

    // Tìm sản phẩm thuộc về nhà in này
    const products = await Product.find({ printerId: printerUserId }).sort({
      createdAt: -1, // Sắp xếp mới nhất trước
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

// --- (HÀM NHÀ IN - Cập nhật sản phẩm) ---
// (Lưu ý: Chưa xử lý upload/xóa ảnh khi cập nhật)
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

    // Kiểm tra ownership
    if (product.printerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa sản phẩm này.",
      });
    }

    // --- Validation dữ liệu cập nhật ---
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
    // --- Kết thúc Validation ---

    // Cập nhật các fields được phép
    const allowedUpdates = [
      "name",
      "category",
      "description",
      /* "images", */ "pricing",
      "specifications",
      "productionTime",
      "customization",
      "isActive",
      "stock",
    ];

    allowedUpdates.forEach((field) => {
      // Chỉ cập nhật nếu field đó có trong req.body
      if (req.body[field] !== undefined) {
        // Parse stock nếu là chuỗi
        if (field === "stock" && typeof req.body.stock === "string") {
          product.stock = !isNaN(parseInt(req.body.stock))
            ? parseInt(req.body.stock)
            : undefined;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    // TODO: Xử lý cập nhật ảnh (xóa ảnh cũ trên Cloudinary, upload ảnh mới nếu có)

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

// --- (HÀM NHÀ IN - Xóa sản phẩm với Cloudinary) ---
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

    // Kiểm tra ownership
    if (product.printerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa sản phẩm này.",
      });
    }

    // --- Xóa ảnh trên Cloudinary ---
    const publicIds = product.images
      ?.map((img) => img.publicId)
      .filter((id) => !!id);
    if (publicIds && publicIds.length > 0) {
      console.log(
        `🗑️ Đang xóa ${publicIds.length} ảnh trên Cloudinary cho sản phẩm ${product._id}...`
      );
      try {
        const result = await cloudinary.api.delete_resources(publicIds);
        console.log("✅ Kết quả xóa ảnh Cloudinary:", result);
      } catch (cloudinaryError) {
        // Log lỗi nhưng không dừng quá trình xóa product trong DB
        console.error(
          "⚠️ Lỗi xóa ảnh Cloudinary khi xóa sản phẩm (bỏ qua):",
          cloudinaryError
        );
      }
    }

    // --- Xóa sản phẩm khỏi DB ---
    // Thay vì soft delete, thực hiện hard delete nếu muốn xóa hẳn
    // await product.deleteOne(); // Hoặc dùng findByIdAndDelete(productId);
    // Hoặc giữ soft delete:
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công!", // Hoặc "Ẩn sản phẩm thành công!" nếu là soft delete
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa sản phẩm.",
    });
  }
};
