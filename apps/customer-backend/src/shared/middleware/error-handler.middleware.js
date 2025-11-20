// src/shared/middleware/error-handler.middleware.js
import multer from "multer";
import { BaseException } from "../exceptions/BaseException.js"; // Cần import BaseException
import { ApiResponse } from "../utils/api-response.util.js"; // Cần import ApiResponse
import { API_CODES } from "../constants/api-codes.constants.js"; // Cần import API_CODES
import { Logger } from "../utils/logger.util.js"; // Cần import Logger

/**
 * Xử lý lỗi từ Multer (Bạn đã có hàm này)
 * (Giữ nguyên code gốc của bạn)
 */
export function handleUploadError(err, req, res, next) {
  Logger.warn("Upload Error Handler triggered", err.message);

  if (err instanceof multer.MulterError) {
    Logger.error("Multer Error", { code: err.code, message: err.message });
    let message = "Lỗi tải lên file.";
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File quá lớn (tối đa 5MB mỗi file).";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Chỉ được tải lên tối đa 5 ảnh.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = err.message || "Trường file không được chấp nhận.";
        break;
      default:
        message = err.message || "Lỗi tải file.";
    }
    return res.status(400).json({
      success: false,
      message: message,
      errorCode: err.code,
    });
  }

  if (err && err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      message: err.message, // "Chỉ chấp nhận file ảnh..."
    });
  }

  // Chuyển tiếp nếu không phải lỗi Multer
  next(err);
}

/**
 * HÀM BỊ THIẾU: Middleware xử lý lỗi toàn cục (Global Error Handler)
 * Bắt tất cả lỗi được ném ra từ các exceptions (NotFound, Validation, v.v.)
 * Phải được đặt SAU TẤT CẢ các app.use() và routes khác trong server.js.
 */
export const errorHandler = (err, req, res, next) => {
  // ✅ IMPROVEMENT: Use proper Logger
  Logger.error(`[${req.method} ${req.path}]`, err.message);

  // 1. Xử lý các lỗi tùy chỉnh (kế thừa từ BaseException)
  if (err instanceof BaseException) {
    const errors = err.errors || null;
    return res
      .status(err.statusCode)
      .json(ApiResponse.error(err.message, errors));
  }

  // 2. Xử lý lỗi validation của Mongoose
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res
      .status(API_CODES.BAD_REQUEST)
      .json(ApiResponse.error("Dữ liệu không hợp lệ", errors));
  }

  // 3. Xử lý lỗi trùng lặp của Mongoose (Duplicate Key)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Giá trị '${err.keyValue[field]}' cho trường '${field}' đã tồn tại.`;
    return res
      .status(API_CODES.CONFLICT)
      .json(ApiResponse.error(message, ["DUPLICATE_KEY"]));
  }

  // 4. Xử lý lỗi chung (500 Internal Server Error)
  const message =
    process.env.NODE_ENV === "production"
      ? "Có lỗi xảy ra, vui lòng thử lại sau."
      : err.message || "Lỗi máy chủ nội bộ không xác định";

  res.status(API_CODES.INTERNAL_SERVER_ERROR).json(ApiResponse.error(message));
};
