// features/shop/components/ProductImageGallery.tsx
import { PrinterProduct } from "@/types/product";

interface ProductImageGalleryProps {
  images: PrinterProduct["images"];
  name: string;
}

export const ProductImageGallery = ({
  images,
  name,
}: ProductImageGalleryProps) => {
  const primaryImage = images?.[0]?.url || "/placeholder-product.jpg";

  return (
    <div>
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
        <img
          src={primaryImage}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* TODO: Thêm gallery ảnh thumbnail nếu có nhiều ảnh */}
    </div>
  );
};
