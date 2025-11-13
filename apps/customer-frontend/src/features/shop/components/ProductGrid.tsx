// features/shop/components/ProductGrid.tsx
import { Filter, ShoppingCart } from "lucide-react"; // ✅ Thêm ShoppingCart
import { ProductCard } from "@/features/shop/components/ProductCard";
import { Product } from "@/types/product";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

// (Skeleton... giữ nguyên)
// ...

// (EmptyState giữ nguyên)
// ...

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  // ✅ MỚI: Thêm prop để nhận hàm từ ShopPage
  onOpenQuickShop: (product: Product, mode: "cart" | "buy") => void;
}

export const ProductGrid = ({
  products,
  loading,
  onOpenQuickShop, // ✅ Nhận prop
}: ProductGridProps) => {
  if (loading) {
    // ... (skeleton)
  }
  if (!products || products.length === 0) {
    // ... (empty state)
  }

  return (
    <>
      <p className="text-gray-600 mb-4 text-sm">
        Hiển thị <strong>{products.length}</strong> kết quả
      </p>
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
        {products.map((product) => (
          // ✅ SỬA: Truyền hàm `onOpenQuickShop` xuống Card
          <ProductCard
            key={product._id}
            product={product}
            onOpenQuickShop={onOpenQuickShop} // ✅ Truyền xuống
          />
        ))}
      </div>
    </>
  );
};
