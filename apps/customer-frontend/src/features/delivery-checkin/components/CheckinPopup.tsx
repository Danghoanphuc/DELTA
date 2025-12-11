// apps/customer-frontend/src/features/delivery-checkin/components/CheckinPopup.tsx
/**
 * Check-in Popup Component
 * Displays check-in details when a marker is clicked on the map
 *
 * Requirements: 5.3, 5.4, 5.7
 * - 5.3: Display popup with check-in details (photos, timestamp, address, shipper name)
 * - 5.4: Show delivery photos in a gallery format
 * - 5.7: Navigate to delivery thread when "View Thread" is clicked
 */

import { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  ImageOff,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { DeliveryCheckin } from "../types";
import { ShipperOrderThreadDialog } from "./ShipperOrderThreadDialog";

interface CheckinPopupProps {
  /** The check-in data to display */
  checkin: DeliveryCheckin;
  /** Whether the check-in details are loading */
  isLoading?: boolean;
  /** Callback when popup is closed */
  onClose: () => void;
  /** Callback when "View Thread" button is clicked */
  onViewThread?: (threadId: string) => void;
}

export function CheckinPopup({
  checkin,
  isLoading = false,
  onClose,
  onViewThread,
}: CheckinPopupProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isThreadDialogOpen, setIsThreadDialogOpen] = useState(false);

  const hasPhotos = checkin.photos && checkin.photos.length > 0;
  const currentPhoto = hasPhotos ? checkin.photos[currentPhotoIndex] : null;

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? checkin.photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === checkin.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handleViewThread = () => {
    setIsThreadDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-xl p-6 w-80 z-20">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main popup */}
      <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-xl w-80 z-20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 rounded-full p-1.5">
              <MapPin className="w-4 h-4 text-orange-600" />
            </div>
            <span className="font-medium text-sm text-gray-900">
              Đơn #{checkin.orderNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Photo gallery - Requirement 5.4 */}
        {hasPhotos ? (
          <div className="relative">
            <img
              src={currentPhoto?.url || currentPhoto?.thumbnailUrl}
              alt={`Ảnh giao hàng ${currentPhotoIndex + 1}`}
              className="w-full h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setIsLightboxOpen(true)}
            />

            {/* Photo navigation */}
            {checkin.photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Photo indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {checkin.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPhotoIndex ? "bg-white" : "bg-white/50"
                      }`}
                      aria-label={`Xem ảnh ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Photo count badge */}
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {currentPhotoIndex + 1}/{checkin.photos.length}
            </div>
          </div>
        ) : (
          /* No photos placeholder */
          <div className="w-full h-32 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
            <ImageOff className="w-8 h-8 mb-2" />
            <span className="text-sm">Không có ảnh</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Shipper info with avatar */}
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {checkin.shipperName}
              </p>
              <p className="text-xs text-gray-500">Nhân viên giao hàng</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {checkin.address.formatted}
            </span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              {format(new Date(checkin.checkinAt), "HH:mm - dd/MM/yyyy", {
                locale: vi,
              })}
            </span>
          </div>

          {/* Notes - only displayed if available */}
          {checkin.notes && checkin.notes.trim() !== "" && (
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 italic">
                "{checkin.notes}"
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 border-t bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewThread}
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Thảo luận
          </Button>
        </div>
      </div>

      {/* Lightbox for full-size photo */}
      {isLightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <img
            src={currentPhoto.url}
            alt={`Ảnh giao hàng ${currentPhotoIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Lightbox navigation */}
          {checkin.photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPhoto();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPhoto();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Photo counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentPhotoIndex + 1} / {checkin.photos.length}
          </div>
        </div>
      )}

      {/* Order Thread Dialog */}
      <ShipperOrderThreadDialog
        orderId={checkin.orderId}
        orderNumber={checkin.orderNumber}
        open={isThreadDialogOpen}
        onOpenChange={setIsThreadDialogOpen}
      />
    </>
  );
}
