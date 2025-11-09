// backend/src/shared/middleware/parse-form-data.middleware.js
import { ValidationException } from "../exceptions/index.js";
import { Logger } from "../utils/index.js";

/**
 * Middleware để parse các trường JSON được gửi dưới dạng string trong form-data.
 * @param {string[]} fieldsToParse - Mảng các tên trường cần parse (ví dụ: ['pricing', 'specifications'])
 */
export const parseJsonFields = (fieldsToParse) => {
  return (req, res, next) => {
    try {
      if (!req.body) return next();

      fieldsToParse.forEach((field) => {
        if (req.body[field] && typeof req.body[field] === "string") {
          try {
            req.body[field] = JSON.parse(req.body[field]);
          } catch (e) {
            Logger.warn(
              `[Middleware] Lỗi parse JSON field '${field}':`,
              e.message
            );
            // Ném lỗi validation để dừng luồng
            throw new ValidationException(
              `Dữ liệu cho trường '${field}' không phải là JSON hợp lệ.`
            );
          }
        }
      });

      next();
    } catch (error) {
      // Chuyển lỗi cho error-handler middleware
      next(error);
    }
  };
};
