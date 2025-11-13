// src/features/shop/components/details/ProductCustomizationFooter.tsx
import { Button } from "@/shared/components/ui/button";
import { Brush } from "lucide-react";

interface ProductCustomizationFooterProps {
  onStartEditing: () => void;
}

export const ProductCustomizationFooter = ({
  onStartEditing,
}: ProductCustomizationFooterProps) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-lg z-40 p-2">
      <Button
        onClick={onStartEditing}
        className="w-full h-full bg-blue-600 hover:bg-blue-700 text-base"
      >
        <Brush size={18} className="mr-2" />
        Bắt đầu Thiết kế
      </Button>
    </div>
  );
};
