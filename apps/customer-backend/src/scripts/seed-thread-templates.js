// apps/customer-backend/src/scripts/seed-thread-templates.js
// Seed default thread templates

import mongoose from "mongoose";
import { ThreadTemplate } from "../shared/models/thread-template.model.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Seed default thread templates
 */
async function seedThreadTemplates() {
  try {
    Logger.info("[Seed] Seeding default thread templates...");

    // Use system user ID (or create a system user)
    const systemUserId = new mongoose.Types.ObjectId();

    const created = await ThreadTemplate.createDefaults(systemUserId);

    Logger.success(`[Seed] Created ${created.length} default templates`);
    return created;
  } catch (error) {
    Logger.error("[Seed] Error seeding templates:", error);
    throw error;
  }
}

/**
 * Clear all templates (for testing)
 */
async function clearTemplates() {
  try {
    Logger.warn("[Seed] Clearing all templates...");

    const result = await ThreadTemplate.deleteMany({});
    Logger.success(`[Seed] Deleted ${result.deletedCount} templates`);

    return result.deletedCount;
  } catch (error) {
    Logger.error("[Seed] Error clearing templates:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      Logger.info("[Seed] Connected to MongoDB");

      if (command === "clear") {
        await clearTemplates();
      } else {
        await seedThreadTemplates();
      }

      await mongoose.disconnect();
      Logger.info("[Seed] Disconnected from MongoDB");
      process.exit(0);
    })
    .catch((error) => {
      Logger.error("[Seed] Connection error:", error);
      process.exit(1);
    });
}

export { seedThreadTemplates, clearTemplates };
