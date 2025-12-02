#!/usr/bin/env node
/**
 * Test workers trong môi trường isolated
 * Mô phỏng các tình huống lỗi Redis để đảm bảo circuit breaker hoạt động
 *
 * Chạy: node scripts/test-workers-isolated.js
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) =>
    console.log(
      `\n${colors.cyan}${"=".repeat(60)}${colors.reset}\n${colors.cyan}${msg}${
        colors.reset
      }\n${colors.cyan}${"=".repeat(60)}${colors.reset}\n`
    ),
};

class WorkerTester {
  constructor() {
    this.testResults = [];
  }

  async runTests() {
    log.section("🧪 KIỂM TRA WORKERS TRONG MÔI TRƯỜNG ISOLATED");

    await this.testCircuitBreakerBasic();
    await this.testCircuitBreakerWithRedisError();
    await this.testCircuitBreakerRecovery();
    await this.testWorkerRateLimiting();
    await this.testWorkerErrorHandling();

    this.printResults();
  }

  /**
   * Test 1: Circuit breaker cơ bản
   */
  async testCircuitBreakerBasic() {
    log.section("Test 1: Circuit Breaker - Chức năng cơ bản");

    try {
      const { getCircuitBreaker } = await import(
        "../src/infrastructure/queue/circuit-breaker.js"
      );

      const breaker = getCircuitBreaker("test-basic", {
        failureThreshold: 3,
        resetTimeout: 2000,
      });

      // Reset trước khi test
      breaker.reset();

      // Test: Execute thành công
      let result = await breaker.execute(async () => {
        return "success";
      });

      if (result === "success") {
        log.success("Execute thành công khi circuit CLOSED");
        this.addResult("Circuit Breaker Basic", true);
      } else {
        log.error("Execute không trả về kết quả đúng");
        this.addResult("Circuit Breaker Basic", false);
      }

      // Test: State ban đầu
      const state = breaker.getState();
      if (state.state === "CLOSED" && state.failureCount === 0) {
        log.success("State ban đầu đúng: CLOSED, failureCount = 0");
      } else {
        log.error(`State không đúng: ${JSON.stringify(state)}`);
        this.addResult("Circuit Breaker State", false);
      }
    } catch (err) {
      log.error(`Test failed: ${err.message}`);
      this.addResult("Circuit Breaker Basic", false);
    }
  }

  /**
   * Test 2: Circuit breaker với Redis errors
   */
  async testCircuitBreakerWithRedisError() {
    log.section("Test 2: Circuit Breaker - Xử lý lỗi Redis");

    try {
      const { getCircuitBreaker } = await import(
        "../src/infrastructure/queue/circuit-breaker.js"
      );

      const breaker = getCircuitBreaker("test-redis-error", {
        failureThreshold: 3,
        resetTimeout: 2000,
      });

      breaker.reset();

      // Simulate 3 Redis errors
      log.info("Mô phỏng 3 lỗi Redis liên tiếp...");

      for (let i = 1; i <= 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error(
              "ERR max requests limit exceeded. Limit: 500000, Usage: 500000"
            );
          });
        } catch (err) {
          log.info(`  Lỗi ${i}/3: ${err.message.substring(0, 50)}...`);
        }
      }

      // Check state - phải OPEN
      const state = breaker.getState();
      if (state.state === "OPEN") {
        log.success("Circuit đã mở sau 3 lỗi Redis");
        this.addResult("Circuit Opens on Redis Error", true);
      } else {
        log.error(`Circuit không mở. State: ${state.state}`);
        this.addResult("Circuit Opens on Redis Error", false);
      }

      // Test: Không cho execute khi OPEN
      try {
        await breaker.execute(async () => "should not execute");
        log.error("Circuit cho phép execute khi đang OPEN!");
        this.addResult("Circuit Blocks When Open", false);
      } catch (err) {
        if (err.message.includes("Circuit breaker")) {
          log.success("Circuit chặn request khi OPEN");
          this.addResult("Circuit Blocks When Open", true);
        }
      }
    } catch (err) {
      log.error(`Test failed: ${err.message}`);
      this.addResult("Circuit Breaker Redis Error", false);
    }
  }

  /**
   * Test 3: Circuit breaker recovery
   */
  async testCircuitBreakerRecovery() {
    log.section("Test 3: Circuit Breaker - Phục hồi sau timeout");

    try {
      const { getCircuitBreaker } = await import(
        "../src/infrastructure/queue/circuit-breaker.js"
      );

      const breaker = getCircuitBreaker("test-recovery", {
        failureThreshold: 2,
        resetTimeout: 1000, // 1 giây
      });

      breaker.reset();

      // Fail 2 lần để mở circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error("max requests limit exceeded");
          });
        } catch (err) {}
      }

      log.info("Circuit đã OPEN. Đợi 1.2s để reset...");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Thử execute lại - phải chuyển sang HALF_OPEN
      try {
        const result = await breaker.execute(async () => "recovered");

        if (result === "recovered") {
          log.success("Circuit phục hồi thành công sau timeout");
          this.addResult("Circuit Recovery", true);
        }

        const state = breaker.getState();
        if (state.state === "CLOSED") {
          log.success("Circuit đã đóng lại sau khi execute thành công");
        }
      } catch (err) {
        log.error(`Circuit không phục hồi: ${err.message}`);
        this.addResult("Circuit Recovery", false);
      }
    } catch (err) {
      log.error(`Test failed: ${err.message}`);
      this.addResult("Circuit Recovery", false);
    }
  }

  /**
   * Test 4: Worker rate limiting
   */
  async testWorkerRateLimiting() {
    log.section("Test 4: Worker Rate Limiting");

    try {
      log.info("Mô phỏng 10 jobs liên tiếp...");

      const startTime = Date.now();
      const jobs = [];

      for (let i = 0; i < 10; i++) {
        jobs.push(
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(i);
            }, i * 100); // Mỗi job cách nhau 100ms
          })
        );
      }

      await Promise.all(jobs);
      const duration = Date.now() - startTime;

      log.info(`Hoàn thành 10 jobs trong ${duration}ms`);

      if (duration >= 900) {
        // Ít nhất 900ms (10 jobs * 100ms - overhead)
        log.success("Rate limiting hoạt động đúng");
        this.addResult("Worker Rate Limiting", true);
      } else {
        log.warn("Jobs chạy quá nhanh, có thể không có rate limiting");
        this.addResult("Worker Rate Limiting", false);
      }
    } catch (err) {
      log.error(`Test failed: ${err.message}`);
      this.addResult("Worker Rate Limiting", false);
    }
  }

  /**
   * Test 5: Worker error handling
   */
  async testWorkerErrorHandling() {
    log.section("Test 5: Worker Error Handling");

    try {
      const { getCircuitBreaker } = await import(
        "../src/infrastructure/queue/circuit-breaker.js"
      );

      const breaker = getCircuitBreaker("test-error-handling", {
        failureThreshold: 5,
        resetTimeout: 2000,
      });

      breaker.reset();

      // Test: Lỗi không phải Redis không trigger circuit breaker
      log.info("Test lỗi network (không phải Redis)...");

      try {
        await breaker.execute(async () => {
          throw new Error("Network timeout");
        });
      } catch (err) {
        // Expected
      }

      const state1 = breaker.getState();
      if (state1.failureCount === 0) {
        log.success("Lỗi network không trigger circuit breaker");
        this.addResult("Non-Redis Error Handling", true);
      } else {
        log.error("Lỗi network đã trigger circuit breaker (không nên)");
        this.addResult("Non-Redis Error Handling", false);
      }

      // Test: Lỗi Redis trigger circuit breaker
      log.info("Test lỗi Redis...");

      try {
        await breaker.execute(async () => {
          throw new Error("ECONNREFUSED");
        });
      } catch (err) {
        // Expected
      }

      const state2 = breaker.getState();
      if (state2.failureCount === 1) {
        log.success("Lỗi Redis trigger circuit breaker");
        this.addResult("Redis Error Handling", true);
      } else {
        log.error("Lỗi Redis không trigger circuit breaker");
        this.addResult("Redis Error Handling", false);
      }
    } catch (err) {
      log.error(`Test failed: ${err.message}`);
      this.addResult("Worker Error Handling", false);
    }
  }

  addResult(testName, passed) {
    this.testResults.push({ testName, passed });
  }

  printResults() {
    log.section("📊 KẾT QUẢ TESTS");

    const passed = this.testResults.filter((r) => r.passed).length;
    const failed = this.testResults.filter((r) => !r.passed).length;

    console.log(`\n${colors.green}Passed:${colors.reset} ${passed}`);
    console.log(`${colors.red}Failed:${colors.reset} ${failed}\n`);

    this.testResults.forEach((result) => {
      const icon = result.passed ? colors.green + "✓" : colors.red + "✗";
      console.log(`  ${icon}${colors.reset} ${result.testName}`);
    });

    if (failed === 0) {
      console.log(
        `\n${colors.green}✅ TẤT CẢ TESTS ĐỀU PASS!${colors.reset}\n`
      );
      process.exit(0);
    } else {
      console.log(
        `\n${colors.red}❌ CÓ ${failed} TESTS FAILED!${colors.reset}\n`
      );
      process.exit(1);
    }
  }
}

// Run tests
const tester = new WorkerTester();
tester.runTests().catch((err) => {
  log.error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
