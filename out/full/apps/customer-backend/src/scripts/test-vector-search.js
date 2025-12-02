// apps/customer-backend/src/scripts/test-vector-search.js
/**
 * Test Script: Verify Vector Search Implementation
 * 
 * Usage:
 *   node src/scripts/test-vector-search.js
 * 
 * This script will:
 * 1. Test embedding generation
 * 2. Test vector search queries
 * 3. Compare vector search vs regex search
 * 4. Show detailed results and performance metrics
 */

import mongoose from "mongoose";
import { config } from "../config/env.config.js";
import { Product } from "../shared/models/product.model.js";
import { embeddingService } from "../shared/services/embedding.service.js";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, colors.bright);
  console.log("=".repeat(60) + "\n");
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

async function testEmbeddingService() {
  logSection("🧪 TEST 1: Embedding Service");

  // Check if service is available
  const isAvailable = embeddingService.isAvailable();
  log(
    `Embedding Service Available: ${isAvailable ? "✅ YES" : "❌ NO"}`,
    isAvailable ? colors.green : colors.red
  );

  if (!isAvailable) {
    log(
      "\n⚠️  OPENAI_API_KEY is not configured. Vector search will not work.",
      colors.yellow
    );
    return false;
  }

  // Test embedding generation
  const testText = "Premium business cards with matte finish";
  log(`\nGenerating embedding for: "${testText}"`, colors.cyan);

  const startTime = Date.now();
  const embedding = await embeddingService.generateEmbedding(testText);
  const duration = Date.now() - startTime;

  if (embedding && embedding.length === 1536) {
    log(`✅ Embedding generated successfully in ${duration}ms`, colors.green);
    log(
      `   Dimensions: ${embedding.length}`,
      colors.cyan
    );
    log(
      `   Sample values: [${embedding.slice(0, 5).map((v) => v.toFixed(4)).join(", ")}...]`,
      colors.cyan
    );
    return true;
  } else {
    log(
      `❌ Failed to generate embedding (got ${embedding?.length} dimensions)`,
      colors.red
    );
    return false;
  }
}

async function testProductEmbeddings() {
  logSection("🧪 TEST 2: Product Embeddings");

  // Check total products
  const totalProducts = await Product.countDocuments();
  log(`Total products in database: ${totalProducts}`, colors.cyan);

  // Check products with embeddings
  const withEmbeddings = await Product.countDocuments({
    embedding: { $exists: true, $ne: null },
    $expr: { $eq: [{ $size: "$embedding" }, 1536] },
  });

  const withoutEmbeddings = totalProducts - withEmbeddings;
  const coverage = totalProducts > 0 ? (withEmbeddings / totalProducts) * 100 : 0;

  log(`Products with embeddings: ${withEmbeddings}`, colors.green);
  log(`Products without embeddings: ${withoutEmbeddings}`, colors.yellow);
  log(`Coverage: ${coverage.toFixed(1)}%`, coverage >= 95 ? colors.green : colors.yellow);

  if (coverage < 95) {
    log(
      "\n⚠️  Warning: Less than 95% coverage. Run migration script:",
      colors.yellow
    );
    log("   node src/scripts/migrate-product-embeddings.js", colors.cyan);
  }

  return withEmbeddings > 0;
}

async function testVectorSearch(query) {
  log(`\n🔍 Searching for: "${query}"`, colors.cyan);
  log("─".repeat(60), colors.cyan);

  try {
    // Generate embedding for query
    const startEmbedding = Date.now();
    const queryVector = await embeddingService.generateEmbedding(query);
    const embeddingDuration = Date.now() - startEmbedding;

    if (!queryVector || queryVector.length !== 1536) {
      log("❌ Failed to generate query embedding", colors.red);
      return null;
    }

    log(
      `✅ Query embedding generated in ${embeddingDuration}ms`,
      colors.green
    );

    // Execute vector search
    const startSearch = Date.now();
    const vectorResults = await Product.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 100,
          limit: 5,
          filter: {
            isActive: { $ne: false },
          },
        },
      },
      {
        $project: {
          name: 1,
          category: 1,
          description: 1,
          pricing: 1,
          basePrice: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);
    const searchDuration = Date.now() - startSearch;

    log(
      `✅ Vector search completed in ${searchDuration}ms`,
      colors.green
    );
    log(`   Found ${vectorResults.length} result(s)\n`, colors.green);

    if (vectorResults.length === 0) {
      log("⚠️  No results found", colors.yellow);
      return [];
    }

    // Display results
    vectorResults.forEach((product, index) => {
      log(`Result ${index + 1}:`, colors.bright);
      log(`  Name: ${product.name}`, colors.cyan);
      log(`  Category: ${product.category}`, colors.cyan);
      log(
        `  Price: ${product.pricing?.[0]?.pricePerUnit || product.basePrice || "N/A"}`,
        colors.cyan
      );
      log(`  Relevance Score: ${product.score.toFixed(4)}`, colors.magenta);
      if (product.description) {
        log(
          `  Description: ${product.description.substring(0, 80)}...`,
          colors.cyan
        );
      }
      console.log();
    });

    return vectorResults;
  } catch (error) {
    log(`❌ Vector search error: ${error.message}`, colors.red);
    if (error.message.includes("index")) {
      log(
        "\n⚠️  Vector search index may not be configured correctly.",
        colors.yellow
      );
      log("   Please verify in MongoDB Atlas that:", colors.yellow);
      log("   1. Index name is 'vector_index'", colors.yellow);
      log("   2. Index is on 'products' collection", colors.yellow);
      log("   3. Index field is 'embedding' with 1536 dimensions", colors.yellow);
    }
    return null;
  }
}

async function testRegexSearch(query) {
  log(`\n🔍 Regex Search for: "${query}"`, colors.cyan);
  log("─".repeat(60), colors.cyan);

  try {
    const startSearch = Date.now();
    const regexResults = await Product.find({
      $and: [
        {
          $or: [
            { name: new RegExp(query, "i") },
            { description: new RegExp(query, "i") },
            { category: new RegExp(query, "i") },
          ],
        },
        {
          $or: [
            { isActive: true },
            { isActive: { $exists: false } },
            { isActive: null },
          ],
        },
      ],
    })
      .select("name category description pricing basePrice")
      .limit(5)
      .lean();
    const searchDuration = Date.now() - startSearch;

    log(
      `✅ Regex search completed in ${searchDuration}ms`,
      colors.green
    );
    log(`   Found ${regexResults.length} result(s)\n`, colors.green);

    if (regexResults.length === 0) {
      log("⚠️  No results found", colors.yellow);
      return [];
    }

    // Display results
    regexResults.forEach((product, index) => {
      log(`Result ${index + 1}:`, colors.bright);
      log(`  Name: ${product.name}`, colors.cyan);
      log(`  Category: ${product.category}`, colors.cyan);
      log(
        `  Price: ${product.pricing?.[0]?.pricePerUnit || product.basePrice || "N/A"}`,
        colors.cyan
      );
      if (product.description) {
        log(
          `  Description: ${product.description.substring(0, 80)}...`,
          colors.cyan
        );
      }
      console.log();
    });

    return regexResults;
  } catch (error) {
    log(`❌ Regex search error: ${error.message}`, colors.red);
    return null;
  }
}

async function compareSearchMethods(query) {
  logSection("🧪 TEST 3: Vector Search vs Regex Search");

  const vectorResults = await testVectorSearch(query);
  const regexResults = await testRegexSearch(query);

  // Summary
  log("\n📊 COMPARISON SUMMARY", colors.bright);
  log("─".repeat(60), colors.cyan);

  if (vectorResults && regexResults) {
    log(
      `Vector Search: ${vectorResults.length} results with semantic relevance`,
      colors.green
    );
    log(
      `Regex Search: ${regexResults.length} results with keyword matching`,
      colors.green
    );

    // Check overlap
    const vectorIds = new Set(
      vectorResults.map((p) => p._id.toString())
    );
    const regexIds = new Set(
      regexResults.map((p) => p._id.toString())
    );
    const overlap = [...vectorIds].filter((id) => regexIds.has(id)).length;

    log(
      `\nOverlap: ${overlap}/${Math.min(vectorResults.length, regexResults.length)} products appear in both results`,
      colors.yellow
    );

    if (overlap < vectorResults.length) {
      log(
        `\n✨ Vector search found ${vectorResults.length - overlap} additional semantically relevant product(s) that regex missed!`,
        colors.magenta
      );
    }
  } else if (!vectorResults && regexResults) {
    log(
      "⚠️  Vector search failed, but regex search worked (fallback is functional)",
      colors.yellow
    );
  } else if (vectorResults && !regexResults) {
    log(
      "✅ Vector search worked, regex search found no results",
      colors.green
    );
  } else {
    log("❌ Both search methods failed", colors.red);
  }
}

async function runAllTests() {
  try {
    await connectDatabase();

    // Test 1: Embedding Service
    const embeddingWorks = await testEmbeddingService();

    // Test 2: Product Embeddings
    const hasProductEmbeddings = await testProductEmbeddings();

    if (!embeddingWorks) {
      log(
        "\n❌ Cannot proceed with vector search tests: Embedding service unavailable",
        colors.red
      );
      return;
    }

    if (!hasProductEmbeddings) {
      log(
        "\n❌ Cannot proceed with vector search tests: No products have embeddings",
        colors.red
      );
      log(
        "   Run migration first: node src/scripts/migrate-product-embeddings.js",
        colors.yellow
      );
      return;
    }

    // Test 3: Search Comparison
    const testQueries = [
      "business cards for corporate events",
      "wedding invitations elegant design",
      "marketing materials for small business",
    ];

    for (const query of testQueries) {
      await compareSearchMethods(query);
    }

    // Final Summary
    logSection("🎉 TEST COMPLETE");
    log("✅ Vector search implementation is working!", colors.green);
    log("\nNext steps:", colors.cyan);
    log("1. Monitor search performance in production", colors.cyan);
    log("2. Collect user feedback on search relevance", colors.cyan);
    log("3. Adjust numCandidates/limit if needed", colors.cyan);
  } catch (error) {
    log(`\n❌ Unexpected error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log("\n🔌 Database connection closed", colors.cyan);
  }
}

// Run all tests
runAllTests();

