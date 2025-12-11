// apps/customer-frontend/src/features/delivery-checkin/types.ts
/**
 * TypeScript types for Delivery Check-in feature
 */

export interface DeliveryCheckin {
  _id: string;
  orderId: string;
  orderNumber: string;
  shipperId: string;
  shipperName: string;
  customerId: string;
  customerEmail: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: {
    formatted: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
    country: string;
  };
  gpsMetadata: {
    accuracy: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    timestamp: string;
    source: "device" | "browser" | "manual";
  };
  photos: CheckinPhoto[];
  notes: string;
  threadId?: string;
  status: "pending" | "completed" | "failed";
  checkinAt: string;
  emailSent: boolean;
  emailSentAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckinPhoto {
  url: string;
  thumbnailUrl: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  uploadedAt: string;
}

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GPSStatus {
  isCapturing: boolean;
  hasPosition: boolean;
  accuracy: number | null;
  error: string | null;
}

export interface PhotoPreview {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "uploaded" | "failed";
  progress: number;
  error?: string;
}

export interface CreateCheckinData {
  orderId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  gpsTimestamp: number;
  gpsSource: "device" | "browser" | "manual";
  notes?: string;
}

export interface AssignedOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  // For Today's Route page
  recipientName?: string;
  recipientPhone?: string;
  address?: string;
  isCheckedIn?: boolean;
  checkinId?: string;
  distance?: number; // Distance in meters from current location
  latitude?: number;
  longitude?: number;
}

export const GPS_ACCURACY_THRESHOLD = 50; // meters - good accuracy
export const GPS_ACCURACY_WARNING = 100; // meters - acceptable but warn
export const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_PHOTOS = 5;

// Offline support types
export interface OfflineCheckin {
  id: string;
  data: CreateCheckinData;
  photos: OfflinePhoto[];
  createdAt: number;
  status: "pending" | "syncing" | "failed";
  retryCount: number;
  lastError?: string;
  orderNumber?: string;
}

export interface OfflinePhoto {
  id: string;
  dataUrl: string; // Base64 encoded photo
  filename: string;
  mimeType: string;
  size: number;
}

export interface OfflineQueueStatus {
  isOnline: boolean;
  pendingCount: number;
  syncingCount: number;
  failedCount: number;
  isSyncing: boolean;
  lastSyncAt: number | null;
}

export interface EXIFGPSData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  timestamp: number | null;
}

export const OFFLINE_STORAGE_KEY = "delivery_checkin_offline_queue";
export const MAX_OFFLINE_CHECKINS = 50;
export const MAX_RETRY_COUNT = 3;

// Customer Map View types
export interface MapBounds {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface MapViewport {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface CheckinMarker {
  _id: string;
  longitude: number;
  latitude: number;
  orderNumber: string;
  shipperName: string;
  thumbnailUrl?: string;
  checkinAt: string;
  address: string;
}

export interface ClusteredMarker {
  id: string;
  longitude: number;
  latitude: number;
  count: number;
  checkins: CheckinMarker[];
}

export interface DateRangeFilter {
  startDate: string | null;
  endDate: string | null;
}

export const DEFAULT_MAP_CENTER = {
  longitude: 106.6297, // Ho Chi Minh City
  latitude: 10.8231,
};

export const DEFAULT_MAP_ZOOM = 12;
export const CLUSTER_ZOOM_THRESHOLD = 12;
export const CLUSTER_RADIUS = 50; // pixels
