// src/components/AppLayout.tsx (CẬP NHẬT)
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { GlobalHeader } from "./GlobalHeader";
import { MobileNav } from "./MobileNav";
import { useShop } from "@/features/shop/hooks/useShop";
import { cn } from "@/shared/lib/utils";

// ✅ FIX: Removed GlobalModalProvider imports (moved to App.tsx)
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

  // ✅ FIX: Removed GlobalModalProvider wrapper (now in App.tsx)
  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader
        onSearchSubmit={showSearch ? handleSearchSubmit : undefined}
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      <main
        className={cn(
          "pb-5 lg:pb-0", // Padding bottom cho MobileNav (h-20 mới)
          "pt-4 lg:pt-16" // Gần sát mép trên ở mobile, offset header ở desktop
        )}
      >
        {/* Outlet sẽ render nội dung trang full-width */}
        <Outlet />
      </main>
      <MobileNav />

      {/* Cart sidebar - local to AppLayout */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};
