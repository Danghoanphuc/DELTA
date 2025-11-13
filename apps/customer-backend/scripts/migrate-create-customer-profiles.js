// backend/scripts/migrate-create-customer-profiles.js
// ✅ MIGRATION: Create CustomerProfile for all legacy users

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Import models (after env is loaded)
import { User } from "../src/shared/models/user.model.js";
import { CustomerProfile } from "../src/shared/models/customer-profile.model.js";

const MONGODB_URI = process.env.MONGODB_CONNECTIONSTRING;

// ANSI color codes for pretty console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Main migration function
 */
async function migrateCustomerProfiles() {
  let connection = null;

  try {
    log(
      "\n╔════════════════════════════════════════════════════════════╗",
      colors.cyan
    );
    log(
      "║   MIGRATION: Create CustomerProfiles for Legacy Users     ║",
      colors.cyan
    );
    log(
      "╚════════════════════════════════════════════════════════════╝\n",
      colors.cyan
    );

    // Validate MongoDB URI
    if (!MONGODB_URI) {
      log(
        "❌ FATAL: MONGODB_CONNECTIONSTRING not found in .env file",
        colors.red
      );
      process.exit(1);
    }

    // Connect to database
    log("🔄 Connecting to MongoDB...", colors.blue);
    connection = await mongoose.connect(MONGODB_URI);
    log("✅ Connected to MongoDB\n", colors.green);

    // Find all users without customerProfileId
    log("📊 Analyzing database...", colors.blue);
    const usersWithoutProfile = await User.find({
      customerProfileId: { $in: [null, undefined] },
    });

    const totalUsers = await User.countDocuments();
    const usersWithProfile = totalUsers - usersWithoutProfile.length;

    log(`   Total users: ${totalUsers}`, colors.cyan);
    log(`   ✅ Users with CustomerProfile: ${usersWithProfile}`, colors.green);
    log(
      `   ⚠️  Users without CustomerProfile: ${usersWithoutProfile.length}\n`,
      colors.yellow
    );

    if (usersWithoutProfile.length === 0) {
      log(
        "✅ All users already have CustomerProfile. Migration not needed.\n",
        colors.green
      );
      process.exit(0);
    }

    // Confirm migration
    log(
      `📝 Starting migration for ${usersWithoutProfile.length} users...\n`,
      colors.bright
    );

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process each user
    for (let i = 0; i < usersWithoutProfile.length; i++) {
      const user = usersWithoutProfile[i];
      const progress = `[${i + 1}/${usersWithoutProfile.length}]`;

      try {
        // Check if profile already exists (safety check)
        const existingProfile = await CustomerProfile.findOne({
          userId: user._id,
        });

        if (existingProfile) {
          log(
            `${progress} ⚠️  User ${user.email} already has profile, updating reference...`,
            colors.yellow
          );
          user.customerProfileId = existingProfile._id;
          await user.save();
          skippedCount++;
          continue;
        }

        // Create new profile
        const newProfile = new CustomerProfile({
          userId: user._id,
          savedAddresses: [],
        });

        await newProfile.save();

        // Update user
        user.customerProfileId = newProfile._id;
        await user.save();

        log(
          `${progress} ✅ Created CustomerProfile for: ${user.email}`,
          colors.green
        );
        successCount++;
      } catch (err) {
        log(
          `${progress} ❌ Failed for user ${user.email}: ${err.message}`,
          colors.red
        );
        errorCount++;
      }
    }

    // Print summary
    log(
      "\n╔════════════════════════════════════════════════════════════╗",
      colors.cyan
    );
    log(
      "║                     MIGRATION SUMMARY                      ║",
      colors.cyan
    );
    log(
      "╚════════════════════════════════════════════════════════════╝\n",
      colors.cyan
    );
    log(`   ✅ Successfully created: ${successCount}`, colors.green);
    log(`   ⚠️  Skipped (already exists): ${skippedCount}`, colors.yellow);
    log(`   ❌ Errors: ${errorCount}`, colors.red);
    log(
      `   📊 Total processed: ${usersWithoutProfile.length}\n`,
      colors.bright
    );

    if (errorCount > 0) {
      log(
        "⚠️  Migration completed with errors. Please check the logs above.\n",
        colors.yellow
      );
      process.exit(1);
    } else {
      log("🎉 Migration completed successfully!\n", colors.green);
      process.exit(0);
    }
  } catch (error) {
    log("\n❌ FATAL ERROR:", colors.red);
    console.error(error);
    log(
      "\nMigration failed. Please fix the error and try again.\n",
      colors.red
    );
    process.exit(1);
  } finally {
    // Cleanup
    if (connection) {
      await mongoose.connection.close();
      log("🔌 Database connection closed\n", colors.blue);
    }
  }
}

/**
 * Handle script interruption
 */
process.on("SIGINT", async () => {
  log("\n\n⚠️  Migration interrupted by user", colors.yellow);
  await mongoose.connection.close();
  log("🔌 Database connection closed\n", colors.blue);
  process.exit(0);
});

// Run migration
log("\n" + "=".repeat(60));
log("  PRINTZ - Customer Profile Migration Script", colors.bright);
log("=".repeat(60) + "\n");

migrateCustomerProfiles();
