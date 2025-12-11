// apps/admin-frontend/src/components/products/ProductForm.tsx
// ✅ SOLID: Single Responsibility - Product Form Component

import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { PrintMethodConfig, PrintMethod } from "./PrintMethodConfig";
import { PricingTiersConfig, PricingTier } from "./PricingTiersConfig";
import { catalogService, Category } from "../../services/catalog.service";

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  baseCost: number;
  moq: number;
  status: "active" | "inactive" | "draft";
  printMethods: PrintMethod[];
  pricingTiers: PricingTier[];
  images: string[];
  tags: string[];
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const INITIAL_FORM_DATA: ProductFormData = {
  name: "",
  description: "",
  category: "",
  basePrice: 0,
  baseCost: 0,
  moq: 1,
  status: "draft",
  printMethods: [],
  pricingTiers: [],
  images: [],
  tags: [],
};

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    ...INITIAL_FORM_DATA,
    ...initialData,
  });

  const [activeTab, setActiveTab] = useState<
    "basic" | "printMethods" | "pricing"
  >("basic");

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await catalogService.getCategories(true); // flat list
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...INITIAL_FORM_DATA, ...initialData });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateField = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "basic"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Thông tin cơ bản
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("printMethods")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "printMethods"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Print Methods
            {formData.printMethods.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full">
                {formData.printMethods.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "pricing"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Pricing Tiers
            {formData.pricingTiers.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full">
                {formData.pricingTiers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="VD: Áo thun cotton"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                placeholder="Mô tả chi tiết về sản phẩm..."
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={isLoadingCategories}
                >
                  <option value="">
                    {isLoadingCategories ? "Đang tải..." : "Chọn danh mục"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.path.split("/").join(" > ")}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && !isLoadingCategories && (
                  <p className="text-xs text-red-500 mt-1">
                    Chưa có danh mục. Vui lòng tạo danh mục trước.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    updateField(
                      "status",
                      e.target.value as "active" | "inactive" | "draft"
                    )
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="draft">Draft (Nháp)</option>
                  <option value="active">Active (Hoạt động)</option>
                  <option value="inactive">Inactive (Tạm ngưng)</option>
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Base Cost (Giá vốn) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.baseCost}
                  onChange={(e) =>
                    updateField("baseCost", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
                <span className="text-xs text-gray-500">
                  {formatCurrency(formData.baseCost)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Base Price (Giá bán) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    updateField("basePrice", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                  required
                />
                <span className="text-xs text-gray-500">
                  {formatCurrency(formData.basePrice)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  MOQ (Số lượng tối thiểu)
                </label>
                <input
                  type="number"
                  value={formData.moq}
                  onChange={(e) =>
                    updateField("moq", parseInt(e.target.value) || 1)
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            {/* Margin Calculation */}
            {formData.basePrice > 0 && formData.baseCost > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Margin:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {(
                      ((formData.basePrice - formData.baseCost) /
                        formData.basePrice) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Lợi nhuận:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(formData.basePrice - formData.baseCost)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Print Methods Tab */}
        {activeTab === "printMethods" && (
          <div>
            <PrintMethodConfig
              printMethods={formData.printMethods}
              onChange={(printMethods) =>
                updateField("printMethods", printMethods)
              }
            />
          </div>
        )}

        {/* Pricing Tiers Tab */}
        {activeTab === "pricing" && (
          <div>
            <PricingTiersConfig
              pricingTiers={formData.pricingTiers}
              baseCost={formData.baseCost}
              basePrice={formData.basePrice}
              onChange={(pricingTiers) =>
                updateField("pricingTiers", pricingTiers)
              }
            />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isLoading ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
      </div>
    </form>
  );
}
