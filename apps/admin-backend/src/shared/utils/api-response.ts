// apps/admin-backend/src/shared/utils/api-response.ts
// ✅ API Response utilities - Standardized response format

export const API_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

export class ApiResponse {
  static success(data: any, message?: string) {
    return {
      success: true,
      data,
      message,
    };
  }

  static error(code: string, message: string, details?: any) {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    };
  }
}
