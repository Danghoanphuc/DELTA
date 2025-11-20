// src/features/chat/hooks/useFileUpload.ts
// Tách logic file upload thành custom hook theo nguyên tắc Single Responsibility

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

interface UseFileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const useFileUpload = ({ onFileUpload, isLoading }: UseFileUploadProps) => {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    // File size limit: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File quá lớn. Giới hạn 10MB.");
      return false;
    }

    // File type validation
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Loại file không được hỗ trợ. Chỉ chấp nhận ảnh, PDF và tài liệu Word.");
      return false;
    }

    return true;
  }, []);

  const processFile = useCallback((file: File) => {
    if (!validateFile(file)) return;

    if (isLoading) {
      toast.warning("Đang xử lý tin nhắn trước, vui lòng đợi...");
      return;
    }

    setFileToUpload(file);
    onFileUpload(file);
  }, [validateFile, isLoading, onFileUpload]);

  const clearFile = useCallback(() => {
    setFileToUpload(null);
  }, []);

  const dropzoneConfig = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    }, [processFile]),
    onDragEnter: useCallback(() => setIsDragActive(true), []),
    onDragLeave: useCallback(() => setIsDragActive(false), []),
    multiple: false,
    noClick: true, // Disable click to open file dialog
  });

  return {
    fileToUpload,
    isDragActive,
    clearFile,
    dropzoneConfig,
  };
};
