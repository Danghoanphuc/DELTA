// src/modules/uploads/upload.controller.js
import { ApiResponse } from "../../shared/utils/api-response.util.js";
import { API_CODES } from "../../shared/constants/api-codes.constants.js";
import { ValidationException } from "../../shared/exceptions/ValidationException.js";
// ✅ BƯỚC 1: Import Cloudinary và Logger
import { cloudinary } from "../../infrastructure/storage/multer.config.js";
import { Logger } from "../../shared/utils/index.js";

export class UploadController {
  /**
   * @desc    Trả về URL file từ multer/Cloudinary
   */
  uploadSingleFile = async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ValidationException("Không có file nào được tải lên.");
      }
      const fileUrl = req.file.path;
      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ url: fileUrl }, "Tải file lên thành công!")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✨ SMART PIPELINE: Generate signed URL for direct upload to Cloudinary
   * @desc    Client sẽ upload trực tiếp lên Cloudinary (không qua server)
   */
  generateUploadSignature = async (req, res, next) => {
    try {
      const { folder = "printz/products" } = req.body;

      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
          upload_preset: "printz_products", // ⚠️ Cần tạo preset trong Cloudinary dashboard
        },
        process.env.CLOUDINARY_API_SECRET
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            uploadPreset: "printz_products",
            folder,
          }, "Signed URL generated")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✨ SMART PIPELINE: Upload ảnh async (trả về URL ngay lập tức)
   * @desc    Alternative cho signed URL - server upload lên Cloudinary
   */
  uploadImageAsync = async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ValidationException("No file uploaded");
      }

      // Multer đã upload lên Cloudinary
      const imageUrl = req.file.path;
      const publicId = req.file.filename;

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({
            url: imageUrl,
            publicId,
            width: req.file.width,
            height: req.file.height,
          }, "Image uploaded successfully")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✅ BƯỚC 2: Thêm hàm dọn dẹp file rác (orphan)
   * @desc    Xóa file trên cloud nếu lưu DB thất bại
   */
  cleanupOrphanedFile = async (req, res, next) => {
    try {
      const { url } = req.body;
      if (!url) {
        throw new ValidationException("Cần có URL của file để dọn dẹp");
      }

      // Trích xuất public_id từ URL Cloudinary
      // Ví dụ: .../upload/v12345/printz/products/image-123.png
      // Chúng ta cần: printz/products/image-123
      const urlSegments = url.split("/");
      // Tìm index của folder gốc 'printz'
      const folderIndex = urlSegments.indexOf("printz");
      if (folderIndex === -1) {
        throw new ValidationException(
          "URL không hợp lệ, không tìm thấy folder 'printz'"
        );
      }

      const publicIdWithFolder = urlSegments.slice(folderIndex).join("/");
      // Bỏ đuôi file (.png, .jpg, .svg, .glb)
      const publicId = publicIdWithFolder.substring(
        0,
        publicIdWithFolder.lastIndexOf(".")
      );

      Logger.warn(`[Cleanup] Đang xóa file rác Cloudinary: ${publicId}`);

      // Xóa file: Cloudinary đủ thông minh để tự biết resource_type (image/raw)
      // nếu chúng ta cung cấp public_id đầy đủ.
      // Tuy nhiên, để chắc chắn, ta nên thử cả hai.
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (imageError) {
        Logger.debug("[Cleanup] Không thể xóa dạng 'image', thử dạng 'raw'...");
        try {
          // Thử xóa dạng "raw" (cho file SVG, GLB)
          await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        } catch (rawError) {
          throw new Error(
            `Không thể xóa file rác ${publicId} (đã thử image và raw): ${rawError.message}`
          );
        }
      }

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã dọn dẹp file rác"));
    } catch (error) {
      next(error);
    }
  };
}
