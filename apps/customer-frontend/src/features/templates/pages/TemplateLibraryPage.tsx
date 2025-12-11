// apps/customer-frontend/src/features/templates/pages/TemplateLibraryPage.tsx
// ✅ PHASE 9.2.1: Template Library Page - Display saved templates

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTemplates } from "../hooks/useTemplates";
import { ProductTemplate } from "../services/template.service";
import {
  Package,
  Calendar,
  TrendingUp,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
} from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const TEMPLATE_TYPES = {
  welcome_kit: { label: "Welcome Kit", color: "bg-blue-100 text-blue-700" },
  event_swag: { label: "Event Swag", color: "bg-purple-100 text-purple-700" },
  client_gift: { label: "Client Gift", color: "bg-green-100 text-green-700" },
  holiday: { label: "Holiday", color: "bg-red-100 text-red-700" },
  custom: { label: "Custom", color: "bg-gray-100 text-gray-700" },
};

export function TemplateLibraryPage() {
  const navigate = useNavigate();
  const { templates, isLoading, fetchTemplates, deleteTemplate } =
    useTemplates();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates({
      type: typeFilter === "all" ? undefined : typeFilter,
      isActive: true,
    });
  }, [fetchTemplates, typeFilter]);

  const handleReorder = (templateId: string) => {
    navigate(`/templates/${templateId}/reorder`);
  };

  const handleEdit = (templateId: string) => {
    navigate(`/templates/${templateId}/edit`);
  };

  const handleDelete = async (templateId: string) => {
    if (confirm("Bạn có chắc muốn xóa template này?")) {
      try {
        await deleteTemplate(templateId);
        fetchTemplates({
          type: typeFilter === "all" ? undefined : typeFilter,
          isActive: true,
        });
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Template Library
        </h1>
        <p className="text-gray-600">
          Quản lý và tái sử dụng các template đơn hàng của bạn
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setTypeFilter("all")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            typeFilter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </button>
        {Object.entries(TEMPLATE_TYPES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              typeFilter === key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có template nào
          </h3>
          <p className="text-gray-600 mb-4">
            Tạo template từ đơn hàng đã hoàn thành để tái sử dụng sau này
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              onReorder={handleReorder}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showMenu={showMenu === template._id}
              onToggleMenu={() =>
                setShowMenu(showMenu === template._id ? null : template._id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: ProductTemplate;
  onReorder: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  showMenu: boolean;
  onToggleMenu: () => void;
}

function TemplateCard({
  template,
  onReorder,
  onEdit,
  onDelete,
  showMenu,
  onToggleMenu,
}: TemplateCardProps) {
  const typeInfo = TEMPLATE_TYPES[template.type];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative">
      {/* Menu Button */}
      <button
        onClick={onToggleMenu}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
      >
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
          <button
            onClick={() => {
              onEdit(template._id);
              onToggleMenu();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Chỉnh sửa
          </button>
          <button
            onClick={() => {
              onReorder(template._id);
              onToggleMenu();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Đặt lại
          </button>
          <button
            onClick={() => {
              onDelete(template._id);
              onToggleMenu();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        </div>
      )}

      {/* Type Badge */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-sm ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </div>

      {/* Template Name */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {template.name}
      </h3>

      {/* Description */}
      {template.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {template.description}
        </p>
      )}

      {/* Items Count */}
      <div className="flex items-center gap-2 text-gray-600 mb-4">
        <Package className="h-4 w-4" />
        <span className="text-sm">{template.items.length} sản phẩm</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
        <div>
          <div className="flex items-center gap-1 text-gray-600 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Đã dùng</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {template.usageTracking.timesUsed} lần
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-gray-600 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Lần cuối</span>
          </div>
          <p className="text-sm text-gray-900">
            {template.usageTracking.lastUsedAt
              ? formatDistanceToNow(
                  new Date(template.usageTracking.lastUsedAt),
                  {
                    addSuffix: true,
                    locale: vi,
                  }
                )
              : "Chưa dùng"}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Giá ước tính</p>
        <p className="text-xl font-bold text-blue-600">
          {formatCurrency(template.estimatedPrice)}
        </p>
      </div>

      {/* Reorder Button */}
      <button
        onClick={() => onReorder(template._id)}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Đặt lại đơn hàng
      </button>
    </div>
  );
}
