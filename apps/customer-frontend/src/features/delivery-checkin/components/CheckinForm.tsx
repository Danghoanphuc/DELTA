// apps/customer-frontend/src/features/delivery-checkin/components/CheckinForm.tsx
/**
 * Shipper Mobile Check-in Form Component
 * Main form for creating delivery check-ins with GPS, photos, and notes
 * Includes offline support with auto-sync
 *
 * Requirements: 2.1, 2.2, 2.3, 2.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 14.1
 */

import { useState } from "react";
import {
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  WifiOff,
  QrCode,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Progress } from "@/shared/components/ui/progress";
import { useCheckinForm } from "../hooks/useCheckinForm";
import { useAssignedOrders } from "../hooks/useAssignedOrders";
import { GPSIndicator } from "./GPSIndicator";
import { PhotoCapture } from "./PhotoCapture";
import { OrderSelector } from "./OrderSelector";
import { SyncStatusIndicator } from "./SyncStatusIndicator";
import { OfflineCheckinList } from "./OfflineCheckinList";
import { QRScanner } from "./QRScanner";
import type { DeliveryCheckin } from "../types";

interface CheckinFormProps {
  onSuccess?: (checkin: DeliveryCheckin) => void;
  onCancel?: () => void;
}

export function CheckinForm({ onSuccess, onCancel }: CheckinFormProps) {
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Fetch assigned orders
  const {
    orders,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useAssignedOrders();

  // Form state management with offline support
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
  } = useCheckinForm({
    onSuccess: (checkin) => {
      resetForm();
      onSuccess?.(checkin);
    },
    onOfflineQueued: () => {
      resetForm();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setShowValidationErrors(true);
      return;
    }

    await submitCheckin();
  };

  const handleFilesSelected = (files: FileList) => {
    photos.addPhotos(files);
  };

  const handleQRScan = (orderNumber: string) => {
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (order) {
      setSelectedOrder(order);
    } else {
      // Order not in assigned list, show error
      alert(`Đơn hàng ${orderNumber} không có trong danh sách của bạn`);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Offline Status Indicator - Requirements: 8.4, 14.1 */}
        <SyncStatusIndicator
          status={offlineStatus}
          syncProgress={
            offlineStatus.isSyncing
              ? {
                  current: offlineStatus.syncingCount,
                  total:
                    offlineStatus.pendingCount + offlineStatus.syncingCount,
                }
              : undefined
          }
          onSync={syncOfflineQueue}
        />

        {/* Offline Check-in Queue */}
        {offlineCheckins.length > 0 && (
          <OfflineCheckinList
            checkins={offlineCheckins}
            onRetry={retryOfflineCheckin}
            onRemove={removeOfflineCheckin}
          />
        )}

        {/* Offline Mode Banner */}
        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">Chế độ offline</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Check-in sẽ được lưu và tự động đồng bộ khi có kết nối mạng.
            </p>
          </div>
        )}

        {/* Order Selection with QR Scanner */}
        <section className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Chọn đơn hàng</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQRScanner(true)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Quét QR
            </Button>
          </div>
          <OrderSelector
            orders={orders}
            selectedOrder={selectedOrder}
            isLoading={isLoadingOrders}
            error={ordersError}
            onSelect={setSelectedOrder}
            onRefresh={refetchOrders}
          />
        </section>

        {/* GPS Status */}
        <section className="bg-white rounded-xl p-4 shadow-sm border">
          <GPSIndicator
            status={gps.status}
            accuracyLevel={gps.accuracyLevel}
            onRetry={gps.capturePosition}
          />
        </section>

        {/* Photo Capture */}
        <section className="bg-white rounded-xl p-4 shadow-sm border">
          <PhotoCapture
            photos={photos.photos}
            canAddMore={photos.canAddMore}
            remainingSlots={photos.remainingSlots}
            validationError={photos.validationError}
            inputRef={photos.inputRef}
            onOpenCamera={photos.openCamera}
            onOpenGallery={photos.openGallery}
            onRemovePhoto={photos.removePhoto}
            onFilesSelected={handleFilesSelected}
          />
        </section>

        {/* Notes */}
        <section className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-medium text-gray-900 mb-3">Ghi chú (tùy chọn)</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Thêm ghi chú về việc giao hàng..."
            maxLength={500}
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-400 mt-2 text-right">
            {notes.length}/500 ký tự
          </p>
        </section>

        {/* Validation Errors */}
        {showValidationErrors && validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
              <AlertCircle className="w-5 h-5" />
              <span>Vui lòng hoàn thành các mục sau:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang tải lên...</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-blue-600 mt-2 text-center">
              {uploadProgress}% hoàn thành
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : !isOnline ? (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                Lưu offline
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Check-in giao hàng
              </>
            )}
          </Button>
        </div>

        {/* GPS Warning for poor accuracy */}
        {gps.status.hasPosition && gps.accuracyLevel === "poor" && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  Độ chính xác GPS thấp
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Bạn vẫn có thể check-in nhưng vị trí có thể không chính xác.
                  Để cải thiện, hãy di chuyển ra ngoài trời hoặc gần cửa sổ.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />
    </>
  );
}
