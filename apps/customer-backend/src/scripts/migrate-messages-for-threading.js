// apps/customer-backend/src/scripts/migrate-messages-for-threading.js
// Migration script: Messages → ThreadedMessages

import mongoose from "mongoose";
import { Message } from "../shared/models/message.model.js";
import { ThreadedMessage } from "../shared/models/threaded-message.model.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Migrate existing Messages to ThreadedMessages
 */
async function migrateMessagesToThreadedMessages() {
  try {
    Logger.info(
      "[Migration] Starting Messages → ThreadedMessages migration..."
    );

    const messages = await Message.find({}).sort({ createdAt: 1 });
    Logger.info(`[Migration] Found ${messages.length} messages to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const message of messages) {
      try {
        // Check if already migrated
        const existingThreadedMessage = await ThreadedMessage.findOne({
          _id: message._id,
        });
        if (existingThreadedMessage) {
          Logger.debug(
            `[Migration] Message ${message._id} already exists, skipping`
          );
          skippedCount++;
          continue;
        }

        // Calculate thread depth and path
        let threadDepth = 0;
        let threadPath = "";
        let rootMessageId = null;

        if (message.replyTo) {
          const parentMessage = await ThreadedMessage.findById(message.replyTo);
          if (parentMessage) {
            threadDepth = Math.min(parentMessage.threadDepth + 1, 3);
            rootMessageId = parentMessage.rootMessageId || parentMessage._id;

            if (threadDepth <= 3) {
              threadPath = parentMessage.threadPath
                ? `${parentMessage.threadPath}/${message._id}`
                : `${parentMessage._id}/${message._id}`;
            } else {
              // Flatten if depth > 3
              const pathParts = parentMessage.threadPath.split("/").slice(0, 3);
              threadPath = `${pathParts.join("/")}/${message._id}`;
              threadDepth = 3;
            }
          }
        }

        // Create threaded message
        const threadedMessageData = {
          _id: message._id, // Keep same ID
          conversationId: message.conversationId,
          sender: message.sender,
          senderType: message.senderType,
          clientSideId: message.clientSideId,
          type: message.type,
          content: message.content,
          metadata: message.metadata,
          readBy: message.readBy,
          deletedFor: message.deletedFor,
          replyTo: message.replyTo,

          // New threading fields
          threadDepth,
          threadPath,
          rootMessageId,
          replyCount: 0,
          totalReplyCount: 0,
          mentions: [],
          reactions: [],
          isEdited: false,
          editedAt: null,
          editHistory: [],
          attachments: [],

          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        };

        await ThreadedMessage.create(threadedMessageData);
        migratedCount++;

        if (migratedCount % 1000 === 0) {
          Logger.info(`[Migration] Migrated ${migratedCount} messages...`);
        }
      } catch (error) {
        Logger.error(
          `[Migration] Error migrating message ${message._id}:`,
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
 * Calculate reply counts for all messages
 */
async function calculateReplyCounts() {
  try {
    Logger.info("[Migration] Calculating reply counts...");

    const messages = await ThreadedMessage.find({});
    let updatedCount = 0;

    for (const message of messages) {
      try {
        const directReplies = await ThreadedMessage.countDocuments({
          replyTo: message._id,
        });

        const allReplies = await ThreadedMessage.countDocuments({
          rootMessageId: message.rootMessageId || message._id,
          _id: { $ne: message._id },
        });

        message.replyCount = directReplies;
        message.totalReplyCount = allReplies;
        await message.save();

        updatedCount++;

        if (updatedCount % 1000 === 0) {
          Logger.info(`[Migration] Updated ${updatedCount} reply counts...`);
        }
      } catch (error) {
        Logger.error(
          `[Migration] Error updating message ${message._id}:`,
          error
        );
      }
    }

    Logger.success(`[Migration] Updated ${updatedCount} reply counts`);
    return updatedCount;
  } catch (error) {
    Logger.error("[Migration] Error calculating reply counts:", error);
    throw error;
  }
}

/**
 * Parse mentions from existing messages
 */
async function parseMentions() {
  try {
    Logger.info("[Migration] Parsing mentions from messages...");

    const messages = await ThreadedMessage.find({
      type: "text",
      "content.text": /@\w+/,
    });

    Logger.info(
      `[Migration] Found ${messages.length} messages with potential mentions`
    );

    let updatedCount = 0;

    for (const message of messages) {
      try {
        const text = message.content?.text || "";
        const mentionRegex = /@(\w+)/g;
        const matches = [...text.matchAll(mentionRegex)];

        if (matches.length > 0) {
          const User = mongoose.model("User");
          const mentions = [];

          for (const match of matches) {
            const username = match[1];
            const user = await User.findOne({ username }).lean();

            if (user) {
              mentions.push({
                userId: user._id,
                username: user.username,
                displayName: user.displayName || user.username,
              });
            }
          }

          if (mentions.length > 0) {
            message.mentions = mentions;
            await message.save();
            updatedCount++;
          }
        }

        if (updatedCount % 100 === 0) {
          Logger.info(`[Migration] Parsed ${updatedCount} mentions...`);
        }
      } catch (error) {
        Logger.error(
          `[Migration] Error parsing mentions for ${message._id}:`,
          error
        );
      }
    }

    Logger.success(`[Migration] Parsed ${updatedCount} mentions`);
    return updatedCount;
  } catch (error) {
    Logger.error("[Migration] Error parsing mentions:", error);
    throw error;
  }
}

/**
 * Rollback migration
 */
async function rollbackMigration() {
  try {
    Logger.warn("[Migration] Rolling back ThreadedMessages → Messages...");

    const result = await ThreadedMessage.deleteMany({});
    Logger.success(
      `[Migration] Deleted ${result.deletedCount} threaded messages`
    );

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
        await migrateMessagesToThreadedMessages();
        await calculateReplyCounts();
        await parseMentions();
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
  migrateMessagesToThreadedMessages,
  calculateReplyCounts,
  parseMentions,
  rollbackMigration,
};
