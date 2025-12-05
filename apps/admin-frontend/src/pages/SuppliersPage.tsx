// apps/admin-frontend/src/pages/SuppliersPage.tsx
// ✅ Admin Suppliers Management

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Star,
  RefreshCw,
  X,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { supplierApi, Supplier } from "@/services/catalog.service";

const SUPPLIER_TYPES = [
  { value: "manufacturer", label: "Nhà sản xuất" },
  { value: "distributor", label: "Nhà phân phối" },
  { value: "printer", label: "Nhà in" },
  { value: "dropshipper", label: "Dropshipper" },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "manufacturer" as Supplier["type"],
    contactInfo: {
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Vietnam",
    },
    capabilities: [] as string[],
    leadTime: { min: 3, max: 7, unit: "days" },
    minimumOrderQuantity: 1,
    paymentTerms: "",
    isActive: true,
    isPreferred: false,
    notes: "",
  });
  const [capabilityInput, setCapabilityInput] = useState("");

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supplierApi.getAll({
        type: typeFilter !== "all" ? typeFilter : undefined,
      });
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      code: "",
      type: "manufacturer",
      contactInfo: {
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "Vietnam",
      },
      capabilities: [],
      leadTime: { min: 3, max: 7, unit: "days" },
      minimumOrderQuantity: 1,
      paymentTerms: "",
      isActive: true,
      isPreferred: false,
      notes: "",
    });
    setShowModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      code: supplier.code,
      type: supplier.type,
      contactInfo: {
        email: supplier.contactInfo.email,
        phone: supplier.contactInfo.phone || "",
        address: supplier.contactInfo.address || "",
        city: supplier.contactInfo.city || "",
        country: supplier.contactInfo.country || "Vietnam",
      },
      capabilities: supplier.capabilities || [],
      leadTime: supplier.leadTime || { min: 3, max: 7, unit: "days" },
      minimumOrderQuantity: supplier.minimumOrderQuantity || 1,
      paymentTerms: "",
      isActive: supplier.isActive,
      isPreferred: supplier.isPreferred,
      notes: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await supplierApi.update(editingSupplier._id, formData);
      } else {
        await supplierApi.create(formData);
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa nhà cung cấp này?")) return;
    try {
      await supplierApi.delete(id);
      fetchSuppliers();
    } catch (error: any) {
      alert(error.response?.data?.error || "Không thể xóa nhà cung cấp");
    }
  };

  const addCapability = () => {
    if (
      capabilityInput.trim() &&
      !formData.capabilities.includes(capabilityInput.trim())
    ) {
      setFormData({
        ...formData,
        capabilities: [...formData.capabilities, capabilityInput.trim()],
      });
      setCapabilityInput("");
    }
  };

  const removeCapability = (cap: string) => {
    setFormData({
      ...formData,
      capabilities: formData.capabilities.filter((c) => c !== cap),
    });
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
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          Thêm nhà cung cấp
        </button>
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
            onClick={openCreateModal}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Thêm nhà cung cấp đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <div
              key={supplier._id}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                      {supplier.name}
                      {supplier.isPreferred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{supplier.code}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    supplier.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {supplier.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Loại:</span>{" "}
                  {getTypeLabel(supplier.type)}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {supplier.contactInfo.email}
                </p>
                {supplier.contactInfo.phone && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {supplier.contactInfo.phone}
                  </p>
                )}
                {supplier.contactInfo.city && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {supplier.contactInfo.city}
                  </p>
                )}
              </div>

              {supplier.capabilities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {supplier.capabilities.slice(0, 3).map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                    >
                      {cap}
                    </span>
                  ))}
                  {supplier.capabilities.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                      +{supplier.capabilities.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => openEditModal(supplier)}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  <Edit2 className="w-4 h-4 inline mr-1" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(supplier._id)}
                  className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingSupplier ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as Supplier["type"],
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {SUPPLIER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Thông tin liên hệ
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.contactInfo.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...formData.contactInfo,
                            email: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điện thoại
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactInfo: {
                              ...formData.contactInfo,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thành phố
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactInfo: {
                              ...formData.contactInfo,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactInfo: {
                            ...formData.contactInfo,
                            address: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Năng lực</h4>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={capabilityInput}
                    onChange={(e) => setCapabilityInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCapability())
                    }
                    placeholder="Thêm năng lực..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={addCapability}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {cap}
                      <button
                        type="button"
                        onClick={() => removeCapability(cap)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead time (ngày)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.leadTime.min}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leadTime: {
                            ...formData.leadTime,
                            min: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Min"
                    />
                    <span className="py-2">-</span>
                    <input
                      type="number"
                      value={formData.leadTime.max}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          leadTime: {
                            ...formData.leadTime,
                            max: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MOQ
                  </label>
                  <input
                    type="number"
                    value={formData.minimumOrderQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumOrderQuantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Kích hoạt</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPreferred}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPreferred: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Ưu tiên</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {editingSupplier ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
