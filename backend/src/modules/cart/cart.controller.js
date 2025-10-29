// backend/src/modules/cart/cart.controller.js (✅ UPDATED - GUEST CART SUPPORT)
import { Cart } from "../../shared/models/cart.model.js";
import { Product } from "../../shared/models/product.model.js";
import mongoose from "mongoose";

// === HELPER FUNCTIONS ===

/**
 * Tìm hoặc tạo mới giỏ hàng cho user
 */
const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [],
      totalItems: 0,
      totalAmount: 0,
    });
    console.log("✅ Created new cart for user:", userId);
  }
  return cart;
};

/**
 * ✅ FIXED: Populate thông tin sản phẩm cho giỏ hàng với error handling
 */
const populateCart = async (cart) => {
  try {
    console.log("🔄 Populating cart:", cart._id);

    const populatedCart = await cart.populate({
      path: "items.productId",
      select: "name images category specifications printerId",
      populate: {
        path: "printerId",
        select: "displayName avatarUrl",
      },
    });

    const originalItemCount = populatedCart.items.length;
    const validItems = populatedCart.items.filter((item) => {
      if (!item.productId || item.productId === null) {
        console.warn(
          `⚠️ Item ${item._id} has null productId (product deleted), removing from cart`
        );
        return false;
      }
      return true;
    });

    if (validItems.length < originalItemCount) {
      console.log(
        `🗑️ Removed ${
          originalItemCount - validItems.length
        } invalid items from cart`
      );
      populatedCart.items = validItems;
      populatedCart.calculateTotals();
      await populatedCart.save();
    }

    console.log("✅ Cart populated successfully:", {
      cartId: populatedCart._id,
      itemsCount: populatedCart.items.length,
      totalAmount: populatedCart.totalAmount,
    });

    return populatedCart;
  } catch (error) {
    console.error("❌ Error populating cart:", error);
    return cart;
  }
};

// === CONTROLLERS ===

// @desc    Lấy giỏ hàng của user
// @route   GET /api/cart
// @access  Public with optionalAuth
export const getCart = async (req, res) => {
  try {
    // ✅ NEW: Check if user is authenticated
    if (!req.user) {
      // Guest user - return empty cart structure
      // Frontend will handle cart from localStorage
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          totalItems: 0,
          totalAmount: 0,
          isGuest: true,
          message: "Giỏ hàng tạm thời - Đăng nhập để lưu giỏ hàng",
        },
      });
    }

    // Authenticated user - get cart from database
    const userId = req.user._id;
    console.log("📦 Getting cart for authenticated user:", userId);

    const cart = await findOrCreateCart(userId);
    const populatedCart = await populateCart(cart);

    res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("❌ Lỗi getCart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy giỏ hàng.",
    });
  }
};

// @desc    Thêm sản phẩm vào giỏ
// @route   POST /api/cart/add
// @access  Private (requireAuth middleware ensures req.user exists)
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id; // requireAuth ensures this exists
    const { productId, quantity, selectedPriceIndex, customization } = req.body;

    console.log("➕ Adding to cart:", {
      userId,
      productId,
      quantity,
      selectedPriceIndex,
    });

    // 1. Validation input
    if (!productId || !quantity || selectedPriceIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin sản phẩm.",
      });
    }

    // 2. Kiểm tra Product và Price
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm hoặc sản phẩm đã ngưng kinh doanh.",
      });
    }

    const priceTier = product.pricing[selectedPriceIndex];
    if (!priceTier) {
      return res.status(400).json({
        success: false,
        message: "Mức giá không hợp lệ.",
      });
    }

    if (quantity < priceTier.minQuantity) {
      return res.status(400).json({
        success: false,
        message: `Số lượng tối thiểu là ${priceTier.minQuantity}.`,
      });
    }

    // 3. Tìm hoặc tạo giỏ hàng
    const cart = await findOrCreateCart(userId);

    // 4. Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    const subtotal = quantity * priceTier.pricePerUnit;

    if (existingItemIndex !== -1) {
      // Cập nhật item đã có
      cart.items[existingItemIndex].quantity = quantity;
      cart.items[existingItemIndex].selectedPrice = {
        minQuantity: priceTier.minQuantity,
        pricePerUnit: priceTier.pricePerUnit,
        maxQuantity: priceTier.maxQuantity,
      };
      cart.items[existingItemIndex].customization = customization || {};
      cart.items[existingItemIndex].subtotal = subtotal;

      console.log("✅ Updated existing item in cart");
    } else {
      // Thêm item mới
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

      console.log("✅ Added new item to cart");
    }

    // 5. Tính toán lại tổng tiền và lưu
    cart.calculateTotals();
    await cart.save();

    console.log("💾 Cart saved, now populating...");

    // 6. Populate và xử lý error
    let populatedCart;
    try {
      populatedCart = await populateCart(cart);

      if (!populatedCart || !populatedCart._id) {
        throw new Error("Populate failed - cart is null");
      }
      console.log("✅ Cart populated successfully:", {
        cartId: populatedCart._id,
        itemsCount: populatedCart.items.length,
      });
    } catch (populateError) {
      console.error(
        "⚠️ Populate error, using unpopulated cart:",
        populateError.message
      );
      populatedCart = cart;
    }

    // 7. Response
    res.status(200).json({
      success: true,
      message: "Đã thêm vào giỏ hàng!",
      cart: populatedCart.toObject ? populatedCart.toObject() : populatedCart,
    });
  } catch (error) {
    console.error("❌ Lỗi addToCart:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi thêm vào giỏ hàng.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    ✨ NEW: Merge guest cart from localStorage into authenticated cart
// @route   POST /api/cart/merge
// @access  Private
export const mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items: guestItems } = req.body;

    console.log("🔄 Merging guest cart for user:", userId);
    console.log("Guest cart items:", guestItems?.length || 0);

    if (!guestItems || !Array.isArray(guestItems) || guestItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có sản phẩm nào để merge.",
      });
    }

    // Get or create authenticated cart
    const cart = await findOrCreateCart(userId);

    let mergedCount = 0;
    let skippedCount = 0;

    // Process each guest item
    for (const guestItem of guestItems) {
      try {
        const { productId, quantity, selectedPriceIndex, customization } =
          guestItem;

        // Validate product exists and is active
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
          console.warn(`⚠️ Skipping invalid product: ${productId}`);
          skippedCount++;
          continue;
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
          (item) => item.productId.toString() === productId
        );

        const priceTier = product.pricing[selectedPriceIndex];
        if (!priceTier) {
          console.warn(`⚠️ Invalid price tier for product: ${productId}`);
          skippedCount++;
          continue;
        }

        const subtotal = quantity * priceTier.pricePerUnit;

        if (existingItemIndex !== -1) {
          // Item exists - increase quantity
          const newQuantity = cart.items[existingItemIndex].quantity + quantity;
          cart.items[existingItemIndex].quantity = newQuantity;
          cart.items[existingItemIndex].subtotal =
            newQuantity * priceTier.pricePerUnit;
          console.log(`✅ Merged item (increased quantity): ${productId}`);
        } else {
          // New item - add to cart
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
          console.log(`✅ Merged new item: ${productId}`);
        }

        mergedCount++;
      } catch (itemError) {
        console.error(`❌ Error processing guest item:`, itemError);
        skippedCount++;
      }
    }

    // Recalculate totals and save
    cart.calculateTotals();
    await cart.save();

    // Populate and return
    const populatedCart = await populateCart(cart);

    res.status(200).json({
      success: true,
      message: `Đã merge ${mergedCount} sản phẩm vào giỏ hàng${
        skippedCount > 0 ? ` (${skippedCount} sản phẩm không hợp lệ)` : ""
      }`,
      cart: populatedCart,
      stats: {
        merged: mergedCount,
        skipped: skippedCount,
        total: cart.items.length,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi mergeGuestCart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi merge giỏ hàng.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Cập nhật số lượng item
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItemId, quantity } = req.body;

    console.log("🔄 Updating cart item:", { cartItemId, quantity });

    if (!cartItemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin cập nhật.",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải lớn hơn 0.",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng.",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === cartItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm trong giỏ.",
      });
    }

    const item = cart.items[itemIndex];
    if (quantity < item.selectedPrice.minQuantity) {
      return res.status(400).json({
        success: false,
        message: `Số lượng tối thiểu là ${item.selectedPrice.minQuantity}.`,
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = quantity * item.selectedPrice.pricePerUnit;

    cart.calculateTotals();
    await cart.save();

    console.log("✅ Cart item updated successfully");

    const populatedCart = await populateCart(cart);

    res.status(200).json({
      success: true,
      message: "Đã cập nhật giỏ hàng!",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("❌ Lỗi updateCartItem:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật giỏ hàng.",
    });
  }
};

// @desc    Xóa 1 item khỏi giỏ
// @route   DELETE /api/cart/remove/:cartItemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItemId } = req.params;

    console.log("🗑️ Removing from cart:", { userId, cartItemId });

    if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ.",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng.",
      });
    }

    const itemExists = cart.items.some(
      (item) => item._id.toString() === cartItemId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không có trong giỏ.",
      });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== cartItemId
    );

    console.log(
      `✅ Removed item ${cartItemId} from cart. Remaining items: ${cart.items.length}`
    );

    cart.calculateTotals();
    await cart.save();

    const populatedCart = await populateCart(cart);

    res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm khỏi giỏ hàng!",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("❌ Lỗi removeFromCart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa sản phẩm.",
    });
  }
};

// @desc    Xóa sạch giỏ hàng
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("🧹 Clearing cart for user:", userId);

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      const newCart = await Cart.create({
        userId,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });

      return res.status(200).json({
        success: true,
        message: "Giỏ hàng đã được làm sạch!",
        cart: newCart,
      });
    }

    cart.items = [];
    cart.calculateTotals();
    await cart.save();

    console.log("✅ Cart cleared successfully");

    res.status(200).json({
      success: true,
      message: "Giỏ hàng đã được làm sạch!",
      cart,
    });
  } catch (error) {
    console.error("❌ Lỗi clearCart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xóa giỏ hàng.",
    });
  }
};
