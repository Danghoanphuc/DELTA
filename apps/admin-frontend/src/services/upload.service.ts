// apps/admin-frontend/src/services/upload.service.ts
// Service for uploading files - Cloudinary for images, R2 for documents

import api from "@/lib/axios";

export interface UploadResponse {
  url: string;
  publicId?: string; // For Cloudinary images
  fileKey?: string; // For R2 documents
  filename: string;
}

class UploadService {
  /**
   * Upload image to Cloudinary
   * Backend will: resize 1200px, add watermark, convert WebP, rename
   * @param file - Image file
   * @param slug - Optional slug for filename (e.g., product slug)
   */
  async uploadImage(file: File, slug?: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    if (slug) {
      formData.append("slug", slug);
    }

    const response = await api.post("/admin/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data.url;
  }

  /**
   * Upload video to Cloudinary
   */
  async uploadVideo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/admin/upload/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data.url;
  }

  /**
   * Upload PDF document to R2 (2-step process)
   */
  async uploadDocument(file: File): Promise<UploadResponse> {
    // Step 1: Get presigned upload URL from backend
    const { data } = await api.post("/admin/upload/document-url", {
      fileName: file.name,
      fileType: file.type,
    });

    const { uploadUrl, fileKey } = data.data;

    // Step 2: Upload directly to R2 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to R2");
    }

    // Step 3: Return download URL (will be proxied through backend)
    return {
      url: `/api/admin/upload/document-download?key=${encodeURIComponent(
        fileKey
      )}&filename=${encodeURIComponent(file.name)}`,
      fileKey,
      filename: file.name,
    };
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    await api.delete(`/admin/upload/image/${encodeURIComponent(publicId)}`);
  }
}

export const uploadService = new UploadService();
