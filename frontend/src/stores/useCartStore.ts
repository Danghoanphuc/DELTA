// frontend/src/stores/useCartStore.ts (✅ FIXED VERSION)

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
        console.log("📦 [CartStore] Updating cart locally:", {
          cartId: cart._id,
          itemsCount: cart.items?.length || 0,
          totalAmount: cart.totalAmount,
        });

        // ✅ Validate cart structure
        if (!cart || !cart._id) {
          console.error("❌ [CartStore] Invalid cart structure:", cart);
          toast.error("Dữ liệu giỏ hàng không hợp lệ");
          return;
        }

        set({ cart, error: null });

        console.log("✅ [CartStore] Cart updated successfully");
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
        console.log("🔄 [CartStore] Fetching cart...");

        try {
          set({ isLoading: true, error: null });
          const res = await api.get("/cart");

          console.log("📥 [CartStore] Fetch response:", {
            success: res.data?.success,
            hasCart: !!res.data?.cart,
            itemsCount: res.data?.cart?.items?.length || 0,
          });

          // ✅ Validate response structure
          if (!res.data || typeof res.data.success === "undefined") {
            throw new Error("Invalid response structure");
          }

          if (res.data.success && res.data.cart) {
            set({ cart: res.data.cart });
            console.log("✅ [CartStore] Cart fetched successfully");
          } else {
            console.warn("⚠️ [CartStore] No cart in response");
            set({ cart: null });
          }
        } catch (err: any) {
          console.error("❌ [CartStore] Fetch error:", err);
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

      // ==================== ADD TO CART (IMPROVED) ====================
      addToCart: async (payload: AddToCartPayload) => {
        console.log("➕ [CartStore] Adding to cart:", payload);

        try {
          set({ isLoading: true, error: null });

          const res = await api.post("/cart/add", payload);

          console.log("📥 [CartStore] Add response:", {
            success: res.data?.success,
            hasCart: !!res.data?.cart,
            cartId: res.data?.cart?._id,
            itemsCount: res.data?.cart?.items?.length || 0,
            totalAmount: res.data?.cart?.totalAmount,
          });

          // ✅ Validate response structure
          if (!res.data) {
            throw new Error("No response data");
          }

          if (!res.data.success) {
            throw new Error(res.data.message || "Add to cart failed");
          }

          if (!res.data.cart || !res.data.cart._id) {
            throw new Error("Invalid cart in response");
          }

          // ✅ Validate cart has items
          if (!Array.isArray(res.data.cart.items)) {
            throw new Error("Cart items is not an array");
          }

          // Update cart with server response
          get()._updateCartLocally(res.data.cart);

          toast.success("✅ Đã thêm vào giỏ hàng!");

          console.log("✅ [CartStore] Item added successfully");
        } catch (err: any) {
          console.error("❌ [CartStore] Add error:", err);
          console.error("Error response:", err.response?.data);

          const msg =
            err.response?.data?.message ||
            err.message ||
            "Không thể thêm vào giỏ hàng";

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

        console.log("🔄 [CartStore] Updating cart item:", {
          cartItemId,
          quantity,
        });

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

          console.log("📥 [CartStore] Update response:", {
            success: res.data?.success,
            itemsCount: res.data?.cart?.items?.length || 0,
          });

          // Sync with server response
          if (res.data?.cart) {
            get()._updateCartLocally(res.data.cart);
          }

          console.log("✅ [CartStore] Item updated successfully");
        } catch (err: any) {
          console.error("❌ [CartStore] Update error:", err);

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
        console.log("🗑️ [CartStore] Removing from cart:", cartItemId);

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

          console.log("📥 [CartStore] Remove response:", {
            success: res.data?.success,
            itemsCount: res.data?.cart?.items?.length || 0,
          });

          // Sync with server
          if (res.data?.cart) {
            get()._updateCartLocally(res.data.cart);
          }

          console.log("✅ [CartStore] Item removed successfully");
        } catch (err: any) {
          console.error("❌ [CartStore] Remove error:", err);

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
        console.log("🧹 [CartStore] Clearing cart...");

        try {
          set({ isLoading: true, error: null });
          await api.delete("/cart/clear");
          set({ cart: null });

          console.log("✅ [CartStore] Cart cleared successfully");
        } catch (err: any) {
          console.error("❌ [CartStore] Clear error:", err);
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
          console.log("♻️ [Rehydrate CartStore]", {
            hasCart: !!state?.cart,
            itemsCount: state?.cart?.items?.length || 0,
          });
        }
      },
    }
  )
);
