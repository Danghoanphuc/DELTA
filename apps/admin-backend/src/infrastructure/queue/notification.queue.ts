// apps/admin-backend/src/infrastructure/queue/notification.queue.ts
/**
 * Notification Queue Service for Admin Backend
 * Simplified wrapper for Novu notifications
 */

/**
 * Add notification job to queue
 * Note: This is a simplified version. Full implementation would use Bull/BullMQ
 */
export function addNotificationJob(data: {
  type: string;
  recipientId: string;
  recipientModel: string;
  data: Record<string, any>;
}) {
  try {
    // TODO: Implement actual queue with Bull/BullMQ
    // For now, just log
    console.log("[NotificationQueue] Job queued:", {
      type: data.type,
      recipientId: data.recipientId,
    });
  } catch (error) {
    console.error("[NotificationQueue] Failed to queue job:", error);
  }
}
