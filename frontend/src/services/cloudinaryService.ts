// src/services/cloudinaryService.ts
// ✅ Cập nhật để nhất quán với giải pháp mới

import api from "@/shared/lib/axios";

// ✅ SỬA LỖI: Chỉ dùng đường dẫn tương đối.
// axios sẽ tự động gọi: ${VITE_API_BASE_URL}/uploads/file
const UPLOAD_ENDPOINT = "/uploads/file";

/**
 * Tải file lên Cloudinary (qua Backend Proxy)
 * * @param file File (GLB/SVG/Image)
 * @returns Promise<string> URL sau khi upload
 */
export const uploadFileToCloudinary = async (file: File): Promise<string> => {
  if (!file) throw new Error("File rỗng.");

  const formData = new FormData();

  // 1. Đính kèm file (key 'file' phải khớp với backend multer)
  formData.append("file", file);

  // 2. Thêm thông tin loại tài nguyên cho backend (để backend đặt đúng folder)
  const resourceType =
    file.name.endsWith(".glb") || file.name.endsWith(".gltf")
      ? "3d-models"
      : "products";
  formData.append("resource_type", resourceType);

  // 3. Log để theo dõi
  console.log(
    `[CloudinaryService] Đang tải file thật: ${file.name} lên ${resourceType}`
  );

  try {
    // 4. Gọi API POST với FormData
    const res = await api.post(UPLOAD_ENDPOINT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // Tăng timeout cho file GLB lớn
      timeout: 30000,
    });

    // 5. Giả định backend trả về { url: 'https://new-unique-url' }
    const url = res.data?.url || res.data?.data?.url;

    if (!url) {
      throw new Error("Không nhận được URL từ server sau khi upload");
    }

    console.log(`✅ [CloudinaryService] Tải lên thành công: ${url}`);
    return url;
  } catch (error) {
    console.error("❌ [CloudinaryService] Lỗi upload thật:", error);
    // Ném lỗi với thông báo chung
    throw new Error("Tải file lên Cloud thất bại. Vui lòng kiểm tra kết nối.");
  }
};
