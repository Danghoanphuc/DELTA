// apps/customer-frontend/src/features/chat/hooks/useFileUpload.ts
import { useState, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import { useDropzone } from "react-dropzone";

interface UseFileUploadProps {
  isLoading: boolean; // Giữ lại prop này để hiển thị UI warning nếu cần, nhưng không chặn logic
}

export const useFileUpload = ({ isLoading }: UseFileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const validateFile = useCallback((file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    // Thêm check type nếu cần thiết (ví dụ chỉ ảnh/pdf)
    // const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      toast.error(`File ${file.name} quá lớn (Giới hạn 10MB).`);
      return false;
    }
    return true;
  }, []);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      // UX UPDATE: Không chặn hoàn toàn, chỉ cảnh báo nhẹ hoặc vẫn cho phép
      // Nếu muốn chặn người dùng spam khi AI đang trả lời, có thể disable nút gửi,
      // nhưng việc chọn file để chuẩn bị thì nên cho phép.

      const validFiles = newFiles.filter(validateFile);

      if (validFiles.length > 0) {
        setFiles((prev) => {
          const updated = [...prev, ...validFiles];
          // Giới hạn số lượng file trong hàng đợi
          if (updated.length > 5) {
            toast.warning(
              "Chỉ được gửi tối đa 5 file một lúc. Đã cắt bớt danh sách."
            );
            return updated.slice(0, 5);
          }
          return updated;
        });
      }
    },
    [validateFile]
  );

  const removeFile = useCallback((indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: addFiles,
    noClick: true, // Để người dùng tự handle click event vào button attachment
    noKeyboard: true,
    multiple: true,
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
    // Trả về helper để UI biết có nên disable nút send hay không
    isUploadingLocked: false,
  };
};
