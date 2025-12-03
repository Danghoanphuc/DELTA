// apps/customer-frontend/src/features/chat/lib/offline-queue.ts
/**
 * 🔥 OFFLINE MESSAGE QUEUE
 * Lưu trữ và gửi lại messages khi mất kết nối
 */

import { QueuedMessage } from "@/types/chat";

const QUEUE_STORAGE_KEY = "chat_offline_queue";
const MAX_QUEUE_SIZE = 50;
const MAX_RETRY_COUNT = 5;

export class OfflineMessageQueue {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load queue từ localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        // Xóa messages quá cũ (> 24h)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        this.queue = this.queue.filter((msg) => msg.createdAt > oneDayAgo);
      }
    } catch (error) {
      console.error("[OfflineQueue] Failed to load from storage:", error);
      this.queue = [];
    }
  }

  /**
   * Save queue vào localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error("[OfflineQueue] Failed to save to storage:", error);
    }
  }

  /**
   * Thêm message vào queue
   */
  add(message: Omit<QueuedMessage, "retryCount" | "createdAt">): void {
    // Kiểm tra size limit
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      console.warn("[OfflineQueue] Queue full, removing oldest message");
      this.queue.shift();
    }

    const queuedMessage: QueuedMessage = {
      ...message,
      retryCount: 0,
      createdAt: Date.now(),
    };

    this.queue.push(queuedMessage);
    this.saveToStorage();

    console.log("[OfflineQueue] Added message:", queuedMessage.tempId);
  }

  /**
   * Xóa message khỏi queue
   */
  remove(tempId: string): void {
    const index = this.queue.findIndex((msg) => msg.tempId === tempId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      console.log("[OfflineQueue] Removed message:", tempId);
    }
  }

  /**
   * Update retry count
   */
  private incrementRetry(tempId: string): void {
    const message = this.queue.find((msg) => msg.tempId === tempId);
    if (message) {
      message.retryCount++;
      this.saveToStorage();
    }
  }

  /**
   * Get tất cả messages trong queue
   */
  getAll(): QueuedMessage[] {
    return [...this.queue];
  }

  /**
   * Get số lượng messages trong queue
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Clear toàn bộ queue
   */
  clear(): void {
    this.queue = [];
    localStorage.removeItem(QUEUE_STORAGE_KEY);
    this.notifyListeners();
    console.log("[OfflineQueue] Cleared");
  }

  /**
   * Flush queue - gửi tất cả messages
   */
  async flush(
    sendFn: (message: QueuedMessage) => Promise<void>
  ): Promise<{ success: number; failed: number }> {
    if (this.isProcessing) {
      console.log("[OfflineQueue] Already processing");
      return { success: 0, failed: 0 };
    }

    if (this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    this.isProcessing = true;
    let successCount = 0;
    let failedCount = 0;

    console.log(`[OfflineQueue] Flushing ${this.queue.length} messages...`);

    // Process messages one by one
    while (this.queue.length > 0) {
      const message = this.queue[0];

      // Skip nếu đã retry quá nhiều
      if (message.retryCount >= MAX_RETRY_COUNT) {
        console.warn(
          `[OfflineQueue] Max retry reached for ${message.tempId}, removing`
        );
        this.queue.shift();
        failedCount++;
        this.saveToStorage();
        continue;
      }

      try {
        await sendFn(message);
        this.queue.shift(); // Remove on success
        successCount++;
        this.saveToStorage();
        console.log(`[OfflineQueue] Sent message: ${message.tempId}`);
      } catch (error) {
        console.error(
          `[OfflineQueue] Failed to send ${message.tempId}:`,
          error
        );
        this.incrementRetry(message.tempId);
        failedCount++;
        break; // Stop processing on error
      }
    }

    this.isProcessing = false;
    console.log(
      `[OfflineQueue] Flush complete: ${successCount} success, ${failedCount} failed`
    );

    return { success: successCount, failed: failedCount };
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Check if queue is processing
   */
  isFlushingQueue(): boolean {
    return this.isProcessing;
  }
}

// Singleton instance
export const offlineQueue = new OfflineMessageQueue();
