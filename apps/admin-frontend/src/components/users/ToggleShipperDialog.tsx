// apps/admin-frontend/src/components/users/ToggleShipperDialog.tsx
import { useState } from "react";
import { type IUser } from "@printz/types";
import { X, Truck } from "lucide-react";

interface ToggleShipperDialogProps {
  user: IUser;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function ToggleShipperDialog({
  user,
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}: ToggleShipperDialogProps) {
  const isCurrentlyShipper = !!user.shipperProfileId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Truck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isCurrentlyShipper ? "Xóa vai trò Shipper" : "Đổi thành Shipper"}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            {isCurrentlyShipper ? (
              <>
                <p className="text-sm text-gray-700">
                  Bạn có chắc muốn xóa vai trò Shipper của{" "}
                  <span className="font-semibold">{user.displayName}</span>?
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Shipper profile sẽ bị xóa vĩnh viễn và không thể khôi phục.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  Bạn có chắc muốn thêm vai trò Shipper cho{" "}
                  <span className="font-semibold">{user.displayName}</span>?
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Shipper sẽ có thể cập nhật thông tin (số điện thoại, phương
                  tiện...) sau khi đăng nhập vào Shipper Portal.
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                isCurrentlyShipper
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isProcessing
                ? "Đang xử lý..."
                : isCurrentlyShipper
                ? "Xóa vai trò"
                : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
