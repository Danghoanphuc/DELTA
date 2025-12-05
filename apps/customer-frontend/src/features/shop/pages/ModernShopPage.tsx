import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../hooks/useShop";
import { useProductQuickShop } from "../hooks/useProductQuickShop";

// New Components
import { VisualCategories } from "../components/VisualCategories";
import { CuratedCollections } from "../components/CuratedCollections";

// Existing Components
import { ProductGrid } from "../components/ProductGrid";
import { ProductPurchaseSheet } from "../components/details/ProductPurchaseSheet";
import { SortBar } from "../components/SortBar";

// UI
import { Button } from "@/shared/components/ui/button";
import { Loader2, ArrowUp, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/components/ui/input";

export function ModernShopPage() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    products,
    loading: productsLoading,
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmit(searchQuery);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="pt-32 pb-16 px-6 text-center bg-gradient-to-b from-stone-50 to-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-6 italic leading-tight">
            In ấn chuyên nghiệp.
            <br />
            <span className="text-emerald-800">Giao hàng nhanh chóng.</span>
          </h1>
          <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto font-light">
            Hơn 10,000+ sản phẩm in ấn chất lượng cao từ các nhà in uy tín trên
            toàn quốc.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex gap-3"
          >
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm... (VD: danh thiếp, áo thun, bao bì)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-none border-2 border-stone-200 focus:border-emerald-800 text-base"
              />
            </div>
            <Button
              type="submit"
              className="bg-stone-900 hover:bg-emerald-900 text-white rounded-none px-8 h-14 font-bold uppercase text-sm"
            >
              Tìm kiếm
            </Button>
          </form>
        </div>
      </section>

      {/* VISUAL CATEGORIES */}
      <VisualCategories
        selectedCategory={selectedCategory}
        onSelectCategory={(val) => {
          onCategoryChange(val);
          // Scroll to products section
          document.getElementById("products")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      />

      {/* CURATED COLLECTIONS */}
      {selectedCategory === "all" && <CuratedCollections />}

      {/* PRODUCTS SECTION */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12 pb-6 border-b border-stone-200">
            <div className="flex items-baseline gap-3">
              <h2 className="font-serif text-3xl text-stone-900 italic">
                {selectedCategory === "all"
                  ? "Tất cả sản phẩm"
                  : "Kết quả tìm kiếm"}
              </h2>
              <span className="text-sm font-medium text-stone-500">
                ({products.length} sản phẩm)
              </span>
            </div>

            <SortBar sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          {/* Products Grid */}
          <div className="min-h-[400px]">
            {productsLoading && products.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-800" />
                <p className="text-sm text-stone-400 font-medium">
                  Đang tìm kiếm sản phẩm tốt nhất...
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
                      variant="outline"
                      size="lg"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="min-w-[220px] h-12 rounded-none border-2 border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all text-base font-bold uppercase"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        "Xem thêm sản phẩm"
                      )}
                    </Button>
                    <p className="text-xs text-stone-400 mt-3">
                      Hiển thị {products.length} sản phẩm
                    </p>
                  </div>
                )}

                {/* End of list */}
                {!hasNextPage && products.length > 0 && (
                  <div className="flex items-center justify-center gap-2 text-stone-300 pb-12">
                    <div className="h-px w-12 bg-stone-200" />
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Hết danh sách
                    </span>
                    <div className="h-px w-12 bg-stone-200" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Shop Sheet */}
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

      {/* Scroll To Top */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 rounded-full shadow-lg bg-stone-900 text-white hover:bg-emerald-900 transition-all duration-300 z-40",
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

export default ModernShopPage;
