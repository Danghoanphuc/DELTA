// apps/customer-backend/src/scripts/migrate-conversations-to-threads.js
// Migration script: Conversations → Threads

import mongoose from "mongoose";
import { Conversation } from "../shared/models/conversation.model.js";
import {
  Thread,
  THREAD_STATUS,
  THREAD_PRIORITY,
} from "../shared/models/thread.model.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Migrate existing Conversations to Threads
 */
async function migrateConversationsToThreads() {
  try {
    Logger.info("[Migration] Starting Conversations → Threads migration...");

    // Get all conversations
    const conversations = await Conversation.find({});
    Logger.info(
      `[Migration] Found ${conversations.length} conversations to migrate`
    );

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const conversation of conversations) {
      try {
        // Check if already migrated
        const existingThread = await Thread.findOne({ _id: conversation._id });
        if (existingThread) {
          Logger.debug(
            `[Migration] Thread ${conversation._id} already exists, skipping`
          );
          skippedCount++;
          continue;
        }

        // Create thread from conversation
        const threadData = {
          _id: conversation._id, // Keep same ID
          type: conversation.type,
          title: conversation.title,
          avatarUrl: conversation.avatarUrl,
          description: conversation.description,
          context: conversation.context,
          participants: conversation.participants,
          lastMessageAt: conversation.lastMessageAt,
          isActive: conversation.isActive,
          creatorId: conversation.creatorId,

          // New fields with defaults
          status: THREAD_STATUS.ACTIVE,
          resolvedAt: null,
          resolvedBy: null,
          resolutionNotes: "",
          isPinned: false,
          pinnedAt: null,
          pinnedBy: null,
          priority: THREAD_PRIORITY.NORMAL,
          stats: {
            messageCount: 0,
            replyCount: 0,
            participantCount: conversation.participants.filter(
              (p) => p.isVisible
            ).length,
            unreadCount: 0,
            lastActivityAt: conversation.lastMessageAt,
          },
          permissions: {
            canReply: "all",
            canInvite: "participants",
            canPin: "moderators",
            canResolve: "moderators",
            canArchive: "moderators",
          },
          tags: [],
          templateId: null,
          templateName: null,
          autoArchiveAfterDays: 7,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        };

        await Thread.create(threadData);
        migratedCount++;

        if (migratedCount % 100 === 0) {
          Logger.info(`[Migration] Migrated ${migratedCount} threads...`);
        }
      } catch (error) {
        Logger.error(
          `[Migration] Error migrating conversation ${conversation._id}:`,
          error
        );
        errorCount++;
      }
    }

    Logger.success(`[Migration] Completed!`);
    Logger.info(`[Migration] Migrated: ${migratedCount}`);
    Logger.info(`[Migration] Skipped: ${skippedCount}`);
    Logger.info(`[Migration] Errors: ${errorCount}`);

    return { migratedCount, skippedCount, errorCount };
  } catch (error) {
    Logger.error("[Migration] Fatal error:", error);
    throw error;
  }
}

/**
 * Update thread statistics from messages
 */
async function updateThreadStatistics() {
  try {
    Logger.info("[Migration] Updating thread statistics...");

    const Message = mongoose.model("Message");
    const threads = await Thread.find({});

    let updatedCount = 0;

    for (const thread of threads) {
      try {
        const messageCount = await Message.countDocuments({
          conversationId: thread._id,
        });

        const replyCount = await Message.countDocuments({
          conversationId: thread._id,
          replyTo: { $ne: null },
        });

        thread.stats.messageCount = messageCount;
        thread.stats.replyCount = replyCount;
        thread.stats.participantCount = thread.participants.filter(
          (p) => p.isVisible
        ).length;

        await thread.save();
        updatedCount++;

        if (updatedCount % 100 === 0) {
          Logger.info(`[Migration] Updated ${updatedCount} thread stats...`);
        }
      } catch (error) {
        Logger.error(
          `[Migration] Error updating thread ${thread._id} stats:`,
          error
        );
      }
    }

    Logger.success(`[Migration] Updated ${updatedCount} thread statistics`);
    return updatedCount;
  } catch (error) {
    Logger.error("[Migration] Error updating statistics:", error);
    throw error;
  }
}

/**
 * Rollback migration (if needed)
 */
async function rollbackMigration() {
  try {
    Logger.warn("[Migration] Rolling back Threads → Conversations...");

    const result = await Thread.deleteMany({});
    Logger.success(`[Migration] Deleted ${result.deletedCount} threads`);

    return result.deletedCount;
  } catch (error) {
    Logger.error("[Migration] Rollback error:", error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      Logger.info("[Migration] Connected to MongoDB");

      if (command === "rollback") {
        await rollbackMigration();
      } else {
        await migrateConversationsToThreads();
        await updateThreadStatistics();
      }

      await mongoose.disconnect();
      Logger.info("[Migration] Disconnected from MongoDB");
      process.exit(0);
    })
    .catch((error) => {
      Logger.error("[Migration] Connection error:", error);
      process.exit(1);
    });
}

export {
  migrateConversationsToThreads,
  updateThreadStatistics,
  rollbackMigration,
};
