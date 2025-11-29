// apps/customer-frontend/src/components/AppLayout.tsx
import { useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { GlobalHeader } from "./GlobalHeader";
import { MobileNav } from "./MobileNav";
import { SocialNavMobile } from "@/features/social/components/SocialNavMobile";
import { useShop } from "@/features/shop/hooks/useShop";
import { cn } from "@/shared/lib/utils";

import { CartSidebar } from "@/features/shop/pages/CartSidebar";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { OfflineIndicator } from "./OfflineIndicator"; // <--- IMPORT MỚI
// import { EventBanner } from "./EventBanner";
// import { EventParticles } from "./EventParticles";

export const AppLayout = () => {
  const { handleSearchSubmit } = useShop();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartItemCount } = useCartStore();
  const { accessToken } = useAuthStore();
  const cartItemCount = getCartItemCount(!!accessToken);

  // 1. Logic chế độ Social
  const socialRoutes = ["/messages", "/friends", "/chat", "/social-settings"];
  const isSocialMode = socialRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // 2. Logic phát hiện đang Chat
  const isChatting =
    location.pathname === "/chat" ||
    (location.pathname === "/messages" && !!searchParams.get("conversationId"));

  const showSearch =
    location.pathname === "/app" || location.pathname === "/shop";

  // ✅ FIXED: Ẩn header trên các trang auth
  const authRoutes = [
    "/signin",
    "/signup",
    "/check-email",
    "/verify-email",
    "/reset-password",
    "/auth/callback",
  ];
  const isAuthPage = authRoutes.some((route) => location.pathname === route);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Event Theme: TẮT - Uncomment để bật lại */}
      {/* {!isAuthPage && <EventBanner />} */}
      {/* {!isAuthPage && <EventParticles />} */}

      {/* Header: Chỉ hiện trên Desktop và không phải trang auth */}
      {!isAuthPage && (
        <div className="hidden lg:block">
          <GlobalHeader
            onSearchSubmit={showSearch ? handleSearchSubmit : undefined}
            cartItemCount={cartItemCount}
            onCartClick={() => setIsCartOpen(true)}
          />
        </div>
      )}

      <main
        className={cn(
          "transition-all duration-200",
          // ✅ LOGIC PADDING CHUẨN:
          // 1. Khi Chat: Fullscreen tuyệt đối (pt-0, pb-0, h-100dvh) -> ChatWindow tự lo padding bên trong.
          // 2. Khi Auth: Không có header nên không cần pt-16
          // 3. Khi Bình thường: Dùng 'safe-top' (tránh tai thỏ) + pb-24 (tránh footer).
          isChatting
            ? "pt-0 pb-0 h-[100dvh]"
            : isAuthPage
            ? "safe-top pb-24"
            : "safe-top pb-24 lg:pt-16 lg:pb-0"
        )}
      >
        <Outlet />
      </main>

      {/* Footer: Ẩn khi đang chat hoặc đang ở trang auth */}
      {!isChatting &&
        !isAuthPage &&
        (isSocialMode ? <SocialNavMobile /> : <MobileNav />)}

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* ✅ OFFLINE INDICATOR: Hiển thị trạng thái mất kết nối */}
      <OfflineIndicator />
    </div>
  );
};
