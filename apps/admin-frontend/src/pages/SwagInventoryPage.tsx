// src/pages/SwagInventoryPage.tsx
// ✅ SOLID Refactored: UI composition only

import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { useInventory, InventoryItem } from "@/hooks/useInventory";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { EditQuantityModal } from "@/components/inventory/EditQuantityModal";

export default function SwagInventoryPage() {
  const {
    items,
    stats,
    organizations,
    isLoading,
    isUpdating,
    search,
    setSearch,
    orgFilter,
    setOrgFilter,
    statusFilter,
    setStatusFilter,
    fetchInventory,
    updateInventoryItem,
  } = useInventory();

  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tồn kho</h1>
          <p className="text-gray-600">Theo dõi inventory của tất cả tổ chức</p>
        </div>
        <button
          onClick={fetchInventory}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Stats */}
      {stats && <InventoryStats stats={stats} />}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 my-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tất cả tổ chức</option>
            {organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.businessName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="low_stock">Sắp hết hàng</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable items={items} onEdit={setEditItem} />

      {/* Edit Modal */}
      <EditQuantityModal
        item={editItem}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={updateInventoryItem}
        isUpdating={isUpdating}
      />
    </div>
  );
}
