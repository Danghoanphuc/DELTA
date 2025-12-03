// apps/customer-frontend/src/features/chat/pages/AppPage.tsx

import React, { lazy, Suspense, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MobileHomeHeader } from "../components/MobileHomeHeader";

// UI Components
import { BannerHero } from "../components/BannerHero";
import { ContextNav } from "../components/ContextNav";
import { AiFab } from "../../chat/components/AiFab";
import { CategorySidebar } from "../components/CategorySidebar";
import { UserQuickActions } from "../components/UserQuickActions";
import { BusinessComboGrid } from "../components/BusinessComboGrid";

// Hooks
import { useShop } from "@/features/shop/hooks/useShop";

// Lazy-load
const InspirationFeed = lazy(() =>
  import("../../chat/pages/InspirationFeed").then((module) => ({
    default: module.InspirationFeed,
  }))
);

const FeedSkeleton = () => (
  <div className="w-full">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg overflow-hidden bg-gray-200 animate-pulse"
          style={{ height: `${200 + Math.random() * 150}px` }}
        />
      ))}
    </div>
  </div>
);

const ChatAppView = () => {
  const {
    products,
    loading: productsLoading,
    handleSearchSubmit,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useShop();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasProcessedSearchRef = React.useRef(false);

  useEffect(() => {
    const searchTermFromUrl = searchParams.get("search");
    if (searchTermFromUrl && !hasProcessedSearchRef.current) {
      hasProcessedSearchRef.current = true;
      handleSearchSubmit(searchTermFromUrl);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("search");
      setSearchParams(newSearchParams, { replace: true });
    } else if (!searchTermFromUrl) {
      hasProcessedSearchRef.current = false;
    }
  }, [searchParams, handleSearchSubmit, setSearchParams]);

  const openChat = () => navigate("/chat");

  // Sticky Top Offset cho Sidebar
  const STICKY_TOP_OFFSET = "top-24";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 pb-20 font-sans">
      {/* ======================== MOBILE VIEW (< 1024px) ======================== */}
      <div className="lg:hidden flex flex-col gap-4 pb-4">
        {/* Header tìm kiếm thông minh */}
        <MobileHomeHeader onSearch={handleSearchSubmit} />

        <div className="px-4 flex flex-col gap-5">
          {/* ✅ 1. Context Nav (Đã hồi sinh) */}
          <ContextNav layout="mobile-grid" />

          {/* 2. Banner Mobile */}
          <BannerHero
            aspectRatio="superSlim"
            className="rounded-2xl shadow-sm overflow-hidden"
          />

          {/* 3. Business Combo Section */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-bold text-gray-900 text-xs uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Gói Doanh nghiệp
              </h3>
            </div>
            {/* Pop-out nhẹ sang trái để tạo điểm nhấn thị giác */}
            <div className="-ml-1">
              <BusinessComboGrid />
            </div>
          </div>

          {/* 4. Mobile Category Grid */}
          <CategorySidebar layout="mobile-grid" />
        </div>
      </div>

      {/* ======================== DESKTOP VIEW (Grid 12 Cột) ======================== */}
      <div className="hidden lg:grid max-w-[1440px] mx-auto w-full px-6 pt-6 grid-cols-12 gap-8 items-start">
        {/* === LEFT SIDEBAR (Context Nav) === */}
        <div
          className={`col-span-3 sticky ${STICKY_TOP_OFFSET} z-30 transition-all`}
        >
          <ContextNav />
        </div>

        {/* === MAIN CONTENT (Center) === */}
        <div className="col-span-6 flex flex-col gap-6">
          {/* 1. Hero Block: Banner + Combo ghép chung */}
          <div className="group rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <BannerHero className="w-full" aspectRatio="superSlim" />

            <div className="p-6 pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Giải pháp B2B
                </h3>
                <button
                  onClick={() => navigate("/business")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                >
                  Xem toàn bộ
                </button>
              </div>
              <BusinessComboGrid />
            </div>
          </div>

          {/* 2. Category Rail (Ngang) */}
          <div className="w-full">
            <CategorySidebar layout="horizontal" />
          </div>

          {/* 3. Feed Sản phẩm */}
          <div className="mt-2">
            <div className="flex items-center gap-4 mb-6 px-1">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Gợi ý hôm nay
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
            </div>

            <Suspense fallback={<FeedSkeleton />}>
              <InspirationFeed
                products={products}
                isLoading={productsLoading}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            </Suspense>
          </div>
        </div>

        {/* === RIGHT SIDEBAR (User Tools) === */}
        <div className={`col-span-3 sticky ${STICKY_TOP_OFFSET} z-30`}>
          <UserQuickActions onOpenChat={openChat} />
        </div>
      </div>

      {/* Chat FAB (Nút nổi) */}
      <div className="hidden lg:block">
        <AiFab />
      </div>
    </div>
  );
};

export default function ChatAppPage() {
  return <ChatAppView />;
}
