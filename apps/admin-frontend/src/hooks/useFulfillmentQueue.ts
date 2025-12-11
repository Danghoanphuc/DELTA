// src/hooks/useFulfillmentQueue.ts
// ✅ SOLID: Single Responsibility - State management cho Fulfillment Queue

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  swagOpsService,
  SwagOrder,
} from "@/services/admin.swag-operations.service";

export interface FulfillmentQueue {
  readyToProcess: SwagOrder[];
  processing: SwagOrder[];
  kitting: SwagOrder[];
}

export function useFulfillmentQueue() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<FulfillmentQueue>({
    readyToProcess: [],
    processing: [],
    kitting: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [draggedOrder, setDraggedOrder] = useState<SwagOrder | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Fetch queue data
  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await swagOpsService.getFulfillmentQueue();
      setQueue(data);
    } catch (error) {
      console.error("Error fetching queue:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Start processing order
  const startProcessing = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      await swagOpsService.startProcessing(orderId);
      await fetchQueue();
    } catch (error) {
      console.error("Error starting processing:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Complete kitting
  const completeKitting = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      await swagOpsService.completeKitting(orderId);
      await fetchQueue();
    } catch (error) {
      console.error("Error completing kitting:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle drag & drop
  const handleDrop = async (targetColumn: string) => {
    if (!draggedOrder) return;

    const currentStatus = draggedOrder.status;

    // Determine valid transitions
    if (targetColumn === "processing" && currentStatus === "paid") {
      await startProcessing(draggedOrder._id);
    } else if (targetColumn === "kitting" && currentStatus === "processing") {
      await completeKitting(draggedOrder._id);
    } else if (targetColumn === "shipped" && currentStatus === "kitting") {
      navigate(`/swag-ops/orders/${draggedOrder._id}`);
    }

    setDraggedOrder(null);
    setDragOverColumn(null);
  };

  // Navigate to order detail
  const viewOrderDetail = (orderId: string) => {
    navigate(`/swag-ops/orders/${orderId}`);
  };

  // Computed values
  const totalInQueue =
    queue.readyToProcess.length +
    queue.processing.length +
    queue.kitting.length;

  return {
    // State
    queue,
    isLoading,
    isUpdating,
    draggedOrder,
    dragOverColumn,
    totalInQueue,

    // Actions
    fetchQueue,
    startProcessing,
    completeKitting,
    viewOrderDetail,

    // Drag & Drop
    setDraggedOrder,
    setDragOverColumn,
    handleDrop,
  };
}
