// features/shop/components/ProductGrid.tsx
import { Filter } from "lucide-react";
import { ProductCard } from "@/features/shop/pages/ProductCard";
import { PrinterProduct } from "@/types/product";

interface ProductGridProps {
  products: PrinterProduct[];
  loading: boolean;
}

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl h-96 animate-pulse" />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <Filter size={64} className="mx-auto text-gray-300 mb-4" />
    <h3 className="text-lg font-semibold text-gray-700 mb-2">
      Không tìm thấy sản phẩm
    </h3>
    <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
  </div>
);

export const ProductGrid = ({ products, loading }: ProductGridProps) => {
  if (loading) {
    return <ProductGridSkeleton />;
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
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
  );
};
