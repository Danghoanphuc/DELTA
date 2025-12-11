// src/components/inventory/InventoryStats.tsx
// ✅ SOLID: Single Responsibility - Display inventory statistics

import { Package, Building2, AlertTriangle } from "lucide-react";
import { InventoryStats as Stats } from "@/hooks/useInventory";

interface InventoryStatsProps {
  stats: Stats;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function InventoryStats({ stats }: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-600">Tổng sản phẩm</span>
        </div>
        <p className="text-2xl font-bold">{stats.totalItems}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-5 h-5 text-purple-500" />
          <span className="text-sm text-gray-600">Tổ chức</span>
        </div>
        <p className="text-2xl font-bold">{stats.organizationCount}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-gray-600">Sắp hết hàng</span>
        </div>
        <p className="text-2xl font-bold text-yellow-600">
          {stats.lowStockCount}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-600">Tổng giá trị</span>
        </div>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(stats.totalValue)}
        </p>
      </div>
    </div>
  );
}
