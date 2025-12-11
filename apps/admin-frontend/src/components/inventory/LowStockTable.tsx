// src/components/inventory/LowStockTable.tsx
// ✅ SOLID: Single Responsibility - Display low stock items

import { Package, AlertCircle, Edit, ShoppingCart } from "lucide-react";
import { LowStockItem } from "@/services/admin.inventory.service";

interface Props {
  items: LowStockItem[];
  onAdjust: (variantId: string) => void;
  onPurchase: (variantId: string) => void;
}

export function LowStockTable({ items, onAdjust, onPurchase }: Props) {
  if (items.length === 0) {
    return (
      <div className="p-12 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Không có sản phẩm sắp hết hàng</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sản phẩm
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tồn kho
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Đã đặt trước
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Khả dụng
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reorder Point
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => {
            const { variant, needsReorder } = item;
            const { inventory } = variant;

            return (
              <tr key={variant._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {variant.productName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {variant.attributes.size &&
                        `Size: ${variant.attributes.size}`}
                      {variant.attributes.color &&
                        ` • ${variant.attributes.color}`}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {variant.sku}
                  </code>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium">{inventory.onHand}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-600">{inventory.reserved}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`font-medium ${
                      inventory.available <= 0
                        ? "text-red-600"
                        : inventory.available <= inventory.reorderPoint
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {inventory.available}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-600">
                    {inventory.reorderPoint}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {needsReorder ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Cần nhập hàng
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Sắp hết
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onAdjust(variant._id)}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Điều chỉnh tồn kho"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPurchase(variant._id)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Ghi nhận nhập hàng"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
