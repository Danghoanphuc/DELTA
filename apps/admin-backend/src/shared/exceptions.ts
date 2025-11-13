// apps/admin-backend/src/shared/exceptions.ts

// (Giữ nguyên các class ValidationException, UnauthorizedException, ForbiddenException)

export class ValidationException extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "ValidationException";
    this.statusCode = 400; // Bad Request
  }
}

export class UnauthorizedException extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedException";
    this.statusCode = 401; // Unauthorized
  }
}

export class ForbiddenException extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenException";
    this.statusCode = 403; // Forbidden
  }
}

// --- THÊM CLASS BỊ THIẾU VÀO ĐÂY ---
export class NotFoundException extends Error {
  public statusCode: number;

  constructor(resourceName: string, resourceId?: string) {
    const message = resourceId
      ? `${resourceName} với ID '${resourceId}' không tìm thấy.`
      : `${resourceName} không tìm thấy.`;
    super(message);
    this.name = "NotFoundException";
    this.statusCode = 404;
  }
}
