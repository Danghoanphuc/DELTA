// features/shop/components/ProductGrid.tsx (ĐÃ ĐƠN GIẢN HÓA)
import { Filter } from "lucide-react";
import { ProductCard } from "@/features/shop/components/ProductCard";
import { Product } from "@/types/product"; // Import Product type
// 1. Loại bỏ: WorkshopItem, InspirationPin, InspirationPinCard, Sparkles
import { Skeleton } from "@/shared/components/ui/skeleton";

// Skeleton (Giữ nguyên)
const ProductGridSkeleton = () => (
  <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="mb-4 break-inside-avoid">
        <Skeleton
          className="w-full h-64 rounded-lg"
          style={{ height: `${200 + Math.random() * 150}px` }}
        />
      </div>
    ))}
  </div>
);

// EmptyState (Cập nhật lại text)
const EmptyState = () => (
  <div className="text-center py-16">
    <Filter size={64} className="mx-auto text-gray-300 mb-4" />
    <h3 className="text-lg font-semibold text-gray-700 mb-2">
      Không tìm thấy sản phẩm
    </h3>
    <p className="text-gray-500">
      Hãy thử một từ khóa tìm kiếm khác hoặc đổi danh mục.
    </p>
  </div>
);

// 2. Loại bỏ AiLoadingState

interface ProductGridProps {
  products: Product[]; // 3. Đổi prop từ 'items' thành 'products'
  loading: boolean;
  // loadingAI: boolean; // (Loại bỏ)
}

export const ProductGrid = ({ products, loading }: ProductGridProps) => {
  if (loading) {
    return <ProductGridSkeleton />;
  }

  // 4. Loại bỏ check loadingAI

  if (!products || products.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <p className="text-gray-600 mb-4">
        Hiển thị <strong>{products.length}</strong> kết quả
      </p>

      <div
        className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4"
        style={{ columnFill: "balance" }}
      >
        {/* 5. Chỉ render ProductCard */}
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </>
  );
};
