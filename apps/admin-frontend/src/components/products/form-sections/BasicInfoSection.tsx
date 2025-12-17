// apps/admin-frontend/src/components/products/form-sections/BasicInfoSection.tsx
// Section 1: Basic Information

import { StorytellingProductFormData } from "../../../types/storytelling-product";
import { CATEGORY_OPTIONS } from "../../../constants/product-categories";

interface BasicInfoSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function BasicInfoSection({
  formData,
  updateFormData,
  errors,
}: BasicInfoSectionProps) {
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    updateFormData({
      name,
      slug: generateSlug(name),
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên sản phẩm <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="VD: Bình Hút Lộc Vạn Dặm Giang Sơn"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Danh mục (Ngũ Hành) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-5 gap-3">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateFormData({ categoryId: cat.value })}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.categoryId === cat.value
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-medium text-sm">{cat.label}</div>
              <div className="text-xs text-gray-500 mt-1">{cat.subtitle}</div>
            </button>
          ))}
        </div>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
        )}
      </div>

      {/* SKU & Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => updateFormData({ sku: e.target.value })}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.sku ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="VD: BINH-001"
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-red-500">{errors.sku}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL)
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => updateFormData({ slug: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
            placeholder="Auto-generated"
            readOnly
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả ngắn
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Mô tả ngắn gọn về sản phẩm (2-3 câu)"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (phân cách bằng dấu phẩy)
        </label>
        <input
          type="text"
          value={formData.tags.join(", ")}
          onChange={(e) =>
            updateFormData({
              tags: e.target.value.split(",").map((t) => t.trim()),
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="VD: gốm sứ, bát tràng, quà tặng"
        />
      </div>
    </div>
  );
}
