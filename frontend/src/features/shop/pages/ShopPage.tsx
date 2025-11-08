// features/shop/pages/ShopPage.tsx (ĐÃ CẬP NHẬT)
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { CartSidebar } from "@/features/shop/pages/CartSidebar";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useShop } from "../hooks/useShop";
import { ShopHeader } from "../components/ShopHeader"; // 1. Đổi tên import
import { ProductGrid } from "../components/ProductGrid";
// 2. Loại bỏ các import không dùng
// import { Button } from "@/shared/components/ui/button";
// import { Sparkles } from "lucide-react";

export function ShopPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartItemCount } = useCartStore();
  const { accessToken } = useAuthStore();

  const {
    products, // 3. Nhận lại 'products' (đã lọc)
    loading,
    // loadingAI, // (Không còn)
    handleSearchSubmit, // 4. Nhận hàm submit mới
    categories,
    selectedCategory,
    onCategoryChange,
    sortBy,
    setSortBy,
  } = useShop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        {/* Header AI-First */}
        <div className="bg-white/95 backdrop-blur-sm border-b sticky top-0 lg:top-0 z-30">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            {/* 5. Sử dụng ShopHeader component */}
            <ShopHeader
              cartItemCount={getCartItemCount(!!accessToken)}
              onCartOpen={() => setIsCartOpen(true)}
              onSearchSubmit={handleSearchSubmit} // 6. Truyền prop mới
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categories={categories}
            />
          </div>
        </div>

        {/* 7. Loại bỏ trạng thái rỗng ban đầu, vì giờ đã tải SP mặc định */}

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {/* 8. Truyền prop 'products' (thay vì 'items') */}
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>

      {/* Cart Sidebar (Giữ nguyên) */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
