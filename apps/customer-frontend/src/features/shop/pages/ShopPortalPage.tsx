// src/features/shop/pages/ShopPortalPage.tsx (CẬP NHẬT)
import { useNavigate } from "react-router-dom";
import { useShop } from "../hooks/useShop";
import { useProductQuickShop } from "../hooks/useProductQuickShop";
// ❌ GỠ BỎ: useCartStore
import { CategoryTree } from "../components/CategoryTree";
import { SortBar } from "../components/SortBar";
import { ProductGrid } from "../components/ProductGrid";
import { ProductPurchaseSheet } from "../components/details/ProductPurchaseSheet";
import { ShopFilterModal } from "../components/ShopFilterModal";
import { Button } from "@/shared/components/ui/button";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";

export function ShopPortalPage() {
  const navigate = useNavigate();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const {
    products,
    loading: productsLoading,
    taxonomy,
    categories, // Cần cho Modal
    selectedCategory,
    onCategoryChange,
    sortBy,
    setSortBy,
  } = useShop();

  // (Logic Mua nhanh - giống hệt /app)
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

  return (
    <>
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-4 lg:gap-8 px-4 md:px-6 pt-6">
        {/* === CỘT TRÁI (1/4) - CÂY DANH MỤC === */}
        <div className="hidden lg:block lg:col-span-1">
          <CategoryTree
            taxonomy={taxonomy}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>

        {/* === CỘT PHẢI (3/4) - LƯỚI SẢN PHẨM === */}
        <div className="lg:col-span-3">
          {/* Header (SortBar + Nút Filter Mobile) */}
          <div className="flex justify-between items-center mb-4">
            <SortBar sortBy={sortBy} onSortChange={setSortBy} />
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setIsFilterModalOpen(true)}
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Lọc
            </Button>
          </div>

          {/* Hiển thị Loading */}
          {productsLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Lưới sản phẩm */}
          {!productsLoading && (
            <ProductGrid
              products={products}
              loading={productsLoading}
              onOpenQuickShop={openQuickShop}
            />
          )}
        </div>
      </div>

      {/* Sheet Mua nhanh (Toàn cục) */}
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

      {/* Modal Filter (Mobile) */}
      <ShopFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={categories} // Dùng categories ngang
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
    </>
  );
}

export default ShopPortalPage;
