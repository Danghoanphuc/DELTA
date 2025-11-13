// apps/customer-backend/src/modules/cart/cart.service.js
// ✅ PHẪU THUẬT: Sửa lỗi import ProductRepository
// ✅ NÂNG CẤP GĐ 5.4: Thêm logic validateCheckout và tối ưu hóa addToCart

import { CartRepository } from "./cart.repository.js";
import { productRepository } from "../products/product.repository.js";
// ✅ GĐ 5.4: Import thêm PrinterProfile và Product
import { Product } from "../../shared/models/product.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import mongoose from "mongoose";
import { Logger } from "../../shared/utils/index.js";

export class CartService {
  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = productRepository;
  }

  /**
   * Lấy giỏ hàng của user
   */
  async getCart(userId) {
    Logger.debug(`[CartService] Getting cart for user: ${userId}`);
    const cart = await this.cartRepository.findOrCreate(userId);
    return await this.cartRepository.getPopulated(cart._id);
  }

  /**
   * Thêm sản phẩm vào giỏ hàng (Logic từ controller cũ)
   */
  async addToCart(userId, itemData) {
    Logger.debug(`[CartService] Adding to cart for user: ${userId}`, itemData);
    const { productId, quantity, selectedPriceIndex, customization } = itemData;

    // 1. Validate Input
    if (!productId || !quantity || selectedPriceIndex === undefined) {
      throw new ValidationException(
        "Thiếu thông tin sản phẩm (productId, quantity, hoặc selectedPriceIndex)."
      );
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ValidationException("ID sản phẩm không hợp lệ.");
    }

    // 2. Validate Product
    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new NotFoundException(
        "Không tìm thấy sản phẩm hoặc sản phẩm đã ngưng kinh doanh."
      );
    }

    if (!product.printerProfileId) {
      throw new ValidationException(
        "Sản phẩm này chưa được gán cho nhà in hợp lệ."
      );
    }

    // 3. Validate Price Tier
    const priceTier = product.pricing[selectedPriceIndex];
    if (!priceTier) {
      throw new ValidationException("Mức giá không hợp lệ.");
    }
    if (quantity < priceTier.minQuantity) {
      throw new ValidationException(
        `Số lượng tối thiểu là ${priceTier.minQuantity}.`
      );
    }

    // 4. Lấy giỏ hàng
    const cart = await this.cartRepository.findOrCreate(userId);

    // 5. Thêm/Cập nhật item
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    const subtotal = quantity * priceTier.pricePerUnit;

    const itemPayload = {
      productId,
      // --- NÂNG CẤP TỐI ƯU HÓA (GĐ 5.4) ---
      // Lưu printerId để validateCheckout không cần join
      printerProfileId: product.printerProfileId,
      // --- KẾT THÚC NÂNG CẤP ---
      quantity,
      selectedPrice: {
        minQuantity: priceTier.minQuantity,
        pricePerUnit: priceTier.pricePerUnit,
        maxQuantity: priceTier.maxQuantity,
      },
      customization: customization || {},
      subtotal,
    };

    if (existingItemIndex !== -1) {
      Logger.debug(`[CartService] Updating existing item in cart.`);
      cart.items[existingItemIndex] = itemPayload;
    } else {
      Logger.debug(`[CartService] Adding new item to cart.`);
      cart.items.push(itemPayload);
    }

    // 6. Lưu và trả về giỏ hàng đã populate
    const savedCart = await this.cartRepository.save(cart);
    return await this.cartRepository.getPopulated(savedCart._id);
  }

  /**
   * Gộp giỏ hàng (Đã vá lỗi N+1 Query)
   */
  async mergeGuestCart(userId, guestItems) {
    Logger.debug(`[CartService] Merging guest cart for user: ${userId}`);
    if (!guestItems || !Array.isArray(guestItems) || guestItems.length === 0) {
      throw new ValidationException("Không có sản phẩm nào để merge.");
    }

    const cart = await this.cartRepository.findOrCreate(userId);

    // ✅ BƯỚC 1: Gom ID
    const productIds = guestItems.map((item) => item.productId);

    // ✅ BƯỚC 2: 1 Query duy nhất
    const activeProducts = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).select("printerProfileId pricing"); // Lấy thêm printerProfileId

    // ✅ BƯỚC 3: Tạo Map
    const productMap = new Map(
      activeProducts.map((p) => [p._id.toString(), p])
    );

    let mergedCount = 0;
    let skippedCount = 0;

    // ✅ BƯỚC 4: Xử lý
    for (const guestItem of guestItems) {
      const { productId, quantity, selectedPriceIndex, customization } =
        guestItem;

      const product = productMap.get(productId); // Lấy từ Map (O(1))

      if (!product) {
        skippedCount++;
        continue;
      }

      const priceTier = product.pricing[selectedPriceIndex];
      if (!priceTier) {
        skippedCount++;
        continue;
      }

      const subtotal = quantity * priceTier.pricePerUnit;
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingItemIndex !== -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].subtotal =
          newQuantity * priceTier.pricePerUnit;
      } else {
        cart.items.push({
          productId,
          printerProfileId: product.printerProfileId, // ✅ TỐI ƯU HÓA: Thêm printerProfileId
          quantity,
          selectedPrice: {
            minQuantity: priceTier.minQuantity,
            pricePerUnit: priceTier.pricePerUnit,
            maxQuantity: priceTier.maxQuantity,
          },
          customization: customization || {},
          subtotal,
        });
      }
      mergedCount++;
    }

    Logger.info(
      `[CartService] Merge complete: ${mergedCount} merged, ${skippedCount} skipped.`
    );

    const savedCart = await this.cartRepository.save(cart);
    return await this.cartRepository.getPopulated(savedCart._id);
  }

  // ... (updateCartItem, removeFromCart, clearCart giữ nguyên) ...

  /**
   * Xóa sạch giỏ hàng
   */
  async clearCart(userId) {
    Logger.debug(`[CartService] Clearing cart for user: ${userId}`);
    const cart = await this.cartRepository.findOrCreate(userId);
    cart.items = [];
    return await this.cartRepository.save(cart);
  }

  // --- NÂNG CẤP GĐ 5.4: LOGIC "HARD CHECK" ---
  /**
   * Xác thực giỏ hàng (Kiểm tra
   * 1. Sản phẩm còn active
   * 2. Nhà in còn active
   * 3. Nhà in stripe.status === 'active'
   */
  async validateCheckout(userId) {
    Logger.debug(`[CartService] Validating checkout for user: ${userId}`);
    // 1. Lấy giỏ hàng (không cần populate, chỉ cần ID)
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      return { isValid: false, invalidItems: [], message: "Giỏ hàng trống." };
    }

    // 2. Gom các ID duy nhất
    const printerProfileIds = [
      ...new Set(
        cart.items
          .map((item) => item.printerProfileId && item.printerProfileId.toString())
          .filter(Boolean)
      ),
    ];
    const productIds = [...new Set(cart.items.map((item) => item.productId))];

    // 3. Thực hiện 2 truy vấn song song
    const [printerProfiles, activeProducts] = await Promise.all([
      PrinterProfile.find({
        _id: { $in: printerProfileIds },
      }).select("_id isActive stripeAccountId businessName stripe status"),
      Product.find({
        _id: { $in: productIds },
        isActive: true,
      }).select("_id"),
    ]);

    // 4. Tạo Map để tra cứu O(1)
    const printerMap = new Map(
      printerProfiles.map((p) => [p._id.toString(), p])
    );
    const activeProductMap = new Map(
      activeProducts.map((p) => [p._id.toString(), true])
    );

    // 5. Duyệt giỏ hàng và kiểm tra
    const invalidItems = [];
    for (const item of cart.items) {
      const productId = item.productId.toString();
      const printerProfileId = item.printerProfileId?.toString();

      // Kiểm tra 1: Sản phẩm bị xóa hoặc de-activated
      if (!activeProductMap.has(productId)) {
        invalidItems.push({
          cartItemId: item._id,
          productId,
          reason: "Sản phẩm này đã bị vô hiệu hóa hoặc không còn tồn tại.",
        });
        continue; // Bỏ qua, không cần check nhà in nữa
      }

      // Kiểm tra 2: Nhà in
      if (!printerProfileId) {
        invalidItems.push({
          cartItemId: item._id,
          productId,
          reason:
            "Không tìm thấy thông tin nhà in cho sản phẩm này. Vui lòng thử lại.",
        });
        continue;
      }

      const printer = printerMap.get(printerProfileId);
      if (!printer) {
        invalidItems.push({
          cartItemId: item._id,
          productId,
          reason: "Không tìm thấy thông tin nhà in của sản phẩm này.",
        });
      } else if (!printer.isActive) {
        invalidItems.push({
          cartItemId: item._id,
          productId,
          reason: `Nhà in "${printer.businessName}" đang tạm ngưng hoạt động.`,
        });
      } else if (
        printer.stripeAccountId &&
        printer.stripe?.status &&
        printer.stripe.status !== "active"
      ) {
        invalidItems.push({
          cartItemId: item._id,
          productId,
          reason: `Nhà in "${printer.businessName}" hiện không thể nhận thanh toán. Vui lòng thử lại sau.`,
        });
      }
    }

    if (invalidItems.length > 0) {
      Logger.warn(
        `[CartService] Validation FAILED for user ${userId}`,
        invalidItems
      );
      return {
        isValid: false,
        invalidItems,
        message:
          "Một số sản phẩm trong giỏ hàng không thể thanh toán. Xin hãy xem lại giỏ hàng.",
      };
    }

    Logger.debug(`[CartService] Validation SUCCESS for user ${userId}`);
    return {
      isValid: true,
      invalidItems: [],
      message: "Giỏ hàng hợp lệ, sẵn sàng thanh toán.",
    };
  }
}
