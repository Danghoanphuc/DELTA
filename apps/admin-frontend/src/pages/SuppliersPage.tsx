// apps/admin-frontend/src/pages/SuppliersPage.tsx
// ✅ SOLID Compliant: Single Responsibility - UI rendering only

import { useState } from "react";
import { Building2, Plus, RefreshCw, TrendingUp } from "lucide-react";
import { Supplier } from "@/services/catalog.service";
import { useSuppliers } from "@/hooks/useSuppliers";
import { SupplierModal } from "@/components/suppliers/SupplierModal";
import { SupplierCard } from "@/components/suppliers/SupplierCard";

const SUPPLIER_TYPES = [
  { value: "manufacturer", label: "Nhà sản xuất" },
  { value: "distributor", label: "Nhà phân phối" },
  { value: "printer", label: "Nhà in" },
  { value: "dropshipper", label: "Dropshipper" },
];

export default function SuppliersPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const {
    suppliers,
    isLoading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useSuppliers(typeFilter);

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setShowModal(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Supplier>) => {
    if (editingSupplier) {
      await updateSupplier(editingSupplier._id, data);
    } else {
      await createSupplier(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa nhà cung cấp này?")) return;
    try {
      await deleteSupplier(id);
    } catch (error: any) {
      alert(error.response?.data?.error || "Không thể xóa nhà cung cấp");
    }
  };

  const getTypeLabel = (type: string) => {
    return SUPPLIER_TYPES.find((t) => t.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhà cung cấp</h1>
          <p className="text-gray-600">Quản lý suppliers và vendors</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() =>
              (window.location.href = "/catalog/suppliers-performance")
            }
            className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50"
          >
            <TrendingUp className="w-4 h-4" />
            So sánh hiệu suất
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Thêm nhà cung cấp
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tất cả loại</option>
          {SUPPLIER_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Suppliers Grid */}
      {suppliers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có nhà cung cấp
          </h3>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Thêm nhà cung cấp đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier._id}
              supplier={supplier}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              getTypeLabel={getTypeLabel}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <SupplierModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingSupplier={editingSupplier}
      />
    </div>
  );
}
