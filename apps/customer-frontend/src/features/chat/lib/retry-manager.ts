// apps/customer-frontend/src/features/chat/lib/retry-manager.ts
/**
 * 🔥 RETRY MANAGER - EXPONENTIAL BACKOFF WITH JITTER
 * Quản lý retry logic thông minh cho chat messages
 */

import { ChatError, ChatErrorCode } from "./error-handler";

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
  backoffMultiplier: number;
  jitterFactor: number; // 0-1, thêm random để tránh thundering herd
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1s
  maxDelay: 10000, // 10s
  backoffMultiplier: 2,
  jitterFactor: 0.3,
};

/**
 * Tính delay cho lần retry tiếp theo (exponential backoff + jitter)
 */
export const calculateRetryDelay = (
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number => {
  // Exponential backoff: baseDelay * (multiplier ^ attempt)
  const exponentialDelay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  );

  // Add jitter: random từ (1 - jitter) đến (1 + jitter)
  const jitter = 1 + (Math.random() * 2 - 1) * config.jitterFactor;
  const delayWithJitter = exponentialDelay * jitter;

  return Math.floor(delayWithJitter);
};

/**
 * Kiểm tra xem error có nên retry không
 */
export const shouldRetry = (
  error: ChatError,
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): boolean => {
  // Đã vượt quá số lần retry
  if (attempt >= config.maxRetries) {
    return false;
  }

  // Chỉ retry những lỗi có thể retry
  if (!error.retryable) {
    return false;
  }

  // Không retry những lỗi này
  const nonRetryableCodes = [
    ChatErrorCode.UNAUTHORIZED,
    ChatErrorCode.VALIDATION_ERROR,
    ChatErrorCode.FILE_TOO_LARGE,
    ChatErrorCode.UNSUPPORTED_FILE,
  ];

  return !nonRetryableCodes.includes(error.code);
};

/**
 * Sleep helper
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry wrapper với exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, delay: number, error: ChatError) => void
): Promise<T> {
  let lastError: ChatError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Import dynamically để tránh circular dependency
      const { parseChatError } = await import("./error-handler");
      const chatError = parseChatError(error);
      lastError = chatError;

      // Kiểm tra có nên retry không
      if (!shouldRetry(chatError, attempt, config)) {
        throw chatError;
      }

      // Tính delay và chờ
      const delay = calculateRetryDelay(attempt, config);

      if (onRetry) {
        onRetry(attempt + 1, delay, chatError);
      }

      await sleep(delay);
    }
  }

  // Nếu đến đây nghĩa là đã hết retry
  throw lastError;
}

/**
 * Retry manager class để quản lý nhiều retry tasks
 */
export class RetryManager {
  private tasks = new Map<string, AbortController>();
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute task với retry, có thể cancel
   */
  async execute<T>(
    taskId: string,
    fn: () => Promise<T>,
    onRetry?: (attempt: number, delay: number, error: ChatError) => void
  ): Promise<T> {
    // Cancel task cũ nếu có
    this.cancel(taskId);

    // Tạo abort controller mới
    const controller = new AbortController();
    this.tasks.set(taskId, controller);

    try {
      const result = await retryWithBackoff(
        async () => {
          // Check nếu đã bị cancel
          if (controller.signal.aborted) {
            throw new Error("Task cancelled");
          }
          return await fn();
        },
        this.config,
        onRetry
      );

      this.tasks.delete(taskId);
      return result;
    } catch (error) {
      this.tasks.delete(taskId);
      throw error;
    }
  }

  /**
   * Cancel một task đang retry
   */
  cancel(taskId: string): void {
    const controller = this.tasks.get(taskId);
    if (controller) {
      controller.abort();
      this.tasks.delete(taskId);
    }
  }

  /**
   * Cancel tất cả tasks
   */
  cancelAll(): void {
    this.tasks.forEach((controller) => controller.abort());
    this.tasks.clear();
  }

  /**
   * Kiểm tra task có đang chạy không
   */
  isRunning(taskId: string): boolean {
    return this.tasks.has(taskId);
  }
}
