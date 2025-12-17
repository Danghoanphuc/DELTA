// apps/admin-frontend/src/components/products/form-sections/BasicInfoSection.tsx
// Section 1: Basic Information with Auto-generate SKU & Slug

import { useState, useEffect } from "react";
import { Wand2, RefreshCw, Loader2 } from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";
import { CATEGORY_OPTIONS } from "../../../constants/product-categories";
import { toast } from "sonner";

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
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Generate SKU from name and category
  const generateSku = (name: string, categoryId: string): string => {
    // Get category prefix
    const categoryPrefixes: Record<string, string> = {
      "hanh-tho": "THO",
      "hanh-kim": "KIM",
      "hanh-thuy": "THUY",
      "hanh-moc": "MOC",
      "hanh-hoa": "HOA",
    };

    const prefix = categoryPrefixes[categoryId] || "PRD";

    // Extract first letters from product name (max 3 words)
    const words = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .slice(0, 3);

    const nameCode = words.map((w) => w.charAt(0).toUpperCase()).join("");

    // Add random number for uniqueness
    const randomNum = Math.floor(Math.random() * 900) + 100;

    return `${prefix}-${nameCode || "XX"}-${randomNum}`;
  };

  // Auto-generate SKU when name or category changes
  const handleAutoGenerateSku = () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm trước");
      return;
    }

    setIsGeneratingSku(true);
    setTimeout(() => {
      const newSku = generateSku(formData.name, formData.categoryId);
      updateFormData({ sku: newSku });
      toast.success("Đã tạo SKU tự động!");
      setIsGeneratingSku(false);
    }, 300);
  };

  // Handle name change - auto update slug
  const handleNameChange = (name: string) => {
    updateFormData({
      name,
      slug: generateSlug(name),
    });
  };

  // Auto-generate SKU when category changes (if name exists and SKU is empty)
  useEffect(() => {
    if (formData.name && formData.categoryId && !formData.sku) {
      const newSku = generateSku(formData.name, formData.categoryId);
      updateFormData({ sku: newSku });
    }
  }, [formData.categoryId]);

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
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => updateFormData({ sku: e.target.value })}
              className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.sku ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="VD: THO-BHL-001"
            />
            <button
              type="button"
              onClick={handleAutoGenerateSku}
              disabled={isGeneratingSku}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors disabled:opacity-50"
              title="Tự động tạo SKU"
            >
              {isGeneratingSku ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.sku && (
            <p className="mt-1 text-sm text-red-500">{errors.sku}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Nhấn <Wand2 className="w-3 h-3 inline" /> để tự động tạo SKU từ tên
            và danh mục
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => updateFormData({ slug: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-orange-500"
              placeholder="auto-generated-from-name"
            />
            <button
              type="button"
              onClick={() =>
                updateFormData({ slug: generateSlug(formData.name) })
              }
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              title="Tạo lại slug từ tên"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Tự động tạo từ tên sản phẩm, có thể chỉnh sửa
          </p>
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
              tags: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0),
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="VD: gốm sứ, bát tràng, quà tặng"
        />
      </div>
    </div>
  );
}
