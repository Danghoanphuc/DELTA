import { useState, useCallback } from "react";
import { toast } from "sonner";
import { uploadFileDirectly } from "@/services/cloudinaryService";
import { getR2UploadUrl, uploadToR2 } from "@/features/chat/services/chat.api.service";

export type FileContextType = "PRINT_FILE" | "REFERENCE" | "INVOICE" | "OTHER";

export interface StagedFile {
  id: string;
  file?: File; // Có thể null nếu là Link
  linkMeta?: { url: string; title: string; type: 'canva' | 'drive' | 'general' }; // ✅ Metadata cho Link
  previewUrl: string; // Blob URL hoặc Link icon
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  context: FileContextType;
  serverUrl?: string;
  fileType: string; // 'image', 'file', 'link'
}

export const useSmartFileUpload = () => {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Detect Context cho File thật
  const detectContext = (file: File): FileContextType => {
    const name = file.name.toLowerCase();
    if (name.match(/\.(ai|psd|cdr|eps|pdf|tiff|zip|rar)$/)) return "PRINT_FILE";
    if (name.match(/\.(jpg|jpeg|png|heic|webp)$/)) {
        if (file.size > 5 * 1024 * 1024) return "PRINT_FILE"; 
        return "REFERENCE";
    }
    return "OTHER";
  };

  const getFileType = (file: File) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'file';
  };

  // 2a. Add FILES (Vật lý)
  const addFiles = useCallback((files: File[]) => {
    const newStagedFiles: StagedFile[] = files.map(file => {
      const blobUrl = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: blobUrl,
        progress: 0,
        status: "pending",
        context: detectContext(file),
        fileType: getFileType(file)
      };
    });
    setStagedFiles(prev => [...prev, ...newStagedFiles]);
  }, []);

  // 2b. ✅ Add LINKS (Canva/Drive) - Coi như một file đã upload xong
  const addLink = useCallback((url: string, type: 'canva' | 'drive' | 'general', title?: string) => {
    const newLink: StagedFile = {
        id: Math.random().toString(36).substring(7),
        linkMeta: { url, type, title: title || url },
        previewUrl: "", // Không dùng blob cho link
        progress: 100,
        status: "done", // Link coi như đã xong, không cần upload
        context: "REFERENCE", // Mặc định là tham khảo, user có thể đổi
        fileType: "link"
    };
    setStagedFiles(prev => [...prev, newLink]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const updateFileContext = useCallback((id: string, newContext: FileContextType) => {
    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, context: newContext } : f));
  }, []);

  // 3. Process Queue
  const uploadAllFiles = async (): Promise<any[]> => {
    setIsUploading(true);
    
    // Chỉ upload những file "pending" (Links đã là "done" rồi)
    const filesToUpload = stagedFiles.filter(f => f.status === "pending" || f.status === "error");
    // Những file đã done (bao gồm links) thì giữ nguyên để return
    const alreadyDoneFiles = stagedFiles.filter(f => f.status === "done");

    const uploadPromises = filesToUpload.map(async (stagedFile) => {
      if (!stagedFile.file) return null; // Should not happen for pending files

      setStagedFiles(prev => prev.map(f => f.id === stagedFile.id ? { ...f, status: "uploading" } : f));

      try {
        const isImage = stagedFile.file.type.startsWith("image/");
        let result: { url?: string; fileKey?: string };

        if (isImage) {
          const cloudinaryResult = await uploadFileDirectly(stagedFile.file, (percent) => {
            setStagedFiles(prev => prev.map(f => f.id === stagedFile.id ? { ...f, progress: percent } : f));
          });
          result = { url: cloudinaryResult.url };
        } else {
          const { fileKey } = await getR2UploadUrl(stagedFile.file.name, stagedFile.file.type);
          await uploadToR2(fileKey, stagedFile.file, (percent) => {
             setStagedFiles(prev => prev.map(f => f.id === stagedFile.id ? { ...f, progress: percent } : f));
          });
          result = { fileKey };
        }

        setStagedFiles(prev => prev.map(f => f.id === stagedFile.id ? { ...f, status: "done", serverUrl: result.url } : f));

        const proxyUrl = result.fileKey 
          ? `${import.meta.env.VITE_API_URL || ''}/api/chat/r2/download?key=${encodeURIComponent(result.fileKey)}&filename=${encodeURIComponent(stagedFile.file.name)}`
          : result.url;

        return {
            originalName: stagedFile.file.name,
            url: proxyUrl,
            fileKey: result.fileKey,
            storage: isImage ? "cloudinary" : "r2",
            type: stagedFile.fileType,
            format: stagedFile.file.name.split('.').pop()?.toLowerCase(),
            size: stagedFile.file.size,
            context: stagedFile.context
        };
      } catch (error) {
        setStagedFiles(prev => prev.map(f => f.id === stagedFile.id ? { ...f, status: "error" } : f));
        toast.error(`Lỗi upload: ${stagedFile.file.name}`);
        return null;
      }
    });

    const uploadedResults = await Promise.all(uploadPromises);
    
    // Map Links sang format attachment của backend
    const linkResults = alreadyDoneFiles.filter(f => f.fileType === 'link').map(f => ({
        originalName: f.linkMeta?.title || "Liên kết",
        url: f.linkMeta?.url,
        type: 'link', // Backend cần handle type này
        format: f.linkMeta?.type, // 'canva' | 'drive'
        context: f.context,
        storage: 'external'
    }));

    setIsUploading(false);
    return [...uploadedResults.filter(r => r !== null), ...linkResults];
  };

  const clearStaging = useCallback(() => {
    stagedFiles.forEach(f => { if(f.previewUrl) URL.revokeObjectURL(f.previewUrl) });
    setStagedFiles([]);
  }, [stagedFiles]);

  return {
    stagedFiles,
    addFiles,
    addLink, // ✅ Export function mới
    removeFile,
    updateFileContext,
    uploadAllFiles,
    clearStaging,
    isUploading
  };
};