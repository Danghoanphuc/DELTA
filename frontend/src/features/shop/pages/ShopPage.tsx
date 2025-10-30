// features/shop/pages/ShopPage.tsx
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { CartSidebar } from "@/components/shop/CartSidebar";
import { useCartStore } from "@/stores/useCartStore";
import { useShop } from "../hooks/useShop";
import { ShopHeader } from "../components/ShopHeader";
import { ShopFilterBar } from "../components/ShopFilterBar";
import { ProductGrid } from "../components/ProductGrid";

export function ShopPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartItemCount } = useCartStore();
  const {
    products,
    loading,
    categories,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
  } = useShop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 lg:top-0 z-30">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <ShopHeader
              cartItemCount={getCartItemCount()}
              onCartOpen={() => setIsCartOpen(true)}
            />
            <ShopFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categories={categories}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
