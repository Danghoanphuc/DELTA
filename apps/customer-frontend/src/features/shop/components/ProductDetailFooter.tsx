// src/features/shop/components/ProductDetailFooter.tsx
// (Bản cập nhật NHẤT QUÁN 2 NÚT)
import { Button } from "@/shared/components/ui/button";
import { ShoppingBag, Brush } from "lucide-react"; // Gỡ bỏ MessageSquare
import { cn } from "@/shared/lib/utils";

interface ProductDetailFooterProps {
  isCustomizable: boolean;
  onOpenSheet: (mode: "cart" | "buy") => void; // Mở Bottom Sheet
  onStartEditing: () => void; // Đi tới Editor
}

export const ProductDetailFooter = ({
  isCustomizable,
  onOpenSheet,
  onStartEditing,
}: ProductDetailFooterProps) => {
  // Layout 2 nút này giờ sẽ áp dụng cho CẢ HAI loại sản phẩm
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-lg z-40 flex p-2 gap-2">
      {/*
        Nút 1: Thêm vào giỏ (LUÔN CỐ ĐỊNH)
        Luôn là nút phụ (outline) và luôn mở Bottom Sheet 'cart'.
      */}
      <Button
        variant="outline"
        onClick={() => onOpenSheet("cart")}
        className="flex-1 h-full rounded-md text-base text-blue-600 border-blue-600"
      >
        <ShoppingBag size={20} className="mr-2" />
        Thêm vào giỏ
      </Button>

      {/*
        Nút 2: Nút Hành Động Chính (THÔNG MINH)
        Nút chính sẽ thay đổi chức năng và màu sắc.
      */}
      <Button
        onClick={isCustomizable ? onStartEditing : () => onOpenSheet("buy")}
        className={cn(
          "flex-1 h-full rounded-md text-base text-white",
          isCustomizable
            ? "bg-blue-600 hover:bg-blue-700" // Màu "Thiết kế"
            : "bg-red-600 hover:bg-red-700" // Màu "Mua ngay" (giống ảnh)
        )}
      >
        {isCustomizable && <Brush size={20} className="mr-2" />}{" "}
        {/* Chỉ SP phôi mới có icon Brush */}
        {isCustomizable ? "Thiết kế ngay" : "Mua ngay"}
      </Button>
    </div>
  );
};
