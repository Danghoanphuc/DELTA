// features/artworks/components/ArtworkUploadModal.tsx
// ✅ Artwork Upload Component with drag & drop

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Upload, X, FileImage, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ArtworkUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: {
    file: File;
    description?: string;
    tags?: string[];
  }) => Promise<void>;
}

// Validation constants
const ACCEPTED_FORMATS = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "image/svg+xml",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MIN_RESOLUTION = 300; // DPI

export function ArtworkUploadModal({
  open,
  onClose,
  onUpload,
}: ArtworkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate file
  const validateFile = useCallback((file: File): string[] => {
    const errors: string[] = [];

    // Check format
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      errors.push(`Format không hỗ trợ. Chỉ chấp nhận: PNG, JPEG, PDF, SVG`);
    }

    // Check size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(
        `File quá lớn. Kích thước tối đa: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    return errors;
  }, []);

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const selectedFile = acceptedFiles[0];
      const errors = validateFile(selectedFile);

      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      setFile(selectedFile);
      setValidationErrors([]);

      // Create preview for images
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    },
    [validateFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
      "image/svg+xml": [".svg"],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Add tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload({
        file,
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      // Reset form
      setFile(null);
      setPreview(null);
      setDescription("");
      setTags([]);
      setValidationErrors([]);
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset on close
  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setPreview(null);
      setDescription("");
      setTags([]);
      setValidationErrors([]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Artwork</DialogTitle>
          <DialogDescription>
            Upload file thiết kế của bạn. Hỗ trợ PNG, JPEG, PDF, SVG (tối đa
            50MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-lg font-medium">Thả file vào đây...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Kéo thả file vào đây hoặc click để chọn
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPEG, PDF, SVG • Tối đa 50MB
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                      <FileImage className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {validationErrors.length === 0 && (
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>File hợp lệ</span>
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setValidationErrors([]);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 mb-1">
                    File không hợp lệ
                  </p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả (tùy chọn)</Label>
            <Textarea
              id="description"
              placeholder="Mô tả về artwork này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (tùy chọn)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Nhập tag và nhấn Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Thêm
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || validationErrors.length > 0 || isUploading}
            >
              {isUploading ? "Đang upload..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
