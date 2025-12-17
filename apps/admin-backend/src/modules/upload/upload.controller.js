// apps/admin-backend/src/modules/upload/upload.controller.js
// Upload controller - Cloudinary for images, R2 for documents

import { cloudinaryService } from "../../infrastructure/storage/cloudinary.service.js";
import { r2Service } from "../../infrastructure/storage/r2.service.js";
import { ApiResponse, Logger } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class UploadController {
  /**
   * Upload image to Cloudinary
   * @route POST /api/upload/image
   * @query folder - Folder to upload to (default: "supplier-posts")
   * @query watermark - Add watermark (default: "true" for supplier-posts)
   */
  uploadImage = async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("No file uploaded"));
      }

      // Use folder from query param or default to "supplier-posts"
      const folder = req.query.folder || "supplier-posts";

      // Watermark mặc định cho supplier-posts, có thể tắt bằng query param
      const shouldAddWatermark =
        req.query.watermark !== "false" && folder.includes("supplier-posts");

      // Upload to Cloudinary với watermark nếu cần
      const result = await cloudinaryService.uploadImage(req.file.buffer, {
        folder,
        withWatermark: shouldAddWatermark,
      });

      Logger.success(
        `[UploadCtrl] Image uploaded: ${result.public_id}${
          result.hasWatermark ? " [with watermark]" : ""
        }`
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          url: result.secure_url,
          publicId: result.public_id,
          filename: req.file.originalname,
          format: result.format,
          width: result.width,
          height: result.height,
          hasWatermark: result.hasWatermark || false,
        })
      );
    } catch (error) {
      Logger.error(`[UploadCtrl] Image upload failed:`, error);
      next(error);
    }
  };

  /**
   * Get presigned URL for R2 document upload
   * @route POST /api/upload/document-url
   */
  getDocumentUploadUrl = async (req, res, next) => {
    try {
      const { fileName, fileType } = req.body;

      if (!fileName || !fileType) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("fileName and fileType are required"));
      }

      // Validate PDF only
      if (fileType !== "application/pdf") {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Only PDF files are allowed"));
      }

      // Generate unique key
      const uniqueKey = `product-documents/${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}-${fileName}`;

      const data = await r2Service.getPresignedUploadUrl(uniqueKey, fileType);

      Logger.success(`[UploadCtrl] Generated presigned URL for: ${uniqueKey}`);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(data));
    } catch (error) {
      Logger.error(`[UploadCtrl] Failed to generate presigned URL:`, error);
      next(error);
    }
  };

  /**
   * Get presigned download URL for R2 document
   * @route GET /api/upload/document-download
   */
  getDocumentDownloadUrl = async (req, res, next) => {
    try {
      const { key, filename } = req.query;

      if (!key) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("key is required"));
      }

      const presignedUrl = await r2Service.getPresignedDownloadUrl(
        key,
        filename || "document.pdf",
        "inline" // inline for preview, attachment for download
      );

      // Redirect to presigned URL
      res.redirect(presignedUrl);
    } catch (error) {
      Logger.error(`[UploadCtrl] Failed to get download URL:`, error);
      next(error);
    }
  };

  /**
   * Upload video to Cloudinary
   * @route POST /api/upload/video
   */
  uploadVideo = async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("No file uploaded"));
      }

      // Upload to Cloudinary as video
      const result = await cloudinaryService.uploadVideo(req.file.buffer, {
        folder: "supplier-posts/videos",
        resource_type: "video",
      });

      Logger.success(`[UploadCtrl] Video uploaded: ${result.public_id}`);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          url: result.secure_url,
          publicId: result.public_id,
          filename: req.file.originalname,
          format: result.format,
          duration: result.duration,
        })
      );
    } catch (error) {
      Logger.error(`[UploadCtrl] Video upload failed:`, error);
      next(error);
    }
  };

  /**
   * Delete image from Cloudinary
   * @route DELETE /api/upload/image/:publicId
   */
  deleteImage = async (req, res, next) => {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("publicId is required"));
      }

      await cloudinaryService.deleteImage(publicId);

      Logger.success(`[UploadCtrl] Image deleted: ${publicId}`);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Image deleted successfully"));
    } catch (error) {
      Logger.error(`[UploadCtrl] Image deletion failed:`, error);
      next(error);
    }
  };
}
