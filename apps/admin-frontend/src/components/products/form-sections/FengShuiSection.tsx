// apps/admin-frontend/src/components/products/form-sections/FengShuiSection.tsx
// Section 6: Feng Shui & Application

import { Upload, X } from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";
import { FENG_SHUI_ELEMENTS } from "../../../constants/product-categories";

interface FengShuiSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function FengShuiSection({
  formData,
  updateFormData,
  errors,
}: FengShuiSectionProps) {
  const toggleElement = (element: string) => {
    const current = formData.fengShui?.suitableElements || [];
    const updated = current.includes(element as any)
      ? current.filter((e) => e !== element)
      : [...current, element as any];
    updateFormData({
      fengShui: {
        suitableElements: updated,
        placement: formData.fengShui?.placement,
        meaning: formData.fengShui?.meaning,
        message: formData.fengShui?.message,
        lifestyleImage: formData.fengShui?.lifestyleImage,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Suitable Elements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hợp mệnh
        </label>
        <div className="grid grid-cols-5 gap-3">
          {FENG_SHUI_ELEMENTS.map((element) => (
            <button
              key={element.value}
              type="button"
              onClick={() => toggleElement(element.value)}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                formData.fengShui?.suitableElements?.includes(
                  element.value as any
                )
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{
                borderColor: formData.fengShui?.suitableElements?.includes(
                  element.value as any
                )
                  ? element.color
                  : undefined,
              }}
            >
              <div className="font-medium text-sm">{element.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Placement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vị trí đặt
        </label>
        <textarea
          value={formData.fengShui?.placement || ""}
          onChange={(e) =>
            updateFormData({
              fengShui: {
                suitableElements: formData.fengShui?.suitableElements || [],
                placement: e.target.value,
                meaning: formData.fengShui?.meaning,
                message: formData.fengShui?.message,
                lifestyleImage: formData.fengShui?.lifestyleImage,
              },
            })
          }
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          placeholder="VD: Bàn làm việc CEO, Kệ sách phía sau ghế ngồi"
        />
      </div>

      {/* Meaning */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ý nghĩa phong thủy
        </label>
        <textarea
          value={formData.fengShui?.meaning || ""}
          onChange={(e) =>
            updateFormData({
              fengShui: {
                suitableElements: formData.fengShui?.suitableElements || [],
                placement: formData.fengShui?.placement,
                meaning: e.target.value,
                message: formData.fengShui?.message,
                lifestyleImage: formData.fengShui?.lifestyleImage,
              },
            })
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          placeholder="VD: Thu hút tài lộc, gia cố vị thế..."
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thông điệp
        </label>
        <textarea
          value={formData.fengShui?.message || ""}
          onChange={(e) =>
            updateFormData({
              fengShui: {
                suitableElements: formData.fengShui?.suitableElements || [],
                placement: formData.fengShui?.placement,
                meaning: formData.fengShui?.meaning,
                message: e.target.value,
                lifestyleImage: formData.fengShui?.lifestyleImage,
              },
            })
          }
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          placeholder="VD: Món quà thể hiện sự trân trọng..."
        />
      </div>

      {/* Lifestyle Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ảnh Lifestyle (sản phẩm trong không gian thực tế)
        </label>
        {!formData.fengShui?.lifestyleImage ? (
          <button
            type="button"
            onClick={() =>
              updateFormData({
                fengShui: {
                  suitableElements: formData.fengShui?.suitableElements || [],
                  placement: formData.fengShui?.placement,
                  meaning: formData.fengShui?.meaning,
                  message: formData.fengShui?.message,
                  lifestyleImage: "https://placehold.co/800x600?text=Lifestyle",
                },
              })
            }
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400"
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Upload ảnh</p>
          </button>
        ) : (
          <div className="relative">
            <img
              src={formData.fengShui.lifestyleImage}
              alt="Lifestyle"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() =>
                updateFormData({
                  fengShui: {
                    suitableElements: formData.fengShui?.suitableElements || [],
                    placement: formData.fengShui?.placement,
                    meaning: formData.fengShui?.meaning,
                    message: formData.fengShui?.message,
                    lifestyleImage: undefined,
                  },
                })
              }
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
