// frontend/src/stores/useCartStore.ts (UPDATED VERSION)
import { create } from "zustand";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  getGuestCartItemCount,
  isProductInGuestCart,
  GuestCartItem,
} from "@/lib/guestCart";
import { useAuthStore } from "./useAuthStore";
import { Cart, AddToCartPayload } from "@/types/cart";
// ==================== TYPES ====================

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;

  // Server Cart Actions
  fetchCart: () => Promise<void>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  updateCartItem: (cartItemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Guest Cart Actions (không cần async)
  addToGuestCartLocal: (item: GuestCartItem) => void;
  updateGuestCartLocal: (
    productId: string,
    selectedPriceIndex: number,
    newQuantity: number
  ) => void;
  removeFromGuestCartLocal: (
    productId: string,
    selectedPriceIndex: number
  ) => void;

  // Merge Logic
  mergeGuestCartToServer: () => Promise<void>;

  // Helpers
  getCartItemCount: () => number;
  getCartTotal: () => number;
  isInCart: (productId: string) => boolean;
}

// ==================== STORE ====================
export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isLoading: false,

  // ==================== SERVER CART (Authenticated) ====================
  fetchCart: async () => {
    const { accessToken } = useAuthStore.getState();

    // Nếu chưa login, không fetch
    if (!accessToken) {
      return;
    }

    set({ isLoading: true });
    try {
      const res = await api.get("/cart");
      set({ cart: res.data.cart });
    } catch (err: any) {
      console.error("Fetch cart error:", err);
      // Không toast error ở đây vì có thể là 401 bình thường
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (payload: AddToCartPayload) => {
    const { accessToken } = useAuthStore.getState();

    // Nếu chưa login -> thêm vào guest cart
    if (!accessToken) {
      const guestItemPayload: GuestCartItem = {
        ...payload,
        selectedPriceIndex: payload.selectedPriceIndex ?? 0,
      };

      // Truyền object đã hợp lệ vào
      get().addToGuestCartLocal(guestItemPayload);
      toast.success("✅ Đã thêm vào giỏ hàng");
      return;
    }

    // Nếu đã login -> gọi API
    set({ isLoading: true });
    try {
      const res = await api.post("/cart/add", payload);
      set({ cart: res.data.cart });
      toast.success("✅ Đã thêm vào giỏ hàng");
    } catch (err: any) {
      console.error("Add to cart error:", err);
      toast.error(err.response?.data?.message || "Không thể thêm vào giỏ hàng");
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCartItem: async (cartItemId: string, newQuantity: number) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;

    set({ isLoading: true });
    try {
      const res = await api.put(`/cart/update/${cartItemId}`, {
        quantity: newQuantity,
      });
      set({ cart: res.data.cart });
    } catch (err: any) {
      console.error("Update cart error:", err);
      toast.error(err.response?.data?.message || "Không thể cập nhật giỏ hàng");
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (cartItemId: string) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;

    set({ isLoading: true });
    try {
      const res = await api.delete(`/cart/remove/${cartItemId}`);
      set({ cart: res.data.cart });
      toast.success("Đã xóa khỏi giỏ hàng");
    } catch (err: any) {
      console.error("Remove from cart error:", err);
      toast.error(err.response?.data?.message || "Không thể xóa khỏi giỏ hàng");
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      clearGuestCart();
      return;
    }

    try {
      await api.delete("/cart/clear");
      set({ cart: null });
      toast.success("Đã xóa giỏ hàng");
    } catch (err: any) {
      console.error("Clear cart error:", err);
      toast.error(err.response?.data?.message || "Không thể xóa giỏ hàng");
    }
  },

  // ==================== GUEST CART (Local) ====================
  addToGuestCartLocal: (item: GuestCartItem) => {
    addToGuestCart(item);
    // Force re-render nếu cần (optional, vì guest cart không có trong state)
  },

  updateGuestCartLocal: (
    productId: string,
    selectedPriceIndex: number,
    newQuantity: number
  ) => {
    updateGuestCartItem(productId, selectedPriceIndex, newQuantity);
  },

  removeFromGuestCartLocal: (productId: string, selectedPriceIndex: number) => {
    removeFromGuestCart(productId, selectedPriceIndex);
  },

  // ==================== MERGE LOGIC ====================
  mergeGuestCartToServer: async () => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;

    const guestCart = getGuestCart();
    if (guestCart.items.length === 0) return;

    try {
      // Gọi API merge cart (backend endpoint: POST /cart/merge)
      const res = await api.post("/cart/merge", {
        items: guestCart.items,
      });

      set({ cart: res.data.cart });
      clearGuestCart(); // Xóa guest cart sau khi merge thành công
      toast.success(
        `✅ Đã hợp nhất ${guestCart.items.length} sản phẩm vào giỏ hàng`
      );
    } catch (err: any) {
      console.error("Merge cart error:", err);
      toast.error(err.response?.data?.message || "Không thể hợp nhất giỏ hàng");
    }
  },

  // ==================== HELPERS ====================
  getCartItemCount: () => {
    const { accessToken } = useAuthStore.getState();
    const { cart } = get();

    if (!accessToken) {
      // Guest user -> đếm từ localStorage
      return getGuestCartItemCount();
    }

    // Authenticated user -> đếm từ cart state
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  },

  getCartTotal: () => {
    const { cart } = get();
    return cart?.totalAmount || 0;
  },

  isInCart: (productId: string) => {
    const { accessToken } = useAuthStore.getState();
    const { cart } = get();

    if (!accessToken) {
      // Guest user
      return isProductInGuestCart(productId);
    }

    // Authenticated user
    return cart?.items.some((item) => item.productId === productId) || false;
  },
}));
