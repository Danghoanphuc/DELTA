// apps/customer-frontend/src/features/templates/pages/TemplateReorderPage.tsx
// ✅ PHASE 9.2.3: Template Reorder Page - Reorder from template with substitutions

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTemplateReorder } from "../hooks/useTemplates";
import { AlertTriangle, Package, ArrowRight, Check } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import { SubstituteProduct } from "../services/template.service";

export function TemplateReorderPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { templateData, substitutes, isLoading, loadTemplate } =
    useTemplateReorder();

  const [selectedSubstitutes, setSelectedSubstitutes] = useState<
    Record<string, string>
  >({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId, loadTemplate]);

  useEffect(() => {
    if (templateData) {
      // Initialize quantities from template
      const initialQuantities: Record<string, number> = {};
      templateData.template.items.forEach((item) => {
        initialQuantities[item.productId] = item.quantity;
      });
      setQuantities(initialQuantities);
    }
  }, [templateData]);

  const handleSubstituteSelect = (productId: string, substituteId: string) => {
    setSelectedSubstitutes({
      ...selectedSubstitutes,
      [productId]: substituteId,
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity >= 1) {
      setQuantities({
        ...quantities,
        [productId]: quantity,
      });
    }
  };

  const handleProceedToOrder = () => {
    // Navigate to order creation with template data
    const orderData = {
      templateId,
      substitutes: selectedSubstitutes,
      quantities,
    };
    navigate("/orders/create", { state: { fromTemplate: orderData } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!templateData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy template</p>
        </div>
      </div>
    );
  }

  const { template, availability, needsUpdate } = templateData;
  const hasUnavailableProducts = !availability.allAvailable;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Đặt lại từ Template
        </h1>
        <p className="text-gray-600">{template.name}</p>
      </div>

      {/* Warning if products unavailable */}
      {hasUnavailableProducts && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900 mb-1">
                Một số sản phẩm không còn khả dụng
              </h3>
              <p className="text-sm text-yellow-800">
                {availability.unavailableProducts.length} sản phẩm trong
                template không còn khả dụng. Vui lòng chọn sản phẩm thay thế
                hoặc bỏ qua.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-6">
        {template.items.map((item) => {
          const isUnavailable = availability.unavailableProducts.some(
            (u) => u.productId === item.productId
          );
          const productSubstitutes = substitutes[item.productId] || [];
          const selectedSubstitute = selectedSubstitutes[item.productId];

          return (
            <div
              key={item.productId}
              className={`bg-white rounded-lg shadow-md p-6 ${
                isUnavailable ? "border-2 border-yellow-300" : ""
              }`}
            >
              {/* Product Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    SKU: {item.productSku}
                  </p>
                  {isUnavailable && (
                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                      Không còn khả dụng
                    </span>
                  )}
                </div>

                {/* Quantity Selector */}
                {!isUnavailable && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Số lượng:</label>
                    <input
                      type="number"
                      min="1"
                      value={quantities[item.productId] || item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.productId,
                          parseInt(e.target.value)
                        )
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Substitutes */}
              {isUnavailable && productSubstitutes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Sản phẩm thay thế gợi ý:
                  </h4>
                  <div className="space-y-3">
                    {productSubstitutes.map((substitute) => (
                      <SubstituteOption
                        key={substitute.productId}
                        substitute={substitute}
                        isSelected={selectedSubstitute === substitute.productId}
                        onSelect={() =>
                          handleSubstituteSelect(
                            item.productId,
                            substitute.productId
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tóm tắt đơn hàng
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Tổng sản phẩm:</span>
            <span className="font-medium">{template.items.length} loại</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Giá ước tính:</span>
            <span className="font-medium">
              {formatCurrency(template.estimatedPrice)}
            </span>
          </div>
          {hasUnavailableProducts && (
            <div className="flex justify-between text-yellow-600">
              <span>Sản phẩm cần thay thế:</span>
              <span className="font-medium">
                {availability.unavailableProducts.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate("/templates")}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Quay lại
        </button>
        <button
          onClick={handleProceedToOrder}
          disabled={
            hasUnavailableProducts &&
            availability.unavailableProducts.some(
              (u) => !selectedSubstitutes[u.productId]
            )
          }
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Tiếp tục đặt hàng
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

interface SubstituteOptionProps {
  substitute: SubstituteProduct;
  isSelected: boolean;
  onSelect: () => void;
}

function SubstituteOption({
  substitute,
  isSelected,
  onSelect,
}: SubstituteOptionProps) {
  const priceDiffColor =
    substitute.priceDifference > 0
      ? "text-red-600"
      : substitute.priceDifference < 0
      ? "text-green-600"
      : "text-gray-600";

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
            isSelected
              ? "border-blue-500 bg-blue-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">
            {substitute.productName}
          </h5>
          <p className="text-sm text-gray-600 mt-1">
            SKU: {substitute.productSku}
          </p>
          <p className="text-sm text-gray-600 mt-1">{substitute.reason}</p>

          {/* Price */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(substitute.basePrice)}
            </span>
            {substitute.priceDifference !== 0 && (
              <span className={`text-sm ${priceDiffColor}`}>
                {substitute.priceDifference > 0 ? "+" : ""}
                {formatCurrency(substitute.priceDifference)}
              </span>
            )}
            {substitute.isInStock ? (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                Còn hàng
              </span>
            ) : (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                Hết hàng
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
