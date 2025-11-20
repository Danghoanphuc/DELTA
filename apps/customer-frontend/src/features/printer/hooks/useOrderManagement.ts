// src/features/printer/hooks/useOrderManagement.ts
// ✅ NEW: Hook với useInfiniteQuery cho pagination

import { useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Order, OrderStatus } from "@/types/order";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

interface FetchOrdersParams {
  pageParam?: number;
  status?: OrderStatus | "all";
  search?: string;
  sort?: "newest" | "oldest" | "highest" | "lowest";
}

/**
 * Tải đơn hàng THEO TRANG (cho infinite query)
 */
const fetchPaginatedOrders = async ({
  pageParam = 1,
  status,
  search,
  sort = "newest",
}: FetchOrdersParams) => {
  try {
    const res = await api.get("/orders/printer/my-orders", {
      params: {
        page: pageParam,
        limit: 20, // Tải 20 đơn hàng mỗi lần
        status: status !== "all" ? status : undefined,
        search: search || undefined,
        sort: sort,
      },
    });

    // ✅ DEBUG: Log full response để xem structure
    console.log("🔍 [useOrderManagement] Full response:", res.data);
    
    // ✅ FIX: Backend wraps response in ApiResponse.success({ orders, page, ... })
    // Structure: { success: true, data: { orders: [], page: 1, totalPages: 5 } }
    const responseData = res.data?.data || res.data;  // Unwrap ApiResponse first!
    
    console.log("🔍 [useOrderManagement] responseData:", responseData);
    console.log("🔍 [useOrderManagement] responseData.orders type:", typeof responseData?.orders);
    console.log("🔍 [useOrderManagement] responseData.orders is array?:", Array.isArray(responseData?.orders));
    
    const orders: Order[] = Array.isArray(responseData?.orders) 
      ? responseData.orders 
      : [];
    const page = responseData?.page || pageParam;
    const totalPages = responseData?.totalPages || 1;

    console.log(
      `📊 [useOrderManagement] Found ${orders.length} orders (page ${page}/${totalPages})`,
      orders.length > 0 ? orders.map(o => ({ _id: o._id, orderNumber: o.orderNumber })) : "No orders"
    );

    return {
      orders,
      nextPage: page < totalPages ? page + 1 : undefined,
    };
  } catch (err: any) {
    console.error("❌ Error fetching paginated orders:", err);
    if (err.response?.status !== 404 && err.response?.status !== 400) {
      toast.error("Không thể tải đơn hàng");
    }
    throw new Error("Không thể tải đơn hàng");
  }
};

export const useOrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");

  // ✅ THAY THẾ: Bằng useInfiniteQuery
  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["printer-orders", statusFilter, sortBy, searchTerm],
    queryFn: ({ pageParam }) =>
      fetchPaginatedOrders({
        pageParam,
        status: statusFilter,
        search: searchTerm,
        sort: sortBy,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // ✅ SỬA: `orders` giờ là list phẳng (flat list) từ các trang
  const orders = useMemo(
    () => data?.pages.flatMap((page) => page.orders) ?? [],
    [data]
  );

  // Tính stats từ tất cả orders đã tải
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      printing: orders.filter((o) => o.status === "printing").length,
      shipping: orders.filter((o) => o.status === "shipping").length,
      completed: orders.filter((o) => o.status === "completed").length,
    };
  }, [orders]);

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await api.put(`/orders/printer/${orderId}/status`, {
        status: newStatus,
      });

      // Invalidate query để refetch
      await refetch();

      toast.success(`✅ Đã cập nhật trạng thái đơn hàng`);
    } catch (err: any) {
      console.error("❌ Update Status Error:", err);
      toast.error(
        err.response?.data?.message || "Không thể cập nhật trạng thái"
      );
    }
  };

  return {
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
    // ✅ TRẢ VỀ: Các hàm điều khiển cuộn vô tận
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

