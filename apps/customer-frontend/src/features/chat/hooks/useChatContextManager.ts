// apps/customer-frontend/src/features/chat/hooks/useChatContextManager.ts
import { useLocation, useParams } from "react-router-dom";
import { useMemo } from "react";

export interface ChatContextPayload {
  pageTitle?: string;
  referenceType?: "product" | "order" | "category" | "page";
  referenceId?: string;
  metadata?: Record<string, any>;
}

export const useChatContextManager = () => {
  const location = useLocation();
  const params = useParams();

  const contextData = useMemo((): ChatContextPayload => {
    const path = location.pathname;
    const p: Record<string, any> = params as any;

    // 1) Nếu route có productId
    if (p.productId) {
      return {
        pageTitle: document.title || "Sản phẩm",
        referenceType: "product",
        referenceId: String(p.productId),
        metadata: { path },
      };
    }

    // 2) Nếu route có orderId
    if (p.orderId) {
      return {
        pageTitle: document.title || "Đơn hàng",
        referenceType: "order",
        referenceId: String(p.orderId),
        metadata: { path },
      };
    }

    // 3) Nếu route có categoryId
    if (p.categoryId) {
      return {
        pageTitle: document.title || "Danh mục",
        referenceType: "category",
        referenceId: String(p.categoryId),
        metadata: { path },
      };
    }

    // 4) Mặc định
    return {
      pageTitle: document.title || "Trang chủ",
      referenceType: "page",
      metadata: { path },
    };
  }, [location.pathname, JSON.stringify(params)]);

  return {
    contextData,
    // Hàm này sẽ được gọi khi gửi tin nhắn để lấy context mới nhất
    getContext: () => contextData,
  };
};

export default useChatContextManager;
