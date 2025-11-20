// apps/customer-backend/src/scripts/migrate-product-embeddings.js
/**
 * Migration Script: Generate embeddings for existing products
 * 
 * Usage:
 *   node src/scripts/migrate-product-embeddings.js
 * 
 * This script will:
 * 1. Find all products without embeddings
 * 2. Generate embeddings using OpenAI
 * 3. Update products with the new embeddings
 * 4. Show progress and statistics
 */

import mongoose from "mongoose";
import { config } from "../config/env.config.js";
import { Product } from "../shared/models/product.model.js";
import { embeddingService } from "../shared/services/embedding.service.js";

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function connectDatabase() {
  try {
    await mongoose.connect(config.db.connectionString);
    log("✅ Connected to MongoDB", colors.green);
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

async function migrateProductEmbeddings() {
  log("\n🚀 Starting Product Embedding Migration...\n", colors.bright);

  // Check if embedding service is available
  if (!embeddingService.isAvailable()) {
    log(
      "❌ Embedding service is not available. Please check your OPENAI_API_KEY.",
      colors.red
    );
    process.exit(1);
  }

  try {
    // Find all products without embeddings or with invalid embeddings
    const productsWithoutEmbeddings = await Product.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: null },
        { embedding: [] },
        { $expr: { $ne: [{ $size: "$embedding" }, 1536] } }, // Invalid size
      ],
    })
      .select("_id name description category specifications assets")
      .lean();

    const totalCount = productsWithoutEmbeddings.length;

    if (totalCount === 0) {
      log("✅ All products already have embeddings!", colors.green);
      return;
    }

    log(
      `📊 Found ${totalCount} product(s) without embeddings\n`,
      colors.yellow
    );

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process products in batches to avoid rate limits
    const BATCH_SIZE = 10;
    const batches = [];
    for (let i = 0; i < productsWithoutEmbeddings.length; i += BATCH_SIZE) {
      batches.push(productsWithoutEmbeddings.slice(i, i + BATCH_SIZE));
    }

    log(`📦 Processing in ${batches.length} batch(es)...\n`, colors.cyan);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      log(
        `\n🔄 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} products)`,
        colors.blue
      );

      for (const product of batch) {
        try {
          // Generate embedding
          const embedding = await embeddingService.generateProductEmbedding(
            product
          );

          if (!embedding || embedding.length !== 1536) {
            log(
              `  ⚠️  Skipped: "${product.name}" (Failed to generate embedding)`,
              colors.yellow
            );
            skippedCount++;
            continue;
          }

          // Update product with embedding
          await Product.updateOne(
            { _id: product._id },
            { $set: { embedding: embedding } }
          );

          successCount++;
          log(`  ✅ Updated: "${product.name}"`, colors.green);
        } catch (error) {
          errorCount++;
          log(
            `  ❌ Error: "${product.name}" - ${error.message}`,
            colors.red
          );
        }
      }

      // Add a small delay between batches to avoid rate limits
      if (batchIndex < batches.length - 1) {
        log("  ⏳ Waiting 2 seconds before next batch...", colors.cyan);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // Print summary
    log("\n" + "=".repeat(50), colors.bright);
    log("📊 MIGRATION SUMMARY", colors.bright);
    log("=".repeat(50), colors.bright);
    log(`Total products processed: ${totalCount}`, colors.cyan);
    log(`✅ Successfully updated: ${successCount}`, colors.green);
    log(`⚠️  Skipped: ${skippedCount}`, colors.yellow);
    log(`❌ Errors: ${errorCount}`, colors.red);
    log("=".repeat(50) + "\n", colors.bright);

    if (successCount === totalCount) {
      log("🎉 Migration completed successfully!", colors.green);
    } else if (successCount > 0) {
      log(
        "⚠️  Migration completed with some issues. Check the logs above.",
        colors.yellow
      );
    } else {
      log("❌ Migration failed. No products were updated.", colors.red);
    }
  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  try {
    await connectDatabase();
    await migrateProductEmbeddings();
  } catch (error) {
    log(`\n❌ Unexpected error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log("\n🔌 Database connection closed", colors.cyan);
  }
}

// Run the migration
main();

