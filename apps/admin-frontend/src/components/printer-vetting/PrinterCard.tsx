// src/components/printer-vetting/PrinterCard.tsx
// ✅ SOLID: Single Responsibility - Display printer card

import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertCircle,
} from "lucide-react";

interface PrinterCardProps {
  printer: any;
  onApprove: (printerId: string) => void;
  onReject: (printerId: string) => void;
  isProcessing: boolean;
}

export function PrinterCard({
  printer,
  onApprove,
  onReject,
  isProcessing,
}: PrinterCardProps) {
  const getStatusBadge = () => {
    if (printer.verificationStatus === "not_submitted") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="mr-1 h-3 w-3" />
          Chưa nộp hồ sơ
        </span>
      );
    }
    if (printer.verificationStatus === "pending_review") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="mr-1 h-3 w-3" />
          Đang chờ duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {printer.verificationStatus}
      </span>
    );
  };

  return (
    <tr>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {printer.businessName || "Chưa có tên"}
        </div>
        <div className="text-sm text-gray-500">
          {printer.contactPhone || "Chưa có SĐT"}
        </div>
        {printer.user && typeof printer.user === "object" && (
          <div className="text-xs text-gray-400 mt-1">
            {printer.user.email || printer.user.displayName || ""}
          </div>
        )}
        {printer.shopAddress && (
          <div className="text-xs text-gray-400 mt-1">
            {printer.shopAddress.street}, {printer.shopAddress.district},{" "}
            {printer.shopAddress.city}
          </div>
        )}
      </td>
      <td className="whitespace-nowrap px-6 py-4">{getStatusBadge()}</td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex flex-col space-y-2">
          {printer.verificationDocs?.gpkdUrl ? (
            <a
              href={printer.verificationDocs.gpkdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              title="Xem Giấy phép KD"
            >
              <Download className="mr-1 h-4 w-4" /> GPKD
            </a>
          ) : (
            <span className="text-xs text-gray-400">Chưa có GPKD</span>
          )}
          {printer.verificationDocs?.cccdUrl ? (
            <a
              href={printer.verificationDocs.cccdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              title="Xem CCCD"
            >
              <Download className="mr-1 h-4 w-4" /> CCCD
            </a>
          ) : (
            <span className="text-xs text-gray-400">Chưa có CCCD</span>
          )}
          {!printer.verificationDocs?.gpkdUrl &&
            !printer.verificationDocs?.cccdUrl && (
              <span className="text-xs text-red-500">Chưa có tài liệu</span>
            )}
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {new Date(printer.createdAt || printer.updatedAt).toLocaleDateString(
          "vi-VN"
        )}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <button
          onClick={() => onReject(printer._id.toString())}
          disabled={isProcessing}
          className="mr-3 inline-flex items-center rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
        >
          <XCircle className="mr-1 h-4 w-4" /> Từ chối
        </button>
        <button
          onClick={() => onApprove(printer._id.toString())}
          disabled={isProcessing}
          className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
        >
          <CheckCircle className="mr-1 h-4 w-4" /> Chấp thuận
        </button>
      </td>
    </tr>
  );
}
