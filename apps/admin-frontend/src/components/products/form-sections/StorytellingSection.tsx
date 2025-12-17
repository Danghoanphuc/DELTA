// apps/admin-frontend/src/components/products/form-sections/StorytellingSection.tsx
// Section 4: Storytelling Content

import { Upload, X } from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";

interface StorytellingSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function StorytellingSection({
  formData,
  updateFormData,
  errors,
}: StorytellingSectionProps) {
  const handleImageUpload = (part: "materials" | "process") => {
    // TODO: Implement actual upload
    const mockUrl = `https://placehold.co/800x600?text=${part}`;
    updateFormData({
      story: {
        ...formData.story,
        [part]: {
          ...formData.story?.[part],
          image: mockUrl,
        },
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Part 1: Materials */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Phần 1: Nguyên liệu
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              value={formData.story?.materials?.title || ""}
              onChange={(e) =>
                updateFormData({
                  story: {
                    ...formData.story,
                    materials: {
                      ...formData.story?.materials,
                      title: e.target.value,
                      content: formData.story?.materials?.content || "",
                      image: formData.story?.materials?.image || "",
                    },
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="VD: Chọn lựa nguyên liệu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              value={formData.story?.materials?.content || ""}
              onChange={(e) =>
                updateFormData({
                  story: {
                    ...formData.story,
                    materials: {
                      ...formData.story?.materials,
                      title: formData.story?.materials?.title || "",
                      content: e.target.value,
                      image: formData.story?.materials?.image || "",
                    },
                  },
                })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="Kể về quá trình chọn nguyên liệu..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh minh họa
            </label>
            {!formData.story?.materials?.image ? (
              <button
                type="button"
                onClick={() => handleImageUpload("materials")}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors"
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Upload ảnh</p>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={formData.story.materials.image}
                  alt="Materials"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      story: {
                        ...formData.story,
                        materials: {
                          title: formData.story?.materials?.title || "",
                          content: formData.story?.materials?.content || "",
                          image: "",
                        },
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
      </div>

      {/* Part 2: Process */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Phần 2: Quy trình chế tác
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              value={formData.story?.process?.title || ""}
              onChange={(e) =>
                updateFormData({
                  story: {
                    ...formData.story,
                    process: {
                      ...formData.story?.process,
                      title: e.target.value,
                      content: formData.story?.process?.content || "",
                      image: formData.story?.process?.image || "",
                    },
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="VD: Tạo hình & Trang trí"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              value={formData.story?.process?.content || ""}
              onChange={(e) =>
                updateFormData({
                  story: {
                    ...formData.story,
                    process: {
                      ...formData.story?.process,
                      title: formData.story?.process?.title || "",
                      content: e.target.value,
                      image: formData.story?.process?.image || "",
                    },
                  },
                })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="Kể về quy trình chế tác..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh minh họa
            </label>
            {!formData.story?.process?.image ? (
              <button
                type="button"
                onClick={() => handleImageUpload("process")}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors"
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Upload ảnh</p>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={formData.story.process.image}
                  alt="Process"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      story: {
                        ...formData.story,
                        process: {
                          title: formData.story?.process?.title || "",
                          content: formData.story?.process?.content || "",
                          image: "",
                        },
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
      </div>
    </div>
  );
}
