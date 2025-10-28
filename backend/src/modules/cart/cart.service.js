// src/modules/cart/cart.service.js
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

  async getCart(userId) {
    const cart = await this.cartRepository.findOrCreate(userId);
    return await this.cartRepository.getPopulated(cart._id);
  }

  async addToCart(userId, itemData) {
    Logger.debug("--- Add to Cart Service ---");
    Logger.debug("1. Received itemData:", itemData);
    Logger.debug("1. Received userId:", userId);


    const { productId, quantity, selectedPriceIndex, customization } = itemData;

    if (!productId || !quantity || selectedPriceIndex === undefined) {
      throw new ValidationException("Thiếu thông tin sản phẩm.");
    }

    const product = await this.productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new NotFoundException(
        "Không tìm thấy sản phẩm hoặc sản phẩm đã ngưng kinh doanh."
      );
    }
    Logger.debug("2. Found product:", { name: product.name, _id: product._id });


    const priceTier = product.pricing[selectedPriceIndex];
    if (!priceTier) {
      throw new ValidationException("Mức giá không hợp lệ.");
    }
    if (quantity < priceTier.minQuantity) {
      throw new ValidationException(
        `Số lượng tối thiểu là ${priceTier.minQuantity}.`
      );
    }

    const cart = await this.cartRepository.findOrCreate(userId);
    Logger.debug("3. Found or created cart:", { cartId: cart._id, currentItems: cart.items.length });


    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    const subtotal = quantity * priceTier.pricePerUnit;

    if (existingItemIndex !== -1) {
      Logger.debug("4. Updating existing item in cart");
      cart.items[existingItemIndex].quantity = quantity;
      cart.items[existingItemIndex].selectedPrice = priceTier;
      cart.items[existingItemIndex].customization = customization || {};
      cart.items[existingItemIndex].subtotal = subtotal;
    } else {
      Logger.debug("4. Adding new item to cart");
      cart.items.push({
        productId,
        quantity,
        selectedPrice: priceTier,
        customization: customization || {},
        subtotal,
      });
    }

    Logger.debug("5. Cart before saving:", JSON.stringify(cart.toObject(), null, 2));


    cart.markModified('items');
    cart.calculateTotals();
    
    Logger.debug("6. Cart totals calculated:", { totalItems: cart.totalItems, totalAmount: cart.totalAmount });


    const savedCart = await this.cartRepository.save(cart);
    Logger.debug("7. Cart saved:", { savedCartId: savedCart._id });


    const populatedCart = await this.cartRepository.getPopulated(savedCart._id);
    Logger.debug("8. Final populated cart:", JSON.stringify(populatedCart.toObject(), null, 2));

    return populatedCart;
  }

  async updateCartItem(userId, updateData) {
    const { cartItemId, quantity } = updateData;

    if (!cartItemId || !quantity || quantity < 1) {
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

    if (quantity < item.selectedPrice.minQuantity) {
      throw new ValidationException(
        `Số lượng tối thiểu là ${item.selectedPrice.minQuantity}.`
      );
    }

    item.quantity = quantity;
    item.subtotal = quantity * item.selectedPrice.pricePerUnit;

    cart.markModified('items');
    cart.calculateTotals();
    const savedCart = await this.cartRepository.save(cart);
    return await this.cartRepository.getPopulated(savedCart._id);
  }

  async removeFromCart(userId, cartItemId) {
    if (!cartItemId || !mongoose.Types.ObjectId.isValid(cartItemId)) {
      throw new ValidationException("ID sản phẩm không hợp lệ.");
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException("Không tìm thấy giỏ hàng.");
    }

    const item = cart.items.id(cartItemId);
    if (!item) {
      throw new NotFoundException("Sản phẩm không có trong giỏ.");
    }

    item.remove();

    cart.markModified('items');
    cart.calculateTotals();
    const savedCart = await this.cartRepository.save(cart);
    return await this.cartRepository.getPopulated(savedCart._id);
  }

  async clearCart(userId) {
    const cart = await this.cartRepository.findOrCreate(userId);
    cart.items = [];
    cart.calculateTotals();
    const savedCart = await this.cartRepository.save(cart);
    return savedCart;
  }
}
