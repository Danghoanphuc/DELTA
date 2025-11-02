// backend/src/infrastructure/storage/multer.config.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "./cloudinary.config.js";

// ==================== IMAGE UPLOAD (Existing) ====================
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

export const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ==================== 3D MODEL UPLOAD (GLB/GLTF) ====================
const modelStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "3d-models",
    allowed_formats: ["glb", "gltf"],
    resource_type: "raw", // ✅ QUAN TRỌNG: Phải dùng 'raw' cho GLB
  },
});

export const uploadModel = multer({
  storage: modelStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB cho file 3D
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "model/gltf-binary",
      "model/gltf+json",
      "application/octet-stream",
    ];
    const allowedExts = [".glb", ".gltf"];
    const ext = file.originalname
      .toLowerCase()
      .slice(file.originalname.lastIndexOf("."));

    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file .glb hoặc .gltf"));
    }
  },
});

// ==================== DIELINE UPLOAD (SVG) ====================
const dielineStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dielines",
    allowed_formats: ["svg"],
    resource_type: "raw",
  },
});

export const uploadDieline = multer({
  storage: dielineStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ==================== DESIGN TEMPLATE UPLOAD ====================
const designStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Preview = image, Production = raw (SVG)
    const isPreview = file.fieldname === "previewFile";
    return {
      folder: isPreview ? "design-previews" : "design-production",
      allowed_formats: isPreview ? ["jpg", "jpeg", "png"] : ["svg"],
      resource_type: isPreview ? "image" : "raw",
    };
  },
});

export const uploadDesignTemplate = multer({
  storage: designStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
