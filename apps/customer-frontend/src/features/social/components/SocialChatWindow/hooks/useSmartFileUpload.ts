import { useState, useCallback } from "react";
import { toast } from "sonner";
import { uploadFileDirectly } from "@/services/cloudinaryService";

export type FileContextType = "PRINT_FILE" | "REFERENCE" | "INVOICE" | "OTHER";

export interface StagedFile {
  id: string;
  file: File;
  previewUrl: string; // Blob URL để preview ngay lập tức
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  context: FileContextType; // ✅ Context-Aware: Tag ngữ cảnh
  serverUrl?: string; // URL thật sau khi upload xong
  fileType: string; // 'image', 'pdf', 'ai', 'zip'...
}

export const useSmartFileUpload = () => {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Smart Detection: Tự đoán ngữ cảnh dựa trên đuôi file
  const detectContext = (file: File): FileContextType => {
    const name = file.name.toLowerCase();
    if (name.match(/\.(ai|psd|cdr|eps|pdf|tiff|zip|rar)$/)) return "PRINT_FILE";
    if (name.match(/\.(jpg|jpeg|png|heic|webp)$/)) {
        // Ảnh > 5MB thường là ảnh in hoặc ảnh gốc máy ảnh
        if (file.size > 5 * 1024 * 1024) return "PRINT_FILE"; 
        return "REFERENCE";
    }
    return "OTHER";
  };

  const getFileType = (file: File) => {
    // 1. Nếu là ảnh -> trả về 'image'
    if (file.type.startsWith('image/')) return 'image';
    
    // 2. Nếu là video -> trả về 'video'
    if (file.type.startsWith('video/')) return 'video';
    
    // 3. Còn lại (PDF, AI, ZIP, RAR...) -> trả về 'file' hết
    return 'file';
  };

  // 2. Add files to Staging Area
  const addFiles = useCallback((files: File[]) => {
    const newStagedFiles: StagedFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      status: "pending",
      context: detectContext(file),
      fileType: getFileType(file)
    }));

    setStagedFiles(prev => [...prev, ...newStagedFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const updateFileContext = useCallback((id: string, newContext: FileContextType) => {
    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, context: newContext } : f));
  }, []);

  // 3. Process Upload Queue (Parallel)
  const uploadAllFiles = async (): Promise<any[]> => {
    setIsUploading(true);
    
    // Lọc ra các file chưa upload (pending)
    const filesToUpload = stagedFiles.filter(f => f.status === "pending" || f.status === "error");
    
    const uploadPromises = filesToUpload.map(async (stagedFile) => {
      // Update status -> uploading
      setStagedFiles(prev => prev.map(f => f.id === stagedFile.id ? { ...f, status: "uploading" } : f));

      try {
        // Call Direct Upload Service
        const result = await uploadFileDirectly(stagedFile.file, (percent) => {
           setStagedFiles(prev => prev.map(f => f.id === stagedFile.id ? { ...f, progress: percent } : f));
        });

        // Update status -> done
        setStagedFiles(prev => prev.map(f => f.id === stagedFile.id ? { 
            ...f, 
            status: "done", 
            serverUrl: result.url 
        } : f));

        return {
            originalName: stagedFile.file.name,
            url: result.url,
            type: stagedFile.fileType, // Lúc này sẽ là 'file' hoặc 'image' (Backend chịu nhận)
            format: stagedFile.file.name.split('.').pop()?.toLowerCase(), // ✅ Gửi thêm cái này để Frontend biết là PDF hay AI mà hiện icon
            size: stagedFile.file.size,
            context: stagedFile.context // Quan trọng: Gửi kèm tag ngữ cảnh cho Backend lưu
        };

      } catch (error) {
        setStagedFiles(prev => prev.map(f => f.id === stagedFile.id ? { ...f, status: "error" } : f));
        toast.error(`Lỗi upload: ${stagedFile.file.name}`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    setIsUploading(false);
    return results.filter(r => r !== null);
  };

  const clearStaging = useCallback(() => {
    stagedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl)); // Clean memory
    setStagedFiles([]);
  }, [stagedFiles]);

  return {
    stagedFiles,
    addFiles,
    removeFile,
    updateFileContext,
    uploadAllFiles,
    clearStaging,
    isUploading
  };
};