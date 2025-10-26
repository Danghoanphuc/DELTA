// frontend/src/stores/useCartStore.ts (IMPROVED VERSION)

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { Cart, AddToCartPayload } from "@/types/cart";
import api from "@/lib/axios";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

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

  // Internal helpers
  _updateCartLocally: (cart: Cart) => void;
  _removeItemLocally: (cartItemId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      error: null,

      // ==================== INTERNAL HELPERS ====================
      _updateCartLocally: (cart: Cart) => {
        set({ cart, error: null });
      },

      _removeItemLocally: (cartItemId: string) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        const updatedItems = currentCart.items.filter(
          (item) => item._id !== cartItemId
        );

        const updatedCart: Cart = {
          ...currentCart,
          items: updatedItems,
          totalItems: updatedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          totalAmount: updatedItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
          ),
        };

        set({ cart: updatedCart });
      },

      // ==================== FETCH CART ====================
      fetchCart: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.get("/cart");
          set({ cart: res.data.cart });
        } catch (err: any) {
          console.error("❌ [FetchCart Error]", err);
          const errorMsg =
            err.response?.data?.message || "Không thể tải giỏ hàng";
          set({ error: errorMsg });

          // Chỉ toast nếu không phải lỗi 404 (giỏ hàng trống)
          if (err.response?.status !== 404) {
            toast.error(errorMsg);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== ADD TO CART (OPTIMISTIC) ====================
      addToCart: async (payload: AddToCartPayload) => {
        try {
          set({ isLoading: true, error: null });
          const res = await api.post("/cart/add", payload);

          // Update cart with server response
          get()._updateCartLocally(res.data.cart);
          toast.success("✅ Đã thêm vào giỏ hàng!");
        } catch (err: any) {
          console.error("❌ [AddToCart Error]", err);
          const msg =
            err.response?.data?.message || "Không thể thêm vào giỏ hàng";
          set({ error: msg });
          toast.error(msg);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== UPDATE CART ITEM (OPTIMISTIC) ====================
      updateCartItem: async (cartItemId: string, quantity: number) => {
        if (quantity < 1) {
          toast.error("Số lượng phải lớn hơn 0");
          return;
        }

        // Optimistic update
        const currentCart = get().cart;
        if (!currentCart) return;

        const oldCart = { ...currentCart };

        try {
          // Update locally first (optimistic)
          const updatedItems = currentCart.items.map((item) => {
            if (item._id === cartItemId) {
              const newSubtotal =
                (item.selectedPrice?.pricePerUnit || 0) * quantity;
              return { ...item, quantity, subtotal: newSubtotal };
            }
            return item;
          });

          const optimisticCart: Cart = {
            ...currentCart,
            items: updatedItems,
            totalItems: updatedItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
            totalAmount: updatedItems.reduce(
              (sum, item) => sum + item.subtotal,
              0
            ),
          };

          set({ cart: optimisticCart });

          // Then update on server
          set({ isLoading: true, error: null });
          const res = await api.put("/cart/update", { cartItemId, quantity });

          // Sync with server response
          get()._updateCartLocally(res.data.cart);
        } catch (err: any) {
          console.error("❌ [UpdateCart Error]", err);

          // Rollback on error
          set({ cart: oldCart });

          const msg =
            err.response?.data?.message || "Không thể cập nhật giỏ hàng";
          set({ error: msg });
          toast.error(msg);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== REMOVE FROM CART (OPTIMISTIC) ====================
      removeFromCart: async (cartItemId: string) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        const oldCart = { ...currentCart };

        try {
          // Optimistic removal
          get()._removeItemLocally(cartItemId);

          toast.success("🗑️ Đã xóa khỏi giỏ hàng");

          // Then update on server
          set({ isLoading: true, error: null });
          const res = await api.delete(`/cart/remove/${cartItemId}`);

          // Sync with server
          get()._updateCartLocally(res.data.cart);
        } catch (err: any) {
          console.error("❌ [RemoveFromCart Error]", err);

          // Rollback on error
          set({ cart: oldCart });

          const msg =
            err.response?.data?.message || "Không thể xóa khỏi giỏ hàng";
          set({ error: msg });
          toast.error(msg);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== CLEAR CART ====================
      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          await api.delete("/cart/clear");
          set({ cart: null });
        } catch (err: any) {
          console.error("❌ [ClearCart Error]", err);
          const msg = err.response?.data?.message || "Không thể xóa giỏ hàng";
          set({ error: msg });
          toast.error(msg);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==================== HELPERS ====================
      getCartItemCount: () => {
        const cart = get().cart;
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
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
      onRehydrateStorage: () => (state) => {
        if (import.meta.env.DEV) {
          console.log("♻️ [Rehydrate CartStore]", state?.cart);
        }
      },
    }
  )
);
