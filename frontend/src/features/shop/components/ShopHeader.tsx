// features/shop/components/ShopHeader.tsx
import { ShoppingCart } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ShopHeaderProps {
  cartItemCount: number;
  onCartOpen: () => void;
}

export const ShopHeader = ({ cartItemCount, onCartOpen }: ShopHeaderProps) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cửa hàng</h1>
      <p className="text-gray-600 text-sm md:text-base">
        Khám phá sản phẩm in ấn chất lượng cao
      </p>
    </div>
    <Button
      className="relative bg-blue-600 hover:bg-blue-700"
      onClick={onCartOpen}
    >
      <ShoppingCart size={20} className="mr-2" />
      <span className="hidden sm:inline">Giỏ hàng</span>
      {cartItemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cartItemCount}
        </span>
      )}
    </Button>
  </div>
);
