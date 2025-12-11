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
import { OfflineIndicator } from "./OfflineIndicator";

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
    location.pathname === "/app" ||
    location.pathname === "/shop" ||
    location.pathname === "/designs" ||
    location.pathname === "/orders";

  // 3. Logic Auth
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
    // STYLE CHANGE: Nền giấy #F9F8F6 thay vì xám lạnh. Font mặc định sans-serif.
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      {/* TEXTURE OVERLAY: Lớp noise mờ, tạo cảm giác giấy in tạp chí */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply"></div>

      {/* Header: Chỉ hiện trên Desktop và không phải trang auth */}
      {!isAuthPage && (
        <div className="hidden lg:block relative z-20">
          <GlobalHeader
            onSearchSubmit={showSearch ? handleSearchSubmit : undefined}
            cartItemCount={cartItemCount}
            onCartClick={() => setIsCartOpen(true)}
          />
        </div>
      )}

      <main
        className={cn(
          "relative z-10 transition-all duration-300 ease-out",
          // PADDING LOGIC:
          // Chat: Full screen
          // Auth: Basic padding
          // App: Padding rộng, thoáng đãng (Editorial Space)
          isChatting
            ? "pt-0 pb-0 h-[100dvh]"
            : isAuthPage
            ? "safe-top pb-24"
            : "safe-top pb-32 lg:pt-24 lg:px-12"
        )}
      >
        {/* Container giới hạn chiều rộng nội dung để đảm bảo tính thẩm mỹ */}
        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer: Ẩn khi đang chat hoặc đang ở trang auth */}
      {!isChatting &&
        !isAuthPage &&
        (isSocialMode ? <SocialNavMobile /> : <MobileNav />)}

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <OfflineIndicator />
    </div>
  );
};
