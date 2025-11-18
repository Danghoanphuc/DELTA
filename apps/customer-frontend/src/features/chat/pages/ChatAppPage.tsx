// src/features/chat/pages/ChatAppPage.tsx (ĐÃ TÁI CẤU TRÚC)

import React, { lazy, Suspense, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import { MobileHomeHeader } from "../components/MobileHomeHeader";

// UI Components
import { BannerHero } from "../components/BannerHero";
import { ContextNav } from "../components/ContextNav";
import { AiFab } from "../components/AiFab";
import { CategorySidebar } from "../components/CategorySidebar";
import { UserQuickActions } from "../components/UserQuickActions";
import { Skeleton } from "@/shared/components/ui/skeleton";

// Hooks
import { useShop } from "@/features/shop/hooks/useShop";

// Lazy-load
const InspirationFeed = lazy(() =>
  import("./InspirationFeed").then((module) => ({
    default: module.InspirationFeed,
  }))
);

// (FeedSkeleton giữ nguyên)
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
  // (Logic hook useShop và useEffect xử lý search params giữ nguyên)
  const {
    products,
    loading: productsLoading,
    handleSearchSubmit,
    taxonomy,
    selectedCategory,
    onCategoryChange,
    sortBy,
    setSortBy,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useShop();

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
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
  }, [searchParams.get("search") || ""]); // Phụ thuộc đã chính xác

  const openChat = () => {
    navigate("/chat");
  };

  const STICKY_TOP_OFFSET = "top-4";

  return (
    <>
      <div className="flex flex-col">
        {/* ======================== MOBILE QUICK / EVENT BLOCK ======================== */}
        <div className="lg:hidden px-0 space-y-4">
          <MobileHomeHeader onSearch={handleSearchSubmit} />

          <div className="px-3">
            <BannerHero />
          </div>
        </div>

        {/* =================================================================== */}
        {/* ✅✅✅ LAYOUT MỚI 3/12 + 9/12 (THEO YÊU CẦU CỦA PHÚC) ✅✅✅ */}
        {/* =================================================================== */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* === CỘT 1: CONTEXT NAV (3/12 - Desktop Only) === */}
          <div className="hidden lg:block lg:col-span-3">
            <div className={`sticky ${STICKY_TOP_OFFSET}`}>
              <ContextNav />
            </div>
          </div>

          {/* === CỘT 2: BANNER HERO (6/12) === */}
          <div className="lg:col-span-6 hidden lg:block">
            <BannerHero className="h-full min-h-[360px]" />
          </div>

          {/* === CỘT 3: USER QUICK ACTIONS (3/12 - Desktop Only) === */}
          <div className="hidden lg:block lg:col-span-3">
            <div className={`sticky ${STICKY_TOP_OFFSET}`}>
              <UserQuickActions onOpenChat={openChat} />
            </div>
          </div>

          {/* === KHỐI DƯỚI 12/12 === */}
          <div className="lg:col-span-12 space-y-4">
            <div className="lg:hidden px-3">
              <CategorySidebar layout="mobile-grid" />
            </div>
            {/* Danh mục sản phẩm full width */}
            <CategorySidebar layout="horizontal" />

            {/* Feed full width */}
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
        {/* =================================================================== */}


        {/* FAB AI - Desktop Only */}
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