// src/modules/cart/cart.service.js
// ✅ BÀN GIAO: File Service MỚI, chứa toàn bộ logic nghiệp vụ của Cart

import { CartRepository } from "./cart.repository.js";
import { ProductRepository } from "../products/product.repository.js";
import { Product } from "../../shared/models/product.model.js"; // Dùng cho N+1 fix
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import mongoose from "mongoose";
import { Logger } from "../../shared/utils/index.js";

export class CartService {
  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
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
    });

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

  /**
   * Cập nhật số lượng
   */
  async updateCartItem(userId, updateData) {
    const { cartItemId, quantity } = updateData;
    Logger.debug(
      `[CartService] Updating item ${cartItemId} to qty ${quantity}`
    );

    if (
      !cartItemId ||
      !mongoose.Types.ObjectId.isValid(cartItemId) ||
      !quantity ||
      quantity < 1
    ) {
      throw new ValidationException("Thông tin cập nhật không hợp lệ.");
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException("Không tìm thấy giỏ hàng.");
    }

    const item = cart.items.id(cartItemId);
    if (!item) {
      throw new NotFoundException("Không tìm thấy sản phẩm trong giỏ.");
    }

    if (item.selectedPrice && quantity < item.selectedPrice.minQuantity) {
      throw new ValidationException(
        `Số lượng tối thiểu là ${item.selectedPrice.minQuantity}.`
      );
    }

    item.quantity = quantity;
    item.subtotal = quantity * (item.selectedPrice?.pricePerUnit || 0);

    const savedCart = await this.cartRepository.save(cart);
    return await this.cartRepository.getPopulated(savedCart._id);
  }

  /**
   * Xóa sản phẩm khỏi giỏ
   */
  async removeFromCart(userId, cartItemId) {
    Logger.debug(`[CartService] Removing item ${cartItemId} from cart`);
    if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
      throw new ValidationException("ID sản phẩm không hợp lệ.");
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException("Không tìm thấy giỏ hàng.");
    }

    if (!cart.items.id(cartItemId)) {
      throw new NotFoundException("Sản phẩm không có trong giỏ để xóa.");
    }

    cart.items.pull({ _id: cartItemId });

    const savedCart = await this.cartRepository.save(cart);
    return await this.cartRepository.getPopulated(savedCart._id);
  }

  /**
   * Xóa sạch giỏ hàng
   */
  async clearCart(userId) {
    Logger.debug(`[CartService] Clearing cart for user: ${userId}`);
    const cart = await this.cartRepository.findOrCreate(userId);
    cart.items = [];
    return await this.cartRepository.save(cart);
  }
}
