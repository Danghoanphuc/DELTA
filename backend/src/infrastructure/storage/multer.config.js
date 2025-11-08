// backend/src/infrastructure/storage/multer.config.js
// ✅ BẢN CẢI TIẾN: Hợp nhất, tinh gọn và sửa lỗi

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "./cloudinary.config.js";

// ==========================================================
// ĐỊNH NGHĨA CÁC "KHO LƯU TRỮ" (STORAGES)
// ==========================================================

/**
 * 1. Storage cho Upload Hỗn Hợp (Dùng cho API upload chung)
 * - Tự động phát hiện loại file (ảnh, 3d, svg)
 * - Dùng cho route: /api/uploads/file
 */
const mixedStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const ext = file.originalname.toLowerCase().split(".").pop();
    let folder = "products";
    let resource_type = "image"; // Mặc định cho ảnh

    // Phân loại cho file "raw"
    if (["glb", "gltf", "svg"].includes(ext)) {
      folder = ext === "svg" ? "dielines" : "3d-models";
      resource_type = "raw";
    }

    // Tạo public_id
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const final_public_id = `${resource_type}-${uniqueSuffix}`;

    return {
      folder: `printz/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "svg", "glb", "gltf"],
      resource_type: resource_type,
      public_id: final_public_id,
    };
  },
});

/**
 * 2. Storage cho Hình Ảnh (Dùng cho API chỉ nhận ảnh)
 * - Chỉ chấp nhận ảnh, tự động tối ưu hóa
 */
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "printz/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

/**
 * 3. Storage cho Model 3D (Dùng cho API chỉ nhận model)
 * - Chỉ chấp nhận GLB/GLTF, lưu dạng "raw"
 */
const modelStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "printz/3d-models",
    allowed_formats: ["glb", "gltf"],
    resource_type: "raw",
  },
});

/**
 * 4. Storage cho Dieline (Dùng cho API chỉ nhận SVG)
 * - Chỉ chấp nhận SVG, lưu dạng "raw"
 */
const dielineStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "printz/dielines",
    allowed_formats: ["svg"],
    resource_type: "raw",
  },
});

/**
 * 5. Storage cho Mẫu Thiết Kế (API đăng bán template)
 * - "previewFile" (ảnh) và "productionFile" (json)
 */
const designStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isPreview = file.fieldname === "previewFile";
    return {
      folder: isPreview ? "printz/design-previews" : "printz/design-production",
      // ✅ SỬA LỖI: File production là 'json', không phải 'svg'
      allowed_formats: isPreview ? ["jpg", "jpeg", "png"] : ["json"],
      resource_type: isPreview ? "image" : "raw",
    };
  },
});

// ==========================================================
// ✅ EXPORTS: Xuất các instance Multer đã cấu hình
// ==========================================================

/**
 * 1. Dùng cho API upload chung (ví dụ: /api/uploads/file)
 * (Frontend dùng trong cloudinaryService.ts)
 */
export const uploadMixed = multer({
  storage: mixedStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase().split(".").pop();
    const isAllowed = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "svg",
      "glb",
      "gltf",
    ].includes(ext);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("File không được hỗ trợ."), false);
    }
  },
});

/**
 * 2. Dùng cho API chỉ upload ảnh
 * (ví dụ: /api/products/:id/images)
 */
export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * 3. Dùng cho API chỉ upload model 3D (GLB)
 */
export const uploadModel = multer({
  storage: modelStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/**
 * 4. Dùng cho API chỉ upload dieline (SVG)
 */
export const uploadDieline = multer({
  storage: dielineStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * 5. Dùng cho API đăng bán template (Đa trường)
 * (Dùng cho /api/designs/templates)
 */
export const uploadDesignTemplate = multer({
  storage: designStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Đổi tên export 'upload' cũ thành 'uploadMixed'
// Nếu anh muốn giữ tên cũ 'upload' cho route chung, hãy đổi tên:
// export const upload = uploadMixed;
