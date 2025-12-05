// src/features/organization/hooks/useSwagOrders.ts
// ✅ SOLID: Single Responsibility - Orders state management

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import { swagOrderService, SwagOrder } from "../services/swag-order.service";

export function useSwagOrders() {
  const [orders, setOrders] = useState<SwagOrder[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Detail modal state
  const [selectedOrder, setSelectedOrder] = useState<SwagOrder | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await swagOrderService.getOrders(statusFilter);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await swagOrderService.getOrderStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  const viewOrderDetail = async (orderId: string) => {
    setIsLoadingDetail(true);
    try {
      const order = await swagOrderService.getOrderDetail(orderId);
      setSelectedOrder(order);
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng");
      setSelectedOrder(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await swagOrderService.cancelOrder(orderId, "Hủy bởi người dùng");
      toast.success("Đã hủy đơn hàng");
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    }
  };

  const resendEmail = async (orderId: string, recipientId: string) => {
    try {
      await swagOrderService.resendEmail(orderId, recipientId);
      toast.success("Đã gửi lại email");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi email");
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    orders: filteredOrders,
    stats,
    isLoading,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    selectedOrder,
    setSelectedOrder,
    isLoadingDetail,
    viewOrderDetail,
    cancelOrder,
    resendEmail,
  };
}
