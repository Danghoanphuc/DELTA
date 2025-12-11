// apps/admin-frontend/src/components/categories/CategoryModal.tsx
// ✅ SOLID: Single Responsibility - Form UI only

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Category } from "@/services/catalog.service";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => Promise<void>;
  editingCategory: Category | null;
  flatCategories: Category[];
}

export function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  flatCategories,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    icon: "",
    isActive: true,
  });

  // Reset form when modal opens or editingCategory changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editingCategory?.name || "",
        description: editingCategory?.description || "",
        parentId: editingCategory?.parentId || "",
        icon: editingCategory?.icon || "",
        isActive: editingCategory?.isActive ?? true,
      });
    }
  }, [isOpen, editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean data - remove empty strings
    const cleanData: Partial<Category> = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      isActive: formData.isActive,
    };

    // Only include parentId if it's not empty
    if (formData.parentId) {
      cleanData.parentId = formData.parentId as any;
    }

    console.log("[CategoryModal] Submitting data:", cleanData);

    try {
      await onSubmit(cleanData);
      onClose();
    } catch (error) {
      console.error("[CategoryModal] Submit error:", error);
      // Error is handled in the hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục cha
            </label>
            <select
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">— Không có (Root) —</option>
              {flatCategories
                .filter((c) => c._id !== editingCategory?._id)
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {"—".repeat(cat.level)} {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Kích hoạt
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {editingCategory ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
