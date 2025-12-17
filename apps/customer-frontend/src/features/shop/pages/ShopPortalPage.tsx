// src/features/shop/pages/ShopPortalPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../hooks/useShop";
import { useProductQuickShop } from "../hooks/useProductQuickShop";

// Components
import { ShopCategorySidebar } from "../components/ShopCategorySidebar";
import { ProductGrid } from "../components/ProductGrid";
import { ProductPurchaseSheet } from "../components/details/ProductPurchaseSheet";
import { ShopFilterModal } from "../components/ShopFilterModal";
import { SortBar } from "../components/SortBar";

// UI Libs
import { Button } from "@/shared/components/ui/button";
import { SlidersHorizontal, Loader2, ArrowUp, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function ShopPortalPage() {
  const navigate = useNavigate();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const {
    products,
    loading: productsLoading,
    categories,
    selectedCategory,
    onCategoryChange,
    handleSearchSubmit,
    sortBy,
    setSortBy,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useShop();

  const {
    isSheetOpen,
    sheetMode,
    quickShopProduct,
    closeQuickShop,
    openQuickShop,
    isAddingToCart,
    inCart,
    minQuantity,
    selectedQuantity,
    setSelectedQuantity,
    currentPricePerUnit,
    handleQuickShopAddToCart,
    formatPrice,
  } = useProductQuickShop();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickShopBuyNow = async () => {
    if (!quickShopProduct) return;
    const success = await handleQuickShopAddToCart();
    if (success) navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
      {/* Header trang tra cứu */}
      <div className="bg-white border-b border-stone-200 py-8 px-6">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-2 italic">
            Thư Viện Tra Cứu
          </h1>
          <p className="text-stone-500 font-light text-sm">
            Tìm kiếm chi tiết trong kho tàng {categories.length} danh mục di
            sản.
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* === CỘT TRÁI: SIDEBAR === */}
          <div className="hidden lg:block w-[280px] flex-shrink-0 sticky top-24 z-30 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pb-10 pr-4 border-r border-stone-200">
            <div className="mb-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">
                Bộ Lọc
              </h3>
              {/* Search Input trong Sidebar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Từ khóa..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-amber-800 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleSearchSubmit(e.currentTarget.value);
                  }}
                />
              </div>
            </div>

            <ShopCategorySidebar
              selectedCategory={selectedCategory}
              onSelectCategory={(val) => {
                onCategoryChange(val);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            {/* Support Box - Style Giấy */}
            <div className="mt-8 p-5 bg-stone-100 rounded-sm border border-stone-200 text-center">
              <p className="font-serif text-sm font-bold text-stone-900 mb-1">
                Cần chế tác riêng?
              </p>
              <p className="text-xs text-stone-500 mb-3 font-light">
                Chúng tôi hỗ trợ thiết kế Bespoke độc bản cho doanh nghiệp.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white border-stone-300 hover:border-amber-800 text-stone-700 hover:text-amber-800 text-xs h-9 uppercase tracking-wider font-bold"
                onClick={() => navigate("/contact")}
              >
                Liên hệ Giám tuyển
              </Button>
            </div>
          </div>

          {/* === CỘT PHẢI: MAIN CONTENT === */}
          <div className="flex-1 min-w-0 w-full">
            {/* 1. MOBILE FILTER TRIGGER */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                className="w-full flex justify-between bg-white border-stone-200 text-stone-700"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={16} /> Bộ lọc & Danh mục
                </span>
                <span className="font-bold text-amber-800">
                  {selectedCategory !== "all" ? "1" : ""}
                </span>
              </Button>
            </div>

            {/* 2. TOOLBAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  {selectedCategory === "all"
                    ? "Tất cả tác phẩm"
                    : "Kết quả lọc"}
                </h2>
                <span className="text-sm font-mono text-stone-400">
                  [{products.length}]
                </span>
              </div>

              <div className="flex items-center gap-3">
                <SortBar sortBy={sortBy} onSortChange={setSortBy} />
              </div>
            </div>

            {/* 3. PRODUCT GRID */}
            <div className="min-h-[400px]">
              {productsLoading && products.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-amber-800" />
                  <p className="text-sm text-stone-400 font-light italic">
                    Đang tra cứu kho dữ liệu...
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  <ProductGrid
                    products={products}
                    loading={productsLoading}
                    onOpenQuickShop={openQuickShop}
                  />

                  {/* Load More */}
                  {hasNextPage && (
                    <div className="flex flex-col items-center pt-6 pb-12">
                      <Button
                        variant="ghost"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="text-stone-500 hover:text-amber-800 hover:bg-stone-100 transition-all text-xs font-bold uppercase tracking-[0.2em]"
                      >
                        {isFetchingNextPage ? (
                          <>
                            <Loader2 size={14} className="mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Tải thêm dữ liệu"
                        )}
                      </Button>
                    </div>
                  )}

                  {!hasNextPage && products.length > 0 && (
                    <div className="flex items-center justify-center gap-2 text-stone-300 pb-12">
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        End of Archive
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Components */}
      {quickShopProduct && (
        <ProductPurchaseSheet
          isOpen={isSheetOpen}
          onClose={closeQuickShop}
          mode={sheetMode}
          product={quickShopProduct}
          onAddToCart={async () => {
            await handleQuickShopAddToCart();
          }}
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

      <ShopFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 rounded-full shadow-lg bg-stone-900 text-white hover:bg-amber-900 transition-all duration-300 z-40 border border-white/10",
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none"
        )}
        onClick={scrollToTop}
      >
        <ArrowUp size={20} />
      </Button>
    </div>
  );
}
