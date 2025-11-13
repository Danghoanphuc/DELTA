// src/features/chat/pages/ChatAppPage.tsx (CẬP NHẬT)

import React, { lazy, Suspense, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// UI Components
import { ChatTeaserSidebar } from "../components/ChatTeaserSidebar";
import { PromotionCarousel } from "../components/PromotionCarousel";
import { UserQuickActions } from "../components/UserQuickActions";
import { ShopFilterBar } from "@/features/shop/components/ShopFilterBar";
import { ShopFilterModal } from "@/features/shop/components/ShopFilterModal";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { FeaturedCategoriesGrid } from "../components/FeaturedCategoriesGrid"; // ✅ Import component mới

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
  <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
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

const ChatAppView = () => {
  // ✅ Lấy thêm props cuộn vô tận từ useShop
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
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ SỬA: Tránh vòng lặp navigation bằng cách dùng ref để track đã xử lý chưa
  const hasProcessedSearchRef = React.useRef(false);
  
  useEffect(() => {
    const searchTermFromUrl = searchParams.get("search");
    // ✅ Chỉ xử lý một lần khi mount hoặc khi search param thay đổi
    if (searchTermFromUrl && !hasProcessedSearchRef.current) {
      hasProcessedSearchRef.current = true;
      handleSearchSubmit(searchTermFromUrl);
      // ✅ Tạo searchParams mới và xóa search param
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("search");
      setSearchParams(newSearchParams, { replace: true });
    } else if (!searchTermFromUrl) {
      // ✅ Reset flag khi không còn search param
      hasProcessedSearchRef.current = false;
    }
    // ✅ Chỉ depend vào searchTermFromUrl string value, không depend vào object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("search") || ""]);

  return (
    <div className="flex flex-col gap-6">
      {" "}
      {/* ✅ Tăng gap chung */}
      {/* 1. CỤM LAYOUT DASHBOARD (1-2-1) */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cột 1 (1/4 Trái): Chat Teaser */}
        <div className="lg:col-span-1">
          <ChatTeaserSidebar />
        </div>

        {/* Cột 2 & 3 (2/4 Giữa): Banner + Danh mục nổi bật */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* 1. Banner Khuyến mãi */}
          <PromotionCarousel />

          {/* 2. Lấp đầy khoảng trống bằng Component mới (Task 3) */}
          <FeaturedCategoriesGrid />
        </div>

        {/* Cột 4 (1/4 Phải): User Quick Actions */}
        <div className="lg:col-span-1">
          <UserQuickActions />
        </div>
      </div>
      {/* 2. BỘ LỌC (Vị trí đúng) */}
      <div className="px-4 md:px-6 max-w-7xl mx-auto w-full">
        <ShopFilterBar
          taxonomy={taxonomy}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onFilterOpen={() => setIsFilterModalOpen(true)}
        />
      </div>
      {/* 3. FEED SẢN PHẨM (Cuộn vô tận - Task 2) */}
      <Suspense fallback={<FeedSkeleton />}>
        <InspirationFeed
          products={products}
          isLoading={productsLoading}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </Suspense>
      {/* (Modal Filter giữ nguyên) */}
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
    </div>
  );
};

export default function ChatAppPage() {
  return <ChatAppView />;
}
