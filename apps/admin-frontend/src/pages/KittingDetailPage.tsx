// apps/admin-frontend/src/pages/KittingDetailPage.tsx
// ✅ Kitting Detail Page - Phase 6.2.2
// Kitting workflow page

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useKitting } from "../hooks/useKitting";
import { KittingChecklist } from "../components/kitting/KittingChecklist";
import { ArrowLeft } from "lucide-react";

export function KittingDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const {
    checklist,
    validation,
    isLoading,
    fetchKittingChecklist,
    validateInventory,
    startKitting,
    scanItem,
    completeKitting,
  } = useKitting();

  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchKittingChecklist(orderId);
      validateInventory(orderId);
    }
  }, [orderId, fetchKittingChecklist, validateInventory]);

  const handleStartKitting = async () => {
    if (!orderId) return;

    setIsStarting(true);
    try {
      await startKitting(orderId);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsStarting(false);
    }
  };

  const handleScanItem = async (sku: string, quantity?: number) => {
    if (!orderId) return;

    setIsScanning(true);
    try {
      await scanItem(orderId, sku, quantity);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsScanning(false);
    }
  };

  const handleCompleteKitting = async () => {
    if (!orderId) return;

    if (
      !window.confirm(
        "Bạn có chắc chắn muốn hoàn tất kitting? Đơn hàng sẽ sẵn sàng để ship."
      )
    ) {
      return;
    }

    setIsCompleting(true);
    try {
      await completeKitting(orderId);
      navigate("/kitting");
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading && !checklist) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        </div>
      </div>
    );
  }

  const canStart = checklist.status === "pending";
  const canComplete =
    checklist.status === "in_progress" &&
    checklist.progress.percentComplete === 100;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/kitting")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kitting - {checklist.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              {checklist.totalRecipients} người nhận
            </p>
          </div>

          <div className="flex gap-3">
            {canStart && (
              <button
                onClick={handleStartKitting}
                disabled={isStarting}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isStarting ? "Đang bắt đầu..." : "Bắt đầu kitting"}
              </button>
            )}

            {canComplete && (
              <button
                onClick={handleCompleteKitting}
                disabled={isCompleting}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isCompleting ? "Đang hoàn tất..." : "Hoàn tất kitting"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Validation Alert */}
      {validation && !validation.allAvailable && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            ⚠️ Tồn kho không đủ
          </h3>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.items
              .filter((item) => !item.isAvailable)
              .map((item) => (
                <li key={item.sku}>
                  {item.productName} ({item.sku}): Thiếu {item.shortage} units
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Status Info */}
      {checklist.status === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            Nhấn "Bắt đầu kitting" để bắt đầu quy trình đóng gói
          </p>
        </div>
      )}

      {checklist.status === "in_progress" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Scan từng item trong danh sách. Khi hoàn tất tất cả items, nhấn
            "Hoàn tất kitting"
          </p>
        </div>
      )}

      {/* Checklist */}
      {checklist.status !== "pending" && (
        <KittingChecklist
          checklist={checklist}
          onScanItem={handleScanItem}
          isScanning={isScanning}
        />
      )}
    </div>
  );
}
