// apps/customer-backend/src/modules/admin/circuit-breaker.controller.js
import {
  resetAllCircuitBreakers,
  getCircuitBreaker,
} from "../../infrastructure/queue/circuit-breaker.js";
import { Logger } from "../../shared/utils/index.js";

/**
 * Admin controller để quản lý circuit breakers
 */
export class CircuitBreakerController {
  /**
   * GET /admin/circuit-breakers/status
   * Xem trạng thái tất cả circuit breakers
   */
  static async getStatus(req, res) {
    try {
      const breakers = ["url-preview-worker", "notification-worker"];

      const status = breakers.map((name) => {
        const breaker = getCircuitBreaker(name);
        return {
          name,
          ...breaker.getState(),
        };
      });

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      Logger.error(`[Circuit Breaker] Get status failed: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /admin/circuit-breakers/reset
   * Reset tất cả circuit breakers
   */
  static async resetAll(req, res) {
    try {
      resetAllCircuitBreakers();

      Logger.info("[Circuit Breaker] All circuit breakers reset by admin");

      res.json({
        success: true,
        message: "All circuit breakers have been reset. Workers will resume.",
      });
    } catch (error) {
      Logger.error(`[Circuit Breaker] Reset failed: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /admin/circuit-breakers/:name/reset
   * Reset một circuit breaker cụ thể
   */
  static async resetOne(req, res) {
    try {
      const { name } = req.params;
      const breaker = getCircuitBreaker(name);

      if (!breaker) {
        return res.status(404).json({
          success: false,
          error: `Circuit breaker '${name}' not found`,
        });
      }

      breaker.reset();

      Logger.info(`[Circuit Breaker] Reset ${name} by admin`);

      res.json({
        success: true,
        message: `Circuit breaker '${name}' has been reset`,
      });
    } catch (error) {
      Logger.error(`[Circuit Breaker] Reset failed: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
