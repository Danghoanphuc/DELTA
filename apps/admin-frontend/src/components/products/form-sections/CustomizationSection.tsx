// apps/admin-frontend/src/components/products/form-sections/CustomizationSection.tsx
// Section 7: Customization & Packaging

import { Upload, X } from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";
import { LOGO_CUSTOMIZATION_METHODS } from "../../../constants/product-categories";

interface CustomizationSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function CustomizationSection({
  formData,
  updateFormData,
  errors,
}: CustomizationSectionProps) {
  const toggleMethod = (method: string) => {
    const current = formData.customization?.logoMethods || [];
    const updated = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    updateFormData({
      customization: {
        allowLogoCustomization:
          formData.customization?.allowLogoCustomization || false,
        logoMethods: updated,
        packagingImages: formData.customization?.packagingImages || [],
        packagingDescription: formData.customization?.packagingDescription,
      },
    });
  };

  const addPackagingImage = () => {
    const mockUrl = `https://placehold.co/800x600?text=Packaging`;
    updateFormData({
      customization: {
        allowLogoCustomization:
          formData.customization?.allowLogoCustomization || false,
        logoMethods: formData.customization?.logoMethods || [],
        packagingImages: [
          ...(formData.customization?.packagingImages || []),
          mockUrl,
        ],
        packagingDescription: formData.customization?.packagingDescription,
      },
    });
  };

  const removePackagingImage = (index: number) => {
    const updated = (formData.customization?.packagingImages || []).filter(
      (_, i) => i !== index
    );
    updateFormData({
      customization: {
        allowLogoCustomization:
          formData.customization?.allowLogoCustomization || false,
        logoMethods: formData.customization?.logoMethods || [],
        packagingImages: updated,
        packagingDescription: formData.customization?.packagingDescription,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Allow Logo Customization */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="allowLogo"
          checked={formData.customization?.allowLogoCustomization || false}
          onChange={(e) =>
            updateFormData({
              customization: {
                allowLogoCustomization: e.target.checked,
                logoMethods: formData.customization?.logoMethods || [],
                packagingImages: formData.customization?.packagingImages || [],
                packagingDescription:
                  formData.customization?.packagingDescription,
              },
            })
          }
          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
        />
        <label
          htmlFor="allowLogo"
          className="text-sm font-medium text-gray-700"
        >
          Cho phép in/khắc logo doanh nghiệp
        </label>
      </div>

      {/* Logo Methods */}
      {formData.customization?.allowLogoCustomization && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Phương thức in/khắc logo
          </label>
          <div className="grid grid-cols-3 gap-3">
            {LOGO_CUSTOMIZATION_METHODS.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => toggleMethod(method.value)}
                className={`p-3 border-2 rounded-lg text-sm transition-all ${
                  formData.customization?.logoMethods?.includes(method.value)
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Packaging Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả bao bì
        </label>
        <textarea
          value={formData.customization?.packagingDescription || ""}
          onChange={(e) =>
            updateFormData({
              customization: {
                allowLogoCustomization:
                  formData.customization?.allowLogoCustomization || false,
                logoMethods: formData.customization?.logoMethods || [],
                packagingImages: formData.customization?.packagingImages || [],
                packagingDescription: e.target.value,
              },
            })
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          placeholder="Mô tả về hộp quà, túi giấy, thiệp..."
        />
      </div>

      {/* Packaging Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Ảnh bao bì
        </label>
        <div className="grid grid-cols-4 gap-4">
          {formData.customization?.packagingImages?.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Packaging ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePackagingImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPackagingImage}
            className="h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex flex-col items-center justify-center"
          >
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="mt-1 text-xs text-gray-600">Thêm ảnh</span>
          </button>
        </div>
      </div>
    </div>
  );
}
