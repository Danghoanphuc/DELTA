// frontend/src/pages/customer/ShopPage.tsx

import { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartSidebar } from "@/components/shop/CartSidebar";
import { useCartStore } from "@/stores/useCartStore";
import { PrinterProduct } from "@/types/product";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ShopPage() {
  const [products, setProducts] = useState<PrinterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { getCartItemCount } = useCartStore();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products", {
          params: {
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            search: searchTerm || undefined,
            sort: sortBy,
          },
        });
        setProducts(res.data?.data?.products || []);
      } catch (err: any) {
        console.error("❌ Error fetching products:", err);
        toast.error("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Re-fetch with search term
      // KHẮC PHỤC: Xóa 'if (searchTerm)'
      // Luôn luôn fetch, server sẽ tự xử lý khi 'search' là chuỗi rỗng
      setLoading(true);
      api
        .get("/products", {
          params: {
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            search: searchTerm || undefined, // Gửi undefined nếu searchTerm rỗng
            sort: sortBy,
          },
        })
        .then((res) => setProducts(res.data?.data?.products || []))
        .catch(() => toast.error("Không thể tìm kiếm"))
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy]); // <-- Thêm dependency cho nhất quán

  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "business-card", label: "Danh thiếp" },
    { value: "flyer", label: "Tờ rơi" },
    { value: "banner", label: "Banner" },
    { value: "brochure", label: "Brochure" },
    { value: "sticker", label: "Sticker" },
    { value: "packaging", label: "Bao bì" },
    { value: "other", label: "Khác" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 lg:top-0 z-30">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Cửa hàng
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  Khám phá sản phẩm in ấn chất lượng cao
                </p>
              </div>

              {/* Cart Button */}
              <Button
                className="relative bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={20} className="mr-2" />
                <span className="hidden sm:inline">Giỏ hàng</span>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-asc">Giá: Thấp → Cao</SelectItem>
                  <SelectItem value="price-desc">Giá: Cao → Thấp</SelectItem>
                  <SelectItem value="popular">Phổ biến nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl h-96 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Filter size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-500">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Tìm thấy <strong>{products.length}</strong> sản phẩm
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
