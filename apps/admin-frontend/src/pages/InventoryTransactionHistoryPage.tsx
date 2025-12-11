// src/pages/InventoryTransactionHistoryPage.tsx
// ✅ SOLID: UI composition only

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Download } from "lucide-react";
import { useVariantInventory } from "@/hooks/useInventoryManagement";
import { TransactionHistoryTable } from "@/components/inventory/TransactionHistoryTable";
import { VariantInventoryCard } from "@/components/inventory/VariantInventoryCard";

export default function InventoryTransactionHistoryPage() {
  const { variantId } = useParams<{ variantId: string }>();
  const navigate = useNavigate();
  const { variant, transactions, pagination, isLoading, fetchTransactions } =
    useVariantInventory(variantId || null);

  const [typeFilter, setTypeFilter] = useState<string>("all");

  const handlePageChange = (page: number) => {
    fetchTransactions(page, typeFilter === "all" ? undefined : typeFilter);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    fetchTransactions(1, type === "all" ? undefined : type);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log("Export transactions to CSV");
  };

  if (isLoading && !variant) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy variant</p>
          <button
            onClick={() => navigate("/inventory")}
            className="mt-4 text-orange-500 hover:text-orange-600"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/inventory")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lịch sử giao dịch
            </h1>
            <p className="text-gray-600">{variant.productName}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() =>
              fetchTransactions(
                pagination.page,
                typeFilter === "all" ? undefined : typeFilter
              )
            }
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
        </div>
      </div>

      {/* Variant Info Card */}
      <VariantInventoryCard variant={variant} />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 my-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Loại giao dịch:
          </label>
          <select
            value={typeFilter}
            onChange={(e) => handleTypeFilterChange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tất cả</option>
            <option value="purchase">Nhập hàng</option>
            <option value="sale">Xuất hàng</option>
            <option value="adjustment">Điều chỉnh</option>
            <option value="reserve">Đặt trước</option>
            <option value="release">Hủy đặt trước</option>
            <option value="return">Trả hàng</option>
            <option value="damage">Hư hỏng</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch sử giao dịch ({pagination.total})
          </h2>
        </div>
        <TransactionHistoryTable
          transactions={transactions}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
