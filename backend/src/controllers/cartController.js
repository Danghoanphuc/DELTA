// backend/src/controllers/cartController.js - ĐÃ KHẮC PHỤC 100%
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
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
  }
  return cart;
};

/**
 * Populate thông tin sản phẩm cho giỏ hàng trước khi gửi về client
 */
const populateCart = (cart) => {
  return cart.populate({
    path: "items.productId",
    select: "name images category specifications printerId",
    populate: {
      path: "printerId",
      select: "displayName avatarUrl",
    },
  });
};

// === CONTROLLERS (Khớp với useCartStore) ===

// @desc    Lấy giỏ hàng của user
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
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
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity, selectedPriceIndex, customization } = req.body;

    console.log("📦 Adding to cart:", {
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

    // 6. Populate và trả về
    const populatedCart = await populateCart(cart);

    res.status(200).json({
      success: true,
      message: "Đã thêm vào giỏ hàng!",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("❌ Lỗi addToCart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi thêm vào giỏ hàng.",
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

    // Validation
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

    // Tìm giỏ hàng
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng.",
      });
    }

    // Tìm item cần update
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === cartItemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm trong giỏ.",
      });
    }

    // Validate quantity với minQuantity
    const item = cart.items[itemIndex];
    if (quantity < item.selectedPrice.minQuantity) {
      return res.status(400).json({
        success: false,
        message: `Số lượng tối thiểu là ${item.selectedPrice.minQuantity}.`,
      });
    }

    // Cập nhật số lượng và tính lại subtotal
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = quantity * item.selectedPrice.pricePerUnit;

    // Tính toán lại tổng tiền và lưu
    cart.calculateTotals();
    await cart.save();

    console.log("✅ Cart item updated successfully");

    // Populate và trả về
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

// @desc    Xóa 1 item khỏi giỏ - ĐÃ FIX!
// @route   DELETE /api/cart/remove/:cartItemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItemId } = req.params;

    console.log("🗑️ Removing from cart:", { userId, cartItemId });

    // Validation
    if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ.",
      });
    }

    // Tìm giỏ hàng
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng.",
      });
    }

    // Kiểm tra item có tồn tại không
    const itemExists = cart.items.some(
      (item) => item._id.toString() === cartItemId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không có trong giỏ.",
      });
    }

    // XÓA ITEM BẰNG CÁCH FILTER ARRAY (Thay vì dùng .remove() - đã deprecated)
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== cartItemId
    );

    console.log(
      `✅ Removed item ${cartItemId} from cart. Remaining items: ${cart.items.length}`
    );

    // Tính toán lại tổng tiền và lưu
    cart.calculateTotals();
    await cart.save();

    // Populate và trả về
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

// @desc    Xóa sạch giỏ hàng (sau khi checkout)
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("🧹 Clearing cart for user:", userId);

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      // Nếu không có giỏ, tạo giỏ trống mới
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

    // Xóa tất cả items
    cart.items = [];
    cart.calculateTotals(); // Sẽ reset về 0
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

// @desc    Cập nhật nhiều items cùng lúc (Batch update)
// @route   PUT /api/cart/batch-update
// @access  Private
export const batchUpdateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { updates } = req.body; // Array of { cartItemId, quantity }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu cập nhật không hợp lệ.",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng.",
      });
    }

    // Cập nhật từng item
    updates.forEach(({ cartItemId, quantity }) => {
      const itemIndex = cart.items.findIndex(
        (item) => item._id.toString() === cartItemId
      );

      if (itemIndex !== -1 && quantity >= 1) {
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].subtotal =
          quantity * cart.items[itemIndex].selectedPrice.pricePerUnit;
      }
    });

    cart.calculateTotals();
    await cart.save();

    const populatedCart = await populateCart(cart);

    res.status(200).json({
      success: true,
      message: "Đã cập nhật giỏ hàng!",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("❌ Lỗi batchUpdateCart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống.",
    });
  }
};
