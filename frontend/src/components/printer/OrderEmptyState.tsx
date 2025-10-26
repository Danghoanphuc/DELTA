// src/components/printer/OrderEmptyState.tsx (COMPONENT MỚI)
import { Package } from "lucide-react";

export function OrderEmptyState() {
  return (
    <div className="text-center py-12">
      <Package size={64} className="mx-auto text-gray-300 mb-4" />
      <h3 className="font-semibold text-gray-700 mb-2">Chưa có đơn hàng</h3>
      <p className="text-gray-500">Đơn hàng mới sẽ hiển thị ở đây</p>
    </div>
  );
}
