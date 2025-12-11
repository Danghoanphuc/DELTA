// apps/admin-frontend/src/pages/ProductionOrderDetailPage.tsx
// ✅ Production Order Detail Page
// Phase 5.2.2: Production Management UI - Detail Page

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductionManagement } from "@/hooks/useProductionManagement";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QCCheckModal } from "@/components/production/QCCheckModal";
import { UpdateStatusModal } from "@/components/production/UpdateStatusModal";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_production: "bg-purple-100 text-purple-800",
  qc_check: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_production: "Đang sản xuất",
  qc_check: "Kiểm tra QC",
  completed: "Hoàn thành",
  failed: "Thất bại",
};

export default function ProductionOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrder, isLoading, fetchProductionOrder } =
    useProductionManagement();

  const [showQCModal, setShowQCModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductionOrder(id);
    }
  }, [id, fetchProductionOrder]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy đơn sản xuất</p>
          <button
            onClick={() => navigate("/production")}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/production")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          ← Quay lại
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          Chi tiết đơn sản xuất #{currentOrder.swagOrderNumber}
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Trạng thái</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                STATUS_COLORS[currentOrder.status] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {STATUS_LABELS[currentOrder.status] || currentOrder.status}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-600">Nhà cung cấp</p>
            <p className="font-medium">{currentOrder.supplierName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Ngày tạo</p>
            <p className="font-medium">{formatDate(currentOrder.orderedAt)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Tổng chi phí</p>
            <p className="font-medium">
              {formatCurrency(currentOrder.estimatedCost)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
          <div className="space-y-4">
            {currentOrder.items?.map((item: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">x{item.quantity}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.totalCost)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Cập nhật trạng thái
          </button>
          <button
            onClick={() => setShowQCModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Kiểm tra QC
          </button>
        </div>
      </div>

      {showQCModal && (
        <QCCheckModal
          productionOrderId={currentOrder._id}
          onClose={() => setShowQCModal(false)}
          onSuccess={() => {
            setShowQCModal(false);
            fetchProductionOrder(id!);
          }}
        />
      )}

      {showStatusModal && (
        <UpdateStatusModal
          productionOrderId={currentOrder._id}
          currentStatus={currentOrder.status}
          onClose={() => setShowStatusModal(false)}
          onSuccess={() => {
            setShowStatusModal(false);
            fetchProductionOrder(id!);
          }}
        />
      )}
    </div>
  );
}
