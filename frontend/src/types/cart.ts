// frontend/src/types/cart.ts

import { PrinterProduct } from "./product";

// ==================== CART TYPES ====================

export interface CartItem {
  _id: string; // ID của cart item
  productId: string; // ID sản phẩm
  product?: PrinterProduct; // Thông tin sản phẩm (được populate)
  quantity: number;
  selectedPrice?: {
    minQuantity: number;
    pricePerUnit: number;
  };
  customization?: {
    hasFileUpload: boolean;
    fileUrl?: string;
    notes?: string;
  };
  subtotal: number; // quantity * pricePerUnit
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number; // Tổng số sản phẩm
  totalAmount: number; // Tổng tiền
  createdAt: string;
  updatedAt: string;
}

// ==================== ADD TO CART PAYLOAD ====================

export interface AddToCartPayload {
  productId: string;
  quantity: number;
  selectedPriceIndex?: number; // Index của pricing tier được chọn
  customization?: {
    hasFileUpload?: boolean;
    fileUrl?: string;
    notes?: string;
  };
}

export interface UpdateCartItemPayload {
  cartItemId: string;
  quantity: number;
}

// ==================== CART SUMMARY ====================

export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}
