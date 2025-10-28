// src/modules/cart/cart.service.js
import { CartRepository } from "./cart.repository.js";
import { ProductRepository } from "../products/product.repository.js";
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import mongoose from "mongoose";
import { Logger } from "../../shared/utils/index.js"; // Đảm bảo Logger được import

export class CartService {
  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
  }

  async getCart(userId) {
    const cart = await this.cartRepository.findOrCreate(userId);
    // Gọi getPopulated để lấy giỏ hàng chi tiết
    const populatedCart = await this.cartRepository.getPopulated(cart._id);
    // Nếu getPopulated trả về null (do lỗi hoặc không tìm thấy), trả về giỏ hàng cơ bản
    return populatedCart || cart;
  }

  async addToCart(userId, itemData) {
    Logger.debug("--- Add to Cart Service ---");
    Logger.debug("1. Received itemData:", itemData);
    Logger.debug("1. Received userId:", userId);

    const { productId, quantity, selectedPriceIndex, customization } = itemData;

    // --- Validation (Sản phẩm, giá, số lượng) ---
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
    // --- Kết thúc Validation ---

    const cart = await this.cartRepository.findOrCreate(userId);
    Logger.debug("3. Found or created cart:", {
      cartId: cart._id,
      currentItems: cart.items.length,
    });

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    const subtotal = quantity * priceTier.pricePerUnit;

    // ✅ Tạo mảng items mới để đảm bảo Mongoose nhận diện thay đổi
    let newItems = [...cart.items];

    if (existingItemIndex !== -1) {
      Logger.debug(
        "4. Updating existing item in cart array (creating new array)"
      );
      // Tạo object item mới thay vì sửa trực tiếp
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex].toObject(), // Chuyển subdocument thành object thường để sửa
        quantity: quantity,
        selectedPrice: priceTier, // Lưu cả priceTier thay vì chỉ selectedPrice
        customization: customization || {},
        subtotal: subtotal,
      };
    } else {
      Logger.debug("4. Adding new item to cart array (creating new array)");
      // Thêm item mới vào mảng
      newItems.push({
        _id: new mongoose.Types.ObjectId(), // Tạo _id mới cho subdocument
        productId,
        quantity,
        selectedPrice: priceTier, // Lưu cả priceTier
        customization: customization || {},
        subtotal,
      });
    }

    // ✅ Gán mảng mới vào cart
    cart.items = newItems;

    Logger.debug(
      "5. Cart items prepared:",
      cart.items.map((i) => ({
        pId: i.productId,
        qty: i.quantity,
        sub: i.subtotal,
      }))
    );

    // Tính toán lại tổng
    cart.calculateTotals();
    Logger.debug("6. Cart totals calculated:", {
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
    });

    // Lưu cart vào DB
    const savedCart = await this.cartRepository.save(cart);
    Logger.debug("7. Cart saved:", { savedCartId: savedCart._id });

    // Lấy lại cart đã populate để trả về
    try {
      const populatedCart = await this.cartRepository.getPopulated(
        savedCart._id
      );

      // *** KIỂM TRA QUAN TRỌNG ***
      if (!populatedCart) {
        Logger.error(
          `Critical: Failed to populate cart ${savedCart._id} after saving. Possible data inconsistency or deleted product referenced.`
        );
        // Ném lỗi rõ ràng để controller và error handler bắt được
        throw new Error(
          `Không thể lấy thông tin giỏ hàng chi tiết sau khi lưu (ID: ${savedCart._id}). Sản phẩm liên quan có thể đã bị xóa.`
        );
      }

      Logger.debug(
        "8. Final populated cart to return:",
        JSON.stringify(
          populatedCart.toObject ? populatedCart.toObject() : populatedCart,
          null,
          2
        )
      );
      return populatedCart; // Chỉ trả về khi populate thành công
    } catch (populateError) {
      // Logger.error(`Error during populate step for cart ${savedCart._id}:`, populateError); // Tạm comment Logger
      console.error("!!! ERROR IN addToCart (Populate Catch):", populateError); // Dùng console.error
      throw populateError;
    }
  }

  async updateCartItem(userId, updateData) {
    const { cartItemId, quantity } = updateData;

    if (
      !cartItemId ||
      !mongoose.Types.ObjectId.isValid(cartItemId) ||
      !quantity ||
      quantity < 1
    ) {
      throw new ValidationException(
        "Thông tin cập nhật không hợp lệ (ID item hoặc số lượng)."
      );
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException("Không tìm thấy giỏ hàng.");
    }

    // Sử dụng .id() để tìm subdocument an toàn hơn
    const item = cart.items.id(cartItemId);
    if (!item) {
      throw new NotFoundException("Không tìm thấy sản phẩm trong giỏ.");
    }

    // Cần kiểm tra lại minQuantity dựa trên selectedPrice đã lưu
    if (!item.selectedPrice || quantity < item.selectedPrice.minQuantity) {
      Logger.warn("Attempted quantity lower than minQuantity for item:", {
        cartItemId,
        quantity,
        minQuantity: item.selectedPrice?.minQuantity,
      });
      // Vẫn cho phép cập nhật nhưng có thể cân nhắc ném lỗi tùy logic nghiệp vụ
      // throw new ValidationException(`Số lượng tối thiểu là ${item.selectedPrice.minQuantity}.`);
    }

    item.quantity = quantity;
    // Đảm bảo selectedPrice tồn tại trước khi truy cập pricePerUnit
    item.subtotal = quantity * (item.selectedPrice?.pricePerUnit || 0);

    // ✅ Không cần markModified khi sửa trực tiếp subdocument lấy bằng .id()
    // cart.markModified('items');

    cart.calculateTotals();
    const savedCart = await this.cartRepository.save(cart);

    // Lấy lại và kiểm tra populate
    try {
      const populatedCart = await this.cartRepository.getPopulated(
        savedCart._id
      );
      if (!populatedCart) {
        Logger.error(
          `Critical: Failed to populate cart ${savedCart._id} after updating item.`
        );
        throw new Error(
          `Không thể lấy thông tin giỏ hàng chi tiết sau khi cập nhật (ID: ${savedCart._id})`
        );
      }
      return populatedCart;
    } catch (populateError) {
      Logger.error(
        `Error during populate step after update for cart ${savedCart._id}:`,
        populateError
      );
      throw populateError;
    }
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
      // Item không tồn tại, có thể coi là thành công hoặc ném lỗi tùy logic
      Logger.warn(
        `Item ${cartItemId} not found in cart ${cart._id} during removal attempt.`
      );
      // return await this.cartRepository.getPopulated(cart._id); // Trả về giỏ hàng hiện tại
      throw new NotFoundException("Sản phẩm không có trong giỏ để xóa.");
    }

    // Sử dụng pull để xóa subdocument hiệu quả
    cart.items.pull({ _id: cartItemId });

    // ✅ Không cần markModified khi dùng pull
    // cart.markModified('items');

    cart.calculateTotals();
    const savedCart = await this.cartRepository.save(cart);

    // Lấy lại và kiểm tra populate
    try {
      const populatedCart = await this.cartRepository.getPopulated(
        savedCart._id
      );
      // Không cần kiểm tra null ở đây vì giỏ hàng chắc chắn tồn tại
      return populatedCart;
    } catch (populateError) {
      Logger.error(
        `Error during populate step after removal for cart ${savedCart._id}:`,
        populateError
      );
      throw populateError;
    }
  }

  async clearCart(userId) {
    const cart = await this.cartRepository.findOrCreate(userId);
    cart.items = []; // Xóa hết items
    cart.calculateTotals(); // Reset totals về 0
    const savedCart = await this.cartRepository.save(cart);
    // Không cần populate vì giỏ hàng trống
    return savedCart;
  }
}
