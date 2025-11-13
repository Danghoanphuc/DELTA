// src/shared/exceptions/ForbiddenException.js
import { BaseException } from "./BaseException.js";

/**
 * Lỗi 403 - Bị cấm (Không có quyền)
 */
export class ForbiddenException extends BaseException {
  constructor(message = "Không có quyền truy cập tài nguyên này") {
    super(message, 403); // 403 Forbidden
  }
}
