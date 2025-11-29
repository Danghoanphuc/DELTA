#!/usr/bin/env node
/**
 * Reset tất cả circuit breakers để workers hoạt động lại
 * Chạy khi Redis đã phục hồi hoặc đã tạo instance mới
 *
 * Chạy: node scripts/reset-circuit-breakers.js
 */

import { resetAllCircuitBreakers } from "../src/infrastructure/queue/circuit-breaker.js";

console.log("🔄 Resetting all circuit breakers...");

try {
  resetAllCircuitBreakers();
  console.log("✅ All circuit breakers have been reset");
  console.log("✅ Workers will resume processing jobs");
  process.exit(0);
} catch (err) {
  console.error("❌ Failed to reset circuit breakers:", err.message);
  process.exit(1);
}
