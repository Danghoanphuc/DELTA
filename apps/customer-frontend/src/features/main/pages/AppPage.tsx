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
import { cn } from "@/shared/lib/utils";

// Lazy-load
const InspirationFeed = lazy(() =>
  import("../../chat/pages/InspirationFeed").then((module) => ({
    default: module.InspirationFeed,
  }))
);

const FeedSkeleton = () => (
  <div className="w-full mt-8">
    <div className="flex items-center gap-4 mb-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="h-px flex-1 bg-gray-200" />
    </div>
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

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F6] pb-20 font-sans">
      {/* ======================== MOBILE VIEW (< 1024px) ======================== */}
      {/* Giữ nguyên ContextNav ở đây */}
      <div className="lg:hidden flex flex-col gap-4 pb-4">
        <MobileHomeHeader onSearch={handleSearchSubmit} />

        <div className="px-4 flex flex-col gap-5">
          <ContextNav layout="mobile-grid" />

          <div className="space-y-3">
            <BannerHero
              aspectRatio="superSlim"
              className="rounded-2xl shadow-sm overflow-hidden"
            />
            <div className="bg-stone-900 rounded-xl p-4 text-white flex items-center justify-between shadow-lg shadow-stone-900/20">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Dành cho HR/Admin
                </p>
                <p className="font-serif font-bold">
                  Mở tài khoản Doanh Nghiệp
                </p>
              </div>
              <button
                onClick={() => navigate("/business")}
                className="bg-white text-stone-900 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Mở ngay
              </button>
            </div>
          </div>

          <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2"></div>

          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Giải pháp Ngành hàng
              </h3>
            </div>
            <div className="-ml-1">
              <BusinessComboGrid />
            </div>
          </div>

          <CategorySidebar layout="mobile-grid" />
        </div>
      </div>

      {/* ======================== DESKTOP VIEW ======================== */}
      <div className="hidden lg:grid max-w-[1600px] mx-auto w-full px-12 pt-1 grid-cols-12 gap-8 items-start">
        {/* === LEFT MAIN BLOCK (9 Cột) === */}
        <div className="col-span-9 flex flex-col gap-6">
          {/* 1. BusinessComboGrid (Top) */}
          <div className="w-full">
            <BusinessComboGrid className="py-0" />
          </div>

          {/* 2. BannerHero (Middle) */}
          <div className="rounded-3xl overflow-hidden shadow-sm border border-stone-100 bg-white">
            <BannerHero className="w-full" aspectRatio="superSlim" />
          </div>

          {/* 3. CategorySidebar (Bottom) - Đã xóa ContextNav khỏi vị trí này */}
          <div className="w-full">
            <CategorySidebar
              layout="horizontal"
              className="bg-transparent border-b-0 p-0"
            />
          </div>
        </div>

        {/* === RIGHT SIDEBAR (3 Cột) === */}
        <div className="col-span-3 flex flex-col gap-6">
          {/* User Actions */}
          <UserQuickActions onOpenChat={openChat} />
        </div>

        {/* === INSPIRATION FEED (12/12 Cột) === */}
        <div className="col-span-12 mt-8 pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Gợi ý thiết kế
            </h2>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-full bg-stone-900 text-white text-xs font-bold">
                Tất cả
              </button>
              <button className="px-4 py-1.5 rounded-full bg-stone-900 text-white text-stone-600 border border-stone-200 text-xs font-bold hover:border-stone-900">
                Mới nhất
              </button>
            </div>
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

      {/* Chat FAB */}
      <div className="hidden lg:block">
        <AiFab />
      </div>
    </div>
  );
};

export default function ChatAppPage() {
  return <ChatAppView />;
}
