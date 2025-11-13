// src/shared/exceptions/UnauthorizedException.js
import { BaseException } from "./BaseException.js";

/**
 * Lỗi 401 - Chưa xác thực
 */
export class UnauthorizedException extends BaseException {
  constructor(message = "Chưa xác thực hoặc token không hợp lệ") {
    super(message, 401); // 401 Unauthorized
  }
}
