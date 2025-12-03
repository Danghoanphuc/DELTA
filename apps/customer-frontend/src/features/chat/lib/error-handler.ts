// apps/customer-frontend/src/features/chat/lib/error-handler.ts
/**
 * 🔥 CHAT ERROR HANDLER - ENTERPRISE GRADE
 * Xử lý lỗi thống nhất cho toàn bộ chat feature
 */

import * as Sentry from "@sentry/react";
import { toast } from "@/shared/utils/toast";

export enum ChatErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  UNAUTHORIZED = "UNAUTHORIZED",
  RATE_LIMIT = "RATE_LIMIT",
  SERVER_ERROR = "SERVER_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  UNSUPPORTED_FILE = "UNSUPPORTED_FILE",
  UNKNOWN = "UNKNOWN",
}

export interface ChatError {
  code: ChatErrorCode;
  message: string;
  originalError?: any;
  retryable: boolean;
  userMessage: string;
}

/**
 * Parse lỗi từ API response hoặc network error
 */
export const parseChatError = (error: any): ChatError => {
  // Network errors
  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return {
        code: ChatErrorCode.TIMEOUT,
        message: "Request timeout",
        originalError: error,
        retryable: true,
        userMessage: "⏱️ Kết nối chậm, đang thử lại...",
      };
    }

    return {
      code: ChatErrorCode.NETWORK_ERROR,
      message: "Network error",
      originalError: error,
      retryable: true,
      userMessage: "📡 Mất kết nối, đang thử lại...",
    };
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // HTTP status errors
  switch (status) {
    case 401:
      return {
        code: ChatErrorCode.UNAUTHORIZED,
        message: "Unauthorized",
        originalError: error,
        retryable: false,
        userMessage: "🔐 Phiên đăng nhập hết hạn, vui lòng đăng nhập lại",
      };

    case 429:
      return {
        code: ChatErrorCode.RATE_LIMIT,
        message: "Rate limit exceeded",
        originalError: error,
        retryable: true,
        userMessage: "⏳ Bạn gửi tin quá nhanh, vui lòng chờ chút...",
      };

    case 413:
      return {
        code: ChatErrorCode.FILE_TOO_LARGE,
        message: "File too large",
        originalError: error,
        retryable: false,
        userMessage: "📦 File quá lớn (tối đa 10MB)",
      };

    case 400:
      return {
        code: ChatErrorCode.VALIDATION_ERROR,
        message: data?.message || "Validation error",
        originalError: error,
        retryable: false,
        userMessage: `⚠️ ${data?.message || "Dữ liệu không hợp lệ"}`,
      };

    case 500:
    case 502:
    case 503:
      return {
        code: ChatErrorCode.SERVER_ERROR,
        message: "Server error",
        originalError: error,
        retryable: true,
        userMessage: "🔧 Hệ thống đang bận, đang thử lại...",
      };

    default:
      return {
        code: ChatErrorCode.UNKNOWN,
        message: data?.message || "Unknown error",
        originalError: error,
        retryable: false,
        userMessage: "❌ Có lỗi xảy ra, vui lòng thử lại",
      };
  }
};

/**
 * Log lỗi lên Sentry với context đầy đủ
 */
export const logChatError = (
  error: ChatError,
  context: {
    action: string;
    conversationId?: string;
    messageId?: string;
    userId?: string;
    [key: string]: any;
  }
) => {
  Sentry.withScope((scope) => {
    scope.setTag("feature", "chat");
    scope.setTag("error_code", error.code);
    scope.setContext("chat_context", context);

    if (error.retryable) {
      scope.setLevel("warning");
    } else {
      scope.setLevel("error");
    }

    Sentry.captureException(error.originalError || new Error(error.message), {
      contexts: {
        chat: context,
      },
    });
  });
};

/**
 * Hiển thị lỗi cho user (với debounce để tránh spam)
 */
const toastCache = new Map<string, number>();
const TOAST_DEBOUNCE_MS = 3000;

export const showChatError = (error: ChatError, silent = false) => {
  if (silent) return;

  const now = Date.now();
  const lastShown = toastCache.get(error.code);

  // Debounce: Không hiện toast trùng trong 3s
  if (lastShown && now - lastShown < TOAST_DEBOUNCE_MS) {
    return;
  }

  toastCache.set(error.code, now);

  if (error.retryable) {
    toast.warning(error.userMessage);
  } else {
    toast.error(error.userMessage);
  }
};

/**
 * Handle lỗi đầy đủ: parse + log + show
 */
export const handleChatError = (
  error: any,
  context: {
    action: string;
    conversationId?: string;
    messageId?: string;
    [key: string]: any;
  },
  options: {
    silent?: boolean;
    skipSentry?: boolean;
  } = {}
): ChatError => {
  const chatError = parseChatError(error);

  // Log to console in dev
  if (process.env.NODE_ENV === "development") {
    console.error(`[ChatError] ${context.action}:`, {
      error: chatError,
      context,
    });
  }

  // Log to Sentry
  if (!options.skipSentry) {
    logChatError(chatError, context);
  }

  // Show to user
  if (!options.silent) {
    showChatError(chatError);
  }

  return chatError;
};
