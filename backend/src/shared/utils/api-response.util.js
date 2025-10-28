// src/shared/utils/api-response.util.js

/**
 * Lớp dùng để chuẩn hóa cấu trúc phản hồi API
 */
export class ApiResponse {
  /**
   * @param {boolean} success - Trạng thái thành công
   * @param {object | null} data - Dữ liệu trả về
   * @param {string | null} message - Thông báo
   * @param {string[] | null} errors - Mảng các lỗi chi tiết (nếu có)
   */
  constructor(success, data, message, errors) {
    this.success = success;
    if (data !== null) this.data = data;
    if (message !== null) this.message = message;
    if (errors !== null) this.errors = errors;
    this.timestamp = new Date();
  }

  /**
   * Tạo một phản hồi thành công
   * @param {object | null} data - Dữ liệu
   * @param {string} [message=null] - Thông báo
   * @returns {ApiResponse}
   */
  static success(data, message = null) {
    return new ApiResponse(true, data, message, null);
  }

  /**
   * Tạo một phản hồi lỗi
   * @param {string} message - Thông báo lỗi chính
   * @param {string[]} [errors=null] - Mảng các lỗi chi tiết
   * @param {object | null} [data=null] - Dữ liệu bổ sung (nếu cần)
   * @returns {ApiResponse}
   */
  static error(message, errors = null, data = null) {
    return new ApiResponse(false, data, message, errors);
  }
}
