// src/migrations/run-migrations.js
// Migration runner script

import mongoose from "mongoose";
import * as migration001 from "./001-create-pod-catalog-models.js";
import * as migration002 from "./002-enhance-existing-models.js";

const migrations = [
  { name: "001-create-pod-catalog-models", module: migration001 },
  { name: "002-enhance-existing-models", module: migration002 },
];

async function runMigrations() {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag";

  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🚀 Starting migrations...\n");

    for (const migration of migrations) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Running: ${migration.name}`);
      console.log("=".repeat(60));

      try {
        await migration.module.up();
        console.log(`✅ ${migration.name} completed successfully`);
      } catch (error) {
        console.error(`❌ ${migration.name} failed:`, error);
        throw error;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ All migrations completed successfully!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Migration process failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

async function rollbackMigrations() {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag";

  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🔄 Starting rollback...\n");

    // Rollback in reverse order
    for (const migration of migrations.reverse()) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Rolling back: ${migration.name}`);
      console.log("=".repeat(60));

      try {
        await migration.module.down();
        console.log(`✅ ${migration.name} rolled back successfully`);
      } catch (error) {
        console.error(`❌ ${migration.name} rollback failed:`, error);
        throw error;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ All migrations rolled back successfully!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Rollback process failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Parse command line arguments
const command = process.argv[2];

if (command === "up") {
  runMigrations();
} else if (command === "down") {
  rollbackMigrations();
} else {
  console.log(`
Usage:
  node run-migrations.js up      # Run all migrations
  node run-migrations.js down    # Rollback all migrations
  `);
  process.exit(1);
}
