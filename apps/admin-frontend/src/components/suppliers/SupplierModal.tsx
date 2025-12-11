// apps/admin-frontend/src/components/suppliers/SupplierModal.tsx
// ✅ SOLID: Single Responsibility - Form UI only

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Supplier } from "@/services/catalog.service";

const SUPPLIER_TYPES = [
  { value: "manufacturer", label: "Nhà sản xuất" },
  { value: "distributor", label: "Nhà phân phối" },
  { value: "printer", label: "Nhà in" },
  { value: "dropshipper", label: "Dropshipper" },
];

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Supplier>) => Promise<void>;
  editingSupplier: Supplier | null;
}

export function SupplierModal({
  isOpen,
  onClose,
  onSubmit,
  editingSupplier,
}: SupplierModalProps) {
  const [formData, setFormData] = useState({
    name: editingSupplier?.name || "",
    code: editingSupplier?.code || "",
    type: (editingSupplier?.type || "manufacturer") as Supplier["type"],
    contactInfo: {
      email: editingSupplier?.contactInfo.email || "",
      phone: editingSupplier?.contactInfo.phone || "",
      address: editingSupplier?.contactInfo.address || "",
      city: editingSupplier?.contactInfo.city || "",
      country: editingSupplier?.contactInfo.country || "Vietnam",
    },
    capabilities: editingSupplier?.capabilities || [],
    leadTime: editingSupplier?.leadTime || { min: 3, max: 7, unit: "days" },
    minimumOrderQuantity: editingSupplier?.minimumOrderQuantity || 1,
    paymentTerms: "",
    isActive: editingSupplier?.isActive ?? true,
    isPreferred: editingSupplier?.isPreferred ?? false,
    notes: "",
  });
  const [capabilityInput, setCapabilityInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {editingSupplier ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
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
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Năng lực</h4>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={capabilityInput}
                onChange={(e) => setCapabilityInput(e.target.value)}
                onKeyDown={(e) =>
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
                  <button type="button" onClick={() => removeCapability(cap)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
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
                  setFormData({ ...formData, isPreferred: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm text-gray-700">Ưu tiên</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
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
  );
}
