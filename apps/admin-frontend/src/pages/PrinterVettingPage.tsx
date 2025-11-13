// apps/admin-frontend/src/pages/PrinterVettingPage.tsx
import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData, // <-- 1. Thêm import
} from "@tanstack/react-query";
import {
  getPendingPrinters,
  verifyPrinter,
} from "@/services/admin.printer.service";
import { Pagination } from "@/components/ui/Pagination";
// 2. Xóa 'Building' không sử dụng (lỗi TS6133)
import { CheckCircle, XCircle, Clock, Download } from "lucide-react";

export const PrinterVettingPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // === QUERIES ===
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pendingPrinters", page],
    queryFn: () => getPendingPrinters(page),
    placeholderData: keepPreviousData, // <-- 3. Sửa API TanStack v5
  });

  // === MUTATIONS ===
  const verifyMutation = useMutation({
    mutationFn: verifyPrinter,
    onSuccess: (data, variables) => {
      alert(
        `Đã ${
          variables.action === "approve" ? "chấp thuận" : "từ chối"
        } nhà in ${data.businessName}`
      );
      queryClient.invalidateQueries({ queryKey: ["pendingPrinters"] });
    },
    onError: (err: Error) => {
      alert(`Lỗi: ${err.message}`);
    },
  });

  // === HANDLERS (NÂNG CẤP) ===
  const handleApprove = (printerId: string) => {
    if (!window.confirm("Bạn có chắc muốn CHẤP THUẬN nhà in này?")) return;
    verifyMutation.mutate({ printerId, action: "approve" });
  };

  const handleReject = (printerId: string) => {
    const reason = window.prompt(
      "Vui lòng nhập LÝ DO TỪ CHỐI (Bắt buộc). Lý do này sẽ được gửi email cho nhà in."
    );

    if (!reason || reason.trim().length === 0) {
      alert("Hủy bỏ hành động. Lý do từ chối là bắt buộc.");
      return;
    }

    verifyMutation.mutate({
      printerId,
      action: "reject",
      reason: reason.trim(),
    });
  };

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
    if (!data || data.data.length === 0) {
      return (
        <div className="p-10 text-center text-gray-500">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-lg font-medium">Tuyệt vời!</h3>
          <p>Không có nhà in nào đang chờ duyệt.</p>
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
                Tài liệu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ngày nộp
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.data.map((printer) => (
              <tr key={printer._id.toString()}>
                {" "}
                {/* <-- 4. Sửa lỗi ObjectId */}
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {printer.businessName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {printer.contactPhone || "Chưa có SĐT"}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex space-x-2">
                    {printer.verificationDocs?.gpkdUrl && (
                      <a
                        href={printer.verificationDocs.gpkdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        title="Xem Giấy phép KD"
                      >
                        <Download className="mr-1 h-4 w-4" /> GPKD
                      </a>
                    )}
                    {printer.verificationDocs?.cccdUrl && (
                      <a
                        href={printer.verificationDocs.cccdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        title="Xem CCCD"
                      >
                        <Download className="mr-1 h-4 w-4" /> CCCD
                      </a>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(printer.updatedAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => handleReject(printer._id.toString())}
                    disabled={verifyMutation.isPending}
                    className="mr-3 inline-flex items-center rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    <XCircle className="mr-1 h-4 w-4" /> Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(printer._id.toString())}
                    disabled={verifyMutation.isPending}
                    className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" /> Chấp thuận
                  </button>
                </td>
              </tr>
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
        Xem xét và phê duyệt các nhà in mới đã nộp hồ sơ xác thực.
      </p>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {renderContent()}
        {data && data.totalPages > 1 && (
          <div className="border-t border-gray-200 bg-white px-4 py-3">
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrinterVettingPage;
