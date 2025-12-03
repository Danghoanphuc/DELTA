#!/usr/bin/env node
// Build script for customer-backend
// Compiles TypeScript files and copies other assets

import { execSync } from "child_process";
import { cpSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const srcDir = join(rootDir, "src");
const distDir = join(rootDir, "dist");

console.log("[Build] Starting customer-backend build...");

// Create dist directory
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Compile TypeScript
console.log("[Build] Compiling TypeScript...");
try {
  execSync("tsc", { cwd: rootDir, stdio: "inherit" });
  console.log("[Build] ✅ TypeScript compilation completed");
} catch (error) {
  console.error("[Build] ❌ TypeScript compilation failed");
  process.exit(1);
}

// Copy non-TS files (like .js, .json, etc.) that weren't compiled
console.log("[Build] Copying additional assets...");
function copyNonTsFiles(src, dest) {
  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      if (!existsSync(destPath)) {
        mkdirSync(destPath, { recursive: true });
      }
      copyNonTsFiles(srcPath, destPath);
    } else {
      const ext = extname(entry);
      // Copy files that are not .ts (but keep .js files)
      if (ext !== ".ts") {
        cpSync(srcPath, destPath);
      }
    }
  }
}

copyNonTsFiles(srcDir, distDir);

console.log("[Build] ✅ Build completed successfully!");
