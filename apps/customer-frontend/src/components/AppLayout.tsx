// src/components/AppLayout.tsx (CẬP NHẬT)
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { GlobalHeader } from "./GlobalHeader";
import { MobileNav } from "./MobileNav";
import { useShop } from "@/features/shop/hooks/useShop";
import { cn } from "@/shared/lib/utils";

import { GlobalModalProvider } from "@/contexts/GlobalModalProvider";
import { ProductQuickViewModal } from "./ProductQuickViewModal";
import { OrderQuickViewModal } from "@/features/chat/components/OrderQuickViewModal";
import { CartSidebar } from "@/features/shop/pages/CartSidebar";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

export const AppLayout = () => {
  const { handleSearchSubmit } = useShop();
  const location = useLocation();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartItemCount } = useCartStore();
  const { accessToken } = useAuthStore();
  const cartItemCount = getCartItemCount(!!accessToken);

  // Chỉ hiển thị thanh search trên trang chủ /app và /shop
  const showSearch =
    location.pathname === "/app" || location.pathname === "/shop";

  return (
    <GlobalModalProvider>
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader
          onSearchSubmit={showSearch ? handleSearchSubmit : undefined}
          cartItemCount={cartItemCount}
          onCartClick={() => setIsCartOpen(true)}
        />
        <main
          className={cn(
            "pt-16", // Padding top cho GlobalHeader
            "pb-16 lg:pb-0" // Padding bottom cho MobileNav (chỉ trên mobile)
          )}
        >
          {/* Outlet sẽ render nội dung trang full-width */}
          <Outlet />
        </main>
        <MobileNav />

        {/* Các component toàn cục */}
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        <ProductQuickViewModal />
        <OrderQuickViewModal />
      </div>
    </GlobalModalProvider>
  );
};
