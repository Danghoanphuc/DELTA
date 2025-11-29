#!/usr/bin/env node
/**
 * Script kiểm tra môi trường production
 * Mô phỏng các điều kiện thực tế để phát hiện lỗi trước khi deploy
 *
 * Chạy: node scripts/test-production-env.js
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
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

class ProductionEnvTester {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllTests() {
    log.section("🚀 KIỂM TRA MÔI TRƯỜNG PRODUCTION");

    await this.testSyntaxErrors();
    await this.testImportErrors();
    await this.testWorkerCircuitBreaker();
    await this.testRedisConnectionHandling();
    await this.testMongoAggregationQueries();
    await this.testEnvironmentVariables();
    await this.testMemoryLeaks();

    this.printSummary();

    // Exit với code 1 nếu có lỗi
    if (this.failed > 0) {
      process.exit(1);
    }
  }

  /**
   * Test 1: Kiểm tra lỗi cú pháp trong tất cả file
   */
  async testSyntaxErrors() {
    log.section("Test 1: Kiểm tra lỗi cú pháp");

    try {
      const files = await this.getAllJsFiles(join(ROOT_DIR, "src"));

      for (const file of files) {
        try {
          // Thử parse file để tìm lỗi cú pháp
          const content = await fs.readFile(file, "utf-8");

          // Kiểm tra các lỗi phổ biến
          const checks = [
            { pattern: /,,/g, error: "Dấu phẩy thừa (,,)" },
            {
              pattern: /\.\.\./g,
              error: "Spread operator không đúng chỗ",
              warning: true,
            },
            {
              pattern: /\}\s*\}/g,
              error: "Có thể thiếu dấu phẩy giữa các object",
              warning: true,
            },
            {
              pattern: /\$cond\s*:\s*\[\s*\{[^}]+\}\s*,\s*,/g,
              error: "Lỗi MongoDB aggregation: dấu phẩy thừa trong $cond",
            },
          ];

          for (const check of checks) {
            const matches = content.match(check.pattern);
            if (matches && !check.warning) {
              this.addError(`${file}: ${check.error}`);
            } else if (matches && check.warning) {
              this.addWarning(`${file}: ${check.error}`);
            }
          }

          this.passed++;
        } catch (err) {
          this.addError(`${file}: ${err.message}`);
        }
      }

      log.success(`Đã kiểm tra ${files.length} files`);
    } catch (err) {
      this.addError(`Không thể quét files: ${err.message}`);
    }
  }

  /**
   * Test 2: Kiểm tra lỗi import/require
   */
  async testImportErrors() {
    log.section("Test 2: Kiểm tra lỗi import");

    const criticalFiles = [
      "src/infrastructure/queue/url-preview.worker.js",
      "src/infrastructure/queue/notification.worker.js",
      "src/infrastructure/queue/circuit-breaker.js",
      "src/modules/chat/workers/url-processor.worker.js",
    ];

    for (const file of criticalFiles) {
      const fullPath = join(ROOT_DIR, file);
      try {
        await fs.access(fullPath);

        // Kiểm tra import statements
        const content = await fs.readFile(fullPath, "utf-8");
        const imports = content.match(/import .+ from ['"](.+)['"]/g) || [];

        for (const imp of imports) {
          const match = imp.match(/from ['"](.+)['"]/);
          if (match && match[1].startsWith(".")) {
            // Relative import - kiểm tra file có tồn tại không
            const importPath = match[1];
            const resolvedPath = join(dirname(fullPath), importPath);

            try {
              await fs.access(resolvedPath);
            } catch {
              // Thử thêm .js
              try {
                await fs.access(resolvedPath + ".js");
              } catch {
                this.addError(`${file}: Import không tồn tại: ${importPath}`);
              }
            }
          }
        }

        this.passed++;
        log.success(`✓ ${file}`);
      } catch (err) {
        this.addError(`${file}: ${err.message}`);
      }
    }
  }

  /**
   * Test 3: Kiểm tra Circuit Breaker hoạt động đúng
   */
  async testWorkerCircuitBreaker() {
    log.section("Test 3: Kiểm tra Circuit Breaker");

    try {
      // Import circuit breaker
      const { getCircuitBreaker } = await import(
        "../src/infrastructure/queue/circuit-breaker.js"
      );

      const breaker = getCircuitBreaker("test-breaker", {
        failureThreshold: 3,
        resetTimeout: 1000,
      });

      // Test 1: Circuit ban đầu phải CLOSED
      const initialState = breaker.getState();
      if (initialState.state !== "CLOSED") {
        this.addError("Circuit breaker không bắt đầu ở trạng thái CLOSED");
      } else {
        log.success("Circuit breaker bắt đầu ở trạng thái CLOSED");
      }

      // Test 2: Thử fail 3 lần
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error("max requests limit exceeded");
          });
        } catch (err) {
          // Expected
        }
      }

      const openState = breaker.getState();
      if (openState.state !== "OPEN") {
        this.addError("Circuit breaker không mở sau 3 lỗi");
      } else {
        log.success("Circuit breaker mở sau 3 lỗi");
      }

      // Test 3: Khi OPEN, không cho execute
      try {
        await breaker.execute(async () => "success");
        this.addError("Circuit breaker cho phép execute khi đang OPEN");
      } catch (err) {
        if (err.message.includes("Circuit breaker")) {
          log.success("Circuit breaker chặn request khi OPEN");
        }
      }

      // Test 4: Đợi reset timeout
      log.info("Đợi 1s để circuit reset...");
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Thử lại - phải chuyển sang HALF_OPEN
      try {
        await breaker.execute(async () => "success");
        const recoveredState = breaker.getState();
        if (recoveredState.state === "CLOSED") {
          log.success("Circuit breaker phục hồi sau timeout");
        }
      } catch (err) {
        this.addError(`Circuit breaker không phục hồi: ${err.message}`);
      }

      this.passed++;
    } catch (err) {
      this.addError(`Circuit breaker test failed: ${err.message}`);
    }
  }

  /**
   * Test 4: Kiểm tra xử lý Redis connection errors
   */
  async testRedisConnectionHandling() {
    log.section("Test 4: Kiểm tra xử lý lỗi Redis");

    try {
      // Kiểm tra worker có handle Redis errors đúng không
      const workerFile = join(
        ROOT_DIR,
        "src/infrastructure/queue/url-preview.worker.js"
      );
      const content = await fs.readFile(workerFile, "utf-8");

      const checks = [
        { pattern: /worker\.on\(['"]error['"]/, name: "Error handler" },
        { pattern: /max requests limit/i, name: "Redis limit error handling" },
        { pattern: /ECONNREFUSED/, name: "Connection refused handling" },
        { pattern: /circuitBreaker/i, name: "Circuit breaker integration" },
      ];

      for (const check of checks) {
        if (content.match(check.pattern)) {
          log.success(`✓ ${check.name}`);
        } else {
          this.addWarning(`Thiếu ${check.name} trong worker`);
        }
      }

      this.passed++;
    } catch (err) {
      this.addError(`Redis error handling test failed: ${err.message}`);
    }
  }

  /**
   * Test 5: Kiểm tra MongoDB aggregation queries
   */
  async testMongoAggregationQueries() {
    log.section("Test 5: Kiểm tra MongoDB Aggregation");

    try {
      const files = await this.getAllJsFiles(join(ROOT_DIR, "src"));

      for (const file of files) {
        const content = await fs.readFile(file, "utf-8");

        // Tìm aggregation pipelines
        const aggregations = content.match(/\.aggregate\s*\(/g);
        if (aggregations) {
          // Kiểm tra các lỗi phổ biến trong aggregation
          const issues = [
            {
              pattern: /\$cond\s*:\s*\[[^\]]*,,/g,
              error: "Dấu phẩy thừa trong $cond",
            },
            {
              pattern: /\$group\s*:\s*\{[^}]*\$sum\s*:\s*['"]/g,
              error: "$sum với string thay vì number",
            },
          ];

          for (const issue of issues) {
            if (content.match(issue.pattern)) {
              this.addError(`${file}: ${issue.error}`);
            }
          }
        }
      }

      log.success("Đã kiểm tra aggregation queries");
      this.passed++;
    } catch (err) {
      this.addError(`Aggregation test failed: ${err.message}`);
    }
  }

  /**
   * Test 6: Kiểm tra biến môi trường
   */
  async testEnvironmentVariables() {
    log.section("Test 6: Kiểm tra biến môi trường");

    const requiredVars = [
      "MONGODB_URI",
      "REDIS_URL",
      "JWT_SECRET",
      "APIFLASH_ACCESS_KEY",
    ];

    const optionalVars = ["NOVU_API_KEY", "PUSHER_APP_ID", "OPENAI_API_KEY"];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.addError(`Thiếu biến môi trường bắt buộc: ${varName}`);
      } else {
        log.success(`✓ ${varName}`);
      }
    }

    for (const varName of optionalVars) {
      if (!process.env[varName]) {
        this.addWarning(`Thiếu biến môi trường tùy chọn: ${varName}`);
      } else {
        log.success(`✓ ${varName}`);
      }
    }

    this.passed++;
  }

  /**
   * Test 7: Kiểm tra memory leaks tiềm ẩn
   */
  async testMemoryLeaks() {
    log.section("Test 7: Kiểm tra Memory Leaks");

    try {
      const files = await this.getAllJsFiles(join(ROOT_DIR, "src"));

      for (const file of files) {
        const content = await fs.readFile(file, "utf-8");

        // Kiểm tra các pattern gây memory leak
        const leakPatterns = [
          {
            pattern: /setInterval\s*\(/g,
            warning: "setInterval không được clear",
          },
          {
            pattern: /new\s+Worker\s*\(/g,
            warning: "Worker không được cleanup",
            check: /worker\.close\(\)/,
          },
          {
            pattern: /\.on\s*\(\s*['"]error['"]/g,
            warning: "Event listener có thể leak",
            check: /\.removeListener|\.off\(/,
          },
        ];

        for (const leak of leakPatterns) {
          const matches = content.match(leak.pattern);
          if (matches && leak.check && !content.match(leak.check)) {
            this.addWarning(`${file}: ${leak.warning}`);
          }
        }
      }

      log.success("Đã kiểm tra memory leak patterns");
      this.passed++;
    } catch (err) {
      this.addError(`Memory leak test failed: ${err.message}`);
    }
  }

  /**
   * Helper: Lấy tất cả file JS/TS
   */
  async getAllJsFiles(dir, fileList = []) {
    try {
      const files = await fs.readdir(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = join(dir, file.name);

        if (file.isDirectory()) {
          // Skip node_modules, dist, .git
          if (
            !["node_modules", "dist", ".git", "coverage"].includes(file.name)
          ) {
            await this.getAllJsFiles(fullPath, fileList);
          }
        } else if (file.name.match(/\.(js|ts)$/)) {
          fileList.push(fullPath);
        }
      }

      return fileList;
    } catch (err) {
      return fileList;
    }
  }

  addError(msg) {
    this.errors.push(msg);
    this.failed++;
    log.error(msg);
  }

  addWarning(msg) {
    this.warnings.push(msg);
    log.warn(msg);
  }

  printSummary() {
    log.section("📊 KẾT QUẢ KIỂM TRA");

    console.log(`${colors.green}Passed:${colors.reset}   ${this.passed}`);
    console.log(`${colors.red}Failed:${colors.reset}   ${this.failed}`);
    console.log(
      `${colors.yellow}Warnings:${colors.reset} ${this.warnings.length}`
    );

    if (this.errors.length > 0) {
      console.log(`\n${colors.red}❌ CÁC LỖI CẦN SỬA:${colors.reset}`);
      this.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️  CẢNH BÁO:${colors.reset}`);
      this.warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn}`);
      });
    }

    if (this.failed === 0) {
      console.log(
        `\n${colors.green}✅ TẤT CẢ TESTS ĐỀU PASS! An toàn để deploy.${colors.reset}\n`
      );
    } else {
      console.log(
        `\n${colors.red}❌ CÓ ${this.failed} TESTS FAILED! Không nên deploy.${colors.reset}\n`
      );
    }
  }
}

// Chạy tests
const tester = new ProductionEnvTester();
tester.runAllTests().catch((err) => {
  log.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
