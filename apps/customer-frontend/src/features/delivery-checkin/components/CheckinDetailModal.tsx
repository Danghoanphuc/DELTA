// apps/customer-frontend/src/features/delivery-checkin/components/CheckinDetailModal.tsx
/**
 * Modal component for viewing check-in details
 * Displays full photos, GPS coordinates, and thread link
 *
 * Requirements: 9.4 - display full photos, GPS coordinates, and thread link
 */

import { useState } from "react";
import {
  MapPin,
  Clock,
  Package,
  Navigation,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ShipperOrderThreadDialog } from "./ShipperOrderThreadDialog";
import type { DeliveryCheckin } from "../types";

interface CheckinDetailModalProps {
  checkin: DeliveryCheckin | null;
  isOpen: boolean;
  isLoading?: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onDelete: (checkinId: string) => void;
  onViewThread?: (threadId: string) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Đang xử lý",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  failed: {
    label: "Thất bại",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function CheckinDetailModal({
  checkin,
  isOpen,
  isLoading,
  isDeleting,
  onClose,
  onDelete,
}: CheckinDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isThreadDialogOpen, setIsThreadDialogOpen] = useState(false);

  if (!checkin && !isLoading) return null;

  const statusConfig = checkin
    ? STATUS_CONFIG[checkin.status] || STATUS_CONFIG.pending
    : STATUS_CONFIG.pending;

  // Format date and time
  const checkinDate = checkin ? new Date(checkin.checkinAt) : new Date();
  const formattedDate = checkinDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = checkinDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const handlePrevPhoto = () => {
    if (checkin && checkin.photos.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? checkin.photos.length - 1 : prev - 1
      );
    }
  };

  const handleNextPhoto = () => {
    if (checkin && checkin.photos.length > 0) {
      setCurrentPhotoIndex((prev) =>
        prev === checkin.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleDelete = () => {
    if (checkin && window.confirm("Bạn có chắc chắn muốn xóa check-in này?")) {
      onDelete(checkin._id);
    }
  };

  const handleViewThread = () => {
    setIsThreadDialogOpen(true);
  };

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          {/* Header with gradient */}
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    Chi tiết Check-in
                  </div>
                  {checkin && (
                    <div className="text-sm text-gray-600 font-normal">
                      #{checkin.orderNumber}
                    </div>
                  )}
                </div>
              </div>
              {checkin && (
                <Badge className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Đang tải chi tiết...</p>
              </div>
            </div>
          ) : checkin ? (
            <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
              {/* Photo Gallery - Requirements: 9.4 */}
              {checkin.photos.length > 0 ? (
                <div className="space-y-3">
                  {/* Main Photo */}
                  <div
                    className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                    onClick={() => openLightbox(currentPhotoIndex)}
                  >
                    <img
                      src={checkin.photos[currentPhotoIndex].url}
                      alt={`Check-in photo ${currentPhotoIndex + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Navigation arrows */}
                    {checkin.photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevPhoto();
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full transition-all shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextPhoto();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full transition-all shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Photo counter */}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full font-medium">
                      {currentPhotoIndex + 1} / {checkin.photos.length}
                    </div>

                    {/* Expand hint */}
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      Click để phóng to
                    </div>
                  </div>

                  {/* Thumbnail strip */}
                  {checkin.photos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {checkin.photos.map((photo, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentPhotoIndex
                              ? "border-orange-500 ring-2 ring-orange-200 scale-105"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={photo.thumbnailUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Không có ảnh</p>
                    <p className="text-sm mt-1">Chưa có ảnh giao hàng</p>
                  </div>
                </div>
              )}

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">
                        Địa chỉ giao hàng
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {checkin.address?.formatted || "Không có địa chỉ"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        Thời gian check-in
                      </p>
                      <p className="text-sm text-gray-700">{formattedTime}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* GPS Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        Tọa độ GPS
                      </p>
                      <p className="text-sm text-gray-700 font-mono">
                        {checkin.location.coordinates[1].toFixed(6)},{" "}
                        {checkin.location.coordinates[0].toFixed(6)}
                      </p>
                      {checkin.gpsMetadata?.accuracy && (
                        <p className="text-xs text-gray-600 mt-1">
                          Độ chính xác: ±
                          {checkin.gpsMetadata.accuracy.toFixed(0)}m
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        Mã đơn hàng
                      </p>
                      <p className="text-lg font-bold text-orange-600">
                        #{checkin.orderNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {checkin.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
                        Ghi chú
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed italic">
                        "{checkin.notes}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions - Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t pt-4 mt-6 -mx-6 px-6 pb-6">
                <div className="flex gap-3">
                  {/* View Thread - Requirements: 9.4 */}
                  <Button
                    variant="outline"
                    onClick={handleViewThread}
                    className="flex-1 h-12 text-base border-2 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Thảo luận
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 h-12 text-base"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5 mr-2" />
                    )}
                    Xóa Check-in
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Lightbox for full-screen photo view */}
      {isLightboxOpen && checkin && checkin.photos.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
          >
            <X className="w-8 h-8" />
          </button>

          <img
            src={checkin.photos[currentPhotoIndex].url}
            alt={`Full size photo ${currentPhotoIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {checkin.photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPhoto();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPhoto();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentPhotoIndex + 1} / {checkin.photos.length}
          </div>
        </div>
      )}

      {/* Order Thread Dialog */}
      {checkin && (
        <ShipperOrderThreadDialog
          orderId={checkin.orderId}
          orderNumber={checkin.orderNumber}
          open={isThreadDialogOpen}
          onOpenChange={setIsThreadDialogOpen}
        />
      )}
    </>
  );
}
