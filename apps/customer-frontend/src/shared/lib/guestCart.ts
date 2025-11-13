// frontend/src/lib/guestCart.ts
/**
 * Guest Cart Manager
 * Quản lý giỏ hàng local cho người dùng chưa đăng nhập
 */

export interface GuestCartItem {
  productId: string;
  quantity: number;
  selectedPriceIndex: number;
  customization?: Record<string, any>;
}

export interface GuestCart {
  items: GuestCartItem[];
}

const GUEST_CART_KEY = "printz_guest_cart";

/**
 * Lấy guest cart từ localStorage
 */
export function getGuestCart(): GuestCart {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (!stored) return { items: [] };

    const parsed = JSON.parse(stored);
    return parsed;
  } catch (err) {
    console.error("Error reading guest cart:", err);
    return { items: [] };
  }
}

/**
 * Lưu guest cart vào localStorage
 */
export function saveGuestCart(cart: GuestCart): void {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error("Error saving guest cart:", err);
  }
}

/**
 * Thêm item vào guest cart
 */
export function addToGuestCart(item: GuestCartItem): void {
  const cart = getGuestCart();

  // Tìm xem đã có item này chưa
  const existingIndex = cart.items.findIndex(
    (i) =>
      i.productId === item.productId &&
      i.selectedPriceIndex === item.selectedPriceIndex
  );

  if (existingIndex !== -1) {
    // Đã có -> tăng quantity
    cart.items[existingIndex].quantity += item.quantity;
  } else {
    // Chưa có -> thêm mới
    cart.items.push(item);
  }

  saveGuestCart(cart);
}

/**
 * Cập nhật quantity của một item trong guest cart
 */
export function updateGuestCartItem(
  productId: string,
  selectedPriceIndex: number,
  newQuantity: number
): void {
  const cart = getGuestCart();

  const itemIndex = cart.items.findIndex(
    (i) =>
      i.productId === productId && i.selectedPriceIndex === selectedPriceIndex
  );

  if (itemIndex !== -1) {
    if (newQuantity <= 0) {
      // Xóa item nếu quantity <= 0
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQuantity;
    }
    saveGuestCart(cart);
  }
}

/**
 * Xóa item khỏi guest cart
 */
export function removeFromGuestCart(
  productId: string,
  selectedPriceIndex: number
): void {
  const cart = getGuestCart();
  cart.items = cart.items.filter(
    (i) =>
      !(
        i.productId === productId && i.selectedPriceIndex === selectedPriceIndex
      )
  );
  saveGuestCart(cart);
}

/**
 * Xóa toàn bộ guest cart
 */
export function clearGuestCart(): void {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (err) {
    console.error("Error clearing guest cart:", err);
  }
}

/**
 * Đếm số lượng items trong guest cart
 */
export function getGuestCartItemCount(): number {
  const cart = getGuestCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Kiểm tra một product có trong guest cart không
 */
export function isProductInGuestCart(productId: string): boolean {
  const cart = getGuestCart();
  return cart.items.some((item) => item.productId === productId);
}
