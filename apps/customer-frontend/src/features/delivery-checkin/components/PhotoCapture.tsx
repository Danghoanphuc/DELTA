// apps/customer-frontend/src/features/delivery-checkin/components/PhotoCapture.tsx
/**
 * Photo Capture Component
 * Handles camera integration and photo preview management
 */

import {
  Camera,
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { PhotoPreview } from "../types";
import { MAX_PHOTOS } from "../types";

interface PhotoCaptureProps {
  photos: PhotoPreview[];
  canAddMore: boolean;
  remainingSlots: number;
  validationError: string | null;
  inputRef: React.RefObject<HTMLInputElement>;
  onOpenCamera: () => void;
  onOpenGallery: () => void;
  onRemovePhoto: (id: string) => void;
  onFilesSelected: (files: FileList) => void;
}

export function PhotoCapture({
  photos,
  canAddMore,
  remainingSlots,
  validationError,
  inputRef,
  onOpenCamera,
  onOpenGallery,
  onRemovePhoto,
  onFilesSelected,
}: PhotoCaptureProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    }
  };

  const getStatusIcon = (status: PhotoPreview["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-4 h-4 text-white animate-spin" />;
      case "uploaded":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Ảnh giao hàng</h3>
          <p className="text-sm text-gray-500">
            {photos.length}/{MAX_PHOTOS} ảnh
            {remainingSlots > 0 && ` (còn ${remainingSlots} slot)`}
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Photos */}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
          >
            <img
              src={photo.previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />

            {/* Status Overlay */}
            {photo.status !== "pending" && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                {photo.status === "uploading" && (
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin mx-auto" />
                    <span className="text-xs text-white mt-1 block">
                      {photo.progress}%
                    </span>
                  </div>
                )}
                {photo.status === "uploaded" && (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                )}
                {photo.status === "failed" && (
                  <div className="text-center">
                    <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
                    <span className="text-xs text-red-300 mt-1 block">Lỗi</span>
                  </div>
                )}
              </div>
            )}

            {/* Remove Button */}
            {photo.status !== "uploading" && (
              <button
                type="button"
                onClick={() => onRemovePhoto(photo.id)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Status Badge */}
            <div className="absolute bottom-1 right-1">
              {getStatusIcon(photo.status)}
            </div>
          </div>
        ))}

        {/* Add Photo Buttons */}
        {canAddMore && (
          <>
            {/* Camera Button */}
            <button
              type="button"
              onClick={onOpenCamera}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500">Chụp ảnh</span>
            </button>

            {/* Gallery Button */}
            <button
              type="button"
              onClick={onOpenGallery}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2"
            >
              <ImagePlus className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500">Thư viện</span>
            </button>
          </>
        )}
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Help Text */}
      {photos.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          Chụp ảnh bằng chứng giao hàng (tối đa {MAX_PHOTOS} ảnh)
        </p>
      )}
    </div>
  );
}
