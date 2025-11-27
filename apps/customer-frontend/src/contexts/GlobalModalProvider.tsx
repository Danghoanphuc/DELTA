// src/contexts/GlobalModalProvider.tsx (TẠO MỚI)
import { createContext, useContext, ReactNode, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "@/shared/utils/toast";
import { PrinterProduct } from "@/types/product";
import { Order } from "@/types/order";
import api from "@/shared/lib/axios";
import * as chatApi from "@/features/chat/services/chat.api.service";

// Định nghĩa State và API của Context
interface GlobalModalState {
  // Product Quick View
  quickViewProductId: string | null;
  isQuickViewLoading: boolean;
  quickViewProductData: PrinterProduct | null;
  openQuickView: (productId: string) => Promise<void>;
  closeQuickView: () => void;

  // Order Quick View
  quickViewOrderId: string | null;
  isQuickViewOrderLoading: boolean;
  quickViewOrderData: Order | null;
  openOrderQuickView: (orderId: string) => Promise<void>;
  closeOrderQuickView: () => void;
}

// 1. Tạo Context
const GlobalModalContext = createContext<GlobalModalState | null>(null);

// 2. Tạo Provider
export const GlobalModalProvider = ({ children }: { children: ReactNode }) => {
  // --- State cho "Quick View" Sản Phẩm ---
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(
    null
  );
  const [isQuickViewLoading, setIsQuickViewLoading] = useState(false);
  const [quickViewProductData, setQuickViewProductData] =
    useState<PrinterProduct | null>(null);

  // --- State cho "Quick View" Đơn Hàng ---
  const [quickViewOrderId, setQuickViewOrderId] = useState<string | null>(null);
  const [isQuickViewOrderLoading, setIsQuickViewOrderLoading] = useState(false);
  const [quickViewOrderData, setQuickViewOrderData] = useState<Order | null>(
    null
  );

  // --- Handlers Sản Phẩm ---
  const openQuickView = async (productId: string) => {
    if (!productId) return;
    flushSync(() => {
      setIsQuickViewLoading(true);
      setQuickViewProductId(productId);
      setQuickViewProductData(null);
    });
    try {
      const res = await api.get(`/products/${productId}`);
      // Sửa lỗi: API trả về product trong res.data.data.product
      const product = res.data?.data?.product || res.data?.product;
      if (product) {
        setQuickViewProductData(product);
      } else {
        throw new Error("Không tìm thấy sản phẩm");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Không thể tải chi tiết sản phẩm."
      );
      setQuickViewProductId(null);
    } finally {
      setIsQuickViewLoading(false);
    }
  };
  const closeQuickView = () => {
    setQuickViewProductId(null);
    setQuickViewProductData(null);
  };

  // --- Handlers Đơn Hàng ---
  const openOrderQuickView = async (orderId: string) => {
    if (!orderId) return;
    flushSync(() => {
      setIsQuickViewOrderLoading(true);
      setQuickViewOrderId(orderId);
      setQuickViewOrderData(null);
    });
    try {
      const order = await chatApi.fetchOrderDetails(orderId);
      setQuickViewOrderData(order);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Không thể tải chi tiết đơn hàng."
      );
      setQuickViewOrderId(null);
    } finally {
      setIsQuickViewOrderLoading(false);
    }
  };
  const closeOrderQuickView = () => {
    setQuickViewOrderId(null);
    setQuickViewOrderData(null);
  };

  const value = {
    quickViewProductId,
    isQuickViewLoading,
    quickViewProductData,
    openQuickView,
    closeQuickView,
    quickViewOrderId,
    isQuickViewOrderLoading,
    quickViewOrderData,
    openOrderQuickView,
    closeOrderQuickView,
  };

  return (
    <GlobalModalContext.Provider value={value}>
      {children}
    </GlobalModalContext.Provider>
  );
};

// 3. Tạo hook "consumer"
export const useGlobalModalContext = () => {
  const context = useContext(GlobalModalContext);
  if (!context) {
    throw new Error(
      "useGlobalModalContext phải được dùng bên trong GlobalModalProvider"
    );
  }
  return context;
};
