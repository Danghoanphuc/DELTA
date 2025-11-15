// src/modules/cart/cart.repository.js
// ✅ BÀN GIAO: Đã vá lỗi populate (Giải pháp toàn diện)

import { Cart } from "../../shared/models/cart.model.js";
import { Logger } from "../../shared/utils/index.js";

export class CartRepository {
  /**
   * Tìm giỏ hàng bằng UserId
   */
  async findByUserId(userId) {
    Logger.debug(`[CartRepo] Finding cart for user: ${userId}`);
    return await Cart.findOne({ userId });
  }

  /**
   * Tìm hoặc tạo mới giỏ hàng (logic đã chuyển từ controller cũ)
   */
  async findOrCreate(userId) {
    Logger.debug(`[CartRepo] Finding or creating cart for user: ${userId}`);
    let cart = await this.findByUserId(userId);

    if (!cart) {
      Logger.debug(`[CartRepo] Cart not found, creating new cart...`);
      cart = await Cart.create({
        userId,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
      Logger.success(`[CartRepo] New cart created: ${cart._id}`);
    }

    return cart;
  }

  /**
   * Lấy giỏ hàng đã populate (logic đã chuyển từ controller cũ)
   * - Xử lý lỗi sản phẩm đã bị xóa
   * - Tự động dọn dẹp các item không hợp lệ
   * - ✅ VÁ LỖI: Trả về cấu trúc { product: {...}, productId: "..." }
   */
  async getPopulated(cartId) {
    Logger.debug(`[CartRepo] Populating cart: ${cartId}`);

    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        Logger.error(`[CartRepo] CRITICAL: Cart ${cartId} not found`);
        throw new Error(`Cart ${cartId} does not exist`);
      }

      // 1. Populate như cũ (vẫn ghi đè productId)
      const populatedCart = await cart.populate({
        path: "items.productId",
        select: "name images category specifications printerProfileId isActive",
        populate: {
          path: "printerProfileId",
          select: "businessName logoUrl",
        },
      });

      const originalItemCount = populatedCart.items.length;
      const validItems = [];
      const invalidItemIds = [];

      // 2. Logic dọn dẹp (vẫn chạy trên Mongoose doc)
      for (const item of populatedCart.items) {
        // item.productId lúc này là 1 object (hoặc null)
        if (!item.productId) {
          Logger.warn(
            `[CartRepo] Item ${item._id} has null productId (product deleted)`
          );
          invalidItemIds.push(item._id);
          continue;
        }
        // Lọc luôn sản phẩm không còn active
        if (item.productId.isActive === false) {
          Logger.warn(
            `[CartRepo] Item ${item._id} has inactive product: ${item.productId.name}`
          );
          invalidItemIds.push(item._id);
          continue;
        }
        validItems.push(item);
      }

      // 3. Tự động dọn dẹp (vẫn chạy trên Mongoose doc)
      if (invalidItemIds.length > 0) {
        Logger.warn(
          `[CartRepo] Removing ${invalidItemIds.length} invalid items from cart ${cartId}`
        );
        populatedCart.items = validItems;
        populatedCart.calculateTotals();
        await populatedCart.save();
        Logger.success(`[CartRepo] Cart ${cartId} cleaned and saved.`);
      }

      // =======================================================
      // ✅ 4. BƯỚC BIẾN ĐỔI (TRANSFORM) - Fix lỗi Data Mismatch
      // =======================================================
      // Chuyển Mongoose Document thành Plain Old Javascript Object (POJO)
      const cartObject = populatedCart.toObject();

      // "Nắn" lại cấu trúc mảng items
      cartObject.items = cartObject.items
        .filter((item) => item.productId) // Lọc lại những item hợp lệ (phòng trường hợp dọn dẹp)
        .map((item) => {
          // Lấy printerProfileId từ product đã populate hoặc từ item
          const printerProfileId = 
            item.productId?.printerProfileId?._id || 
            item.productId?.printerProfileId || 
            item.printerProfileId;
          
          return {
            ...item,
            product: item.productId, // <-- Đẩy object product vào trường 'product'
            productId: item.productId._id, // <-- Phục hồi 'productId' về dạng string ID
            printerProfileId: printerProfileId
              ? printerProfileId.toString()
              : null,
          };
        });

      return cartObject; // Trả về POJO đã được "nắn"
    } catch (error) {
      Logger.error(`[CartRepo] FATAL error in getPopulated:`, error);
      throw error;
    }
  }

  /**
   * Lưu giỏ hàng
   */
  async save(cart) {
    Logger.debug(`[CartRepo] Saving cart: ${cart._id}`);
    try {
      cart.calculateTotals(); // Luôn tính toán lại trước khi save
      const savedCart = await cart.save();
      Logger.success(`[CartRepo] Cart saved successfully: ${savedCart._id}`);
      return savedCart;
    } catch (error) {
      Logger.error(`[CartRepo] Error saving cart ${cart._id}:`, error);
      throw error;
    }
  }
}
