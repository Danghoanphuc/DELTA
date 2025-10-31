// frontend/src/stores/useCartStore.ts (✅ REFACTORED VERSION)
import { create } from "zustand";
import api from "@/shared/lib/axios";
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
} from "@/shared/lib/guestCart";
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
  getCartItemCount: (isAuthenticated: boolean) => number;
  getCartTotal: () => number;
  isInCart: (productId: string, isAuthenticated: boolean) => boolean;
}

// ==================== STORE ====================
export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isLoading: false,

  // ==================== SERVER CART (Authenticated) ====================
  fetchCart: async () => {
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
    const guestCart = getGuestCart();
    if (guestCart.items.length === 0) return;

    try {
      const res = await api.post("/cart/merge", {
        items: guestCart.items,
      });

      set({ cart: res.data.cart });
      clearGuestCart();
      toast.success(
        `✅ Đã hợp nhất ${guestCart.items.length} sản phẩm vào giỏ hàng`
      );
    } catch (err: any) {
      console.error("Merge cart error:", err);
      toast.error(err.response?.data?.message || "Không thể hợp nhất giỏ hàng");
    }
  },

  // ==================== HELPERS ====================
  // ✅ FIX: Pass isAuthenticated as parameter instead of reading from authStore
  getCartItemCount: (isAuthenticated: boolean) => {
    const { cart } = get();

    if (!isAuthenticated) {
      return getGuestCartItemCount();
    }

    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  },

  getCartTotal: () => {
    const { cart } = get();
    return cart?.totalAmount || 0;
  },

  isInCart: (productId: string, isAuthenticated: boolean) => {
    const { cart } = get();

    if (!isAuthenticated) {
      return isProductInGuestCart(productId);
    }

    return cart?.items.some((item) => item.productId === productId) || false;
  },
}));

// ==================== HELPER HOOK ====================
// ✅ Custom hook để tự động route giữa guest và server cart
import { useAuthStore } from "./useAuthStore";

export const useCartActions = () => {
  const { accessToken } = useAuthStore();
  const store = useCartStore();
  const isAuthenticated = !!accessToken;

  return {
    ...store,
    // ✅ Wrapper methods tự động chọn guest hoặc server
    addToCart: async (payload: AddToCartPayload) => {
      if (!isAuthenticated) {
        const guestItem: GuestCartItem = {
          ...payload,
          selectedPriceIndex: payload.selectedPriceIndex ?? 0,
        };
        store.addToGuestCartLocal(guestItem);
        toast.success("✅ Đã thêm vào giỏ hàng");
      } else {
        await store.addToCart(payload);
      }
    },
    getCartItemCount: () => store.getCartItemCount(isAuthenticated),
    isInCart: (productId: string) => store.isInCart(productId, isAuthenticated),
  };
};
