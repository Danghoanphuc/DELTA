// apps/customer-frontend/src/features/delivery-checkin/hooks/index.ts
/**
 * Export all delivery check-in hooks
 */

// Shipper hooks
export { useGPSCapture } from "./useGPSCapture";
export { usePhotoCapture } from "./usePhotoCapture";
export { useCheckinForm } from "./useCheckinForm";
export { useAssignedOrders } from "./useAssignedOrders";
export { useOnlineStatus } from "./useOnlineStatus";
export { useOfflineQueue } from "./useOfflineQueue";
export { useShipperCheckins } from "./useShipperCheckins";

// Customer map view hooks
export { useCustomerCheckins } from "./useCustomerCheckins";
export { useMapClustering } from "./useMapClustering";
