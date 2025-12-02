// src/shared/constants/api-codes.constants.js

/**
 * Định nghĩa các mã trạng thái HTTP chuẩn
 * để sử dụng nhất quán trong toàn bộ ứng dụng.
 */
export const API_CODES = {
  // 2xx: Thành công
  SUCCESS: 200, // OK
  CREATED: 201, // Created
  NO_CONTENT: 204, // No Content (thường dùng cho delete, signout)

  // 4xx: Lỗi Client
  BAD_REQUEST: 400, // Bad Request (lỗi validation)
  UNAUTHORIZED: 401, // Unauthorized (chưa xác thực)
  FORBIDDEN: 403, // Forbidden (không có quyền)
  NOT_FOUND: 404, // Not Found (không tìm thấy tài nguyên)
  CONFLICT: 409, // Conflict (xung đột, ví dụ: email đã tồn tại)

  // 5xx: Lỗi Server
  INTERNAL_SERVER_ERROR: 500, // Internal Server Error
};
