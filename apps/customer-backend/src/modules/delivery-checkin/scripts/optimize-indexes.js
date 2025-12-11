// apps/customer-backend/src/modules/delivery-checkin/scripts/optimize-indexes.js
/**
 * Database Index Optimization Script for Delivery Check-in
 *
 * Creates and optimizes indexes for:
 * - Geospatial queries (2dsphere index)
 * - Customer queries
 * - Shipper queries
 * - Date range queries
 *
 * **Feature: delivery-checkin-system, Property 26: Geospatial Bounds Query**
 * **Validates: Requirements 7.5, 7.6, 12.1**
 *
 * Run this script to ensure optimal query performance:
 * node apps/customer-backend/src/modules/delivery-checkin/scripts/optimize-indexes.js
 */

import mongoose from "mongoose";
import { config } from "../../../config/env.config.js";
import { DeliveryCheckin } from "../delivery-checkin.model.js";
import logger from "../../../infrastructure/logger.js";

// Create Logger wrapper for consistency with other modules
const Logger = {
  debug: (msg, ...args) => logger.debug(msg, ...args),
  info: (msg, ...args) => logger.info(msg, ...args),
  warn: (msg, ...args) => logger.warn(msg, ...args),
  error: (msg, ...args) => logger.error(msg, ...args),
  success: (msg, ...args) => logger.info(msg, ...args),
};

/**
 * Index definitions for optimal query performance
 */
const INDEXES = [
  // Primary geospatial index for map queries
  {
    name: "location_2dsphere",
    fields: { location: "2dsphere" },
    options: { background: true },
  },

  // Compound index for customer queries with date filtering
  {
    name: "customerId_checkinAt_isDeleted",
    fields: { customerId: 1, checkinAt: -1, isDeleted: 1 },
    options: { background: true },
  },

  // Compound index for shipper queries with date filtering
  {
    name: "shipperId_checkinAt_isDeleted",
    fields: { shipperId: 1, checkinAt: -1, isDeleted: 1 },
    options: { background: true },
  },

  // Compound index for order queries
  {
    name: "orderId_checkinAt_isDeleted",
    fields: { orderId: 1, checkinAt: -1, isDeleted: 1 },
    options: { background: true },
  },

  // Index for status filtering
  {
    name: "status_checkinAt",
    fields: { status: 1, checkinAt: -1 },
    options: { background: true },
  },

  // Index for date range queries
  {
    name: "checkinAt_isDeleted",
    fields: { checkinAt: -1, isDeleted: 1 },
    options: { background: true },
  },

  // Compound index for geospatial + customer queries
  {
    name: "customerId_location_2dsphere",
    fields: { customerId: 1, location: "2dsphere" },
    options: { background: true },
  },
];

/**
 * Create or update indexes
 */
async function createIndexes() {
  Logger.info("[IndexOptimizer] Starting index optimization...");

  const collection = DeliveryCheckin.collection;

  // Get existing indexes
  const existingIndexes = await collection.indexes();
  const existingIndexNames = existingIndexes.map((idx) => idx.name);

  Logger.info(
    `[IndexOptimizer] Found ${existingIndexes.length} existing indexes`
  );

  for (const indexDef of INDEXES) {
    try {
      if (existingIndexNames.includes(indexDef.name)) {
        Logger.debug(`[IndexOptimizer] Index ${indexDef.name} already exists`);
        continue;
      }

      Logger.info(`[IndexOptimizer] Creating index: ${indexDef.name}`);
      await collection.createIndex(indexDef.fields, {
        name: indexDef.name,
        ...indexDef.options,
      });
      Logger.success(`[IndexOptimizer] Created index: ${indexDef.name}`);
    } catch (error) {
      Logger.error(
        `[IndexOptimizer] Failed to create index ${indexDef.name}:`,
        error
      );
    }
  }

  Logger.success("[IndexOptimizer] Index optimization complete");
}

/**
 * Analyze index usage
 */
async function analyzeIndexUsage() {
  Logger.info("[IndexOptimizer] Analyzing index usage...");

  const collection = DeliveryCheckin.collection;

  // Get index stats
  const stats = await collection.aggregate([{ $indexStats: {} }]).toArray();

  Logger.info("[IndexOptimizer] Index Statistics:");
  for (const stat of stats) {
    Logger.info(
      `  - ${stat.name}: ${stat.accesses?.ops || 0} operations since ${
        stat.accesses?.since || "unknown"
      }`
    );
  }

  return stats;
}

/**
 * Drop unused indexes (indexes with 0 operations)
 * Use with caution!
 */
async function dropUnusedIndexes(dryRun = true) {
  Logger.info(
    `[IndexOptimizer] Checking for unused indexes (dryRun: ${dryRun})...`
  );

  const stats = await analyzeIndexUsage();
  const collection = DeliveryCheckin.collection;

  const unusedIndexes = stats.filter(
    (stat) =>
      stat.accesses?.ops === 0 &&
      stat.name !== "_id_" && // Never drop _id index
      !INDEXES.some((idx) => idx.name === stat.name) // Don't drop our defined indexes
  );

  if (unusedIndexes.length === 0) {
    Logger.info("[IndexOptimizer] No unused indexes found");
    return;
  }

  Logger.warn(
    `[IndexOptimizer] Found ${unusedIndexes.length} potentially unused indexes:`
  );
  for (const idx of unusedIndexes) {
    Logger.warn(`  - ${idx.name}`);

    if (!dryRun) {
      try {
        await collection.dropIndex(idx.name);
        Logger.success(`[IndexOptimizer] Dropped index: ${idx.name}`);
      } catch (error) {
        Logger.error(
          `[IndexOptimizer] Failed to drop index ${idx.name}:`,
          error
        );
      }
    }
  }
}

/**
 * Get query explain plan for common queries
 */
async function explainQueries() {
  Logger.info("[IndexOptimizer] Explaining common queries...");

  const testCustomerId = new mongoose.Types.ObjectId();
  const testShipperId = new mongoose.Types.ObjectId();

  const queries = [
    {
      name: "Customer check-ins",
      query: { customerId: testCustomerId, isDeleted: false },
      sort: { checkinAt: -1 },
    },
    {
      name: "Shipper check-ins",
      query: { shipperId: testShipperId, isDeleted: false },
      sort: { checkinAt: -1 },
    },
    {
      name: "Geospatial bounds",
      query: {
        location: {
          $geoWithin: {
            $box: [
              [106.6, 10.7],
              [106.8, 10.9],
            ],
          },
        },
        isDeleted: false,
      },
    },
  ];

  for (const q of queries) {
    try {
      const explain = await DeliveryCheckin.find(q.query)
        .sort(q.sort || {})
        .explain("executionStats");

      const stats = explain.executionStats;
      Logger.info(`[IndexOptimizer] Query: ${q.name}`);
      Logger.info(`  - Execution time: ${stats.executionTimeMillis}ms`);
      Logger.info(`  - Documents examined: ${stats.totalDocsExamined}`);
      Logger.info(`  - Keys examined: ${stats.totalKeysExamined}`);
      Logger.info(
        `  - Index used: ${
          explain.queryPlanner?.winningPlan?.inputStage?.indexName || "COLLSCAN"
        }`
      );
    } catch (error) {
      Logger.error(
        `[IndexOptimizer] Failed to explain query ${q.name}:`,
        error
      );
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Connect to database
    Logger.info("[IndexOptimizer] Connecting to database...");
    await mongoose.connect(config.mongodb.uri);
    Logger.success("[IndexOptimizer] Connected to database");

    // Create indexes
    await createIndexes();

    // Analyze usage
    await analyzeIndexUsage();

    // Explain queries
    await explainQueries();

    Logger.success("[IndexOptimizer] Optimization complete!");
  } catch (error) {
    Logger.error("[IndexOptimizer] Optimization failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (process.argv[1].includes("optimize-indexes")) {
  main();
}

export { createIndexes, analyzeIndexUsage, dropUnusedIndexes, explainQueries };
