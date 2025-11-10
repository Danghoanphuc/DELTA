// frontend/src/stores/useCartStore.ts
// ✅ BÀN GIAO: Đã fix lỗi không cập nhật state sau addToCart

import { create } from "zustand";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
} from "@/shared/lib/guestCart";

// Types
export interface CartItem {
  _id: string;
  productId: string;
  product?: {
    _id: string;
    name: string;
    images: Array<{ url: string }>;
    [key: string]: any;
  };
  quantity: number;
  selectedPrice?: {
    pricePerUnit: number;
    minQuantity: number;
  };
  customization?: any;
  subtotal: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface CartStore {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (item: {
    productId: string;
    quantity: number;
    selectedPriceIndex: number;
    customization?: any;
  }) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;

  // Helpers
  isInCart: (productId: string, isAuthenticated: boolean) => boolean;
  getCartItemCount: (isAuthenticated: boolean) => number;
  getCartTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  // ========================================
  // ✅ FIX: fetchCart
  // ========================================
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/cart");
      // ✅ Parse response đúng
      const cart = res.data?.data?.cart || res.data?.cart;

      console.log("✅ [CartStore] fetchCart thành công:", cart);
      set({ cart, isLoading: false });
    } catch (err: any) {
      console.error("❌ [CartStore] fetchCart lỗi:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  // ========================================
  // ✅ FIX: addToCart - QUAN TRỌNG NHẤT
  // ========================================
  addToCart: async (item) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/cart/add", item);

      // ✅ CRITICAL FIX: Parse response đúng
      const updatedCart = res.data?.data?.cart || res.data?.cart;

      if (!updatedCart) {
        throw new Error("Backend không trả về cart sau khi add");
      }

      console.log("✅ [CartStore] addToCart thành công:", updatedCart);

      // ✅ CRITICAL FIX: CẬP NHẬT STATE
      set({
        cart: updatedCart,
        isLoading: false,
      });

      // ✅ Toast (chỉ 1 lần)
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (err: any) {
      console.error("❌ [CartStore] addToCart lỗi:", err);
      set({ error: err.message, isLoading: false });
      toast.error(err.response?.data?.message || "Thêm vào giỏ thất bại");
      throw err; // Ném lỗi để caller bắt được
    }
  },

  // ========================================
  // ✅ FIX: updateCartItem
  // ========================================
  updateCartItem: async (cartItemId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put("/cart/update", { cartItemId, quantity });

      // ✅ Parse và update
      const updatedCart = res.data?.data?.cart || res.data?.cart;

      console.log("✅ [CartStore] updateCartItem thành công:", updatedCart);

      set({
        cart: updatedCart,
        isLoading: false,
      });
    } catch (err: any) {
      console.error("❌ [CartStore] updateCartItem lỗi:", err);
      set({ error: err.message, isLoading: false });
      toast.error("Cập nhật thất bại");
      throw err;
    }
  },

  // ========================================
  // ✅ FIX: removeFromCart
  // ========================================
  removeFromCart: async (cartItemId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.delete(`/cart/remove/${cartItemId}`);

      // ✅ Parse và update
      const updatedCart = res.data?.data?.cart || res.data?.cart;

      console.log("✅ [CartStore] removeFromCart thành công:", updatedCart);

      set({
        cart: updatedCart,
        isLoading: false,
      });

      toast.success("Đã xóa khỏi giỏ hàng");
    } catch (err: any) {
      console.error("❌ [CartStore] removeFromCart lỗi:", err);
      set({ error: err.message, isLoading: false });
      toast.error("Xóa thất bại");
      throw err;
    }
  },

  // ========================================
  // ✅ clearCart
  // ========================================
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.delete("/cart/clear");
      const clearedCart = res.data?.data?.cart || res.data?.cart;

      set({
        cart: clearedCart,
        isLoading: false,
      });

      toast.success("Đã xóa sạch giỏ hàng");
    } catch (err: any) {
      console.error("❌ [CartStore] clearCart lỗi:", err);
      set({ error: err.message, isLoading: false });
      toast.error("Xóa giỏ hàng thất bại");
      throw err;
    }
  },

  // ========================================
  // ✅ mergeGuestCart
  // ========================================
  mergeGuestCart: async () => {
    const guestCart = getGuestCart();
    if (!guestCart || guestCart.items.length === 0) {
      console.log("⚠️ [CartStore] Không có guest cart để merge");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/cart/merge", { items: guestCart.items });
      const mergedCart = res.data?.data?.cart || res.data?.cart;

      set({
        cart: mergedCart,
        isLoading: false,
      });

      // Xóa guest cart sau khi merge
      clearGuestCart();
      toast.success("Đã gộp giỏ hàng!");
    } catch (err: any) {
      console.error("❌ [CartStore] mergeGuestCart lỗi:", err);
      set({ error: err.message, isLoading: false });
      toast.error("Gộp giỏ hàng thất bại");
      throw err;
    }
  },

  // ========================================
  // Helpers
  // ========================================
  isInCart: (productId, isAuthenticated) => {
    if (isAuthenticated) {
      const { cart } = get();
      return cart?.items.some((item) => item.productId === productId) || false;
    } else {
      const guestCart = getGuestCart();
      return guestCart.items.some((item) => item.productId === productId);
    }
  },

  getCartItemCount: (isAuthenticated) => {
    if (isAuthenticated) {
      const { cart } = get();
      return cart?.totalItems || 0;
    } else {
      const guestCart = getGuestCart();
      return guestCart.items.reduce((sum, item) => sum + item.quantity, 0);
    }
  },

  getCartTotal: () => {
    const { cart } = get();
    return cart?.totalAmount || 0;
  },
}));
