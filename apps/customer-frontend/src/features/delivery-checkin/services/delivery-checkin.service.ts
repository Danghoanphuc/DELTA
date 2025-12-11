// apps/customer-frontend/src/features/delivery-checkin/services/delivery-checkin.service.ts
/**
 * Delivery Check-in Service - API communication layer
 * Handles all API calls for delivery check-in operations
 */

import api from "@/shared/lib/axios";
import type {
  DeliveryCheckin,
  CreateCheckinData,
  AssignedOrder,
  MapBounds,
  CheckinMarker,
} from "../types";

class DeliveryCheckinService {
  /**
   * Create a new delivery check-in with photos
   * @param data - Check-in data
   * @param photos - Array of photo files
   * @param onProgress - Progress callback for upload
   */
  async createCheckin(
    data: CreateCheckinData,
    photos: File[],
    onProgress?: (progress: number) => void
  ): Promise<DeliveryCheckin> {
    const formData = new FormData();

    // Append check-in data
    formData.append("orderId", data.orderId);
    formData.append("latitude", data.latitude.toString());
    formData.append("longitude", data.longitude.toString());
    formData.append("accuracy", data.accuracy.toString());
    formData.append("gpsTimestamp", data.gpsTimestamp.toString());
    formData.append("gpsSource", data.gpsSource);

    if (data.altitude !== undefined) {
      formData.append("altitude", data.altitude.toString());
    }
    if (data.heading !== undefined) {
      formData.append("heading", data.heading.toString());
    }
    if (data.speed !== undefined) {
      formData.append("speed", data.speed.toString());
    }
    if (data.notes) {
      formData.append("notes", data.notes);
    }

    // Append photos
    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    const response = await api.post("/delivery-checkins", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data?.data?.checkin;
  }

  /**
   * Get shipper's assigned orders for check-in
   */
  async getAssignedOrders(): Promise<AssignedOrder[]> {
    const response = await api.get("/delivery-checkins/assigned-orders");
    return response.data?.data?.orders || [];
  }

  /**
   * Get shipper's check-in history
   */
  async getShipperCheckins(options?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{
    checkins: DeliveryCheckin[];
    pagination: { page: number; limit: number; total: number };
  }> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);
    if (options?.status) params.append("status", options.status);

    const response = await api.get(`/delivery-checkins/shipper?${params}`);
    return (
      response.data?.data || {
        checkins: [],
        pagination: { page: 1, limit: 20, total: 0 },
      }
    );
  }

  /**
   * Get a single check-in by ID
   */
  async getCheckin(checkinId: string): Promise<DeliveryCheckin> {
    const response = await api.get(`/delivery-checkins/${checkinId}`);
    return response.data?.data?.checkin;
  }

  /**
   * Delete a check-in (soft delete)
   */
  async deleteCheckin(checkinId: string): Promise<void> {
    await api.delete(`/delivery-checkins/${checkinId}`);
  }

  /**
   * Retry failed photo upload for a check-in
   */
  async retryPhotoUpload(
    checkinId: string,
    photo: File,
    onProgress?: (progress: number) => void
  ): Promise<DeliveryCheckin> {
    const formData = new FormData();
    formData.append("photo", photo);

    const response = await api.post(
      `/delivery-checkins/${checkinId}/photos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );

    return response.data?.data?.checkin;
  }

  // ============================================
  // Customer Map View Methods
  // ============================================

  /**
   * Get customer's check-ins for map view
   * @param options - Query options including date range and bounds
   */
  async getCustomerCheckins(options?: {
    startDate?: string;
    endDate?: string;
    bounds?: MapBounds;
  }): Promise<CheckinMarker[]> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);
    if (options?.bounds) {
      params.append("minLng", options.bounds.minLng.toString());
      params.append("minLat", options.bounds.minLat.toString());
      params.append("maxLng", options.bounds.maxLng.toString());
      params.append("maxLat", options.bounds.maxLat.toString());
    }

    const response = await api.get(`/delivery-checkins/customer?${params}`);
    const checkins = response.data?.data?.checkins || [];

    // Transform to CheckinMarker format
    return checkins.map((checkin: DeliveryCheckin) => ({
      _id: checkin._id,
      longitude: checkin.location.coordinates[0],
      latitude: checkin.location.coordinates[1],
      orderNumber: checkin.orderNumber,
      shipperName: checkin.shipperName,
      thumbnailUrl: checkin.photos[0]?.thumbnailUrl,
      checkinAt: checkin.checkinAt,
      address: checkin.address.formatted,
    }));
  }

  /**
   * Get check-ins within geographic bounds (for viewport loading)
   * @param bounds - Geographic bounds
   */
  async getCheckinsInBounds(bounds: MapBounds): Promise<CheckinMarker[]> {
    const params = new URLSearchParams();
    params.append("minLng", bounds.minLng.toString());
    params.append("minLat", bounds.minLat.toString());
    params.append("maxLng", bounds.maxLng.toString());
    params.append("maxLat", bounds.maxLat.toString());

    const response = await api.get(`/delivery-checkins/map/bounds?${params}`);
    const checkins = response.data?.data?.checkins || [];

    return checkins.map((checkin: DeliveryCheckin) => ({
      _id: checkin._id,
      longitude: checkin.location.coordinates[0],
      latitude: checkin.location.coordinates[1],
      orderNumber: checkin.orderNumber,
      shipperName: checkin.shipperName,
      thumbnailUrl: checkin.photos[0]?.thumbnailUrl,
      checkinAt: checkin.checkinAt,
      address: checkin.address.formatted,
    }));
  }

  /**
   * Get full check-in details for popup display
   * @param checkinId - Check-in ID
   */
  async getCheckinDetail(checkinId: string): Promise<DeliveryCheckin> {
    const response = await api.get(`/delivery-checkins/${checkinId}`);
    return response.data?.data?.checkin;
  }
}

export const deliveryCheckinService = new DeliveryCheckinService();
