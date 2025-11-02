// src/components/printer/ProductEmptyState.tsx (COMPONENT MỚI)
import { Box } from "lucide-react";

export function ProductEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
      <Box size={48} className="text-gray-300 mb-4" />
      <h3 className="font-semibold text-gray-700">Không tìm thấy sản phẩm</h3>
      <p className="text-gray-500 text-sm">
        Bạn chưa có sản phẩm nào. Hãy nhấn "Thêm sản phẩm mới".
      </p>
    </div>
  );
}
