// src/components/inventory/InventoryTable.tsx
// ✅ SOLID: Single Responsibility - Display inventory items table

import { Package, Edit2 } from "lucide-react";
import { InventoryItem } from "@/hooks/useInventory";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "in_stock":
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          Còn hàng
        </span>
      );
    case "low_stock":
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Sắp hết
        </span>
      );
    case "out_of_stock":
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Hết hàng
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
};

export function InventoryTable({ items, onEdit }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Không có sản phẩm nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Sản phẩm
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              SKU
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              Tổ chức
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
              Số lượng
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
              Ngưỡng
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
              Giá trị
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <span className="font-medium">{item.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-sm text-gray-600">
                {item.sku}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {item.organizationName}
              </td>
              <td className="px-4 py-3 text-center font-medium">
                {item.quantity}
              </td>
              <td className="px-4 py-3 text-center text-gray-500">
                {item.lowStockThreshold}
              </td>
              <td className="px-4 py-3 text-center">
                {getStatusBadge(item.status)}
              </td>
              <td className="px-4 py-3 text-right font-medium">
                {formatCurrency(item.totalValue)}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
