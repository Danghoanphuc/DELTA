// apps/admin-frontend/src/components/suppliers/SupplierInfoCard.tsx
// ✅ SOLID: Single Responsibility - Inline edit supplier info

import { useState, useEffect } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  Edit2,
  Check,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { Supplier, supplierApi } from "@/services/catalog.service";
import { useToast } from "@/hooks/use-toast";

const SUPPLIER_TYPES = [
  { value: "manufacturer", label: "Nhà sản xuất" },
  { value: "distributor", label: "Nhà phân phối" },
  { value: "printer", label: "Nhà in" },
  { value: "dropshipper", label: "Dropshipper" },
  { value: "artisan", label: "Nghệ nhân" },
];

interface SupplierInfoCardProps {
  supplier: Supplier;
  onUpdate: (updated: Supplier) => void;
}

export function SupplierInfoCard({
  supplier,
  onUpdate,
}: SupplierInfoCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: supplier.name,
    type: supplier.type,
    contactInfo: { ...supplier.contactInfo },
    capabilities: [...(supplier.capabilities || [])],
    isActive: supplier.isActive,
    isPreferred: supplier.isPreferred,
  });
  const [capabilityInput, setCapabilityInput] = useState("");
  const [rating, setRating] = useState(supplier.rating || 0);

  // Sync formData when supplier changes
  useEffect(() => {
    setFormData({
      name: supplier.name,
      type: supplier.type,
      contactInfo: { ...supplier.contactInfo },
      capabilities: [...(supplier.capabilities || [])],
      isActive: supplier.isActive,
      isPreferred: supplier.isPreferred,
    });
    setRating(supplier.rating || 0);
  }, [supplier]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên không được để trống",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await supplierApi.update(supplier._id, formData);
      onUpdate(updated);
      setIsEditing(false);
      toast({ title: "Thành công", description: "Đã cập nhật thông tin" });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: supplier.name,
      type: supplier.type,
      contactInfo: { ...supplier.contactInfo },
      capabilities: [...(supplier.capabilities || [])],
      isActive: supplier.isActive,
      isPreferred: supplier.isPreferred,
    });
    setIsEditing(false);
  };

  const handleRatingChange = async (newRating: number) => {
    try {
      await supplierApi.updateRating(supplier._id, newRating);
      setRating(newRating);
      onUpdate({ ...supplier, rating: newRating });
      toast({ title: "Thành công", description: "Đã cập nhật đánh giá" });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật",
        variant: "destructive",
      });
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

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="text-xl font-bold text-gray-900 border-b-2 border-orange-500 focus:outline-none bg-transparent"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {supplier.name}
                  {supplier.isPreferred && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  )}
                </h2>
              )}
              <p className="text-gray-500">{supplier.code}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Lưu
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Type & Status */}
        <div className="flex items-center gap-4 flex-wrap">
          {isEditing ? (
            <>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Supplier["type"],
                  })
                }
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {SUPPLIER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm">Kích hoạt</span>
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
                <span className="text-sm">Ưu tiên</span>
              </label>
            </>
          ) : (
            <>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {getTypeLabel(supplier.type)}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  supplier.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {supplier.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
              </span>
            </>
          )}
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Thông tin liên hệ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              {isEditing ? (
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
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Email"
                />
              ) : (
                <span className="text-gray-900">
                  {supplier.contactInfo.email}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={formData.contactInfo.phone || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Điện thoại"
                />
              ) : (
                <span className="text-gray-900">
                  {supplier.contactInfo.phone || "Chưa cập nhật"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              {isEditing ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={formData.contactInfo.address || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          address: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Địa chỉ"
                  />
                  <input
                    type="text"
                    value={formData.contactInfo.city || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          city: e.target.value,
                        },
                      })
                    }
                    className="w-40 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Thành phố"
                  />
                </div>
              ) : (
                <span className="text-gray-900">
                  {supplier.contactInfo.address
                    ? `${supplier.contactInfo.address}, ${
                        supplier.contactInfo.city || ""
                      }`
                    : supplier.contactInfo.city || "Chưa cập nhật"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Năng lực</h3>
          {isEditing && (
            <div className="flex gap-2 mb-3">
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
          )}
          <div className="flex flex-wrap gap-2">
            {(isEditing
              ? formData.capabilities
              : supplier.capabilities || []
            ).map((cap) => (
              <span
                key={cap}
                className={`px-3 py-1 rounded-full text-sm ${
                  isEditing
                    ? "bg-orange-100 text-orange-700 flex items-center gap-1"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {cap}
                {isEditing && (
                  <button type="button" onClick={() => removeCapability(cap)}>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {(isEditing ? formData.capabilities : supplier.capabilities || [])
              .length === 0 && (
              <span className="text-gray-400 text-sm">
                Chưa có năng lực nào
              </span>
            )}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Đánh giá</h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-lg font-bold text-gray-900">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
