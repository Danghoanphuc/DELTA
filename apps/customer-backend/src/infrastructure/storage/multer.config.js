// src/infrastructure/storage/multer.config.js
// BÀN GIAO: Đã gộp cloudinary.config.js VÀ LOẠI BỎ Logger
// để giải quyết dứt điểm lỗi circular dependency

import multer from "multer";
import { v2 as cloudinary } from "cloudinary"; // Import v2
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { config } from "../../config/env.config.js";
// ❌ Đã loại bỏ import Logger

// === BƯỚC 1: CẤU HÌNH CLOUDINARY ===
// (Sử dụng config đã được validate)
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
  timeout: 180000, // ✅ Tăng timeout lên 3 phút cho Cloudinary upload
});

console.log("✅ Cloudinary configured successfully."); // Dùng console.log

// === BƯỚC 2: ĐỊNH NGHĨA STORAGES (DÙNG 'cloudinary' ĐÃ CẤU HÌNH Ở TRÊN) ===

/**
 * 1. Storage cho Upload Hỗn Hợp (Dùng cho API upload chung)
 */
const mixedStorage = new CloudinaryStorage({
  cloudinary: cloudinary, // Giờ 'cloudinary' đã được config 100%
  params: (req, file) => {
    const ext = file.originalname.toLowerCase().split(".").pop();
    let folder = "products";
    let resource_type = "image"; // Mặc định cho ảnh

    if (["glb", "gltf", "svg"].includes(ext)) {
      folder = ext === "svg" ? "dielines" : "3d-models";
      resource_type = "raw";
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Lấy userId từ req.user (do middleware protect thêm vào)
    const userId = req.user?._id || "anonymous";
    const final_public_id = `${resource_type}-${userId}-${uniqueSuffix}`;

    return {
      folder: `printz/${folder}`,
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "svg",
        "glb",
        "gltf",
        "pdf",
      ],
      resource_type: resource_type,
      public_id: final_public_id,
    };
  },
});

/**
 * 2. Storage cho Hình Ảnh (Sản phẩm, Template Preview)
 */
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "printz/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    public_id: (req, file) =>
      `img-${req.user._id}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

/**
 * 3. Storage cho Model 3D (GLB)
 */
const modelStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "printz/3d-models",
    allowed_formats: ["glb", "gltf"],
    resource_type: "raw",
    public_id: (req, file) =>
      `model-${req.user._id}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  },
});

/**
 * 4. Storage cho Dieline (SVG)
 */
const dielineStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "printz/dielines",
    allowed_formats: ["svg"],
    resource_type: "raw",
    public_id: (req, file) =>
      `dieline-${req.user._id}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`,
  },
});

/**
 * 5. Storage cho Mẫu Thiết Kế (Template)
 */
const designStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isPreview = file.fieldname === "previewFile";
    const folder = isPreview
      ? "printz/design-previews"
      : "printz/design-production";
    const type = isPreview ? "image" : "raw";
    // File production là file JSON chứa dữ liệu editor
    const formats = isPreview ? ["jpg", "jpeg", "png"] : ["json"];

    return {
      folder: folder,
      allowed_formats: formats,
      resource_type: type,
      public_id: (req, file) =>
        `${type}-${req.user._id}-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}`,
    };
  },
});

/**
 * 6. Storage cho Tài liệu Pháp lý (GPKD, CCCD)
 */
const legalDocStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const public_id = `doc-${req.user._id}-${file.fieldname}-${Date.now()}`;
    return {
      folder: "printz/legal-docs",
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
      resource_type: "image",
      public_id: public_id,
      tags: ["verification", `user_${req.user._id}`],
    };
  },
});

// ==========================================================
// === BƯỚC 3: EXPORT CÁC MULTER INSTANCES ===
// ==========================================================

const createMulter = (storage, limits, fileFilter) => {
  return multer({
    storage: storage,
    limits: limits,
    fileFilter: fileFilter,
  });
};

// 1. Dùng cho API upload chung (ví dụ: /api/uploads/file)
export const uploadMixed = createMulter(
  mixedStorage,
  { fileSize: 50 * 1024 * 1024 }, // 50MB
  (req, file, cb) => {
    const ext = file.originalname.toLowerCase().split(".").pop();
    const isAllowed = [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "svg",
      "glb",
      "gltf",
      "pdf",
    ].includes(ext);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("File không được hỗ trợ."), false);
    }
  }
);

// 2. Dùng cho API chỉ upload ảnh (VD: /api/products)
export const uploadImage = createMulter(imageStorage, {
  fileSize: 50 * 1024 * 1024, // ✅ Tăng lên 50MB (cho phép upload nhiều ảnh 5MB)
});

// 3. Dùng cho API chỉ upload model 3D (GLB)
export const uploadModel = createMulter(modelStorage, {
  fileSize: 50 * 1024 * 1024, // 50MB
});

// 4. Dùng cho API chỉ upload dieline (SVG)
export const uploadDieline = createMulter(dielineStorage, {
  fileSize: 5 * 1024 * 1024, // 5MB
});

// ❌ REMOVED: Design features
// 5. Dùng cho API đăng bán template (Đa trường)
// export const uploadDesignTemplate = createMulter(designStorage, {
//   fileSize: 10 * 1024 * 1024, // 10MB
// });

// 6. Dùng cho upload tài liệu xác thực
export const uploadLegalDocs = createMulter(legalDocStorage, {
  fileSize: 10 * 1024 * 1024, // 10MB
}).fields([
  { name: "gpkdFile", maxCount: 1 },
  { name: "cccdFile", maxCount: 1 },
]);

// 7. Memory Storage cho R2 Upload (Lưu file vào buffer thay vì Cloudinary)
const memoryStorage = multer.memoryStorage();
export const uploadMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// === BƯỚC 4: EXPORT 'cloudinary' TỪ ĐÂY ===
export { cloudinary };
