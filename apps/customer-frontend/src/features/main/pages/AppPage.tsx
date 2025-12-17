// apps/customer-frontend/src/features/chat/pages/AppPage.tsx

import React, { lazy, Suspense, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MobileHomeHeader } from "../components/MobileHomeHeader";

// UI Components - AN NAM EDITION
import { BannerHero } from "../components/BannerHero";
import { ContextNav } from "../components/ContextNav";
import { AiFab } from "../../chat/components/AiFab";
import { CategorySidebar } from "../components/CategorySidebar";
import { UserQuickActions } from "../components/UserQuickActions";
import { BusinessComboGrid } from "../components/BusinessComboGrid";

// Hooks
import { useShop } from "@/features/shop/hooks/useShop";
import { cn } from "@/shared/lib/utils";
import { Sparkles } from "lucide-react";

// Lazy-load
const InspirationFeed = lazy(() =>
  import("../../chat/pages/InspirationFeed").then((module) => ({
    default: module.InspirationFeed,
  }))
);

const FeedSkeleton = () => (
  <div className="w-full mt-8">
    <div className="flex items-center gap-4 mb-6">
      <div className="h-8 w-48 bg-stone-200 rounded-sm animate-pulse" />
      <div className="h-px flex-1 bg-stone-200" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="rounded-sm overflow-hidden bg-stone-200 animate-pulse"
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
    <div className="flex flex-col min-h-screen pb-20 font-sans text-stone-900">
      {/* ======================== MOBILE VIEW (< 1024px) ======================== */}
      <div className="lg:hidden flex flex-col gap-6 pb-4">
        <MobileHomeHeader onSearch={handleSearchSubmit} />

        <div className="px-4 flex flex-col gap-8">
          {/* 1. Navigation Cards */}
          <ContextNav layout="mobile-grid" />

          {/* 2. Hero Banner */}
          <div className="space-y-4">
            <BannerHero
              aspectRatio="superSlim"
              className="rounded-sm shadow-md overflow-hidden border border-stone-200"
            />
            {/* VIP Card Mobile */}
            <div className="bg-[#2C1810] rounded-sm p-5 text-[#F9F8F6] flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
              <div className="relative z-10">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-1">
                  Private Lounge
                </p>
                <p className="font-serif font-bold text-lg leading-none">
                  Đối tác Doanh Nghiệp
                </p>
              </div>
              <button
                onClick={() => navigate("/business")}
                className="relative z-10 bg-amber-800 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-amber-700 shadow-lg"
              >
                Mở thẻ
              </button>
            </div>
          </div>

          {/* 3. Combos Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-600" />
                Gợi ý Giám tuyển
              </h3>
            </div>
            <div className="-ml-1">
              <BusinessComboGrid />
            </div>
          </div>

          {/* 4. Categories */}
          <CategorySidebar layout="mobile-grid" />
        </div>
      </div>

      {/* ======================== DESKTOP VIEW (Layout Tạp Chí) ======================== */}
      <div className="hidden lg:grid max-w-[1600px] mx-auto w-full px-12 pt-6 grid-cols-12 gap-10 items-start">
        {/* === LEFT MAIN BLOCK (9 Cột) === */}
        <div className="col-span-9 flex flex-col gap-10">
          {/* 1. BusinessComboGrid (Top - Showcase) */}
          <div className="w-full">
            <BusinessComboGrid className="py-0" />
          </div>

          {/* 2. BannerHero (Middle - Highlight) */}
          <div className="rounded-sm overflow-hidden shadow-lg border border-stone-200 relative group">
            <div className="absolute inset-0 border-[6px] border-white/10 z-20 pointer-events-none"></div>
            <BannerHero className="w-full" aspectRatio="superSlim" />
          </div>

          {/* 3. CategorySidebar (Bottom - Discovery) */}
          <div className="w-full border-t border-b border-stone-200 py-6">
            <CategorySidebar
              layout="horizontal"
              className="bg-transparent border-0 p-0"
            />
          </div>
        </div>

        {/* === RIGHT SIDEBAR (3 Cột - Sticky Utility) === */}
        <div className="col-span-3 flex flex-col gap-6 sticky top-24">
          <UserQuickActions onOpenChat={openChat} />

          {/* Mini Banner Ad */}
          <div className="bg-stone-200 h-64 w-full rounded-sm flex items-center justify-center text-stone-400 font-mono text-xs uppercase tracking-widest border border-stone-300">
            [Khu vực Quảng cáo Di sản]
          </div>
        </div>

        {/* === INSPIRATION FEED (12/12 Cột) === */}
        <div className="col-span-12 mt-4 pt-10 border-t border-stone-200">
          <div className="flex items-center justify-between mb-8 px-1">
            <div>
              <span className="font-mono text-xs font-bold text-amber-800 uppercase tracking-widest block mb-2">
                Gallery
              </span>
              <h2 className="text-4xl font-serif font-bold text-stone-900 italic">
                Cảm hứng Chế tác
              </h2>
            </div>

            {/* Filter Buttons - Style Minimal */}
            <div className="flex gap-3">
              <button className="px-5 py-2 rounded-sm bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-900 transition-colors">
                Tất cả
              </button>
              <button className="px-5 py-2 rounded-sm bg-transparent text-stone-500 border border-stone-300 text-xs font-bold uppercase tracking-wider hover:border-stone-900 hover:text-stone-900 transition-colors">
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
    </div>
  );
};

export default function ChatAppPage() {
  return <ChatAppView />;
}
