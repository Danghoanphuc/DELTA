// apps/admin-frontend/src/components/categories/CategoryTree.tsx
// ✅ SOLID: Single Responsibility - Tree rendering only

import {
  FolderTree,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { Category } from "@/services/catalog.service";

interface CategoryTreeProps {
  categories: Category[];
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export function CategoryTree({
  categories,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryTreeProps) {
  const renderTree = (items: Category[], level = 0): React.ReactElement[] => {
    return items.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expandedIds.has(cat._id);

      return (
        <div key={cat._id}>
          <div
            className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-50 border-b`}
            style={{ paddingLeft: `${16 + level * 24}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => onToggleExpand(cat._id)}
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
                onClick={() => onAddChild(cat._id)}
                className="p-1.5 hover:bg-gray-200 rounded"
                title="Thêm danh mục con"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => onEdit(cat)}
                className="p-1.5 hover:bg-gray-200 rounded"
                title="Sửa"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => onDelete(cat._id)}
                className="p-1.5 hover:bg-red-100 rounded"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {hasChildren && isExpanded && renderTree(cat.children!, level + 1)}
        </div>
      );
    });
  };

  return <>{renderTree(categories)}</>;
}
