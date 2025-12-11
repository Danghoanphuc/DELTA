// apps/customer-frontend/src/features/templates/components/SaveAsTemplateModal.tsx
// ✅ PHASE 9.2.2: Save as Template Modal - Create template from order

import { useState } from "react";
import { X } from "lucide-react";
import { useTemplates } from "../hooks/useTemplates";
import { CreateTemplateData } from "../services/template.service";

interface SaveAsTemplateModalProps {
  orderId: string;
  orderName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TEMPLATE_TYPES = [
  { value: "welcome_kit", label: "Welcome Kit" },
  { value: "event_swag", label: "Event Swag" },
  { value: "client_gift", label: "Client Gift" },
  { value: "holiday", label: "Holiday" },
  { value: "custom", label: "Custom" },
];

export function SaveAsTemplateModal({
  orderId,
  orderName,
  isOpen,
  onClose,
  onSuccess,
}: SaveAsTemplateModalProps) {
  const { createFromOrder } = useTemplates();
  const [formData, setFormData] = useState<CreateTemplateData>({
    name: orderName ? `Template - ${orderName}` : "",
    description: "",
    type: "custom",
    isPublic: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createFromOrder(orderId, formData);
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "custom",
        isPublic: false,
      });
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Lưu làm Template
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên Template <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ví dụ: Welcome Kit Q1 2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn gọn về template này..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Template Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại Template
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as CreateTemplateData["type"],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {TEMPLATE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Public/Private */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) =>
                setFormData({ ...formData, isPublic: e.target.checked })
              }
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <label
                htmlFor="isPublic"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Template công khai
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Cho phép các tổ chức khác xem và sử dụng template này
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Template sẽ lưu cấu hình sản phẩm, số lượng và tùy chỉnh từ đơn
              hàng này. Bạn có thể điều chỉnh khi đặt lại.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
