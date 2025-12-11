// apps/customer-frontend/src/features/delivery-checkin/components/SyncStatusIndicator.tsx
/**
 * Sync Status Indicator Component
 * Displays offline queue status and sync progress
 * Requirements: 8.4, 14.1 - Sync status indicator
 */

import React from "react";
import type { OfflineQueueStatus } from "../types";

interface SyncStatusIndicatorProps {
  status: OfflineQueueStatus;
  syncProgress?: { current: number; total: number };
  onSync?: () => void;
  className?: string;
}

export function SyncStatusIndicator({
  status,
  syncProgress,
  onSync,
  className = "",
}: SyncStatusIndicatorProps) {
  const { isOnline, pendingCount, syncingCount, failedCount, isSyncing } =
    status;

  const totalPending = pendingCount + syncingCount;
  const hasItems = totalPending > 0 || failedCount > 0;

  // Don't show if online and no pending items
  if (isOnline && !hasItems && !isSyncing) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border p-3 ${
        !isOnline
          ? "border-yellow-300 bg-yellow-50"
          : failedCount > 0
          ? "border-red-300 bg-red-50"
          : isSyncing
          ? "border-blue-300 bg-blue-50"
          : "border-green-300 bg-green-50"
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Status Icon */}
          {!isOnline ? (
            <OfflineIcon />
          ) : isSyncing ? (
            <SyncingIcon />
          ) : failedCount > 0 ? (
            <ErrorIcon />
          ) : totalPending > 0 ? (
            <PendingIcon />
          ) : (
            <OnlineIcon />
          )}

          {/* Status Text */}
          <div>
            <p className="text-sm font-medium">
              {!isOnline
                ? "Đang offline"
                : isSyncing
                ? "Đang đồng bộ..."
                : failedCount > 0
                ? `${failedCount} check-in thất bại`
                : totalPending > 0
                ? `${totalPending} check-in chờ đồng bộ`
                : "Đã kết nối"}
            </p>

            {/* Progress or details */}
            {isSyncing && syncProgress && (
              <p className="text-xs text-gray-600">
                {syncProgress.current}/{syncProgress.total} check-in
              </p>
            )}

            {!isOnline && totalPending > 0 && (
              <p className="text-xs text-gray-600">
                {totalPending} check-in sẽ được đồng bộ khi có mạng
              </p>
            )}
          </div>
        </div>

        {/* Sync Button */}
        {isOnline && (totalPending > 0 || failedCount > 0) && !isSyncing && (
          <button
            onClick={onSync}
            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            Đồng bộ ngay
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isSyncing && syncProgress && syncProgress.total > 0 && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${(syncProgress.current / syncProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Icon Components
function OfflineIcon() {
  return (
    <svg
      className="h-5 w-5 text-yellow-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
      />
    </svg>
  );
}

function OnlineIcon() {
  return (
    <svg
      className="h-5 w-5 text-green-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
      />
    </svg>
  );
}

function SyncingIcon() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg
      className="h-5 w-5 text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="h-5 w-5 text-red-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default SyncStatusIndicator;
