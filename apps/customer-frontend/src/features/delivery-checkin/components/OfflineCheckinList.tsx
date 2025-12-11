// apps/customer-frontend/src/features/delivery-checkin/components/OfflineCheckinList.tsx
/**
 * Offline Check-in List Component
 * Displays queued offline check-ins with retry/remove options
 * Requirements: 8.4, 14.1 - Offline queue management
 */

import React from "react";
import type { OfflineCheckin } from "../types";
import { MAX_RETRY_COUNT } from "../types";

interface OfflineCheckinListProps {
  checkins: OfflineCheckin[];
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export function OfflineCheckinList({
  checkins,
  onRetry,
  onRemove,
  className = "",
}: OfflineCheckinListProps) {
  if (checkins.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700">
        Check-in đang chờ ({checkins.length})
      </h3>

      <div className="space-y-2">
        {checkins.map((checkin) => (
          <OfflineCheckinItem
            key={checkin.id}
            checkin={checkin}
            onRetry={() => onRetry(checkin.id)}
            onRemove={() => onRemove(checkin.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface OfflineCheckinItemProps {
  checkin: OfflineCheckin;
  onRetry: () => void;
  onRemove: () => void;
}

function OfflineCheckinItem({
  checkin,
  onRetry,
  onRemove,
}: OfflineCheckinItemProps) {
  const { status, retryCount, lastError, createdAt, orderNumber, photos } =
    checkin;

  const isFailed = status === "failed" || retryCount >= MAX_RETRY_COUNT;
  const isSyncing = status === "syncing";
  const canRetry = isFailed && retryCount < MAX_RETRY_COUNT;

  const formattedDate = new Date(createdAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`rounded-lg border p-3 ${
        isFailed
          ? "border-red-200 bg-red-50"
          : isSyncing
          ? "border-blue-200 bg-blue-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Order info */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {orderNumber || "Đơn hàng"}
            </span>
            <StatusBadge status={status} retryCount={retryCount} />
          </div>

          {/* Details */}
          <div className="mt-1 text-xs text-gray-500">
            <span>{formattedDate}</span>
            <span className="mx-1">•</span>
            <span>{photos.length} ảnh</span>
            {retryCount > 0 && (
              <>
                <span className="mx-1">•</span>
                <span>
                  Thử lại: {retryCount}/{MAX_RETRY_COUNT}
                </span>
              </>
            )}
          </div>

          {/* Error message */}
          {lastError && (
            <p className="mt-1 text-xs text-red-600">{lastError}</p>
          )}
        </div>

        {/* Photo preview */}
        {photos.length > 0 && (
          <div className="ml-3 flex-shrink-0">
            <img
              src={photos[0].dataUrl}
              alt="Preview"
              className="h-12 w-12 rounded object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-2 flex gap-2">
        {canRetry && (
          <button
            onClick={onRetry}
            className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
          >
            Thử lại
          </button>
        )}
        <button
          onClick={onRemove}
          className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: OfflineCheckin["status"];
  retryCount: number;
}

function StatusBadge({ status, retryCount }: StatusBadgeProps) {
  const isFailed = status === "failed" || retryCount >= MAX_RETRY_COUNT;

  if (isFailed) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
        Thất bại
      </span>
    );
  }

  if (status === "syncing") {
    return (
      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
        Đang đồng bộ
      </span>
    );
  }

  return (
    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
      Chờ đồng bộ
    </span>
  );
}

export default OfflineCheckinList;
