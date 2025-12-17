// apps/admin-backend/src/infrastructure/storage/local.service.js
// Local file storage service (fallback when Cloudinary is not configured)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Logger } from "../../shared/utils/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LocalStorageService {
  constructor() {
    // Create uploads directory if it doesn't exist
    this.uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      Logger.info(
        `[LocalStorage] Created uploads directory: ${this.uploadsDir}`
      );
    }
  }

  /**
   * Upload image buffer to local storage
   * @param {Buffer} buffer - Image buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(buffer, options = {}) {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 9);
      const ext = options.originalname?.split(".").pop() || "jpg";
      const filename = `${timestamp}-${randomStr}.${ext}`;

      const folder = options.folder || "products";
      const folderPath = path.join(this.uploadsDir, folder);

      // Create folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const filepath = path.join(folderPath, filename);

      // Write file
      fs.writeFileSync(filepath, buffer);

      // Generate URL (assuming backend serves static files from /uploads)
      const url = `/uploads/${folder}/${filename}`;

      Logger.success(
        `[LocalStorage] Uploaded: ${filename} (${buffer.length} bytes)`
      );

      return {
        secure_url: url,
        public_id: `${folder}/${filename}`,
        format: ext,
        bytes: buffer.length,
        width: null, // Not available for local storage
        height: null,
      };
    } catch (error) {
      Logger.error("[LocalStorage] Upload failed:", error);
      throw error;
    }
  }

  /**
   * Delete image from local storage
   * @param {string} publicId - File path (e.g., "products/123-abc.jpg")
   * @returns {Promise<Object>} Deletion result
   */
  async deleteImage(publicId) {
    try {
      const filepath = path.join(this.uploadsDir, publicId);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        Logger.success(`[LocalStorage] Deleted: ${publicId}`);
        return { result: "ok" };
      } else {
        Logger.warn(`[LocalStorage] File not found: ${publicId}`);
        return { result: "not found" };
      }
    } catch (error) {
      Logger.error(`[LocalStorage] Delete failed for ${publicId}:`, error);
      throw error;
    }
  }

  /**
   * Get image URL
   * @param {string} publicId - File path
   * @param {Object} options - Not used for local storage
   * @returns {string} Image URL
   */
  getOptimizedUrl(publicId, options = {}) {
    return `/uploads/${publicId}`;
  }
}

export const localStorageService = new LocalStorageService();
