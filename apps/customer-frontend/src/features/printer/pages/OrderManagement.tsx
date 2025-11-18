// frontend/src/pages/printer/OrderManagement.tsx (✅ NÂNG CẤP - PAGINATION)

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { OrderStatsGrid } from "@/features/printer/components/OrderStatsGrid";
import { OrderFilterBar } from "@/features/printer/components/OrderFilterBar";
import { OrderTable } from "@/features/printer/components/OrderTable";
import { OrderEmptyState } from "@/features/printer/components/OrderEmptyState";
import { useOrderManagement } from "@/features/printer/hooks/useOrderManagement";
import { Loader2 } from "lucide-react";

export function OrderManagement() {
  const {
    orders,
    loading,
    stats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    handleUpdateStatus,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrderManagement();

  // ✅ INFINITE SCROLL: Trigger fetchNextPage khi scroll đến cuối
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ==================== RENDER ====================
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý đơn hàng
          </h1>
          <p className="text-gray-600">Theo dõi và xử lý đơn hàng in ấn</p>
        </div>

        {/* Stats Cards */}
        <OrderStatsGrid stats={stats} />

        {/* Main Card */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <OrderFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              // KHẮC PHỤC: Gói setter trong 1 arrow function để khớp type
              onStatusChange={(value) => setStatusFilter(value)}
              sortBy={sortBy}
              // KHẮC PHỤC: Gói setter trong 1 arrow function để khớp type
              onSortChange={(value) =>
                setSortBy(value as "newest" | "oldest" | "highest" | "lowest")
              }
            />
          </CardHeader>

          <CardContent>
            {loading && orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                <p className="mt-4 text-gray-500">Đang tải đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <OrderEmptyState />
            ) : (
              <>
                <OrderTable
                  orders={orders}
                  onUpdateStatus={handleUpdateStatus}
                  loading={loading}
                />
                {/* ✅ INFINITE SCROLL: Trigger point ở cuối bảng */}
                {hasNextPage && (
                  <div ref={ref} className="flex justify-center py-8">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang tải thêm...</span>
                      </div>
                    ) : (
                      <div className="h-20" /> // Placeholder để trigger inView
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
