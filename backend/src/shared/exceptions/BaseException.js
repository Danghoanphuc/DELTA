// src/shared/exceptions/BaseException.js
/**
 * Lớp Exception (Lỗi) cơ sở để tất cả các lỗi HTTP tùy chỉnh kế thừa.
 */
export class BaseException extends Error {
  /**
   * @param {string} message - Thông báo lỗi
   * @param {number} statusCode - Mã trạng thái HTTP
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name; // Đặt tên lỗi (ví dụ: "NotFoundException")
    Error.captureStackTrace(this, this.constructor); // Ghi lại stack trace
  }
}
