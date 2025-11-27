import { useState, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import { useDropzone } from "react-dropzone";

interface UseFileUploadProps {
  isLoading: boolean;
}

export const useFileUpload = ({ isLoading }: UseFileUploadProps) => {
  // ✅ Thay đổi state thành mảng File[]
  const [files, setFiles] = useState<File[]>([]);

  const validateFile = useCallback((file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`File ${file.name} quá lớn (Giới hạn 10MB).`);
      return false;
    }
    return true;
  }, []);

  // ✅ Hàm thêm file (Append vào danh sách cũ)
  const addFiles = useCallback((newFiles: File[]) => {
    if (isLoading) {
      toast.warning("Đang xử lý tin nhắn trước, vui lòng đợi...");
      return;
    }

    const validFiles = newFiles.filter(validateFile);
    
    if (validFiles.length > 0) {
      setFiles((prev) => {
        // Lọc trùng lặp (nếu cần) hoặc giới hạn số lượng
        const updated = [...prev, ...validFiles];
        if (updated.length > 5) {
            toast.warning("Chỉ được gửi tối đa 5 file một lúc.");
            return prev;
        }
        return updated;
      });
    }
  }, [validateFile, isLoading]);

  // ✅ Hàm xóa file khỏi hàng đợi
  const removeFile = useCallback((indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: addFiles, // Gọi hàm addFiles khi thả
    noClick: true,
    noKeyboard: true,
    multiple: true, // ✅ Cho phép chọn nhiều file
  });

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    isDragActive,
    dropzoneConfig: {
      getRootProps,
      getInputProps,
      open,
    },
  };
};