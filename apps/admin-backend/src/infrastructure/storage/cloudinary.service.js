// apps/admin-backend/src/infrastructure/storage/cloudinary.service.js
// Cloudinary service for image uploads with watermark support

import { v2 as cloudinary } from "cloudinary";
import { Logger } from "../../shared/utils/index.js";

// Retry config for network errors
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "EPIPE",
    "EAI_AGAIN",
  ],
};

// Watermark config - watermark phải được upload lên Cloudinary trước
// Upload 1 lần với public_id: "watermarks/printz-logo"
const WATERMARK_CONFIG = {
  publicId: "watermarks/printz-logo", // Public ID của watermark trên Cloudinary
  gravity: "south_east", // Góc dưới phải
  x: 30, // Margin từ mép phải
  y: 30, // Margin từ mép dưới
  widthPercent: 0.2, // 20% chiều rộng ảnh
  opacity: 80, // 80% opacity
};

class CloudinaryService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      Logger.warn("[Cloudinary] Missing CLOUDINARY_CLOUD_NAME env");
    }
  }

  /**
   * Tạo transformation array cho watermark overlay
   * Cloudinary sẽ overlay watermark với chất lượng cao hơn Sharp
   *
   * @param {Object} options - Watermark options
   * @returns {Array} Cloudinary transformation array
   */
  getWatermarkTransformation(options = {}) {
    const config = { ...WATERMARK_CONFIG, ...options };

    return [
      // Overlay watermark - Cloudinary xử lý với chất lượng cao
      {
        overlay: config.publicId.replace("/", ":"), // Cloudinary format: folder:filename
        gravity: config.gravity,
        x: config.x,
        y: config.y,
        width: config.widthPercent,
        opacity: config.opacity,
        flags: "relative", // width là relative với ảnh gốc (0.2 = 20%)
      },
    ];
  }

  /**
   * Kiểm tra watermark đã tồn tại trên Cloudinary chưa
   * @returns {Promise<boolean>}
   */
  async checkWatermarkExists() {
    try {
      await cloudinary.api.resource(WATERMARK_CONFIG.publicId);
      return true;
    } catch (error) {
      if (error.http_code === 404) {
        return false;
      }
      // Nếu lỗi khác (network, auth...), log và return false để không block upload
      Logger.warn("[Cloudinary] Error checking watermark:", error.message);
      return false;
    }
  }

  /**
   * Check if error is retryable (network errors)
   * @param {Error} error - Error to check
   * @returns {boolean}
   */
  isRetryableError(error) {
    if (!error) return false;
    const errorCode = error.code || error.errno;
    return RETRY_CONFIG.retryableErrors.includes(errorCode);
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate delay for retry with exponential backoff
   * @param {number} attempt - Current attempt number (0-indexed)
   * @returns {number} Delay in milliseconds
   */
  getRetryDelay(attempt) {
    const delay =
      RETRY_CONFIG.initialDelayMs *
      Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
    return Math.min(delay, RETRY_CONFIG.maxDelayMs);
  }

  /**
   * Upload image buffer to Cloudinary with retry logic
   * @param {Buffer} buffer - Image buffer
   * @param {Object} options - Upload options
   * @param {boolean} options.withWatermark - Có thêm watermark không (default: false)
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(buffer, options = {}) {
    const { withWatermark = false, ...uploadOptions } = options;

    // Nếu cần watermark, kiểm tra watermark tồn tại trước
    let transformation = uploadOptions.transformation || [];
    let actuallyAddedWatermark = false;

    if (withWatermark) {
      const watermarkExists = await this.checkWatermarkExists();
      if (watermarkExists) {
        transformation = [
          ...transformation,
          ...this.getWatermarkTransformation(),
        ];
        actuallyAddedWatermark = true;
        Logger.debug("[Cloudinary] Adding watermark transformation");
      } else {
        Logger.warn(
          "[Cloudinary] Watermark not found on Cloudinary. Upload without watermark. " +
            "Run 'node scripts/upload-watermark.js' to upload watermark first."
        );
      }
    }

    // Retry logic for network errors
    let lastError;
    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const result = await this._doUpload(buffer, {
          folder: uploadOptions.folder || "products",
          transformation: transformation,
          resource_type: "image",
          quality: "auto:best",
          format: "webp",
          timeout: 60000, // 60 second timeout
        });

        Logger.success(
          `[Cloudinary] Uploaded: ${result.public_id} (${result.bytes} bytes)${
            actuallyAddedWatermark ? " [with watermark]" : ""
          }${attempt > 0 ? ` [retry ${attempt}]` : ""}`
        );
        result.hasWatermark = actuallyAddedWatermark;
        return result;
      } catch (error) {
        lastError = error;

        if (this.isRetryableError(error) && attempt < RETRY_CONFIG.maxRetries) {
          const delay = this.getRetryDelay(attempt);
          Logger.warn(
            `[Cloudinary] Upload failed with ${
              error.code || error.message
            }, retrying in ${delay}ms (attempt ${attempt + 1}/${
              RETRY_CONFIG.maxRetries
            })`
          );
          await this.sleep(delay);
        } else {
          // Non-retryable error or max retries reached
          Logger.error("[Cloudinary] Upload failed:", {
            message: error.message,
            code: error.code,
            attempts: attempt + 1,
          });
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Internal method to perform actual upload
   * @private
   */
  _doUpload(buffer, uploadOptions) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.on("error", (err) => {
        reject(err);
      });

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload image với watermark (shorthand)
   * @param {Buffer} buffer - Image buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImageWithWatermark(buffer, options = {}) {
    return this.uploadImage(buffer, { ...options, withWatermark: true });
  }

  /**
   * Upload video buffer to Cloudinary
   * @param {Buffer} buffer - Video buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadVideo(buffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || "videos",
          resource_type: "video",
        },
        (error, result) => {
          if (error) {
            Logger.error("[Cloudinary] Video upload failed:", error);
            reject(error);
          } else {
            Logger.success(
              `[Cloudinary] Video uploaded: ${result.public_id} (${result.bytes} bytes)`
            );
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload audio buffer to Cloudinary
   * Cloudinary treats audio as video resource type
   * @param {Buffer} buffer - Audio buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadAudio(buffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || "audio",
          resource_type: "video", // Cloudinary uses video for audio files
        },
        (error, result) => {
          if (error) {
            Logger.error("[Cloudinary] Audio upload failed:", error);
            reject(error);
          } else {
            Logger.success(
              `[Cloudinary] Audio uploaded: ${result.public_id} (${result.bytes} bytes)`
            );
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      Logger.success(`[Cloudinary] Deleted: ${publicId}`);
      return result;
    } catch (error) {
      Logger.error(`[Cloudinary] Delete failed for ${publicId}:`, error);
      throw error;
    }
  }

  /**
   * Get optimized image URL
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} Optimized image URL
   */
  getOptimizedUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      transformation: [
        { width: options.width || 800, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });
  }

  /**
   * Get URL với watermark (cho ảnh đã upload không có watermark)
   * Cloudinary sẽ apply watermark on-the-fly
   *
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Options
   * @returns {string} URL với watermark
   */
  getUrlWithWatermark(publicId, options = {}) {
    const watermarkTransform = this.getWatermarkTransformation(options);

    return cloudinary.url(publicId, {
      transformation: [
        { width: options.width || 1600, crop: "limit" },
        ...watermarkTransform,
        { quality: "auto:best" },
        { fetch_format: "webp" },
      ],
    });
  }

  /**
   * Upload watermark image lên Cloudinary (chạy 1 lần)
   * Watermark cần là PNG với transparent background, resolution cao (ít nhất 1000px width)
   *
   * @param {Buffer} buffer - Watermark image buffer
   * @returns {Promise<Object>} Upload result
   */
  async uploadWatermark(buffer) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: WATERMARK_CONFIG.publicId,
          resource_type: "image",
          overwrite: true,
          // Không transform watermark - giữ nguyên chất lượng gốc
          format: "png",
        },
        (error, result) => {
          if (error) {
            Logger.error("[Cloudinary] Watermark upload failed:", error);
            reject(error);
          } else {
            Logger.success(
              `[Cloudinary] Watermark uploaded: ${result.public_id} (${result.width}x${result.height})`
            );
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  }
}

export const cloudinaryService = new CloudinaryService();
export { WATERMARK_CONFIG };
