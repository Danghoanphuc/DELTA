// apps/admin-frontend/src/components/products/form-sections/ArtisanSection.tsx
// Section 8: Artisan & Social Proof

import { Upload, X } from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";

interface ArtisanSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function ArtisanSection({
  formData,
  updateFormData,
  errors,
}: ArtisanSectionProps) {
  const addClientLogo = () => {
    const mockUrl = `https://placehold.co/200x100?text=Logo`;
    updateFormData({
      clientLogos: [...formData.clientLogos, mockUrl],
    });
  };

  const removeClientLogo = (index: number) => {
    updateFormData({
      clientLogos: formData.clientLogos.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      {/* Artisan Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin Nghệ nhân
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nghệ nhân
              </label>
              <input
                type="text"
                value={formData.artisan?.name || ""}
                onChange={(e) =>
                  updateFormData({
                    artisan: {
                      name: e.target.value,
                      title: formData.artisan?.title || "",
                      photo: formData.artisan?.photo || "",
                      bio: formData.artisan?.bio || "",
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh hiệu
              </label>
              <input
                type="text"
                value={formData.artisan?.title || ""}
                onChange={(e) =>
                  updateFormData({
                    artisan: {
                      name: formData.artisan?.name || "",
                      title: e.target.value,
                      photo: formData.artisan?.photo || "",
                      bio: formData.artisan?.bio || "",
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                placeholder="VD: Nghệ nhân ưu tú"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh chân dung
            </label>
            {!formData.artisan?.photo ? (
              <button
                type="button"
                onClick={() =>
                  updateFormData({
                    artisan: {
                      name: formData.artisan?.name || "",
                      title: formData.artisan?.title || "",
                      photo: "https://placehold.co/400x400?text=Artisan",
                      bio: formData.artisan?.bio || "",
                    },
                  })
                }
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400"
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Upload ảnh</p>
              </button>
            ) : (
              <div className="relative inline-block">
                <img
                  src={formData.artisan.photo}
                  alt="Artisan"
                  className="w-32 h-32 object-cover rounded-full"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      artisan: {
                        name: formData.artisan?.name || "",
                        title: formData.artisan?.title || "",
                        photo: "",
                        bio: formData.artisan?.bio || "",
                      },
                    })
                  }
                  className="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiểu sử
            </label>
            <textarea
              value={formData.artisan?.bio || ""}
              onChange={(e) =>
                updateFormData({
                  artisan: {
                    name: formData.artisan?.name || "",
                    title: formData.artisan?.title || "",
                    photo: formData.artisan?.photo || "",
                    bio: e.target.value,
                  },
                })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="Giới thiệu về nghệ nhân..."
            />
          </div>
        </div>
      </div>

      {/* Client Logos */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Khách hàng tin dùng
        </h3>

        <div className="grid grid-cols-6 gap-4">
          {formData.clientLogos.map((logo, index) => (
            <div key={index} className="relative group">
              <img
                src={logo}
                alt={`Client ${index + 1}`}
                className="w-full h-16 object-contain bg-gray-50 rounded-lg p-2"
              />
              <button
                type="button"
                onClick={() => removeClientLogo(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addClientLogo}
            className="h-16 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center"
          >
            <Upload className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
