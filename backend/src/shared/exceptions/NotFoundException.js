// src/shared/exceptions/NotFoundException.js
import { BaseException } from "./BaseException.js";

/**
 * Lỗi 404 - Không tìm thấy
 */
export class NotFoundException extends BaseException {
  /**
   * @param {string} resourceName - Tên tài nguyên (ví dụ: "Sản phẩm", "Người dùng")
   * @param {string} resourceId - ID của tài nguyên (tùy chọn)
   */
  constructor(resourceName = "Tài nguyên", resourceId = "") {
    const message = resourceId
      ? `${resourceName} với ID '${resourceId}' không tìm thấy.`
      : `${resourceName} không tìm thấy.`;
    super(message, 404); // 404 Not Found
  }
}
