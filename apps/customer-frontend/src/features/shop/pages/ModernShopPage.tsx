import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../hooks/useShop";
import { useProductQuickShop } from "../hooks/useProductQuickShop";

// Components
import { ProductGrid } from "../components/ProductGrid";
import { ProductPurchaseSheet } from "../components/details/ProductPurchaseSheet";
import { SortBar } from "../components/SortBar";
import { CategorySidebar } from "@/features/main/components/CategorySidebar"; // Dùng lại Sidebar đẹp của Main

// UI
import { Button } from "@/shared/components/ui/button";
import { Loader2, ArrowUp, Search, Gem } from "lucide-react";
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
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900">
      {/* HERO SECTION: Gallery Entrance */}
      <section className="relative pt-32 pb-20 px-6 text-center border-b border-stone-200 overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-900/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 border-b border-amber-800/30 pb-1">
            <Gem className="w-4 h-4 text-amber-800" />
            <span className="font-mono text-xs font-bold tracking-[0.3em] text-amber-900 uppercase">
              The Collection 2025
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-6 leading-tight">
            Tinh Hoa{" "}
            <span className="italic text-amber-800">Quà Tặng Việt.</span>
          </h1>
          <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Hơn 1,000+ tác phẩm thủ công độc bản từ các làng nghề danh tiếng,
            sẵn sàng để khắc ghi dấu ấn doanh nghiệp của bạn.
          </p>

          {/* Search Bar - Minimalist */}
          <form
            onSubmit={handleSearch}
            className="max-w-xl mx-auto flex items-center border-b-2 border-stone-300 focus-within:border-amber-800 transition-colors pb-1"
          >
            <Search
              className="text-stone-400 mr-3"
              size={20}
              strokeWidth={1.5}
            />
            <Input
              type="text"
              placeholder="Tìm kiếm tác phẩm... (VD: Ấm tử sa, Trầm hương)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-12 border-none shadow-none bg-transparent text-lg placeholder:text-stone-400 placeholder:italic placeholder:font-serif focus-visible:ring-0 px-0"
            />
            <Button
              type="submit"
              variant="ghost"
              className="text-stone-900 font-bold uppercase tracking-widest text-xs hover:bg-stone-100 hover:text-amber-800"
            >
              Tìm Kiếm
            </Button>
          </form>
        </div>
      </section>

      {/* CATEGORIES NAV */}
      <div className="sticky top-0 z-30 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto">
          {/* Sử dụng lại CategorySidebar đẹp từ Main nhưng layout ngang */}
          <CategorySidebar layout="horizontal" className="py-2" />
        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <section id="products" className="py-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 pb-4 border-b border-stone-200">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400 block mb-1">
                Gallery View
              </span>
              <h2 className="font-serif text-3xl text-stone-900 italic">
                {selectedCategory === "all"
                  ? "Tác phẩm nổi bật"
                  : "Kết quả giám tuyển"}
                <span className="text-sm font-sans font-normal text-stone-500 ml-3 not-italic">
                  ({products.length} vật phẩm)
                </span>
              </h2>
            </div>

            <SortBar sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          {/* Products Grid */}
          <div className="min-h-[400px]">
            {productsLoading && products.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-amber-800" />
                <p className="text-sm text-stone-500 font-serif italic">
                  Đang tìm kiếm trong kho di sản...
                </p>
              </div>
            ) : (
              <div className="space-y-16">
                <ProductGrid
                  products={products}
                  loading={productsLoading}
                  onOpenQuickShop={openQuickShop}
                />

                {/* Load More - Button sang trọng */}
                {hasNextPage && (
                  <div className="flex flex-col items-center">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="min-w-[200px] h-12 rounded-sm border border-stone-300 text-stone-600 hover:border-amber-800 hover:text-amber-800 transition-all text-xs font-bold uppercase tracking-[0.2em]"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 size={14} className="mr-2 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        "Xem thêm tác phẩm"
                      )}
                    </Button>
                  </div>
                )}

                {/* End of list */}
                {!hasNextPage && products.length > 0 && (
                  <div className="flex items-center justify-center gap-4 text-stone-300 pb-12">
                    <div className="h-px w-12 bg-stone-200" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
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
          "fixed bottom-8 right-8 rounded-full shadow-xl bg-stone-900 text-white hover:bg-amber-900 transition-all duration-500 z-40 border border-white/10",
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
