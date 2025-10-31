// backend/src/infrastructure/storage/multer.config.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

// 1. Cấu hình Cloudinary (Giữ nguyên)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 2. TẠO MỘT STORAGE "THÔNG MINH" MỚI
// Storage này sẽ tự động phân loại file vào các thư mục khác nhau
const studioStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Lấy userId từ req.user (do middleware 'protect' thêm vào)
    const userId = req.user?._id || "anonymous";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = path.parse(file.originalname).name;

    let folder;
    let resource_type = "auto";
    let allowed_formats;

    // Phân loại file dựa trên "tên trường" (fieldname) mà frontend gửi lên
    switch (file.fieldname) {
      case "modelFile": // File 3D
        folder = `printz/phoi/${userId}/models`;
        resource_type = "raw"; // Model 3D là file "thô"
        allowed_formats = ["glb", "gltf"];
        break;
      case "dielineFile": // File Khuôn
        folder = `printz/phoi/${userId}/dielines`;
        resource_type = "image"; // SVG có thể coi là image
        allowed_formats = ["svg"];
        break;
      case "productionFile": // File In (do Fabric.js tạo ra)
        folder = `printz/designs/${userId}/production`;
        resource_type = "image"; // SVG
        allowed_formats = ["svg", "pdf"];
        break;
      case "previewFile": // Ảnh xem trước (do Fabric.js tạo ra)
        folder = `printz/designs/${userId}/previews`;
        resource_type = "image";
        allowed_formats = ["png", "jpg", "jpeg"];
        break;
      default:
        folder = `printz/uploads/others`;
    }

    return {
      folder: folder,
      public_id: `${originalName}-${uniqueSuffix}`,
      resource_type: resource_type,
      allowed_formats: allowed_formats,
    };
  },
});

// 3. TẠO MIDDLEWARE UPLOAD MỚI
export const uploadStudioAssets = multer({
  storage: studioStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Tăng lên 20MB (cho model 3D)
  },
  fileFilter: (req, file, cb) => {
    // Logic fileFilter của bạn có thể giữ nguyên hoặc mở rộng
    // (Ở đây chúng ta để storage tự validate 'allowed_formats')
    cb(null, true);
  },
});

// 4. Giữ lại upload cũ (cho AddProductForm)
export { storage as legacyProductStorage } from "./cloudinary.config.js";
export { upload as legacyUpload } from "./multer.config.js";
