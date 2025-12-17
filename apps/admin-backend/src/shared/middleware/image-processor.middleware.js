// apps/admin-backend/src/shared/middleware/image-processor.middleware.js
// Middleware xử lý ảnh: resize, convert WebP, rename
// Watermark được xử lý bởi Cloudinary overlay (chất lượng cao hơn)

import sharp from "sharp";
import { Logger } from "../utils/index.js";

// Config - Tối ưu chất lượng + dung lượng
const CONFIG = {
  maxWidth: 1200, // Max width cho ảnh bài viết (giảm từ 1600 để file nhỏ hơn, vẫn đủ sắc nét)
  // WebP settings tối ưu
  webp: {
    quality: 90, // Tăng quality vì không còn xử lý watermark
    alphaQuality: 100,
    effort: 6,
    smartSubsample: true,
    nearLossless: false,
  },
  // Sharpening sau resize để bù lại độ mờ
  sharpen: {
    sigma: 0.5,
    flat: 1.0,
    jagged: 0.5,
  },
  // Cloudinary watermark config
  // Watermark được upload lên Cloudinary với public_id: "watermarks/printz-logo"
  // Sử dụng Cloudinary overlay transformation khi upload
  cloudinaryWatermark: {
    publicId: "watermarks/printz-logo", // Public ID của watermark trên Cloudinary
    gravity: "south_east", // Góc dưới phải
    x: 30, // Margin từ mép phải
    y: 30, // Margin từ mép dưới
    width: 0.2, // 20% chiều rộng ảnh (relative)
    opacity: 80, // 80% opacity
  },
  // Target file size (KB) - nếu vượt quá sẽ giảm quality
  targetMaxSizeKB: 600,
  // Metadata EXIF cho ảnh
  metadata: {
    copyright: "© Printz Co., Ltd - All Rights Reserved",
    defaultCreator: "DANG HOAN PHUC",
    source: "Printz.vn",
  },
};

/**
 * Tạo EXIF metadata cho ảnh
 * - Copyright: © Printz Co., Ltd - All Rights Reserved
 * - Creator/Artist: Tên người đăng (NCC hoặc mặc định DANG HOAN PHUC)
 * - Source: Printz.vn
 * - DateTime: Thời điểm xử lý ảnh
 *
 * @param {string} creatorName - Tên người đăng (optional)
 */
function createExifMetadata(creatorName) {
  const now = new Date();
  // Format: YYYY:MM:DD HH:MM:SS (EXIF standard)
  const dateTime = now
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, "")
    .replace(/-/g, ":");

  const creator = creatorName || CONFIG.metadata.defaultCreator;

  return {
    IFD0: {
      Copyright: CONFIG.metadata.copyright,
      Artist: creator, // Creator/Artist
      Software: CONFIG.metadata.source, // Source
      DateTime: dateTime,
    },
  };
}

/**
 * Generate unique filename
 * Format: {slug}-{timestamp}-{random}.webp
 */
function generateFilename(originalName, slug) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const baseSlug =
    slug || originalName.replace(/\.[^.]+$/, "").substring(0, 20);
  const cleanSlug = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${cleanSlug}-${timestamp}-${random}.webp`;
}

/**
 * Lấy Cloudinary transformation config cho watermark
 * Sử dụng khi upload ảnh lên Cloudinary
 *
 * @returns {Array} Cloudinary transformation array
 */
export function getWatermarkTransformation() {
  const wm = CONFIG.cloudinaryWatermark;
  return [
    // Resize ảnh gốc
    { width: CONFIG.maxWidth, crop: "limit" },
    // Overlay watermark
    {
      overlay: wm.publicId.replace("/", ":"), // Cloudinary format: folder:filename
      gravity: wm.gravity,
      x: wm.x,
      y: wm.y,
      width: wm.width,
      opacity: wm.opacity,
      flags: "relative", // width là relative với ảnh gốc
    },
    // Output format
    { quality: "auto:best", fetch_format: "webp" },
  ];
}

/**
 * Middleware xử lý ảnh upload (chỉ resize + convert, KHÔNG watermark)
 * Watermark sẽ được Cloudinary xử lý khi upload với transformation
 *
 * Luồng xử lý:
 * 1. Resize: width 1600px (height auto theo tỷ lệ)
 * 2. Convert: WebP quality 90%
 * 3. Rename: slug-timestamp-random.webp
 *
 * Watermark được xử lý bởi Cloudinary overlay transformation
 */
export const processImage = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return next();
    }

    const startTime = Date.now();
    const originalSize = req.file.buffer.length;

    // Get image metadata
    const metadata = await sharp(req.file.buffer).metadata();

    // Skip if not an image
    if (!metadata.width || !metadata.height) {
      return next();
    }

    Logger.debug(
      `[ImageProcessor] Start: ${req.file.originalname} (${metadata.width}x${
        metadata.height
      }, ${Math.round(originalSize / 1024)}KB)`
    );

    // === STEP 1: Resize + Sharpen (giữ chất lượng cao) ===
    let imageBuffer = req.file.buffer;

    if (metadata.width > CONFIG.maxWidth) {
      imageBuffer = await sharp(imageBuffer)
        .resize(CONFIG.maxWidth, null, {
          withoutEnlargement: true,
          fit: "inside",
          kernel: sharp.kernel.lanczos3,
        })
        .sharpen({
          sigma: CONFIG.sharpen.sigma,
          m1: CONFIG.sharpen.flat,
          m2: CONFIG.sharpen.jagged,
        })
        .toBuffer();
      Logger.debug(
        `[ImageProcessor] Step 1: Resized to ${CONFIG.maxWidth}px + sharpened`
      );
    } else {
      Logger.debug(
        `[ImageProcessor] Step 1: No resize needed (${metadata.width}px)`
      );
    }

    // === STEP 2: Convert to WebP với metadata ===
    // KHÔNG thêm watermark ở đây - Cloudinary sẽ xử lý
    Logger.debug(
      `[ImageProcessor] Step 2: Converting to WebP (quality ${CONFIG.webp.quality}%)`
    );

    const creatorName =
      req.body?.creatorName ||
      req.query?.creatorName ||
      req.user?.supplierName ||
      req.user?.displayName ||
      null;

    const exifData = createExifMetadata(creatorName);

    let processedBuffer = await sharp(imageBuffer)
      .toColorspace("srgb") // Đảm bảo color space nhất quán
      .withMetadata({ exif: exifData })
      .webp({
        quality: CONFIG.webp.quality,
        alphaQuality: CONFIG.webp.alphaQuality,
        effort: CONFIG.webp.effort,
        smartSubsample: CONFIG.webp.smartSubsample,
      })
      .toBuffer();

    // Nếu file quá lớn, giảm quality từ từ
    let currentQuality = CONFIG.webp.quality;
    while (
      processedBuffer.length > CONFIG.targetMaxSizeKB * 1024 &&
      currentQuality > 75
    ) {
      currentQuality -= 5;
      processedBuffer = await sharp(imageBuffer)
        .toColorspace("srgb")
        .withMetadata({ exif: exifData })
        .webp({
          quality: currentQuality,
          alphaQuality: CONFIG.webp.alphaQuality,
          effort: CONFIG.webp.effort,
          smartSubsample: CONFIG.webp.smartSubsample,
        })
        .toBuffer();
      Logger.debug(
        `[ImageProcessor] Step 2: Reduced quality to ${currentQuality}% (${Math.round(
          processedBuffer.length / 1024
        )}KB)`
      );
    }

    // === STEP 3: Rename ===
    const slug = req.body?.slug || req.query?.slug;
    const newFilename = generateFilename(req.file.originalname, slug);

    // Update req.file
    req.file.buffer = processedBuffer;
    req.file.mimetype = "image/webp";
    req.file.originalname = newFilename;

    // Đánh dấu để cloudinary service biết cần thêm watermark transformation
    req.file.needsWatermark = true;

    const processingTime = Date.now() - startTime;
    const newSize = processedBuffer.length;
    const reduction = Math.round((1 - newSize / originalSize) * 100);

    Logger.success(
      `[ImageProcessor] Done: ${newFilename} | ${Math.round(
        originalSize / 1024
      )}KB → ${Math.round(
        newSize / 1024
      )}KB (-${reduction}%) | Q:${currentQuality}% | ${processingTime}ms`
    );

    next();
  } catch (error) {
    Logger.error(`[ImageProcessor] Error:`, error);
    next();
  }
};

/**
 * Export config để các service khác có thể sử dụng
 */
export { CONFIG as imageProcessorConfig };

/**
 * Middleware resize only (cho avatar, thumbnail) - không watermark
 */
export const resizeOnly = (maxWidth = 400) => {
  return async (req, res, next) => {
    try {
      if (!req.file || !req.file.buffer) {
        return next();
      }

      const originalSize = req.file.buffer.length;

      const processedBuffer = await sharp(req.file.buffer)
        .resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: "inside",
        })
        .webp({ quality: CONFIG.webp.quality })
        .toBuffer();

      const newFilename = generateFilename(req.file.originalname, null);

      req.file.buffer = processedBuffer;
      req.file.mimetype = "image/webp";
      req.file.originalname = newFilename;

      const newSize = processedBuffer.length;
      Logger.success(
        `[ResizeOnly] ${newFilename} | ${Math.round(
          originalSize / 1024
        )}KB → ${Math.round(newSize / 1024)}KB`
      );

      next();
    } catch (error) {
      Logger.error(`[ResizeOnly] Error:`, error);
      next();
    }
  };
};
