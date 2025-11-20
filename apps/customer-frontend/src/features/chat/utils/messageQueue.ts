// apps/customer-frontend/src/features/chat/utils/messageQueue.ts
// ✅ ENTERPRISE: Message Queue Manager for Offline Support & Retry Logic

import { QueuedMessage } from "@/types/chat";

const QUEUE_STORAGE_KEY = "printz_message_queue";
const MAX_RETRY_COUNT = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // Exponential backoff: 1s, 3s, 5s

export class MessageQueueManager {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("[MessageQueue] Failed to load from storage:", error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("[MessageQueue] Failed to save to storage:", error);
    }
  }

  /**
   * Add message to queue
   */
  add(message: Omit<QueuedMessage, "retryCount" | "createdAt">): QueuedMessage {
    const queuedMessage: QueuedMessage = {
      ...message,
      retryCount: 0,
      createdAt: Date.now(),
    };

    this.queue.push(queuedMessage);
    this.saveToStorage();

    console.log(`[MessageQueue] Added message to queue:`, queuedMessage.tempId);

    return queuedMessage;
  }

  /**
   * Remove message from queue (after successful send)
   */
  remove(tempId: string): void {
    const index = this.queue.findIndex((msg) => msg.tempId === tempId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      console.log(`[MessageQueue] Removed message from queue:`, tempId);
    }

    // Clear retry timeout if exists
    const timeout = this.retryTimeouts.get(tempId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(tempId);
    }
  }

  /**
   * Update message in queue (e.g., increment retry count, add error)
   */
  update(tempId: string, updates: Partial<QueuedMessage>): void {
    const message = this.queue.find((msg) => msg.tempId === tempId);
    if (message) {
      Object.assign(message, updates);
      this.saveToStorage();
      console.log(`[MessageQueue] Updated message in queue:`, tempId, updates);
    }
  }

  /**
   * Get all queued messages
   */
  getAll(): QueuedMessage[] {
    return [...this.queue];
  }

  /**
   * Get message by tempId
   */
  get(tempId: string): QueuedMessage | undefined {
    return this.queue.find((msg) => msg.tempId === tempId);
  }

  /**
   * Check if queue has messages
   */
  hasMessages(): boolean {
    return this.queue.length > 0;
  }

  /**
   * Clear all messages (use with caution)
   */
  clear(): void {
    this.queue = [];
    this.saveToStorage();
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.retryTimeouts.clear();
    console.log("[MessageQueue] Cleared queue");
  }

  /**
   * Process queue - send all pending messages
   * @param sendFn - Function to send message (returns Promise<boolean>)
   */
  async processQueue(
    sendFn: (message: QueuedMessage) => Promise<boolean>
  ): Promise<void> {
    if (this.isProcessing) {
      console.log("[MessageQueue] Already processing, skipping");
      return;
    }

    if (this.queue.length === 0) {
      console.log("[MessageQueue] Queue is empty");
      return;
    }

    this.isProcessing = true;
    console.log(`[MessageQueue] Processing ${this.queue.length} messages`);

    // Process messages in order (FIFO)
    for (const message of [...this.queue]) {
      try {
        // Check if message exceeded max retries
        if (message.retryCount >= MAX_RETRY_COUNT) {
          console.error(
            `[MessageQueue] Message ${message.tempId} exceeded max retries, marking as error`
          );
          this.update(message.tempId, {
            error: `Không thể gửi sau ${MAX_RETRY_COUNT} lần thử`,
          });
          continue;
        }

        // Attempt to send
        const success = await sendFn(message);

        if (success) {
          // Remove from queue on success
          this.remove(message.tempId);
        } else {
          // Increment retry count and schedule retry
          const newRetryCount = message.retryCount + 1;
          this.update(message.tempId, {
            retryCount: newRetryCount,
            error: `Đang thử lại (${newRetryCount}/${MAX_RETRY_COUNT})...`,
          });

          // Schedule retry with exponential backoff
          if (newRetryCount < MAX_RETRY_COUNT) {
            const delay = RETRY_DELAYS[newRetryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
            console.log(
              `[MessageQueue] Scheduling retry for ${message.tempId} in ${delay}ms`
            );

            const timeout = setTimeout(() => {
              this.retryTimeouts.delete(message.tempId);
              this.processQueue(sendFn);
            }, delay);

            this.retryTimeouts.set(message.tempId, timeout);
          }
        }
      } catch (error) {
        console.error(
          `[MessageQueue] Error processing message ${message.tempId}:`,
          error
        );
        this.update(message.tempId, {
          retryCount: message.retryCount + 1,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    this.isProcessing = false;
    console.log("[MessageQueue] Processing complete");
  }

  /**
   * Retry a specific message immediately
   */
  async retryMessage(
    tempId: string,
    sendFn: (message: QueuedMessage) => Promise<boolean>
  ): Promise<void> {
    const message = this.get(tempId);
    if (!message) {
      console.warn(`[MessageQueue] Message ${tempId} not found in queue`);
      return;
    }

    console.log(`[MessageQueue] Manually retrying message:`, tempId);

    try {
      const success = await sendFn(message);

      if (success) {
        this.remove(tempId);
      } else {
        const newRetryCount = message.retryCount + 1;
        this.update(tempId, {
          retryCount: newRetryCount,
          error:
            newRetryCount >= MAX_RETRY_COUNT
              ? `Không thể gửi sau ${MAX_RETRY_COUNT} lần thử`
              : `Đang thử lại (${newRetryCount}/${MAX_RETRY_COUNT})...`,
        });
      }
    } catch (error) {
      console.error(`[MessageQueue] Error retrying message ${tempId}:`, error);
      this.update(tempId, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

// Singleton instance
export const messageQueue = new MessageQueueManager();

