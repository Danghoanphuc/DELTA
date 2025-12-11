// src/components/inventory/VariantInventoryCard.tsx
// ✅ SOLID: Single Responsibility - Display variant inventory info

import { Package, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { SkuVariant } from "@/services/admin.inventory.service";

interface Props {
  variant: SkuVariant;
}

export function VariantInventoryCard({ variant }: Props) {
  const { inventory } = variant;

  const stats = [
    {
      label: "Tồn kho",
      value: inventory.onHand,
      icon: Package,
      color: "blue",
    },
    {
      label: "Đã đặt trước",
      value: inventory.reserved,
      icon: Clock,
      color: "yellow",
    },
    {
      label: "Khả dụng",
      value: inventory.available,
      icon: TrendingUp,
      color: inventory.available <= inventory.reorderPoint ? "red" : "green",
    },
    {
      label: "Đang về",
      value: inventory.inTransit,
      icon: AlertCircle,
      color: "purple",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {variant.productName}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>
              SKU:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                {variant.sku}
              </code>
            </span>
            {variant.attributes.size && (
              <span>Size: {variant.attributes.size}</span>
            )}
            {variant.attributes.color && (
              <span>Màu: {variant.attributes.color}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Giá bán</p>
          <p className="text-lg font-semibold text-gray-900">
            {variant.price.toLocaleString()} VNĐ
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Giá vốn: {variant.cost.toLocaleString()} VNĐ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="flex items-center justify-center mb-2">
              <stat.icon
                className={`w-5 h-5 ${
                  stat.color === "blue"
                    ? "text-blue-600"
                    : stat.color === "green"
                    ? "text-green-600"
                    : stat.color === "red"
                    ? "text-red-600"
                    : stat.color === "yellow"
                    ? "text-yellow-600"
                    : "text-purple-600"
                }`}
              />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {inventory.reorderPoint > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Reorder Point:</span>
            <span className="font-medium text-gray-900">
              {inventory.reorderPoint} units
            </span>
          </div>
          {inventory.reorderQuantity > 0 && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Reorder Quantity:</span>
              <span className="font-medium text-gray-900">
                {inventory.reorderQuantity} units
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
