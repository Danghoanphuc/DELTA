// src/pages/SwagInventoryPage.tsx
// ✅ Admin Swag Inventory Management

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  Building2,
  Edit2,
} from "lucide-react";
import {
  swagOpsService,
  Organization,
} from "@/services/admin.swag-operations.service";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  unitCost: number;
  totalValue: number;
  status: string;
  organizationId: string;
  organizationName: string;
  imageUrl?: string;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  organizationCount: number;
}

export default function SwagInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit modal
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editOperation, setEditOperation] = useState<
    "add" | "subtract" | "set"
  >("add");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inventoryData, orgsData] = await Promise.all([
        swagOpsService.getInventoryOverview({
          organizationId: orgFilter !== "all" ? orgFilter : undefined,
          lowStockOnly: statusFilter === "low_stock",
        }),
        swagOpsService.getOrganizations(),
      ]);

      setItems(inventoryData.items || []);
      setStats(inventoryData.stats || null);
      setOrganizations(orgsData);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgFilter, statusFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Filter items by search
  const filteredItems = items.filter((item) => {
    if (!search) return true;
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Handle update
  const handleUpdate = async () => {
    if (!editItem) return;
    setIsUpdating(true);
    try {
      await swagOpsService.updateInventoryItem(editItem._id, {
        quantity: editQuantity,
        operation: editOperation,
      });
      setEditItem(null);
      fetchInventory();
    } catch (error) {
      console.error("Error updating inventory:", error);
    } finally {
      setIsUpdating(false);
    }
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
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Không có sản phẩm nào</p>
          </div>
        ) : (
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
              {filteredItems.map((item) => (
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
                      onClick={() => {
                        setEditItem(item);
                        setEditQuantity(0);
                        setEditOperation("add");
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Cập nhật số lượng</h3>
            <p className="text-gray-600 mb-4">{editItem.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thao tác
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditOperation("add")}
                    className={`flex-1 py-2 rounded-lg border ${
                      editOperation === "add"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : ""
                    }`}
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Thêm
                  </button>
                  <button
                    onClick={() => setEditOperation("subtract")}
                    className={`flex-1 py-2 rounded-lg border ${
                      editOperation === "subtract"
                        ? "bg-red-50 border-red-500 text-red-700"
                        : ""
                    }`}
                  >
                    <Minus className="w-4 h-4 inline mr-1" />
                    Trừ
                  </button>
                  <button
                    onClick={() => setEditOperation("set")}
                    className={`flex-1 py-2 rounded-lg border ${
                      editOperation === "set"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : ""
                    }`}
                  >
                    Đặt
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  min="0"
                  value={editQuantity}
                  onChange={(e) =>
                    setEditQuantity(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="text-sm text-gray-500">
                Hiện tại: {editItem.quantity} →{" "}
                <span className="font-medium">
                  {editOperation === "add"
                    ? editItem.quantity + editQuantity
                    : editOperation === "subtract"
                    ? Math.max(0, editItem.quantity - editQuantity)
                    : editQuantity}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditItem(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
