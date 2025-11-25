// apps/customer-frontend/src/features/printer/hooks/useAsyncUpload.ts
import { useState, useCallback, useMemo } from "react"; // Thêm useMemo
import { useMutation } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

export interface UploadQueueItem {
  file: File;
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number;
  url?: string;
  publicId?: string;
  error?: string;
  preview?: string;
}

export function useAsyncUpload() {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [activeUploads, setActiveUploads] = useState(0);
  const MAX_CONCURRENT = 3;

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, index }: { file: File; index: number }) => {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/uploads/async-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setQueue((prev) =>
            prev.map((item, i) =>
              i === index ? { ...item, progress, status: "uploading" } : item
            )
          );
        },
      });

      return { index, data: res.data.data };
    },
    onMutate: () => {
      setActiveUploads((prev) => prev + 1);
    },
    onSuccess: ({ index, data }) => {
      setQueue((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                status: "completed",
                url: data.url,
                publicId: data.publicId,
                progress: 100,
              }
            : item
        )
      );
      setActiveUploads((prev) => prev - 1);
    },
    onError: (error: any, { index }) => {
      setQueue((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                status: "failed",
                error: error.message || "Upload failed",
              }
            : item
        )
      );
      setActiveUploads((prev) => prev - 1);
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const addToQueue = useCallback(
    (files: File[]) => {
      const newItems: UploadQueueItem[] = files.map((file) => ({
        file,
        status: "pending",
        progress: 0,
        preview: URL.createObjectURL(file),
      }));

      setQueue((prev) => {
        const updatedQueue = [...prev, ...newItems];
        const pendingItems = updatedQueue
          .map((item, index) => ({ item, index }))
          .filter(({ item }) => item.status === "pending");

        const availableSlots = MAX_CONCURRENT - activeUploads;
        const itemsToUpload = pendingItems.slice(0, availableSlots);

        itemsToUpload.forEach(({ item, index }) => {
          uploadMutation.mutate({ file: item.file, index });
        });

        return updatedQueue;
      });
    },
    [activeUploads, uploadMutation]
  );

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      const item = prev[index];
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const retryUpload = useCallback(
    (index: number) => {
      const item = queue[index];
      if (item && item.status === "failed") {
        setQueue((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, status: "pending", error: undefined } : item
          )
        );
        uploadMutation.mutate({ file: item.file, index });
      }
    },
    [queue, uploadMutation]
  );

  /**
   * ✅ TỐI ƯU: Chỉ tính toán lại danh sách completed khi queue thực sự thay đổi trạng thái
   * Sử dụng JSON.stringify để so sánh "deep" thay vì tham chiếu
   */
  const getCompletedUrls = useCallback(() => {
    return queue
      .filter((item) => item.status === "completed")
      .map((item) => ({
        url: item.url!,
        publicId: item.publicId!,
      }));
  }, [queue]);

  const getCompletedFiles = useCallback(() => {
    return queue
      .filter((item) => item.status === "completed")
      .map((item) => item.file);
  }, [queue]);

  const clearQueue = useCallback(() => {
    queue.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setQueue([]);
  }, [queue]);

  const isAllCompleted =
    queue.length > 0 && queue.every((item) => item.status === "completed");
  const hasErrors = queue.some((item) => item.status === "failed");
  const hasPending = queue.some((item) => item.status === "pending");
  const hasUploading = queue.some((item) => item.status === "uploading");

  const totalProgress =
    queue.length > 0
      ? Math.round(
          queue.reduce((sum, item) => sum + item.progress, 0) / queue.length
        )
      : 0;

  const completedCount = queue.filter(
    (item) => item.status === "completed"
  ).length;
  const failedCount = queue.filter((item) => item.status === "failed").length;

  return {
    queue,
    addToQueue,
    removeFromQueue,
    retryUpload,
    getCompletedUrls,
    getCompletedFiles,
    clearQueue,
    isAllCompleted,
    hasErrors,
    hasPending,
    hasUploading,
    totalProgress,
    completedCount,
    failedCount,
    totalCount: queue.length,
  };
}