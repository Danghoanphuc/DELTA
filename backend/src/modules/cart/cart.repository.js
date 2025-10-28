// src/modules/cart/cart.repository.js
import { Cart } from "../../models/Cart.js";

export class CartRepository {
  async findByUserId(userId) {
    return await Cart.findOne({ userId });
  }

  async findOrCreate(userId) {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    }
    return cart;
  }

  async getPopulated(cartId) {
    return await Cart.findById(cartId).populate({
      path: "items.productId",
      select: "name images category specifications printerId",
      populate: {
        path: "printerId",
        select: "displayName avatarUrl",
      },
    });
  }

  async save(cart) {
    return await cart.save();
  }
}
