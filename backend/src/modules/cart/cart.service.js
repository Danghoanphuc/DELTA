// src/modules/cart/cart.service.js (✅ FIXED - COMPREHENSIVE VERSION)

import { CartRepository } from "./cart.repository.js";
import { ProductRepository } from "../products/product.repository.js";
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
   * Get user's cart
   */
  async getCart(userId) {
    Logger.debug("=== GET CART SERVICE ===");
    Logger.debug("User ID:", userId);

    const cart = await this.cartRepository.findOrCreate(userId);
    const populatedCart = await this.cartRepository.getPopulated(cart._id);

    Logger.debug("Cart retrieved:", {
      cartId: populatedCart._id,
      items: populatedCart.items.length,
    });

    return populatedCart;
  }

  /**
   * ✅ FIXED: Add to cart with comprehensive validation and error handling
   */
  async addToCart(userId, itemData) {
    Logger.debug("=== ADD TO CART SERVICE START ===");
    Logger.debug("User ID:", userId);
    Logger.debug("Item Data:", itemData);

    const { productId, quantity, selectedPriceIndex, customization } = itemData;

    // ========================================
    // 1. VALIDATE INPUT
    // ========================================
    if (!productId || !quantity || selectedPriceIndex === undefined) {
      Logger.error("Missing required fields:", {
        productId,
        quantity,
        selectedPriceIndex,
      });
      throw new ValidationException(
        "Thiếu thông tin sản phẩm (productId, quantity, hoặc selectedPriceIndex)."
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      Logger.error("Invalid productId format:", productId);
      throw new ValidationException("ID sản phẩm không hợp lệ.");
    }

    // ========================================
    // 2. VALIDATE PRODUCT EXISTS & ACTIVE
    // ========================================
    Logger.debug("Fetching product:", productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      Logger.error("Product not found:", productId);
      throw new NotFoundException("Sản phẩm", productId);
    }

    if (!product.isActive) {
      Logger.warn("Product is inactive:", {
        id: productId,
        name: product.name,
      });
      throw new ValidationException("Sản phẩm này đã ngừng kinh doanh.");
    }

    Logger.debug("Product found:", {
      id: product._id,
      name: product.name,
      isActive: product.isActive,
    });

    // ========================================
    // 3. VALIDATE PRICE TIER
    // ========================================
    const priceTier = product.pricing[selectedPriceIndex];
    if (!priceTier) {
      Logger.error("Invalid price tier index:", {
        selectedPriceIndex,
        availableTiers: product.pricing.length,
      });
      throw new ValidationException("Mức giá không hợp lệ.");
    }

    if (quantity < priceTier.minQuantity) {
      Logger.warn("Quantity below minimum:", {
        quantity,
        minQuantity: priceTier.minQuantity,
      });
      throw new ValidationException(
        `Số lượng tối thiểu là ${priceTier.minQuantity}.`
      );
    }

    Logger.debug("Price tier validated:", priceTier);

    // ========================================
    // 4. GET OR CREATE CART
    // ========================================
    const cart = await this.cartRepository.findOrCreate(userId);
    Logger.debug("Cart retrieved:", {
      cartId: cart._id,
      currentItems: cart.items.length,
    });

    // ========================================
    // 5. CHECK IF ITEM ALREADY EXISTS
    // ========================================
    cart.items[existingItemIndex].customization = customization || {};

    const subtotal = quantity * priceTier.pricePerUnit;
    Logger.debug("Calculated subtotal:", subtotal);

    // ========================================
    // 6. UPDATE OR ADD ITEM
    // ========================================
    if (existingItemIndex !== -1) {
      Logger.debug("Item already exists in cart, updating...");

      // Update existing item
      cart.items[existingItemIndex] = {
        ...cart.items[existingItemIndex].toObject(),
        quantity: quantity,
        selectedPrice: {
          minQuantity: priceTier.minQuantity,
          pricePerUnit: priceTier.pricePerUnit,
          maxQuantity: priceTier.maxQuantity,
        },
        customization: customization || {},
        subtotal: subtotal,
      };

      Logger.success("Item updated in cart");
    } else {
      Logger.debug("Adding new item to cart...");

      // Add new item
      cart.items.push({
        _id: new mongoose.Types.ObjectId(),
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

      Logger.success("New item added to cart");
    }

    // ========================================
    // 7. RECALCULATE TOTALS
    // ========================================
    cart.calculateTotals();
    Logger.debug("Totals calculated:", {
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
    });

    // ========================================
    // 8. SAVE CART
    // ========================================
    try {
      const savedCart = await this.cartRepository.save(cart);
      Logger.success("Cart saved:", { cartId: savedCart._id });

      // ========================================
      // 9. POPULATE AND RETURN
      // ========================================
      try {
        const populatedCart = await this.cartRepository.getPopulated(
          savedCart._id
        );

        if (!populatedCart) {
          Logger.error(
            `CRITICAL: Failed to populate cart after save: ${savedCart._id}`
          );
          // ✅ FALLBACK: Return unpopulated cart instead of failing
          Logger.warn("Returning unpopulated cart as fallback");
          return savedCart;
        }

        Logger.success("Cart populated successfully");
        Logger.debug("=== ADD TO CART SERVICE END ===");
        return populatedCart;
      } catch (populateError) {
        Logger.error("Populate error after save:", populateError);
        // ✅ FALLBACK: Return unpopulated cart
        Logger.warn("Returning unpopulated cart due to populate error");
        return savedCart;
      }
    } catch (saveError) {
      Logger.error("FATAL: Failed to save cart:", saveError);
      throw new Error("Không thể lưu giỏ hàng. Vui lòng thử lại.");
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(userId, updateData) {
    Logger.debug("=== UPDATE CART ITEM SERVICE ===");

    const { cartItemId, quantity } = updateData;

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
      Logger.warn("Quantity below minimum:", {
        quantity,
        minQuantity: item.selectedPrice.minQuantity,
      });
    }

    item.quantity = quantity;
    item.subtotal = quantity * (item.selectedPrice?.pricePerUnit || 0);

    cart.calculateTotals();
    const savedCart = await this.cartRepository.save(cart);

    const populatedCart = await this.cartRepository.getPopulated(savedCart._id);
    return populatedCart || savedCart;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId, cartItemId) {
    Logger.debug("=== REMOVE FROM CART SERVICE ===");

    if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
      throw new ValidationException("ID sản phẩm không hợp lệ.");
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException("Không tìm thấy giỏ hàng.");
    }

    const item = cart.items.id(cartItemId);
    if (!item) {
      Logger.warn(`Item ${cartItemId} not found in cart during removal`);
      throw new NotFoundException("Sản phẩm không có trong giỏ để xóa.");
    }

    cart.items.pull({ _id: cartItemId });
    cart.calculateTotals();
    const savedCart = await this.cartRepository.save(cart);

    const populatedCart = await this.cartRepository.getPopulated(savedCart._id);
    return populatedCart || savedCart;
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId) {
    Logger.debug("=== CLEAR CART SERVICE ===");

    const cart = await this.cartRepository.findOrCreate(userId);
    cart.items = [];
    cart.calculateTotals();
    const savedCart = await this.cartRepository.save(cart);

    return savedCart;
  }
}
