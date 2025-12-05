// apps/admin-frontend/src/pages/CategoriesPage.tsx
// ✅ Admin Categories Management

import { useState, useEffect, useCallback } from "react";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  X,
} from "lucide-react";
import { categoryApi, Category } from "@/services/catalog.service";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
    icon: "",
    isActive: true,
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tree, flat] = await Promise.all([
        categoryApi.getAll(false),
        categoryApi.getAll(true),
      ]);
      setCategories(tree);
      setFlatCategories(flat);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateModal = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      parentId: parentId || "",
      icon: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "",
      icon: category.icon || "",
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory._id, formData);
      } else {
        await categoryApi.create(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await categoryApi.delete(id);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || "Không thể xóa danh mục");
    }
  };

  const renderCategoryTree = (items: Category[], level = 0) => {
    return items.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expandedIds.has(cat._id);

      return (
        <div key={cat._id}>
          <div
            className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-50 border-b ${
              level > 0 ? "pl-" + (4 + level * 6) : ""
            }`}
            style={{ paddingLeft: `${16 + level * 24}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(cat._id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}

            <FolderTree className="w-5 h-5 text-orange-500" />

            <div className="flex-1">
              <span className="font-medium">{cat.name}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({cat.productCount} sản phẩm)
              </span>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                cat.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat.isActive ? "Active" : "Inactive"}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => openCreateModal(cat._id)}
                className="p-1.5 hover:bg-gray-200 rounded"
                title="Thêm danh mục con"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => openEditModal(cat)}
                className="p-1.5 hover:bg-gray-200 rounded"
                title="Sửa"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => handleDelete(cat._id)}
                className="p-1.5 hover:bg-red-100 rounded"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {hasChildren &&
            isExpanded &&
            renderCategoryTree(cat.children!, level + 1)}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Danh mục sản phẩm
          </h1>
          <p className="text-gray-600">Quản lý cây danh mục phân cấp</p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có danh mục
            </h3>
            <button
              onClick={() => openCreateModal()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Tạo danh mục đầu tiên
            </button>
          </div>
        ) : (
          renderCategoryTree(categories)
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
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
                  onClick={() => setShowModal(false)}
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
      )}
    </div>
  );
}
