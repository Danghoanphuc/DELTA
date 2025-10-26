// frontend/src/stores/useCartStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { Cart, CartItem, AddToCartPayload } from "@/types/cart";
import api from "@/lib/axios";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Helpers
  getCartItemCount: () => number;
  getCartTotal: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,

      // ==================== FETCH CART ====================
      fetchCart: async () => {
        try {
          set({ isLoading: true });
          const res = await api.get("/cart");
          set({ cart: res.data.cart });
        } catch (err: any) {
          console.error("❌ [FetchCart Error]", err);
          // Không toast lỗi nếu giỏ hàng trống
          if (err.response?.status !== 404) {
            toast.error("Không thể tải giỏ hàng");
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== ADD TO CART ====================
      addToCart: async (payload: AddToCartPayload) => {
        try {
          set({ isLoading: true });
          const res = await api.post("/cart/add", payload);
          set({ cart: res.data.cart });
          toast.success("Đã thêm vào giỏ hàng! 🛒");
        } catch (err: any) {
          console.error("❌ [AddToCart Error]", err);
          const msg =
            err.response?.data?.message || "Không thể thêm vào giỏ hàng";
          toast.error(msg);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== UPDATE CART ITEM ====================
      updateCartItem: async (cartItemId: string, quantity: number) => {
        if (quantity < 1) {
          toast.error("Số lượng phải lớn hơn 0");
          return;
        }

        try {
          set({ isLoading: true });
          const res = await api.put("/cart/update", { cartItemId, quantity });
          set({ cart: res.data.cart });
          toast.success("Đã cập nhật giỏ hàng");
        } catch (err: any) {
          console.error("❌ [UpdateCart Error]", err);
          const msg =
            err.response?.data?.message || "Không thể cập nhật giỏ hàng";
          toast.error(msg);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== REMOVE FROM CART ====================
      removeFromCart: async (cartItemId: string) => {
        try {
          set({ isLoading: true });
          const res = await api.delete(`/cart/remove/${cartItemId}`);
          set({ cart: res.data.cart });
          toast.success("Đã xóa khỏi giỏ hàng");
        } catch (err: any) {
          console.error("❌ [RemoveFromCart Error]", err);
          const msg =
            err.response?.data?.message || "Không thể xóa khỏi giỏ hàng";
          toast.error(msg);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== CLEAR CART ====================
      clearCart: async () => {
        try {
          set({ isLoading: true });
          await api.delete("/cart/clear");
          set({ cart: null });
          toast.success("Đã xóa toàn bộ giỏ hàng");
        } catch (err: any) {
          console.error("❌ [ClearCart Error]", err);
          toast.error("Không thể xóa giỏ hàng");
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== HELPERS ====================

      getCartItemCount: () => {
        const cart = get().cart;
        if (!cart) return 0;
        return (
          cart.totalItems ||
          cart.items.reduce((sum, item) => sum + item.quantity, 0)
        );
      },

      getCartTotal: () => {
        const cart = get().cart;
        return cart?.totalAmount || 0;
      },

      isInCart: (productId: string) => {
        const cart = get().cart;
        if (!cart) return false;
        return cart.items.some((item) => item.productId === productId);
      },
    }),
    {
      name: "cart-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);
