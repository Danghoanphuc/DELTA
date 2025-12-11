// src/hooks/useOrderDetail.ts
// ✅ SOLID: Single Responsibility - State management cho Order Detail

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { swagOpsService } from "@/services/admin.swag-operations.service";

export function useOrderDetail(orderId: string | undefined) {
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<
    Array<{ id: string; name: string; available: boolean }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch order data
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const [orderData, logs, carriersData] = await Promise.all([
        swagOpsService.getOrder(orderId),
        swagOpsService.getOrderActivityLog(orderId),
        swagOpsService.getCarriers(),
      ]);
      setOrder(orderData);
      setActivityLog(logs || []);
      setCarriers(carriersData || []);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Start processing
  const startProcessing = async () => {
    if (!orderId) return;
    setIsUpdating(true);
    try {
      await swagOpsService.startProcessing(orderId);
      await fetchOrder();
    } catch (error) {
      console.error("Error starting processing:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Complete kitting
  const completeKitting = async () => {
    if (!orderId) return;
    setIsUpdating(true);
    try {
      await swagOpsService.completeKitting(orderId);
      await fetchOrder();
    } catch (error) {
      console.error("Error completing kitting:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk update shipments
  const bulkUpdateShipments = async (data: {
    recipientIds: string[];
    status: string;
    trackingNumbers: Record<string, string>;
    carrier: string;
  }) => {
    if (!orderId) return;
    setIsUpdating(true);
    try {
      await swagOpsService.bulkUpdateShipments(orderId, data);
      await fetchOrder();
    } catch (error) {
      console.error("Error updating shipments:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Get tracking info
  const getTrackingInfo = async (recipientId: string) => {
    if (!orderId) return null;
    try {
      return await swagOpsService.getTrackingInfo(orderId, recipientId);
    } catch (error) {
      console.error("Error fetching tracking:", error);
      return null;
    }
  };

  // Navigate back
  const goBack = () => {
    navigate("/swag-ops/orders");
  };

  return {
    order,
    activityLog,
    carriers,
    isLoading,
    isUpdating,
    fetchOrder,
    startProcessing,
    completeKitting,
    bulkUpdateShipments,
    getTrackingInfo,
    goBack,
  };
}
