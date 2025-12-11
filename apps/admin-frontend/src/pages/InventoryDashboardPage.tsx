// src/pages/InventoryDashboardPage.tsx
// ✅ SOLID: UI composition only

import { useState } from "react";
import {
  RefreshCw,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useInventoryManagement } from "@/hooks/useInventoryManagement";
import { InventoryOverviewCards } from "@/components/inventory/InventoryOverviewCards";
import { LowStockTable } from "@/components/inventory/LowStockTable";
import { ManualAdjustmentModal } from "@/components/inventory/ManualAdjustmentModal";
import { RecordPurchaseModal } from "@/components/inventory/RecordPurchaseModal";

export default function InventoryDashboardPage() {
  const {
    overview,
    lowStockItems,
    isLoading,
    isOperating,
    fetchOverview,
    fetchLowStockItems,
    adjustInventory,
    recordPurchase,
  } = useInventoryManagement();

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  const handleRefresh = async () => {
    await Promise.all([fetchOverview(), fetchLowStockItems()]);
  };

  const handleAdjust = (variantId: string) => {
    setSelectedVariantId(variantId);
    setAdjustModalOpen(true);
  };

  const handlePurchase = (variantId: string) => {
    setSelectedVariantId(variantId);
    setPurchaseModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tồn kho</h1>
          <p className="text-gray-600">
            Theo dõi và quản lý inventory real-time
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Overview Cards */}
      {overview && <InventoryOverviewCards overview={overview} />}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">
                Cảnh báo: {lowStockItems.length} sản phẩm sắp hết hàng
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Các sản phẩm dưới đây cần được nhập thêm để tránh hết hàng
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Sản phẩm sắp hết hàng
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Danh sách các variant cần nhập thêm hàng
          </p>
        </div>
        <LowStockTable
          items={lowStockItems}
          onAdjust={handleAdjust}
          onPurchase={handlePurchase}
        />
      </div>

      {/* Modals */}
      <ManualAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => {
          setAdjustModalOpen(false);
          setSelectedVariantId(null);
        }}
        variantId={selectedVariantId}
        onSubmit={adjustInventory}
        isSubmitting={isOperating}
      />

      <RecordPurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => {
          setPurchaseModalOpen(false);
          setSelectedVariantId(null);
        }}
        variantId={selectedVariantId}
        onSubmit={recordPurchase}
        isSubmitting={isOperating}
      />
    </div>
  );
}
