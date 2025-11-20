// src/features/chat/pages/InspirationFeed.tsx
import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import { ProductCard } from "@/features/shop/components/ProductCard";
import {
  InspirationPinCard,
  InspirationPin,
} from "@/features/shop/components/InspirationPinCard";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useProductQuickShop } from "@/features/shop/hooks/useProductQuickShop";
import { ProductPurchaseSheet } from "@/features/shop/components/details/ProductPurchaseSheet";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

export type FeedItem = (Product | InspirationPin) & { feedId: string };

// Dữ liệu sẽ lấy từ API (Mock tạm)
const mockAiPins: InspirationPin[] = [];

const FeedSkeleton = () => (
  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 p-4 md:p-6">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="rounded-lg overflow-hidden break-inside-avoid mb-4"
        style={{ height: `${200 + Math.random() * 150}px` }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    ))}
  </div>
);

interface InspirationFeedProps {
  products: Product[];
  isLoading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export const InspirationFeed = ({
  products,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: InspirationFeedProps) => {
  const navigate = useNavigate();

  const {
    isSheetOpen,
    sheetMode,
    quickShopProduct,
    openQuickShop,
    closeQuickShop,
    isAddingToCart,
    inCart,
    minQuantity,
    selectedQuantity,
    setSelectedQuantity,
    currentPricePerUnit,
    handleQuickShopAddToCart,
    formatPrice,
  } = useProductQuickShop();

  const handleQuickShopAddToCartWrapper = async (): Promise<void> => {
    await handleQuickShopAddToCart();
  };

  const handleQuickShopBuyNow = async (): Promise<void> => {
    if (!quickShopProduct) return;
    const success = await handleQuickShopAddToCart();
    if (success) {
      navigate("/checkout");
    }
  };

  // Trộn và xử lý dữ liệu
  const items = useMemo((): FeedItem[] => {
    const productItems: FeedItem[] = products.map((p) => ({
      ...p,
      feedId: `product_${p._id}`,
    }));
    const pinItems: FeedItem[] = mockAiPins.map((p) => ({
      ...p,
      feedId: `pin_${p.id}`,
    }));
    // Có thể thêm logic sort/shuffle tại đây nếu cần
    return [...productItems, ...pinItems];
  }, [products]);

  // Logic cuộn vô tận
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "0px 0px 500px 0px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && products.length === 0) {
    return <FeedSkeleton />;
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* ✅ KEY FIX: Chuyển từ Grid sang Columns (Masonry Layout)
           - columns-2 -> columns-5: Tạo các cột nước chảy.
           - gap-4: Khoảng cách giữa các cột.
           - space-y-4: Khoảng cách giữa các item trong cùng 1 cột (fallback).
        */}
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
          {items.map((item) => (
            <div 
              key={item.feedId} 
              // ✅ break-inside-avoid: Ngăn trình duyệt cắt đôi Card khi chuyển cột
              // ✅ mb-4: Tạo khoảng cách dưới cho mỗi item
              className="break-inside-avoid mb-4"
            >
              {"type" in item && item.type === "inspiration" ? (
                <InspirationPinCard pin={item} />
              ) : (
                <ProductCard
                  product={item as FeedItem & any}
                  onOpenQuickShop={openQuickShop}
                />
              )}
            </div>
          ))}
        </div>

        {/* Trigger tải thêm */}
        <div ref={ref} className="h-10 w-full flex justify-center items-center mt-6">
          {isFetchingNextPage ? (
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          ) : !hasNextPage && products.length > 0 ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="w-12 h-[1px] bg-gray-200"></span>
              <span>Hết sản phẩm</span>
              <span className="w-12 h-[1px] bg-gray-200"></span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Sheet Mua nhanh */}
      {quickShopProduct && (
        <ProductPurchaseSheet
          isOpen={isSheetOpen}
          onClose={closeQuickShop}
          mode={sheetMode}
          product={quickShopProduct}
          onAddToCart={handleQuickShopAddToCartWrapper}
          onBuyNow={handleQuickShopBuyNow}
          isAddingToCart={isAddingToCart}
          inCart={inCart}
          minQuantity={minQuantity}
          selectedQuantity={selectedQuantity}
          onQuantityChange={setSelectedQuantity}
          formatPrice={formatPrice}
          currentPricePerUnit={currentPricePerUnit}
        />
      )}
    </>
  );
};