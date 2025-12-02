#!/usr/bin/env node
/**
 * Restore circuit breaker từ backup
 *
 * Chạy: node scripts/restore-circuit-breaker.js
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

console.log("🔄 Restoring circuit breaker from backup...");

async function restore() {
  try {
    // Check if backup exists
    try {
      await fs.access(BACKUP_FILE);
    } catch {
      console.error("❌ No backup file found!");
      console.log("   Backup should be at: circuit-breaker.js.backup");
      process.exit(1);
    }

    // Restore from backup
    const backup = await fs.readFile(BACKUP_FILE, "utf-8");
    await fs.writeFile(CIRCUIT_BREAKER_FILE, backup);

    console.log("✅ Circuit breaker restored from backup");
    console.log("✅ Restart your server/workers to apply changes");

    // Clean up backup
    await fs.unlink(BACKUP_FILE);
    console.log("✅ Backup file removed");
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  }
}

restore();
