// features/shop/pages/ShopPage.tsx
// (Cập nhật để quản lý Bottom Sheet "Mua nhanh")

import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { CartSidebar } from "@/features/shop/pages/CartSidebar";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useShop } from "../hooks/useShop";
import { ProductGrid } from "../components/ProductGrid";
import { ShopFilterModal } from "../components/ShopFilterModal";
import { ShopHeader } from "../components/ShopHeader";
import { ShopFilterBar } from "../components/ShopFilterBar";

// ✅ Bước 1: Import Hook và Sheet
import { useProductQuickShop } from "../hooks/useProductQuickShop";
import { ProductPurchaseSheet } from "../components/details/ProductPurchaseSheet";

export function ShopPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate(); // ✅ Khởi tạo navigate

  const { getCartItemCount } = useCartStore();
  const { accessToken } = useAuthStore();

  const {
    products,
    loading,
    handleSearchSubmit,
    categories,
    selectedCategory,
    onCategoryChange,
    sortBy,
    setSortBy,
  } = useShop();

  // ✅ Bước 2: Gọi hook "Quick Shop"
  const {
    isSheetOpen,
    sheetMode,
    quickShopProduct,
    openQuickShop, // Sẽ truyền xuống ProductGrid
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

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmit(prompt);
  };

  // ✅ Bước 3: Hàm "Mua ngay" (từ Sheet)
  const handleQuickShopBuyNow = async () => {
    if (!quickShopProduct) return;

    // 1. Thêm vào giỏ
    await handleQuickShopAddToCart(); // Hàm này sẽ tự đóng Sheet nếu thành công

    // 2. Kiểm tra lỗi (từ store)
    if (!useCartStore.getState().isLoading) {
      // 3. Điều hướng
      navigate("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-0 lg:pt-0">
        <ShopHeader
          prompt={prompt}
          onPromptChange={setPrompt}
          onSearchSubmit={handleAiSearch}
          cartItemCount={getCartItemCount(!!accessToken)}
          onCartOpen={() => setIsCartOpen(true)}
          onFilterOpen={() => setIsFilterModalOpen(true)}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="pt-28 md:pt-20">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="hidden md:block">
              <ShopFilterBar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onFilterOpen={() => setIsFilterModalOpen(true)}
              />
            </div>

            {/* ✅ Bước 4: Truyền hàm `openQuickShop` xuống Grid */}
            <ProductGrid
              products={products}
              loading={loading}
              onOpenQuickShop={openQuickShop}
            />
          </div>
        </div>
      </div>

      {/* Sidebars & Modals (Giữ nguyên) */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ShopFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* ✅ Bước 5: Render Bottom Sheet (nó sẽ tự ẩn/hiện) */}
      {quickShopProduct && (
        <ProductPurchaseSheet
          isOpen={isSheetOpen}
          onClose={closeQuickShop}
          mode={sheetMode}
          product={quickShopProduct}
          onAddToCart={handleQuickShopAddToCart}
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
    </div>
  );
}
