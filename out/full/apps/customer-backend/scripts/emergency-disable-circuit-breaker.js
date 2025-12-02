#!/usr/bin/env node
/**
 * EMERGENCY: Tạm thời disable circuit breaker
 * Chỉ dùng khi cần workers hoạt động ngay lập tức
 *
 * Chạy: node scripts/emergency-disable-circuit-breaker.js
 */

import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CIRCUIT_BREAKER_FILE = join(
  __dirname,
  "../src/infrastructure/queue/circuit-breaker.js"
);
const BACKUP_FILE = join(
  __dirname,
  "../src/infrastructure/queue/circuit-breaker.js.backup"
);

console.log("⚠️  EMERGENCY MODE: Disabling circuit breaker");
console.log("⚠️  This is temporary - you should fix the root cause!");
console.log("");

async function disableCircuitBreaker() {
  try {
    // Backup original file
    const original = await fs.readFile(CIRCUIT_BREAKER_FILE, "utf-8");
    await fs.writeFile(BACKUP_FILE, original);
    console.log("✅ Backed up original circuit-breaker.js");

    // Create disabled version
    const disabled = `// EMERGENCY MODE - Circuit breaker disabled
import { Logger } from "../../shared/utils/index.js";

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    Logger.warn(\`⚠️  Circuit breaker [\${name}] is DISABLED (emergency mode)\`);
  }

  async execute(fn) {
    // Just execute without any circuit breaking
    return await fn();
  }

  onSuccess() {}
  onFailure() {}
  
  getState() {
    return { state: 'DISABLED', failureCount: 0 };
  }

  reset() {
    Logger.info(\`Circuit breaker [\${this.name}] reset (but still disabled)\`);
  }
}

const breakers = new Map();

export function getCircuitBreaker(name, options) {
  if (!breakers.has(name)) {
    breakers.set(name, new CircuitBreaker(name, options));
  }
  return breakers.get(name);
}

export function resetAllCircuitBreakers() {
  Logger.info('All circuit breakers reset (but still disabled)');
}
`;

    await fs.writeFile(CIRCUIT_BREAKER_FILE, disabled);
    console.log("✅ Circuit breaker disabled");
    console.log("");
    console.log("⚠️  IMPORTANT:");
    console.log("   1. Restart your server/workers");
    console.log("   2. Fix the root cause (Redis limit, etc)");
    console.log(
      "   3. Re-enable circuit breaker with: node scripts/restore-circuit-breaker.js"
    );
    console.log("");
    console.log("📁 Backup saved to: circuit-breaker.js.backup");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}

disableCircuitBreaker();
