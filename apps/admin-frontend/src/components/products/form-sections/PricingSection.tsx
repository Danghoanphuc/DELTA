// apps/admin-frontend/src/components/products/form-sections/PricingSection.tsx
// Section 9: Pricing & Inventory

import {
  DollarSign,
  Package,
  ToggleLeft,
  ToggleRight,
  Star,
} from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";

interface PricingSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function PricingSection({
  formData,
  updateFormData,
  errors,
}: PricingSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Giá cơ bản <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.basePrice}
            onChange={(e) =>
              updateFormData({ basePrice: parseFloat(e.target.value) || 0 })
            }
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 ${
              errors.basePrice ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0"
          />
          {errors.basePrice && (
            <p className="mt-1 text-sm text-red-500">{errors.basePrice}</p>
          )}
          {formData.basePrice > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {formatCurrency(formData.basePrice)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giá sale (optional)
          </label>
          <input
            type="number"
            value={formData.salePrice || ""}
            onChange={(e) =>
              updateFormData({
                salePrice: parseFloat(e.target.value) || undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            placeholder="0"
          />
          {formData.salePrice && formData.salePrice > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {formatCurrency(formData.salePrice)}
            </p>
          )}
        </div>
      </div>

      {/* Inventory */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Tồn kho
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) =>
              updateFormData({ stock: parseInt(e.target.value) || 0 })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngưỡng cảnh báo hết hàng
          </label>
          <input
            type="number"
            value={formData.lowStockThreshold}
            onChange={(e) =>
              updateFormData({
                lowStockThreshold: parseInt(e.target.value) || 10,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            placeholder="10"
          />
        </div>
      </div>

      {/* Status Toggles */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Trạng thái</h3>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Kích hoạt</p>
            <p className="text-sm text-gray-500">Sản phẩm có thể được mua</p>
          </div>
          <button
            type="button"
            onClick={() => updateFormData({ isActive: !formData.isActive })}
            className="relative"
          >
            {formData.isActive ? (
              <ToggleRight className="w-12 h-12 text-green-500" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-gray-300" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Xuất bản</p>
            <p className="text-sm text-gray-500">Hiển thị trên trang shop</p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateFormData({ isPublished: !formData.isPublished })
            }
            className="relative"
          >
            {formData.isPublished ? (
              <ToggleRight className="w-12 h-12 text-green-500" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-gray-300" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">
              <Star className="w-4 h-4 inline mr-2 text-yellow-500" />
              Nổi bật
            </p>
            <p className="text-sm text-gray-500">Hiển thị ở vị trí ưu tiên</p>
          </div>
          <button
            type="button"
            onClick={() => updateFormData({ isFeatured: !formData.isFeatured })}
            className="relative"
          >
            {formData.isFeatured ? (
              <ToggleRight className="w-12 h-12 text-yellow-500" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
