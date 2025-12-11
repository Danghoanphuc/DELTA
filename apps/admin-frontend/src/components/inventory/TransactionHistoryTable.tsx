// src/components/inventory/TransactionHistoryTable.tsx
// ✅ SOLID: Single Responsibility - Display transaction history

import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { InventoryTransaction } from "@/services/admin.inventory.service";

interface Props {
  transactions: InventoryTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const TRANSACTION_TYPE_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  purchase: { label: "Nhập hàng", color: "bg-green-100 text-green-700" },
  sale: { label: "Xuất hàng", color: "bg-blue-100 text-blue-700" },
  adjustment: { label: "Điều chỉnh", color: "bg-purple-100 text-purple-700" },
  reserve: { label: "Đặt trước", color: "bg-yellow-100 text-yellow-700" },
  release: { label: "Hủy đặt", color: "bg-gray-100 text-gray-700" },
  return: { label: "Trả hàng", color: "bg-orange-100 text-orange-700" },
  damage: { label: "Hư hỏng", color: "bg-red-100 text-red-700" },
  transfer: { label: "Chuyển kho", color: "bg-indigo-100 text-indigo-700" },
};

export function TransactionHistoryTable({
  transactions,
  pagination,
  onPageChange,
  isLoading,
}: Props) {
  if (isLoading && transactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Chưa có giao dịch nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trước
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thay đổi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tham chiếu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lý do
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const typeInfo = TRANSACTION_TYPE_LABELS[transaction.type] || {
                label: transaction.type,
                color: "bg-gray-100 text-gray-700",
              };

              return (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}
                    >
                      {typeInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {transaction.quantityBefore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span
                      className={`font-medium ${
                        transaction.quantityChange > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.quantityChange > 0 ? "+" : ""}
                      {transaction.quantityChange}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {transaction.quantityAfter}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {transaction.referenceNumber && (
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {transaction.referenceNumber}
                      </code>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>
                      <p>{transaction.reason}</p>
                      {transaction.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          {transaction.notes}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            trong tổng số {pagination.total} giao dịch
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg ${
                      pagination.page === pageNum
                        ? "bg-orange-500 text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
