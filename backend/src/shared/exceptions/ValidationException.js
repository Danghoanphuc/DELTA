// src/shared/exceptions/ValidationException.js
import { BaseException } from "./BaseException.js";

/**
 * Lỗi 400 - Dữ liệu không hợp lệ
 */
export class ValidationException extends BaseException {
  /**
   * @param {string} message - Thông báo lỗi chung
   * @param {string[]} [errors] - Mảng các lỗi chi tiết (tùy chọn)
   */
  constructor(message = "Dữ liệu không hợp lệ", errors = []) {
    super(message, 400); // 400 Bad Request
    this.errors = errors; // Mảng chứa các lỗi validation chi tiết
  }
}
