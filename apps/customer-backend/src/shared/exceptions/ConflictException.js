// src/shared/exceptions/ConflictException.js
import { BaseException } from "./BaseException.js";

/**
 * Lỗi 409 - Xung đột (Tài nguyên đã tồn tại)
 */
export class ConflictException extends BaseException {
  constructor(message = "Tài nguyên đã tồn tại hoặc bị xung đột") {
    super(message, 409); // 409 Conflict
  }
}
