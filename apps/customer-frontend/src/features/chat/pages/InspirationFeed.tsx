// src/features/chat/pages/InspirationFeed.tsx (CẬP NHẬT)
import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import { ProductCard } from "@/features/shop/components/ProductCard";
import {
  InspirationPinCard,
  InspirationPin,
} from "@/features/shop/components/InspirationPinCard";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCartStore } from "@/stores/useCartStore";
import { useProductQuickShop } from "@/features/shop/hooks/useProductQuickShop";
import { ProductPurchaseSheet } from "@/features/shop/components/details/ProductPurchaseSheet";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer"; // ✅ Thư viện theo dõi cuộn

export type FeedItem = (Product | InspirationPin) & { feedId: string };

// Dữ liệu sẽ lấy từ API
const mockAiPins: InspirationPin[] = [];

// (FeedSkeleton giữ nguyên)
const FeedSkeleton = () => (
  <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3 p-4 md:p-6">
    {[...Array(10)].map((_, i) => (
      <Skeleton
        key={i}
        className="rounded-lg h-64"
        style={{ height: `${200 + Math.random() * 150}px` }}
      />
    ))}
  </div>
);

// ✅ ĐỊNH NGHĨA PROPS MỚI
interface InspirationFeedProps {
  products: Product[];
  isLoading: boolean;
  // Props cho cuộn vô tận
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

  // (Logic Mua nhanh giữ nguyên)
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
  // Wrapper cho AddToCart (trả về void thay vì boolean)
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

  // Dữ liệu sẽ lấy từ API
  const items = useMemo((): FeedItem[] => {
    const productItems: FeedItem[] = products.map((p) => ({
      ...p,
      feedId: `product_${p._id}`,
    }));
    const pinItems: FeedItem[] = mockAiPins.map((p) => ({
      ...p,
      feedId: `pin_${p.id}`,
    }));
    return [...productItems, ...pinItems];
  }, [products]);

  // ✅ LOGIC CUỘN VÔ TẬN
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "0px 0px 500px 0px", // Trigger khi cách 500px cuối viewport
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // (Loading ban đầu)
  if (isLoading && products.length === 0) {
    return <FeedSkeleton />;
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* ✅ SỬA: Giảm từ lg:columns-5 xuống lg:columns-4 */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {items.map((item) => (
            <div key={item.feedId} className="break-inside-avoid mb-3">
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

        {/* ✅ TRIGGER TẢI THÊM */}
        <div ref={ref} className="h-10 w-full flex justify-center items-center">
          {isFetchingNextPage ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : !hasNextPage && products.length > 0 ? (
            <p className="text-sm text-gray-500">
              Bạn đã xem hết tất cả sản phẩm
            </p>
          ) : null}
        </div>
      </div>

      {/* (Sheet Mua nhanh - Giữ nguyên) */}
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