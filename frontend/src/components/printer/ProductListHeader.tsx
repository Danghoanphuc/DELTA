// src/components/printer/ProductListHeader.tsx (COMPONENT MỚI)
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";

interface ProductListHeaderProps {
  isAdding: boolean;
  onAddNew: () => void;
}

export function ProductListHeader({
  isAdding,
  onAddNew,
}: ProductListHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quản lý sản phẩm
        </h1>
        <p className="text-gray-600">
          Cập nhật và quản lý các sản phẩm in ấn của bạn
        </p>
      </div>
      {!isAdding && (
        <Button
          className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
          onClick={onAddNew}
        >
          <Plus size={20} className="mr-2" />
          Thêm sản phẩm mới
        </Button>
      )}
    </div>
  );
}
