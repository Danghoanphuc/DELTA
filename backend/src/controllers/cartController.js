// backend/src/controllers/cartController.js
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

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
    select: "name images category specifications",
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

    res.status(200).json({ cart: populatedCart });
  } catch (error) {
    console.error("Lỗi getCart:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi lấy giỏ hàng." });
  }
};

// @desc    Thêm sản phẩm vào giỏ
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    // Lấy payload từ frontend
    const { productId, quantity, selectedPriceIndex, customization } = req.body;

    // 1. Kiểm tra Product và Price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    const priceTier = product.pricing[selectedPriceIndex || 0];
    if (!priceTier) {
      return res.status(400).json({ message: "Mức giá không hợp lệ." });
    }

    if (quantity < priceTier.minQuantity) {
      return res.status(400).json({
        message: `Số lượng tối thiểu là ${priceTier.minQuantity}.`,
      });
    }

    // 2. Tìm giỏ hàng
    const cart = await findOrCreateCart(userId);

    // 3. Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    const subtotal = quantity * priceTier.pricePerUnit;

    if (existingItem) {
      // Cập nhật item đã có
      existingItem.quantity = quantity;
      existingItem.selectedPrice = priceTier;
      existingItem.customization = customization;
      existingItem.subtotal = subtotal;
    } else {
      // Thêm item mới
      cart.items.push({
        productId,
        quantity,
        selectedPrice: priceTier,
        customization,
        subtotal,
      });
    }

    // 4. Tính toán lại tổng tiền và lưu
    cart.calculateTotals();
    await cart.save();

    const populatedCart = await populateCart(cart);
    res.status(200).json({ cart: populatedCart });
  } catch (error) {
    console.error("Lỗi addToCart:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi thêm vào giỏ hàng." });
  }
};

// @desc    Cập nhật số lượng item
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItemId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0." });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng." });
    }

    // Dùng .id() của Mongoose để tìm sub-document
    const item = cart.items.id(cartItemId);
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    // Cập nhật số lượng và tính lại subtotal
    item.quantity = quantity;
    item.subtotal = item.quantity * item.selectedPrice.pricePerUnit;

    // Tính toán lại tổng tiền và lưu
    cart.calculateTotals();
    await cart.save();

    const populatedCart = await populateCart(cart);
    res.status(200).json({ cart: populatedCart });
  } catch (error) {
    console.error("Lỗi updateCartItem:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi cập nhật giỏ hàng." });
  }
};

// @desc    Xóa 1 item khỏi giỏ
// @route   DELETE /api/cart/remove/:cartItemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng." });
    }

    const item = cart.items.id(cartItemId);
    if (item) {
      // Xóa sub-document
      await item.remove();
    } else {
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ." });
    }

    // Tính toán lại tổng tiền và lưu
    cart.calculateTotals();
    await cart.save();

    const populatedCart = await populateCart(cart);
    res.status(200).json({ cart: populatedCart });
  } catch (error) {
    console.error("Lỗi removeFromCart:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi xóa sản phẩm." });
  }
};

// @desc    Xóa sạch giỏ hàng (sau khi checkout)
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });

    if (cart) {
      cart.items = [];
      cart.calculateTotals(); // Sẽ reset về 0
      await cart.save();
      res.status(200).json({ cart });
    } else {
      res.status(404).json({ message: "Không tìm thấy giỏ hàng." });
    }
  } catch (error) {
    console.error("Lỗi clearCart:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi xóa giỏ hàng." });
  }
};
