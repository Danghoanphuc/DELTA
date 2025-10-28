// src/modules/cart/cart.repository.js (✅ FIXED - ROBUST VERSION)

import { Cart } from "../../shared/models/cart.model.js";
import { Logger } from "../../shared/utils/index.js";

export class CartRepository {
  /**
   * Find cart by user ID
   */
  async findByUserId(userId) {
    Logger.debug("=== FIND CART BY USER ID ===");
    Logger.debug("User ID:", userId);

    const cart = await Cart.findOne({ userId });

    Logger.debug(
      "Cart found:",
      cart ? { id: cart._id, items: cart.items.length } : null
    );
    return cart;
  }

  /**
   * Find or create cart for user
   */
  async findOrCreate(userId) {
    Logger.debug("=== FIND OR CREATE CART ===");
    Logger.debug("User ID:", userId);

    let cart = await this.findByUserId(userId);

    if (!cart) {
      Logger.debug("Cart not found, creating new cart...");
      cart = await Cart.create({
        userId,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
      Logger.success("New cart created:", { id: cart._id });
    }

    return cart;
  }

  /**
   * ✅ FIXED: Populate cart with ROBUST error handling
   * - Handles deleted products gracefully
   * - Auto-cleans invalid items
   * - Never returns null
   * - Logs all issues for debugging
   */
  async getPopulated(cartId) {
    Logger.debug("=== POPULATE CART START (ROBUST VERSION) ===");
    Logger.debug("Cart ID:", cartId);

    try {
      // 1. Fetch cart with basic data first
      const cart = await Cart.findById(cartId);

      if (!cart) {
        Logger.error(`CRITICAL: Cart ${cartId} not found in database`);
        throw new Error(`Cart ${cartId} does not exist`);
      }

      Logger.debug("Cart found, items count:", cart.items.length);

      // 2. Attempt to populate products
      let populatedCart;
      try {
        populatedCart = await cart.populate({
          path: "items.productId",
          select: "name images category specifications printerId isActive",
          populate: {
            path: "printerId",
            select: "displayName avatarUrl",
          },
        });

        Logger.debug("Populate completed");
      } catch (populateError) {
        Logger.error("Populate failed:", populateError);
        // Return unpopulated cart if populate fails
        Logger.warn("Returning unpopulated cart due to populate error");
        return cart;
      }

      // 3. Filter out invalid items (deleted products, inactive products)
      const originalItemCount = populatedCart.items.length;
      const validItems = [];
      const invalidItemIds = [];

      for (const item of populatedCart.items) {
        // Check if product exists and is active
        if (!item.productId) {
          Logger.warn(`Item ${item._id} has null productId (product deleted)`);
          invalidItemIds.push(item._id);
          continue;
        }

        if (item.productId.isActive === false) {
          Logger.warn(
            `Item ${item._id} has inactive product: ${item.productId.name}`
          );
          invalidItemIds.push(item._id);
          continue;
        }

        // Item is valid
        validItems.push(item);
      }

      // 4. Auto-clean invalid items from cart
      if (invalidItemIds.length > 0) {
        Logger.warn(
          `Removing ${invalidItemIds.length} invalid items from cart ${cartId}`
        );

        populatedCart.items = validItems;
        populatedCart.calculateTotals();

        try {
          await populatedCart.save();
          Logger.success(
            `Cart ${cartId} cleaned: removed ${invalidItemIds.length} items`
          );
        } catch (saveError) {
          Logger.error("Failed to save cleaned cart:", saveError);
          // Continue anyway - user will see cleaned cart
        }
      }

      Logger.debug("Final cart:", {
        cartId: populatedCart._id,
        itemsCount: populatedCart.items.length,
        totalAmount: populatedCart.totalAmount,
        removedItems: invalidItemIds.length,
      });

      Logger.debug("=== POPULATE CART END ===");
      return populatedCart;
    } catch (error) {
      Logger.error(`FATAL: Error in getPopulated for cart ${cartId}:`, error);
      throw error; // Re-throw to be handled by service layer
    }
  }

  /**
   * Save cart to database
   */
  async save(cart) {
    Logger.debug("=== SAVE CART ===");
    Logger.debug("Cart ID:", cart._id);
    Logger.debug("Items count:", cart.items.length);

    try {
      const savedCart = await cart.save();

      if (!savedCart || !savedCart._id) {
        Logger.error("Cart save returned invalid result");
        throw new Error("Cart save operation failed");
      }

      Logger.success("Cart saved successfully:", { cartId: savedCart._id });
      return savedCart;
    } catch (error) {
      Logger.error(`Error saving cart ${cart._id}:`, error);
      throw error;
    }
  }
}
