// src/features/chat/pages/ChatAppPage.tsx (ĐÃ TÁI CẤU TRÚC)

import React, { lazy, Suspense, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  MapPin,
  Wand2,
  Building2,
  Timer,
  CalendarDays,
  Search,
  ShoppingCart,
  Bell,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";

// UI Components
import { ValuePropBar } from "../components/ValuePropBar";
import { BannerHero } from "../components/BannerHero";
import { AIBanner } from "../components/AIBanner";
import { ContextNav } from "../components/ContextNav";
import { AiFab } from "../components/AiFab";
import { CategorySidebar } from "../components/CategorySidebar";
import { UserQuickActions } from "../components/UserQuickActions";
import { ShopFilterBar } from "@/features/shop/components/ShopFilterBar";
import { ShopFilterModal } from "@/features/shop/components/ShopFilterModal";
import { Skeleton } from "@/shared/components/ui/skeleton";
// ❌ GỠ BỎ: FeaturedCategoriesGrid (vì đã có ContextNav)

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
    <div className="columns-2 md:columns-3 lg:columns-5 gap-3 space-y-3">
      {[...Array(10)].map((_, i) => (
        <Skeleton
          key={i}
          className="rounded-lg h-64"
          style={{ height: `${200 + Math.random() * 150}px` }}
        />
      ))}
    </div>
  </div>
);

const quickUtilityItems = [
  { label: "Printz Studio", icon: Wand2, href: "/design-editor" },
  { label: "Printz B2B", icon: Building2, href: "/contact" },
  { label: "In gấp 24h", icon: Timer, href: "/shop?fast=1" },
  { label: "Theo sự kiện", icon: CalendarDays, href: "/inspiration" },
];

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

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const hasProcessedSearchRef = React.useRef(false);

  const handleMobileSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = mobileSearchTerm.trim();
    if (!trimmed) return;
    handleSearchSubmit(trimmed);
    setMobileSearchTerm("");
  };

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

  // Giả định tổng chiều cao của Header (logo) + ValuePropBar
  // Header (h-16 = 64px) + ValuePropBar (h-10 = 40px) = 104px
  const STICKY_TOP_OFFSET = "top-[104px]";

  return (
    <div className="flex flex-col">
      {/* Khu vực 0: Thanh “niềm tin” (12/12) */}
      <ValuePropBar />

      {/* ======================== MOBILE QUICK / EVENT BLOCK ======================== */}
      <div className="lg:hidden px-0  space-y-4">
        <div className="mx-3 rounded-3xl bg-gradient-to-b from-[#e7f9ff] via-[#fef5ff] to-white shadow-[0_20px_60px_rgba(45,96,255,0.1)] border border-white/80 px-4 pt-5 pb-5 relative">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute -top-10 -left-12 w-44 h-44 bg-[#d9f0ff] rounded-full blur-3xl" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffe4fb] rounded-full blur-3xl" />
          </div>
          <div className="relative z-20 space-y-4">
            <div className="flex items-center gap-3">
              <form
                className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2"
                onSubmit={handleMobileSearch}
              >
                <Search size={18} className="text-gray-400" />
                <Input
                  value={mobileSearchTerm}
                  onChange={(e) => setMobileSearchTerm(e.target.value)}
                  placeholder="Tìm sản phẩm hoặc dịch vụ..."
                  className="border-none shadow-none p-0 focus-visible:ring-0 text-sm bg-transparent"
                />
              </form>
            <div className="flex items-center gap-2">
              <Link
                to="/notifications"
                className="h-10 w-10 rounded-2xl border border-gray-200 bg-white/90 flex items-center justify-center text-gray-700 hover:text-blue-600"
                aria-label="Thông báo"
              >
                <Bell size={18} />
              </Link>
              <Link
                to="/cart"
                className="h-10 w-10 rounded-2xl border border-gray-200 bg-white/90 flex items-center justify-center text-gray-700 hover:text-blue-600"
                aria-label="Giỏ hàng"
              >
                <ShoppingCart size={20} />
              </Link>
            </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quickUtilityItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-white/80 bg-white/85 p-2 text-center text-xs font-medium text-gray-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  <item.icon size={20} className="text-blue-600" />
                  <span className="leading-tight">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 -mt-6">
          <div className="rounded-2xl overflow-hidden shadow-[0_20px_45px_rgba(15,23,42,0.15)]">
            <BannerHero />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ✅✅✅ LAYOUT MỚI 3/12 + 9/12 (THEO YÊU CẦU CỦA PHÚC) ✅✅✅ */}
      {/* =================================================================== */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6  grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* === CỘT 1: SIDEBAR TRÁI (3/12 - Desktop Only) === */}
        <div className="hidden lg:block lg:col-span-3">
          <div className={`sticky ${STICKY_TOP_OFFSET}`}>
            
            <CategorySidebar />

          </div>
        </div>

        {/* === CỘT 2: KHỐI CHÍNH (9/12) === */}
        {/* ✅ SỬA: Giảm "space-y-6" -> "space-y-4" */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Mobile Category Grid */}
          <div className="lg:hidden px-3 mt-4">
            <CategorySidebar isMobileGrid={true} />
          </div>

          {/* Mobile Delivery Address - Displayed only on mobile */}
          <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-blue-600 flex-shrink-0" />
              <span className="text-gray-600">Giao đến:</span>
              <span className="font-medium text-gray-800 flex-1 truncate">
                Quận 1, Hồ Chí Minh
              </span>
            </div>
          </div>

          {/* --- "Phần trên" (Chia 6/9 và 3/9) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
            
            {/* (1) + (3): Khối Banner & Điều hướng (6/9) */}
            {/* ✅ SỬA: Giảm "space-y-7" -> "space-y-4" */}
            <div className="lg:col-span-6 space-y-4">
              {/* (1) Khối Banner - Desktop only: both banners */}
              <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 gap-6">
                <AIBanner />
                <BannerHero />
              </div>
              {/* (3) Khối Điều hướng - Desktop Only */}
              <div className="hidden lg:block">
                <ContextNav />
              </div>
            </div>

            {/* (2) Khối Tiện ích (3/9) - Desktop Only */}
            <div className="hidden lg:block lg:col-span-3">
              <div className={`sticky ${STICKY_TOP_OFFSET}`}>
                <UserQuickActions />
              </div>
            </div>
          </div>

          {/* --- "Phần dưới" (Chiếm 9/12) --- */}
          
          {/* (1) Khối Lọc (Giờ đã rộng 9/12) */}
          <ShopFilterBar
            taxonomy={taxonomy}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onFilterOpen={() => setIsFilterModalOpen(true)}
          />

          {/* (2) Khối Feed (Giờ đã rộng 9/12) */}
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

      {/* Modal Filter (cho mobile) */}
      <ShopFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={taxonomy.map((t) => ({
          label: t.label,
          value: t.value,
        }))}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* FAB AI - Desktop Only */}
      <div className="hidden lg:block">
        <AiFab />
      </div>
    </div>
  );
};

export default function ChatAppPage() {
  return <ChatAppView />;
}