// apps/admin-frontend/src/pages/CategoriesPage.tsx
// ✅ SOLID Compliant: Single Responsibility - UI rendering only

import { useState } from "react";
import { FolderTree, Plus, RefreshCw } from "lucide-react";
import { Category } from "@/services/catalog.service";
import { useCategories } from "@/hooks/useCategories";
import { CategoryModal } from "@/components/categories/CategoryModal";
import { CategoryTree } from "@/components/categories/CategoryTree";

export default function CategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<string>("");

  const {
    categories,
    flatCategories,
    isLoading,
    expandedIds,
    toggleExpand,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const handleOpenCreate = (parent?: string) => {
    setEditingCategory(null);
    setParentId(parent || "");
    setShowModal(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setParentId("");
    setShowModal(true);
  };

  const handleSubmit = async (data: Partial<Category>) => {
    if (parentId) {
      data.parentId = parentId;
    }
    if (editingCategory) {
      await updateCategory(editingCategory._id, data);
    } else {
      await createCategory(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await deleteCategory(id);
    } catch (error: any) {
      alert(error.response?.data?.error || "Không thể xóa danh mục");
    }
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
          onClick={() => handleOpenCreate()}
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
              onClick={() => handleOpenCreate()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Tạo danh mục đầu tiên
            </button>
          </div>
        ) : (
          <CategoryTree
            categories={categories}
            expandedIds={expandedIds}
            onToggleExpand={toggleExpand}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onAddChild={handleOpenCreate}
          />
        )}
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingCategory={editingCategory}
        flatCategories={flatCategories}
      />
    </div>
  );
}
