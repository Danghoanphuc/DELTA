// src/features/chat/pages/AppPage.tsx

import React, { lazy, Suspense, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MobileHomeHeader } from "../components/MobileHomeHeader";

// UI Components
import { BannerHero } from "../components/BannerHero";
import { ContextNav } from "../components/ContextNav";
import { AiFab } from "../components/AiFab";
import { CategorySidebar } from "../components/CategorySidebar";
import { UserQuickActions } from "../components/UserQuickActions";
import { BusinessComboGrid } from "../components/BusinessComboGrid"; 
import { Skeleton } from "@/shared/components/ui/skeleton";

// Hooks
import { useShop } from "@/features/shop/hooks/useShop";

// Lazy-load
const InspirationFeed = lazy(() =>
  import("./InspirationFeed").then((module) => ({
    default: module.InspirationFeed,
  }))
);

const FeedSkeleton = () => (
  <div className="w-full">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg overflow-hidden"
          style={{ height: `${200 + Math.random() * 150}px` }}
        >
          <Skeleton className="w-full h-full" />
        </div>
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

  const openChat = () => {
    navigate("/chat");
  };

  const STICKY_TOP_OFFSET = "top-20"; 

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50/30 pb-10">
        {/* ======================== MOBILE VIEW (< 1024px) ======================== */}
        <div className="lg:hidden space-y-4 pb-4">
          <MobileHomeHeader onSearch={handleSearchSubmit} />

          {/* Khoảng cách chặt chẽ hơn trên mobile */}
          <div className="px-3 space-y-3">
            {/* Banner Mobile (Tự động 3:1) */}
            <BannerHero aspectRatio="superSlim" className="rounded-2xl shadow-sm" />
            
            {/* Combo Grid Mobile */}
            {/* pl-2 để chừa chỗ cho ảnh pop-out bên trái */}
            <div className="pl-2 mt-1">
               <div className="flex items-center justify-between mb-2 pr-1">
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Gói Doanh nghiệp</h3>
               </div>
               <BusinessComboGrid />
            </div>
          </div>
        </div>

        {/* ======================== DESKTOP VIEW (Grid 12 Cột) ======================== */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* === CỘT 1: CONTEXT NAV (3/12 - Left Sidebar) === */}
          <div className="hidden lg:block lg:col-span-3">
            <div className={`sticky ${STICKY_TOP_OFFSET}`}>
              <ContextNav />
            </div>
          </div>

          {/* === CỘT 2: MAIN CONTENT AREA (6/12 - Center) === */}
          <div className="lg:col-span-6 hidden lg:block space-y-0">
            {/* 1. Banner Hero (Tỷ lệ superSlim 6:1 cho Desktop) */}
            <BannerHero 
                className="w-full rounded-b-none rounded-t-2xl shadow-sm border-b-0 z-0 relative" 
                aspectRatio="superSlim" 
            />

            {/* 2. Business Combo Grid */}
            <div className="bg-white rounded-b-2xl border border-gray-200 border-t-0 px-6 pb-6 pt-8 shadow-sm relative z-10 -mt-1">
               <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    Giải pháp Doanh nghiệp
                  </h3>
                  <span className="text-xs text-blue-600 font-medium cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                    Xem tất cả
                  </span>
               </div>
               
               {/* Grid 4 thẻ (Pop-out) */}
               <div className="pl-2">
                 <BusinessComboGrid />
               </div>
            </div>
          </div>

          {/* === CỘT 3: USER QUICK ACTIONS (3/12 - Right Sidebar) === */}
          <div className="hidden lg:block lg:col-span-3">
            <div className={`sticky ${STICKY_TOP_OFFSET}`}>
              <UserQuickActions onOpenChat={openChat} />
            </div>
          </div>

          {/* === KHỐI DƯỚI: DANH MỤC & FEED (Full Width 12/12) === */}
          
          {/* ✅ KÉO LÊN: -mt-10 (~40px) để triệt tiêu khoảng trắng thừa */}
          <div className="lg:col-span-12 space-y-4 -mt-4 lg:-mt-10 relative z-20">
            
            {/* Mobile Category */}
            <div className="lg:hidden px-3">
              <CategorySidebar layout="mobile-grid" />
            </div>

            {/* Desktop Horizontal Category Rail */}
            <div className="mb-1">
               <CategorySidebar layout="horizontal" />
            </div>

            {/* Feed sản phẩm */}
            <div className="bg-transparent pt-2">
              <div className="flex items-center gap-3 mb-4 px-1">
                 <h2 className="text-xl font-bold text-gray-900 tracking-tight">Gợi ý cho bạn</h2>
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
        </div>

        {/* FAB AI - Nút chat nổi (Desktop Only) */}
        <div className="hidden lg:block">
          <AiFab />
        </div>
      </div>
    </>
  );
};

export default function ChatAppPage() {
  return <ChatAppView />;
}