// src/features/shop/pages/ShopPortalPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../hooks/useShop";
import { useProductQuickShop } from "../hooks/useProductQuickShop";

// Components
import { PacdoraBanner } from "../components/PacdoraBanner";
import { ShopCategorySidebar } from "../components/ShopCategorySidebar"; // Component mới
import { ProductGrid } from "../components/ProductGrid";
import { ProductPurchaseSheet } from "../components/details/ProductPurchaseSheet";
import { ShopFilterModal } from "../components/ShopFilterModal";
import { SortBar } from "../components/SortBar";

// UI Libs
import { Button } from "@/shared/components/ui/button";
import { SlidersHorizontal, Loader2, ArrowUp } from "lucide-react";
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
    isFetchingNextPage
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

  // Scroll to top logic (UX Enhancement)
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
    <div className="min-h-screen bg-white">
      {/* Container giới hạn độ rộng chuẩn Dashboard (1600px) */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* === CỘT TRÁI: SIDEBAR (Desktop Only) === */}
          {/* Sticky: Giữ sidebar cố định khi cuộn xuống */}
          {/* ✅ FIX Z-INDEX: Tăng từ z-10 lên z-40 để đè lên Banner (do Banner có animate transform context) */}
          <div className="hidden lg:block w-[260px] flex-shrink-0 sticky top-24 z-40 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pb-10">
             <ShopCategorySidebar 
                selectedCategory={selectedCategory}
                onSelectCategory={(val) => {
                  onCategoryChange(val);
                  window.scrollTo({ top: 0, behavior: 'smooth' }); // UX: Cuộn lên đầu khi đổi danh mục
                }}
             />
             
             {/* Mini Banner / Support Box ở chân Sidebar (Tăng độ tin cậy) */}
             <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
                <p className="text-xs font-semibold text-blue-800 mb-2">Cần thiết kế riêng?</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white border-blue-200 hover:border-blue-400 text-blue-600 text-xs h-8"
                  onClick={() => navigate('/contact')}
                >
                  Liên hệ Printz Studio
                </Button>
             </div>
          </div>

          {/* === CỘT PHẢI: MAIN CONTENT === */}
          <div className="flex-1 min-w-0 w-full">
            
            {/* 1. BANNER (Visual Anchor) */}
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <PacdoraBanner onSearch={handleSearchSubmit} />
            </div>

            {/* 2. MOBILE STICKY NAV (Chỉ hiện Mobile) */}
            {/* Sticky dưới header chính (top-16 giả định header cao 64px) */}
            <div className="lg:hidden sticky top-[60px] z-30 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 shadow-sm border-b border-gray-100 mb-6 transition-all">
                <ShopCategorySidebar 
                  selectedCategory={selectedCategory}
                  onSelectCategory={onCategoryChange}
                />
            </div>

            {/* 3. TOOLBAR (Kết nối cảm xúc: Số lượng kết quả & Sắp xếp) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-baseline gap-2">
                   <h2 className="text-xl font-bold text-slate-900">
                      {selectedCategory === 'all' ? 'Mockups nổi bật' : 'Kết quả tìm kiếm'}
                   </h2>
                   <span className="text-sm font-medium text-slate-500">
                      ({products.length} sản phẩm)
                   </span>
                </div>

                <div className="flex items-center gap-3">
                    <SortBar sortBy={sortBy} onSortChange={setSortBy} />
                    
                    <Button
                        variant="outline"
                        className="lg:hidden h-10 px-4 border-gray-200 hover:bg-gray-50"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <SlidersHorizontal size={16} className="mr-2" />
                        Bộ lọc
                    </Button>
                </div>
            </div>

            {/* 4. PRODUCT GRID (Không gian chính) */}
            <div className="min-h-[400px]">
              {productsLoading && products.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 gap-3">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-400 font-medium">Đang tìm kiếm sản phẩm tốt nhất...</p>
                </div>
              ) : (
                <div className="space-y-12">
                    <ProductGrid
                      products={products}
                      loading={productsLoading}
                      onOpenQuickShop={openQuickShop}
                    />
                    
                    {/* Load More Button (Psychology: "Xem thêm" thay vì phân trang giúp giữ flow) */}
                    {hasNextPage && (
                        <div className="flex flex-col items-center pt-6 pb-12">
                            <Button 
                              variant="outline" 
                              size="lg"
                              onClick={() => fetchNextPage()} 
                              disabled={isFetchingNextPage}
                              className="min-w-[220px] h-12 rounded-full border-2 border-gray-100 hover:border-blue-600 hover:text-blue-600 transition-all text-base font-medium"
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                        Đang tải thêm...
                                    </>
                                ) : (
                                    "Xem thêm sản phẩm"
                                )}
                            </Button>
                            <p className="text-xs text-gray-400 mt-3">
                                Hiển thị {products.length} trên tổng số sản phẩm
                            </p>
                        </div>
                    )}
                    
                    {/* End of list state */}
                    {!hasNextPage && products.length > 0 && (
                        <div className="flex items-center justify-center gap-2 text-gray-300 pb-12">
                            <div className="h-px w-12 bg-gray-200" />
                            <span className="text-xs font-medium uppercase tracking-wider">Hết danh sách</span>
                            <div className="h-px w-12 bg-gray-200" />
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
          onAddToCart={async () => { await handleQuickShopAddToCart(); }}
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

      {/* Scroll To Top Button (Psychology: Control & Convenience) */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 rounded-full shadow-lg bg-slate-900 text-white hover:bg-blue-600 transition-all duration-300 z-40",
          showScrollTop ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        )}
        onClick={scrollToTop}
      >
        <ArrowUp size={20} />
      </Button>
    </div>
  );
}

export default ShopPortalPage;