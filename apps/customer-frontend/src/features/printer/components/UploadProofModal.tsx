// src/features/printer/components/UploadProofModal.tsx
// Modal để upload proof file

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, X, Loader2, FileImage, FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { printerOrderService } from "@/services/printerOrder.service";

interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  currentVersion: number;
}

export function UploadProofModal({
  isOpen,
  onClose,
  orderId,
  currentVersion,
}: UploadProofModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // 1. Upload file to Cloudinary
      const proofUrl = await printerOrderService.uploadProofFile(file);

      // 2. Call backend API to save proof
      return printerOrderService.uploadProof(orderId, {
        proofUrl,
        fileName: file.name,
        fileType: file.type,
      });
    },
    onSuccess: () => {
      toast.success("Proof đã được tải lên! Chờ khách hàng duyệt.");
      queryClient.invalidateQueries({ queryKey: ["printer-order", orderId] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Tải proof lên thất bại");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP) hoặc PDF");
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 10MB");
      return;
    }

    setFile(selectedFile);

    // Show preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải lên Proof</DialogTitle>
          <DialogDescription>
            Version {currentVersion + 1} - File ảnh hoặc PDF (tối đa 10MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Zone */}
          {!file ? (
            <label
              htmlFor="proof-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click để chọn file</span>
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP hoặc PDF (tối đa 10MB)
                </p>
              </div>
              <input
                id="proof-upload"
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                disabled={uploadMutation.isPending}
              />
            </label>
          ) : (
            <div className="space-y-3">
              {/* Preview */}
              <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FileText className="w-16 h-16 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {/* Remove button */}
                {!uploadMutation.isPending && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}

                {/* Loading overlay */}
                {uploadMutation.isPending && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                    <p className="text-white text-sm">Đang tải lên...</p>
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {file.type.startsWith("image/") ? (
                  <FileImage className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span className="truncate">{file.name}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isPending}
              className="flex-1"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Tải lên
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

