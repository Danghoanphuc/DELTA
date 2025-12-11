// apps/admin-frontend/src/pages/PrinterVettingPage.tsx
// ✅ SOLID Refactored: UI composition only

import { Clock, CheckCircle } from "lucide-react";
import { usePrinterVetting } from "@/hooks/usePrinterVetting";
import { PrinterCard } from "@/components/printer-vetting/PrinterCard";
import { Pagination } from "@/components/ui/Pagination";

export const PrinterVettingPage = () => {
  const {
    printers,
    pagination,
    isLoading,
    isError,
    error,
    isProcessing,
    setPage,
    approvePrinter,
    rejectPrinter,
  } = usePrinterVetting();

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-4 text-center">Đang tải danh sách...</div>;
    }
    if (isError) {
      return (
        <div className="p-4 text-center text-red-600">
          Lỗi: {(error as Error).message}
        </div>
      );
    }
    if (printers.length === 0) {
      return (
        <div className="p-10 text-center text-gray-500">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-lg font-medium">Tuyệt vời!</h3>
          <p>Không có nhà in nào đang chờ duyệt hoặc mới tạo.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nhà in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Tài liệu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {printers.map((printer) => (
              <PrinterCard
                key={printer._id.toString()}
                printer={printer}
                onApprove={approvePrinter}
                onReject={rejectPrinter}
                isProcessing={isProcessing}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center space-x-3">
        <Clock className="h-8 w-8 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-900">Duyệt Hồ sơ Nhà in</h1>
      </div>
      <p className="text-gray-600">
        Xem xét và phê duyệt các nhà in mới. Bao gồm các profile đã nộp hồ sơ
        xác thực và các profile mới tạo.
      </p>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {renderContent()}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 bg-white px-4 py-3">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrinterVettingPage;
