// apps/customer-frontend/src/services/cloudinaryService.ts
import api from "@/shared/lib/axios";
import axios from "axios";

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
  folder: string;
}

/**
 * 🚀 DIRECT UPLOAD: Tải file thẳng lên Cloudinary dùng Signed URL
 * Giúp giảm tải cho server Printz khi user up file thiết kế nặng (AI, PSD, PDF)
 */
export const uploadFileDirectly = async (
  file: File, 
  onProgress?: (percent: number) => void
): Promise<{ url: string; publicId: string; format: string; resourceType: string }> => {
  
  // 1. Phân loại tài nguyên để xin chữ ký vào đúng folder
  // - File thiết kế (.ai, .psd, .cdr, .pdf, .zip) -> resource_type: 'raw' (hoặc 'auto')
  // - Ảnh (.png, .jpg) -> resource_type: 'image'
  // - 3D (.glb) -> resource_type: 'image' (Cloudinary coi 3D là image đặc biệt) hoặc 'raw'
  const isRaw = file.name.match(/\.(ai|psd|cdr|zip|rar|eps|pdf)$/i);
  const resourceType = isRaw ? "raw" : "auto"; 
  const folderContext = isRaw ? "printz/design-files" : "printz/chat-media";

  try {
    // 2. Xin chữ ký từ Backend Printz (Secure)
    const sigRes = await api.post("/uploads/signature", {
      folder: folderContext
    });
    
    const { signature, timestamp, cloudName, apiKey, uploadPreset, folder } = sigRes.data.data as CloudinarySignature;

    // 3. Chuẩn bị Form Data gửi sang Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    // 4. Bắn thẳng sang Cloudinary (Bỏ qua Server mình)
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    
    const uploadRes = await axios.post(cloudinaryUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    console.log("✅ [Direct Upload] Success:", uploadRes.data.secure_url);

    return {
      url: uploadRes.data.secure_url,
      publicId: uploadRes.data.public_id,
      format: uploadRes.data.format,
      resourceType: uploadRes.data.resource_type
    };

  } catch (error) {
    console.error("❌ [Direct Upload] Failed:", error);
    throw new Error("Không thể tải file lên. Vui lòng kiểm tra kết nối.");
  }
};