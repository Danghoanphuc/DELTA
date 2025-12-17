// apps/admin-frontend/src/components/products/form-sections/IntroductionSection.tsx
// Section 3: Introduction & Specs

import { Clock, Palette, Gem, Award } from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";

interface IntroductionSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function IntroductionSection({
  formData,
  updateFormData,
  errors,
}: IntroductionSectionProps) {
  return (
    <div className="space-y-6">
      {/* Crafting Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Thời gian chế tác
          </label>
          <input
            type="number"
            value={formData.craftingTime?.value || ""}
            onChange={(e) =>
              updateFormData({
                craftingTime: {
                  value: parseInt(e.target.value) || 0,
                  unit: formData.craftingTime?.unit || "hours",
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            placeholder="120"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đơn vị
          </label>
          <select
            value={formData.craftingTime?.unit || "hours"}
            onChange={(e) =>
              updateFormData({
                craftingTime: {
                  value: formData.craftingTime?.value || 0,
                  unit: e.target.value as "hours" | "days",
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          >
            <option value="hours">Giờ</option>
            <option value="days">Ngày</option>
          </select>
        </div>
      </div>

      {/* Technique */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Palette className="w-4 h-4 inline mr-2" />
          Kỹ thuật chế tác
        </label>
        <input
          type="text"
          value={formData.technique || ""}
          onChange={(e) => updateFormData({ technique: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          placeholder="VD: Men rạn cổ truyền"
        />
      </div>

      {/* Production Limit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Gem className="w-4 h-4 inline mr-2" />
            Giới hạn sản xuất (số lượng)
          </label>
          <input
            type="number"
            value={formData.productionLimit?.value || ""}
            onChange={(e) =>
              updateFormData({
                productionLimit: {
                  value: parseInt(e.target.value) || 0,
                  text: formData.productionLimit?.text || "",
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            placeholder="50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <input
            type="text"
            value={formData.productionLimit?.text || ""}
            onChange={(e) =>
              updateFormData({
                productionLimit: {
                  value: formData.productionLimit?.value || 0,
                  text: e.target.value,
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
            placeholder="bản/năm"
          />
        </div>
      </div>

      {/* Certification */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Award className="w-4 h-4 inline mr-2" />
          Chứng nhận / Danh hiệu
        </label>
        <input
          type="text"
          value={formData.certification || ""}
          onChange={(e) => updateFormData({ certification: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          placeholder="VD: Nghệ nhân ưu tú"
        />
      </div>
    </div>
  );
}
