// src/features/shop/components/details/ProductDetailMobileHeader.tsx (FIXED)
// Header nổi, trong suốt cho di động (giống ảnh mẫu)

import { ArrowLeft, ShoppingCart, MoreVertical } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

interface ProductDetailMobileHeaderProps {
  cartItemCount: number;
  onBackClick: () => void;
  onCartClick: () => void;
  // (onMoreClick có thể thêm sau)
}

export const ProductDetailMobileHeader = ({
  cartItemCount,
  onBackClick,
  onCartClick,
}: ProductDetailMobileHeaderProps) => {
  return (
    // Chỉ hiển thị trên mobile (lg:hidden), fixed, z-30
    <div className="lg:hidden fixed top-0 left-0 right-0 h-14 p-2 flex items-center justify-between z-30">
      {/* Nút Quay Lại */}
      <Button
        variant="ghost"
        size="icon"
        className="bg-black/40 text-white hover:bg-black/60 hover:text-white rounded-full"
        onClick={onBackClick}
      >
        <ArrowLeft size={20} />
      </Button>

      {/* Cụm nút Phải */}
      <div className="flex items-center gap-2">
        {/* Nút Giỏ Hàng */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/40 text-white hover:bg-black/60 hover:text-white rounded-full relative"
          onClick={onCartClick}
        >
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            /* ✅ SỬA LỖI: Gỡ bỏ w-5, dùng min-w-5 và padding */
            <span
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center p-0 rounded-full
                         bg-red-600 text-white text-[10px] font-bold leading-none"
            >
              {cartItemCount}
            </span>
          )}
        </Button>

        {/* Nút Ba Chấm */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/40 text-white hover:bg-black/60 hover:text-white rounded-full"
        >
          <MoreVertical size={20} />
        </Button>
      </div>
    </div>
  );
};
