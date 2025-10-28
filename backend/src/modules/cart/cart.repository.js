// src/modules/cart/cart.repository.js

import { Cart } from "../../models/Cart.js";
import { Logger } from "../../shared/utils/index.js";

export class CartRepository {
  // ... (các hàm khác giữ nguyên) ...

  async getPopulated(cartId) {
    Logger.debug("=== POPULATE CART START ===");
    Logger.debug("1. Populating cart:", cartId);

    try {
      // ✅ Populate và kiểm tra lỗi
      const populatedCart = await Cart.findById(cartId).populate({
        path: "items.productId",
        select: "name images category specifications printerId", // Lấy đủ thông tin cần thiết
        populate: {
          path: "printerId",
          select: "displayName avatarUrl", // Lấy thông tin nhà in
        },
      });

      // ✅ Kiểm tra nếu không tìm thấy Cart hoặc populate lỗi trả về null
      if (!populatedCart) {
        Logger.error("Cart not found or failed to populate:", cartId);
        return null; // Trả về null để service biết có lỗi
      }

      Logger.debug(
        "2. Cart found, initial items count:",
        populatedCart.items?.length || 0
      );

      // ✅ Lọc bỏ các item có productId bị null (do sản phẩm bị xóa)
      const originalItemCount = populatedCart.items.length;
      const validItems = populatedCart.items.filter((item) => {
        if (!item.productId) {
          Logger.warn(`Item ${item._id} has null productId, removing.`);
          return false;
        }
        return true;
      });

      // ✅ Tự động cập nhật lại giỏ hàng nếu có item bị lọc bỏ
      if (validItems.length < originalItemCount) {
        Logger.warn(
          `Removed ${
            originalItemCount - validItems.length
          } invalid items from cart ${cartId}. Updating DB.`
        );
        populatedCart.items = validItems;
        populatedCart.calculateTotals();
        await populatedCart.save(); // Lưu lại giỏ hàng đã được làm sạch
      }

      Logger.debug("3. Populated cart final:", {
        cartId: populatedCart._id,
        itemsCount: populatedCart.items.length,
        totalAmount: populatedCart.totalAmount,
      });

      Logger.debug("=== POPULATE CART END ===");
      return populatedCart; // Trả về giỏ hàng đã populate và hợp lệ
    } catch (error) {
      Logger.error(`Error populating cart ${cartId}:`, error);
      console.error("!!! ERROR IN getPopulated CATCH:", error);
      throw error; // Ném lỗi để service và controller bắt được
    }
  }

  async save(cart) {
    // ... (Hàm save giữ nguyên, có thể thêm log chi tiết hơn nếu muốn) ...
    Logger.debug("Saving cart to DB:", {
      /* ... */
    });
    try {
      const savedCart = await cart.save();
      if (!savedCart || !savedCart._id) {
        Logger.error(
          "Cart save returned invalid result for cartId (potential):",
          cart._id
        );
        throw new Error("Cart save operation failed silently.");
      }
      Logger.debug("Cart saved successfully:", { cartId: savedCart._id });
      return savedCart;
    } catch (error) {
      Logger.error(`Error saving cart ${cart._id}:`, error);
      throw error;
    }
  }

  // ... (các hàm khác findByUserId, findOrCreate giữ nguyên) ...
}
