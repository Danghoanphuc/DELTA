#!/usr/bin/env node
// Simple build script for customer-backend
// Since most files are .js, we just copy them to dist

import { cpSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
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

// Copy all source files to dist
console.log("[Build] Copying source files...");
cpSync(srcDir, distDir, { recursive: true });

console.log("[Build] ✅ Build completed successfully!");
