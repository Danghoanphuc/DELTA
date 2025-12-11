// src/hooks/useShipping.ts
// ✅ useShipping Hook - State management cho shipping operations

import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import {
  shippingService,
  type CreateShipmentRequest,
  type BulkShipmentRequest,
  type TrackingInfo,
  type Carrier,
} from "@/services/admin.shipping.service";

export function useShipping() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);

  /**
   * Fetch available carriers
   */
  const fetchCarriers = useCallback(async () => {
    try {
      const data = await shippingService.getCarriers();
      setCarriers(data);
    } catch (error: any) {
      console.error("Error fetching carriers:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tải danh sách carriers",
        variant: "destructive",
      });
    }
  }, [toast]);

  /**
   * Create shipment for a recipient
   */
  const createShipment = async (data: CreateShipmentRequest) => {
    setIsLoading(true);
    try {
      const result = await shippingService.createShipment(data);
      toast({ title: "Thành công", description: "Đã tạo vận đơn thành công!" });
      return result;
    } catch (error: any) {
      console.error("Error creating shipment:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tạo vận đơn",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create bulk shipments
   */
  const createBulkShipments = async (data: BulkShipmentRequest) => {
    setIsLoading(true);
    try {
      const result = await shippingService.createBulkShipments(data);

      if (result.success > 0) {
        toast({
          title: "Thành công",
          description: `Đã tạo ${result.success} vận đơn${
            result.failed > 0 ? `, ${result.failed} lỗi` : ""
          }`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tạo vận đơn nào",
          variant: "destructive",
        });
      }

      return result;
    } catch (error: any) {
      console.error("Error creating bulk shipments:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tạo vận đơn hàng loạt",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get tracking info
   */
  const getTracking = async (orderId: string, recipientId: string) => {
    setIsLoading(true);
    try {
      const data = await shippingService.getTracking(orderId, recipientId);
      setTrackingInfo(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching tracking:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tải thông tin tracking",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancel shipment
   */
  const cancelShipment = async (
    orderId: string,
    recipientId: string,
    reason: string
  ) => {
    setIsLoading(true);
    try {
      await shippingService.cancelShipment(orderId, recipientId, reason);
      toast({ title: "Thành công", description: "Đã hủy vận đơn thành công!" });
    } catch (error: any) {
      console.error("Error cancelling shipment:", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể hủy vận đơn",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate shipping fee
   */
  const calculateFee = async (
    carrierId: string,
    toDistrict: string,
    weight: number,
    fromDistrict?: string
  ) => {
    try {
      const result = await shippingService.calculateFee(
        carrierId,
        toDistrict,
        weight,
        fromDistrict
      );
      return result;
    } catch (error: any) {
      console.error("Error calculating fee:", error);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tính phí vận chuyển",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    isLoading,
    carriers,
    trackingInfo,
    fetchCarriers,
    createShipment,
    createBulkShipments,
    getTracking,
    cancelShipment,
    calculateFee,
  };
}
