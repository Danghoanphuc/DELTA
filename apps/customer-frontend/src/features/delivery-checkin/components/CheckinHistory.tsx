// apps/customer-frontend/src/features/delivery-checkin/components/CheckinHistory.tsx
/**
 * CheckinHistory Component
 * Displays shipper's check-in history with filtering, pagination, and detail view
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { RefreshCw, History, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useShipperCheckins } from "../hooks/useShipperCheckins";
import { CheckinHistoryItem } from "./CheckinHistoryItem";
import { CheckinHistoryFilters } from "./CheckinHistoryFilters";
import { CheckinDetailModal } from "./CheckinDetailModal";

interface CheckinHistoryProps {
  onViewThread?: (threadId: string) => void;
}

export function CheckinHistory({ onViewThread }: CheckinHistoryProps) {
  const {
    checkins,
    selectedCheckin,
    isLoading,
    isLoadingDetail,
    isDeleting,
    error,
    filters,
    setFilters,
    clearFilters,
    pagination,
    setPage,
    viewCheckinDetail,
    closeCheckinDetail,
    deleteCheckin,
    refreshList,
  } = useShipperCheckins();

  // Handle delete from detail modal
  const handleDeleteFromModal = async (checkinId: string) => {
    const success = await deleteCheckin(checkinId);
    if (success) {
      closeCheckinDetail();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">
            Lịch sử Check-in
            {pagination.total > 0 && (
              <span className="text-gray-500 font-normal ml-2">
                ({pagination.total})
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <CheckinHistoryFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={refreshList}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshList}
            className="mt-2"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && checkins.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border p-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && checkins.length === 0 && !error && (
        <div className="bg-white rounded-xl border p-8 text-center">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">
            Chưa có check-in nào
          </h3>
          <p className="text-sm text-gray-500">
            {filters.startDate || filters.endDate || filters.status
              ? "Không tìm thấy check-in phù hợp với bộ lọc"
              : "Bạn chưa thực hiện check-in giao hàng nào"}
          </p>
          {(filters.startDate || filters.endDate || filters.status) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-4"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}

      {/* Check-in list - Requirements: 9.1, 9.2 */}
      {checkins.length > 0 && (
        <div className="space-y-3">
          {checkins.map((checkin) => (
            <CheckinHistoryItem
              key={checkin._id}
              checkin={checkin}
              onView={viewCheckinDetail}
              onDelete={deleteCheckin}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* Pagination - Requirements: 9.5 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">
            Hiển thị {checkins.length} / {pagination.total} check-in
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-700 px-2">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal - Requirements: 9.4 */}
      <CheckinDetailModal
        checkin={selectedCheckin}
        isOpen={!!selectedCheckin || isLoadingDetail}
        isLoading={isLoadingDetail}
        isDeleting={isDeleting}
        onClose={closeCheckinDetail}
        onDelete={handleDeleteFromModal}
        onViewThread={onViewThread}
      />
    </div>
  );
}
