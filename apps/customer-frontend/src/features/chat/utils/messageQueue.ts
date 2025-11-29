// apps/customer-frontend/src/features/chat/utils/messageQueue.ts
import { QueuedMessage } from "@/types/chat";

const QUEUE_STORAGE_KEY = "printz_message_queue";
const MAX_RETRY_COUNT = 2; // Giảm số lần retry

export class MessageQueueManager {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[MessageQueue] Loaded ${this.queue.length} messages from storage`);
      }
    } catch (error) {
      console.error("[MessageQueue] Failed to load from storage:", error);
      this.queue = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("[MessageQueue] Failed to save to storage:", error);
    }
  }

  add(message: Omit<QueuedMessage, "retryCount" | "createdAt">): QueuedMessage {
    const queuedMessage: QueuedMessage = {
      ...message,
      retryCount: 0,
      createdAt: Date.now(),
    };
    this.queue.push(queuedMessage);
    this.saveToStorage();
    console.log(`[MessageQueue] Added message: ${queuedMessage.tempId}`);
    return queuedMessage;
  }

  remove(tempId: string): void {
    const index = this.queue.findIndex((msg) => msg.tempId === tempId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      console.log(`[MessageQueue] Removed message: ${tempId}`);
    }
  }

  update(tempId: string, updates: Partial<QueuedMessage>): void {
    const message = this.queue.find((msg) => msg.tempId === tempId);
    if (message) {
      Object.assign(message, updates);
      this.saveToStorage();
    }
  }

  getAll(): QueuedMessage[] {
    return [...this.queue];
  }

  hasMessages(): boolean {
    return this.queue.length > 0;
  }

  // ✅ FIX: Logic xử lý queue thông minh hơn
  async processQueue(
    sendFn: (message: QueuedMessage) => Promise<boolean>
  ): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    console.log(`[MessageQueue] Processing ${this.queue.length} messages`);

    // Tạo bản sao để tránh thay đổi trong khi xử lý
    const processingQueue = [...this.queue];

    for (const message of processingQueue) {
      try {
        console.log(`[MessageQueue] Sending message: ${message.tempId}, retry: ${message.retryCount}`);
        
        const success = await sendFn(message);
        
        if (success) {
          this.remove(message.tempId);
          console.log(`[MessageQueue] Successfully sent: ${message.tempId}`);
        } else {
          // Tăng số lần thử và cập nhật
          message.retryCount += 1;
          if (message.retryCount >= MAX_RETRY_COUNT) {
            console.log(`[MessageQueue] Max retries reached for: ${message.tempId}`);
            this.remove(message.tempId);
          } else {
            this.update(message.tempId, { retryCount: message.retryCount });
            console.log(`[MessageQueue] Retry ${message.retryCount} for: ${message.tempId}`);
          }
        }
      } catch (error) {
        console.error(`[MessageQueue] Error processing ${message.tempId}:`, error);
        message.retryCount += 1;
        if (message.retryCount >= MAX_RETRY_COUNT) {
          this.remove(message.tempId);
        } else {
          this.update(message.tempId, { retryCount: message.retryCount });
        }
      }
      
      // ✅ FIX: Thêm delay giữa các lần gửi để tránh spam server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
    
    // Nếu còn message trong queue, tiếp tục xử lý sau 5s
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(sendFn), 5000);
    }
  }
  
  async retryMessage(tempId: string, sendFn: (message: QueuedMessage) => Promise<boolean>) {
    const message = this.get(tempId);
    if (message) {
      await this.processQueue(sendFn);
    }
  }

  get(tempId: string): QueuedMessage | undefined {
    return this.queue.find(m => m.tempId === tempId);
  }

  clear(): void {
    this.queue = [];
    this.saveToStorage();
    console.log('[MessageQueue] Cleared all messages');
  }
}

export const messageQueue = new MessageQueueManager();