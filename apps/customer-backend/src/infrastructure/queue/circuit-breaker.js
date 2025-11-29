// apps/customer-backend/src/infrastructure/queue/circuit-breaker.js
import { Logger } from "../../shared/utils/index.js";

/**
 * Circuit Breaker đơn giản để ngăn worker spam Redis khi gặp lỗi
 */
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 phút
    this.halfOpenAttempts = options.halfOpenAttempts || 1;

    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  async execute(fn) {
    // Nếu circuit OPEN, kiểm tra xem đã đến lúc thử lại chưa
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(
          `Circuit breaker [${this.name}] is OPEN. Next attempt at ${new Date(
            this.nextAttemptTime
          ).toISOString()}`
        );
      }
      // Chuyển sang HALF_OPEN để thử lại
      this.state = "HALF_OPEN";
      Logger.info(`🔄 Circuit breaker [${this.name}] entering HALF_OPEN state`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  onSuccess() {
    if (this.state === "HALF_OPEN") {
      Logger.info(
        `✅ Circuit breaker [${this.name}] recovered, closing circuit`
      );
    }
    this.failureCount = 0;
    this.state = "CLOSED";
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  onFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    // Chỉ mở circuit nếu là lỗi Redis
    const isRedisError =
      error.message?.includes("max requests limit") ||
      error.message?.includes("ECONNREFUSED") ||
      error.code === "ECONNREFUSED";

    if (!isRedisError) {
      // Lỗi khác (network, API) không trigger circuit breaker
      return;
    }

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      Logger.error(
        `🚨 Circuit breaker [${this.name}] OPENED after ${this.failureCount} failures. ` +
          `Will retry at ${new Date(this.nextAttemptTime).toISOString()}`
      );
    } else {
      Logger.warn(
        `⚠️ Circuit breaker [${this.name}] failure ${this.failureCount}/${this.failureThreshold}`
      );
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    Logger.info(`🔄 Circuit breaker [${this.name}] manually reset`);
  }
}

// Singleton instances cho từng worker
const breakers = new Map();

export function getCircuitBreaker(name, options) {
  if (!breakers.has(name)) {
    breakers.set(name, new CircuitBreaker(name, options));
  }
  return breakers.get(name);
}

export function resetAllCircuitBreakers() {
  breakers.forEach((breaker) => breaker.reset());
  Logger.info("🔄 All circuit breakers reset");
}
