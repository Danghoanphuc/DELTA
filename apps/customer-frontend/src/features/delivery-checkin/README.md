# Delivery Check-in Feature

## Overview

This feature provides a mobile-optimized check-in interface for shippers to record delivery confirmations with GPS location, photos, and notes. Includes offline support with automatic sync when connection is restored.

## Requirements Implemented

### Check-in Creation (Task 14)

- **2.1**: GPS coordinates capture using device location API
- **2.2**: Multiple photo upload with file type validation (JPEG, PNG, WebP)
- **2.3**: Check-in record creation with timestamp, GPS, photos, and order reference
- **2.5**: Optional notes storage with check-in record
- **8.1**: Responsive UI optimized for touch input
- **8.2**: Native camera integration for photo capture
- **8.3**: EXIF GPS extraction from photos (automatic fallback)
- **8.4**: Offline queue for check-ins with auto-sync
- **8.5**: GPS loading indicator with accuracy status
- **8.6**: Pre-fill order information from assigned deliveries
- **14.1**: Network connection loss handling with local storage

### Check-in History (Task 16)

- **9.1**: Display list of all check-ins created by shipper
- **9.2**: Show thumbnail, timestamp, address, and order number for each check-in
- **9.3**: Support filtering by date range and order status
- **9.4**: Display full photos, GPS coordinates, and thread link in detail view
- **9.5**: Paginate results with 20 items per page

## Components

### CheckinForm

Main form component that orchestrates the entire check-in process.

```tsx
import { CheckinForm } from "@/features/delivery-checkin";

<CheckinForm
  onSuccess={(checkin) => console.log("Check-in created:", checkin)}
  onCancel={() => navigate(-1)}
/>;
```

### GPSIndicator

Displays GPS status and accuracy level with visual feedback.

```tsx
import { GPSIndicator } from "@/features/delivery-checkin";

<GPSIndicator
  status={gpsStatus}
  accuracyLevel="good"
  onRetry={() => capturePosition()}
/>;
```

### PhotoCapture

Handles camera integration and photo preview management.

```tsx
import { PhotoCapture } from "@/features/delivery-checkin";

<PhotoCapture
  photos={photos}
  canAddMore={true}
  remainingSlots={3}
  onOpenCamera={() => openCamera()}
  onOpenGallery={() => openGallery()}
  onRemovePhoto={(id) => removePhoto(id)}
  onFilesSelected={(files) => addPhotos(files)}
/>;
```

### OrderSelector

Displays assigned orders for shipper to select.

```tsx
import { OrderSelector } from "@/features/delivery-checkin";

<OrderSelector
  orders={orders}
  selectedOrder={selectedOrder}
  isLoading={false}
  onSelect={(order) => setSelectedOrder(order)}
  onRefresh={() => refetchOrders()}
/>;
```

## Hooks

### useCheckinForm

Main hook for form state management with offline support.

```tsx
const {
  selectedOrder,
  setSelectedOrder,
  notes,
  setNotes,
  gps,
  photos,
  isSubmitting,
  uploadProgress,
  submitCheckin,
  isValid,
  validationErrors,
  resetForm,
  // Offline support
  isOnline,
  offlineStatus,
  offlineCheckins,
  syncOfflineQueue,
  retryOfflineCheckin,
  removeOfflineCheckin,
  // EXIF GPS
  extractGPSFromPhotos,
} = useCheckinForm({ onSuccess, onError, onOfflineQueued });
```

### useOnlineStatus

Hook for detecting online/offline status.

```tsx
const { isOnline, wasOffline, lastOnlineAt, checkConnection } =
  useOnlineStatus();
```

### useOfflineQueue

Hook for managing offline check-in queue.

```tsx
const {
  status,
  checkins,
  queueCheckin,
  syncQueue,
  retryCheckin,
  removeCheckin,
  isSyncing,
  syncProgress,
} = useOfflineQueue();
```

### useGPSCapture

Hook for GPS position capture with accuracy tracking.

```tsx
const {
  position,
  status,
  capturePosition,
  clearPosition,
  isGoodAccuracy,
  accuracyLevel,
} = useGPSCapture({ autoCapture: true });
```

### usePhotoCapture

Hook for photo capture and management.

```tsx
const {
  photos,
  addPhoto,
  addPhotos,
  removePhoto,
  clearPhotos,
  canAddMore,
  remainingSlots,
  inputRef,
  openCamera,
  openGallery,
} = usePhotoCapture();
```

### useAssignedOrders

Hook for fetching shipper's assigned orders.

```tsx
const { orders, isLoading, error, refetch } = useAssignedOrders();
```

### useShipperCheckins

Hook for managing shipper check-in history with filtering and pagination.

```tsx
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
  fetchCheckins,
  viewCheckinDetail,
  closeCheckinDetail,
  deleteCheckin,
  refreshList,
} = useShipperCheckins();
```

### CheckinHistory

Main component for displaying shipper's check-in history with filtering and pagination.

```tsx
import { CheckinHistory } from "@/features/delivery-checkin";

<CheckinHistory onViewThread={(threadId) => navigate(`/thread/${threadId}`)} />;
```

### CheckinHistoryItem

Individual check-in item in the history list.

```tsx
import { CheckinHistoryItem } from "@/features/delivery-checkin";

<CheckinHistoryItem
  checkin={checkin}
  onView={(id) => viewDetail(id)}
  onDelete={(id) => deleteCheckin(id)}
  isDeleting={false}
/>;
```

### CheckinHistoryFilters

Filters component for date range and status filtering.

```tsx
import { CheckinHistoryFilters } from "@/features/delivery-checkin";

<CheckinHistoryFilters
  filters={filters}
  onFiltersChange={(newFilters) => setFilters(newFilters)}
  onClearFilters={() => clearFilters()}
/>;
```

### CheckinDetailModal

Modal for viewing full check-in details with photo gallery.

```tsx
import { CheckinDetailModal } from "@/features/delivery-checkin";

<CheckinDetailModal
  checkin={selectedCheckin}
  isOpen={!!selectedCheckin}
  isLoading={isLoadingDetail}
  isDeleting={isDeleting}
  onClose={() => closeModal()}
  onDelete={(id) => deleteCheckin(id)}
  onViewThread={(threadId) => navigate(`/thread/${threadId}`)}
/>;
```

## Pages

### ShipperCheckinPage

Full page component for shipper check-in flow.

```tsx
import { ShipperCheckinPage } from "@/features/delivery-checkin";

// In router
<Route path="/shipper/checkin" element={<ShipperCheckinPage />} />;
```

### ShipperCheckinHistoryPage

Full page component for shipper check-in history with filtering and pagination.

```tsx
import { ShipperCheckinHistoryPage } from "@/features/delivery-checkin";

// In router
<Route path="/shipper/checkins" element={<ShipperCheckinHistoryPage />} />;
```

## Constants

- `GPS_ACCURACY_THRESHOLD`: 50 meters (good accuracy)
- `GPS_ACCURACY_WARNING`: 100 meters (acceptable accuracy)
- `MAX_PHOTO_SIZE`: 2MB
- `MAX_PHOTOS`: 5
- `ACCEPTED_IMAGE_TYPES`: ['image/jpeg', 'image/png', 'image/webp']

## API Endpoints Used

- `POST /api/delivery-checkins` - Create check-in with photos
- `GET /api/delivery-checkins/assigned-orders` - Get shipper's assigned orders
- `GET /api/delivery-checkins/shipper` - Get shipper's check-in history
- `DELETE /api/delivery-checkins/:id` - Delete check-in

## File Structure

```
delivery-checkin/
├── components/
│   ├── CheckinDetailModal.tsx    # Modal for viewing check-in details
│   ├── CheckinForm.tsx
│   ├── CheckinHistory.tsx        # Main history component
│   ├── CheckinHistoryFilters.tsx # Date range and status filters
│   ├── CheckinHistoryItem.tsx    # Individual history item
│   ├── GPSIndicator.tsx
│   ├── OfflineCheckinList.tsx    # Displays queued offline check-ins
│   ├── OrderSelector.tsx
│   ├── PhotoCapture.tsx
│   ├── SyncStatusIndicator.tsx   # Shows sync status and progress
│   └── index.ts
├── hooks/
│   ├── useAssignedOrders.ts
│   ├── useCheckinForm.ts
│   ├── useGPSCapture.ts
│   ├── useOfflineQueue.ts        # Manages offline queue
│   ├── useOnlineStatus.ts        # Detects online/offline status
│   ├── usePhotoCapture.ts
│   ├── useShipperCheckins.ts     # Manages check-in history
│   └── index.ts
├── pages/
│   ├── ShipperCheckinHistoryPage.tsx  # History page
│   ├── ShipperCheckinPage.tsx
│   └── index.ts
├── services/
│   ├── delivery-checkin.service.ts
│   └── index.ts
├── utils/
│   ├── exif-gps.ts               # EXIF GPS extraction
│   ├── offline-storage.ts        # Local storage management
│   └── index.ts
├── types.ts
├── index.ts
└── README.md
```

## Offline Support

### How It Works

1. **Offline Detection**: The app monitors network status using browser events and periodic health checks.

2. **Queue Storage**: When offline, check-ins are stored in localStorage with photos converted to base64 data URLs.

3. **Auto-Sync**: When connection is restored, queued check-ins are automatically synced to the server.

4. **EXIF GPS Fallback**: If device GPS is unavailable, the system attempts to extract GPS coordinates from photo EXIF metadata.

### Offline Queue Limits

- Maximum 50 check-ins in queue
- Maximum 3 retry attempts per check-in
- Photos are compressed before storage

### User Experience

- Visual indicator shows online/offline status
- Progress bar during sync
- Toast notifications for sync success/failure
- Manual retry option for failed check-ins

## Customer Dashboard Map View (Task 17)

### Requirements Implemented

- **5.1**: Display map component showing all check-ins for customer's orders
- **5.2**: Render markers at GPS coordinates with shipper avatar or icon
- **5.3**: Display popup with check-in details (photos, timestamp, address, shipper name)
- **5.4**: Show delivery photos in a gallery format
- **5.5**: Center map on customer's location or most recent check-in
- **5.6**: Display timeline filter to show check-ins by date range
- **5.7**: Navigate to delivery thread from popup
- **12.2**: Implement marker clustering for zoom levels below 12
- **12.3**: Load markers within viewport bounds only

### Components

#### DeliveryMapView

Main map component with Goong.io integration for displaying delivery check-ins.

```tsx
import { DeliveryMapView } from "@/features/delivery-checkin";

<DeliveryMapView
  onViewThread={(threadId) => navigate(`/threads/${threadId}`)}
  className="h-[600px]"
/>;
```

#### CheckinPopup

Popup component for displaying check-in details when a marker is clicked.

```tsx
import { CheckinPopup } from "@/features/delivery-checkin";

<CheckinPopup
  checkin={selectedCheckin}
  isLoading={isLoadingDetail}
  onClose={() => clearSelection()}
  onViewThread={(threadId) => navigate(`/threads/${threadId}`)}
/>;
```

#### MapDateFilter

Date range filter component for filtering check-ins by timeline.

```tsx
import { MapDateFilter } from "@/features/delivery-checkin";

<MapDateFilter
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
  onClear={clearDateRange}
  onClose={() => setShowFilter(false)}
/>;
```

#### ClusterMarker

Cluster marker component for displaying grouped check-ins at low zoom levels.

```tsx
import { ClusterMarker } from "@/features/delivery-checkin";

<ClusterMarker count={15} onClick={() => zoomIn()} />;
```

### Hooks

#### useCustomerCheckins

Hook for managing customer check-in data for map view.

```tsx
const {
  checkins,
  selectedCheckin,
  isLoading,
  isLoadingDetail,
  error,
  dateRange,
  setDateRange,
  clearDateRange,
  fetchCheckins,
  fetchCheckinsInBounds,
  selectCheckin,
  clearSelectedCheckin,
  refreshCheckins,
} = useCustomerCheckins();
```

#### useMapClustering

Hook for marker clustering on the map.

```tsx
const { clusters, individualMarkers, shouldCluster } = useMapClustering({
  markers: checkins,
  zoom: viewport.zoom,
});
```

### Pages

#### CustomerDeliveryMapPage

Full page component for customer delivery map view.

```tsx
import { CustomerDeliveryMapPage } from "@/features/delivery-checkin";

// In router
<Route path="/deliveries/map" element={<CustomerDeliveryMapPage />} />;
```

### API Endpoints Used (Customer)

- `GET /api/delivery-checkins/customer` - Get customer's check-ins with optional date filter
- `GET /api/delivery-checkins/map/bounds` - Get check-ins within geographic bounds
- `GET /api/delivery-checkins/:id` - Get check-in detail for popup

### Map Configuration

The map uses Goong.io tiles with mapbox-gl. Configuration is in `src/lib/mapConfig.ts`:

```typescript
export const GOONG_CONFIG = {
  MAPTILES_KEY: import.meta.env.VITE_GOONG_MAPTILES_KEY,
  API_KEY: import.meta.env.VITE_GOONG_API_KEY,
  STYLE_URL: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${MAPTILES_KEY}`,
};
```

### Map Constants

- `DEFAULT_MAP_CENTER`: Ho Chi Minh City (106.6297, 10.8231)
- `DEFAULT_MAP_ZOOM`: 12
- `CLUSTER_ZOOM_THRESHOLD`: 12 (cluster markers below this zoom level)
- `CLUSTER_RADIUS`: 50 pixels

### Updated File Structure

```
delivery-checkin/
├── components/
│   ├── CheckinDetailModal.tsx
│   ├── CheckinForm.tsx
│   ├── CheckinHistory.tsx
│   ├── CheckinHistoryFilters.tsx
│   ├── CheckinHistoryItem.tsx
│   ├── CheckinPopup.tsx          # NEW: Map popup for check-in details
│   ├── ClusterMarker.tsx         # NEW: Cluster marker component
│   ├── DeliveryMapView.tsx       # NEW: Main map component
│   ├── GPSIndicator.tsx
│   ├── MapDateFilter.tsx         # NEW: Date range filter for map
│   ├── OfflineCheckinList.tsx
│   ├── OrderSelector.tsx
│   ├── PhotoCapture.tsx
│   ├── SyncStatusIndicator.tsx
│   └── index.ts
├── hooks/
│   ├── useAssignedOrders.ts
│   ├── useCheckinForm.ts
│   ├── useCustomerCheckins.ts    # NEW: Customer check-ins hook
│   ├── useGPSCapture.ts
│   ├── useMapClustering.ts       # NEW: Marker clustering hook
│   ├── useOfflineQueue.ts
│   ├── useOnlineStatus.ts
│   ├── usePhotoCapture.ts
│   ├── useShipperCheckins.ts
│   └── index.ts
├── pages/
│   ├── CustomerDeliveryMapPage.tsx  # NEW: Customer map page
│   ├── ShipperCheckinHistoryPage.tsx
│   ├── ShipperCheckinPage.tsx
│   └── index.ts
├── services/
│   ├── delivery-checkin.service.ts  # Updated with customer methods
│   └── index.ts
├── utils/
│   ├── exif-gps.ts
│   ├── offline-storage.ts
│   └── index.ts
├── types.ts                         # Updated with map types
├── index.ts
└── README.md
```
