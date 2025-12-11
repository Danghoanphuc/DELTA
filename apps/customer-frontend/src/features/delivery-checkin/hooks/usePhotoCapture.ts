// apps/customer-frontend/src/features/delivery-checkin/hooks/usePhotoCapture.ts
/**
 * Custom hook for photo capture and management
 * Handles camera integration, photo preview, and validation
 */

import { useState, useCallback, useRef } from "react";
import type { PhotoPreview } from "../types";
import { ACCEPTED_IMAGE_TYPES, MAX_PHOTO_SIZE, MAX_PHOTOS } from "../types";

interface UsePhotoCaptureReturn {
  photos: PhotoPreview[];
  addPhoto: (file: File) => string | null;
  addPhotos: (files: FileList | File[]) => string[];
  removePhoto: (id: string) => void;
  clearPhotos: () => void;
  updatePhotoStatus: (
    id: string,
    status: PhotoPreview["status"],
    error?: string
  ) => void;
  updatePhotoProgress: (id: string, progress: number) => void;
  canAddMore: boolean;
  remainingSlots: number;
  inputRef: React.RefObject<HTMLInputElement>;
  openCamera: () => void;
  openGallery: () => void;
  validationError: string | null;
}

function generateId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `Định dạng file không hỗ trợ. Chỉ chấp nhận: JPEG, PNG, WebP`;
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return `File quá lớn. Kích thước tối đa: ${
      MAX_PHOTO_SIZE / (1024 * 1024)
    }MB`;
  }
  return null;
}

export function usePhotoCapture(): UsePhotoCaptureReturn {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null!);

  const addPhoto = useCallback(
    (file: File): string | null => {
      // Check if we can add more photos
      if (photos.length >= MAX_PHOTOS) {
        setValidationError(`Tối đa ${MAX_PHOTOS} ảnh cho mỗi check-in`);
        return null;
      }

      // Validate file
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return null;
      }

      setValidationError(null);

      const id = generateId();
      const previewUrl = URL.createObjectURL(file);

      const newPhoto: PhotoPreview = {
        id,
        file,
        previewUrl,
        status: "pending",
        progress: 0,
      };

      setPhotos((prev) => [...prev, newPhoto]);
      return id;
    },
    [photos.length]
  );

  const addPhotos = useCallback(
    (files: FileList | File[]): string[] => {
      const fileArray = Array.from(files);
      const addedIds: string[] = [];
      const errors: string[] = [];

      // Check how many we can add
      const availableSlots = MAX_PHOTOS - photos.length;
      if (availableSlots <= 0) {
        setValidationError(`Tối đa ${MAX_PHOTOS} ảnh cho mỗi check-in`);
        return [];
      }

      const filesToAdd = fileArray.slice(0, availableSlots);
      if (fileArray.length > availableSlots) {
        errors.push(`Chỉ có thể thêm ${availableSlots} ảnh nữa`);
      }

      const newPhotos: PhotoPreview[] = [];

      filesToAdd.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
          return;
        }

        const id = generateId();
        const previewUrl = URL.createObjectURL(file);

        newPhotos.push({
          id,
          file,
          previewUrl,
          status: "pending",
          progress: 0,
        });
        addedIds.push(id);
      });

      if (newPhotos.length > 0) {
        setPhotos((prev) => [...prev, ...newPhotos]);
      }

      if (errors.length > 0) {
        setValidationError(errors[0]); // Show first error
      } else {
        setValidationError(null);
      }

      return addedIds;
    },
    [photos.length]
  );

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
    setValidationError(null);
  }, []);

  const clearPhotos = useCallback(() => {
    photos.forEach((photo) => {
      URL.revokeObjectURL(photo.previewUrl);
    });
    setPhotos([]);
    setValidationError(null);
  }, [photos]);

  const updatePhotoStatus = useCallback(
    (id: string, status: PhotoPreview["status"], error?: string) => {
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === id ? { ...photo, status, error } : photo
        )
      );
    },
    []
  );

  const updatePhotoProgress = useCallback((id: string, progress: number) => {
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, progress } : photo))
    );
  }, []);

  const openCamera = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.accept = ACCEPTED_IMAGE_TYPES.join(",");
      inputRef.current.capture = "environment"; // Use back camera
      inputRef.current.click();
    }
  }, []);

  const openGallery = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.accept = ACCEPTED_IMAGE_TYPES.join(",");
      inputRef.current.removeAttribute("capture");
      inputRef.current.click();
    }
  }, []);

  const canAddMore = photos.length < MAX_PHOTOS;
  const remainingSlots = MAX_PHOTOS - photos.length;

  return {
    photos,
    addPhoto,
    addPhotos,
    removePhoto,
    clearPhotos,
    updatePhotoStatus,
    updatePhotoProgress,
    canAddMore,
    remainingSlots,
    inputRef,
    openCamera,
    openGallery,
    validationError,
  };
}
