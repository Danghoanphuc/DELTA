// apps/customer-backend/src/shared/services/product.service.js
import { Product } from "../shared/models/product.model.js";
import { PrinterProfile } from "../shared/models/printer-profile.model.js";
import {
  NotFoundException,
  ForbiddenException,
  ValidationException,
} from "../shared/exceptions.js"; // Giả định

/**
 * Lấy danh sách sản phẩm CỦA TÔI (nhà in đã đăng nhập)
 * @param {string} printerProfileId - ID của nhà in (từ middleware)
 * @param {object} query - (page, limit, search)
 */
export const getMyProducts = async (printerProfileId, query) => {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);
  const search = query.search;

  const filter = {
    printerProfileId: printerProfileId, // Chỉ lấy sản phẩm của nhà in này
  };

  if (search) {
    filter.name = new RegExp(search, "i");
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  return {
    data: products,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Lấy chi tiết 1 sản phẩm CỦA TÔI
 * @param {string} printerProfileId
 * @param {string} productId
 */
export const getMyProductById = async (printerProfileId, productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundException("Sản phẩm", productId);
  }
  // BẢO MẬT: Kiểm tra quyền sở hữu
  if (product.printerProfileId.toString() !== printerProfileId) {
    throw new ForbiddenException("Bạn không có quyền xem sản phẩm này.");
  }
  return product;
};

/**
 * Tạo sản phẩm mới
 * @param {string} printerProfileId
 * @param {import('@printz/types').ICreateProductDto} dto
 */
export const createProduct = async (printerProfileId, dto) => {
  const printer = await PrinterProfile.findById(printerProfileId);
  if (!printer || !printer.isVerified) {
    throw new ForbiddenException(
      "Hồ sơ nhà in của bạn chưa được duyệt hoặc đã bị khóa."
    );
  }

  // Kiểm tra slug (quan trọng)
  const existingSlug = await Product.findOne({ slug: dto.slug });
  if (existingSlug) {
    throw new ValidationException(`Slug "${dto.slug}" đã tồn tại.`);
  }

  const newProduct = new Product({
    ...dto,
    printerProfileId: printerProfileId, // Gán chủ sở hữu
  });

  await newProduct.save();
  return newProduct;
};

/**
 * Cập nhật sản phẩm CỦA TÔI
 * @param {string} printerProfileId
 * @param {string} productId
 * @param {import('@printz/types').IUpdateProductDto} dto
 */
export const updateMyProduct = async (printerProfileId, productId, dto) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundException("Sản phẩm", productId);
  }
  // BẢO MẬT: Kiểm tra quyền sở hữu
  if (product.printerProfileId.toString() !== printerProfileId) {
    throw new ForbiddenException("Bạn không có quyền sửa sản phẩm này.");
  }

  // (Logic tự tạo slug sẽ tốt hơn, nhưng ta tạm theo DTO)
  if (dto.slug && dto.slug !== product.slug) {
    const existingSlug = await Product.findOne({ slug: dto.slug });
    if (existingSlug) {
      throw new ValidationException(`Slug "${dto.slug}" đã tồn tại.`);
    }
  }

  Object.assign(product, dto); // Ghi đè các trường
  await product.save();
  return product;
};

/**
 * Xóa sản phẩm CỦA TÔI
 * @param {string} printerProfileId
 * @param {string} productId
 */
export const deleteMyProduct = async (printerProfileId, productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundException("Sản phẩm", productId);
  }
  // BẢO MẬT: Kiểm tra quyền sở hữu
  if (product.printerProfileId.toString() !== printerProfileId) {
    throw new ForbiddenException("Bạn không có quyền xóa sản phẩm này.");
  }

  await Product.findByIdAndDelete(productId);
  return { message: "Đã xóa sản phẩm thành công." };
};
