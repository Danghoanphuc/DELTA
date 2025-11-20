// apps/customer-frontend/src/features/chat/utils/crossTabSync.ts
// ✅ ENTERPRISE: Cross-Tab Synchronization using BroadcastChannel API

import { SyncMessage } from "@/types/chat";

const CHANNEL_NAME = "printz_chat_sync";

export class CrossTabSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  constructor() {
    this.init();
  }

  /**
   * Initialize BroadcastChannel
   */
  private init(): void {
    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel === "undefined") {
      console.warn("[CrossTabSync] BroadcastChannel not supported, falling back to storage events");
      this.initStorageFallback();
      return;
    }

    try {
      this.channel = new BroadcastChannel(CHANNEL_NAME);

      this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        const { type, payload } = event.data;
        console.log(`[CrossTabSync] Received message:`, type, payload);

        // Notify all listeners for this type
        const listenersForType = this.listeners.get(type);
        if (listenersForType) {
          listenersForType.forEach((callback) => callback(payload));
        }
      };

      this.channel.onmessageerror = (error) => {
        console.error("[CrossTabSync] Message error:", error);
      };

      console.log("[CrossTabSync] BroadcastChannel initialized");
    } catch (error) {
      console.error("[CrossTabSync] Failed to initialize BroadcastChannel:", error);
      this.initStorageFallback();
    }
  }

  /**
   * Fallback to localStorage events for older browsers
   */
  private initStorageFallback(): void {
    const STORAGE_KEY = "printz_chat_sync_fallback";

    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const syncMessage: SyncMessage = JSON.parse(event.newValue);
          const { type, payload } = syncMessage;

          console.log(`[CrossTabSync] [Fallback] Received message:`, type, payload);

          // Notify all listeners for this type
          const listenersForType = this.listeners.get(type);
          if (listenersForType) {
            listenersForType.forEach((callback) => callback(payload));
          }
        } catch (error) {
          console.error("[CrossTabSync] [Fallback] Parse error:", error);
        }
      }
    });

    console.log("[CrossTabSync] Storage fallback initialized");
  }

  /**
   * Post message to other tabs
   */
  postMessage(type: SyncMessage["type"], payload: any): void {
    const message: SyncMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    if (this.channel) {
      // Use BroadcastChannel
      this.channel.postMessage(message);
      console.log(`[CrossTabSync] Posted message:`, type, payload);
    } else {
      // Fallback to localStorage
      const STORAGE_KEY = "printz_chat_sync_fallback";
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
        // Clear immediately to allow repeated messages
        setTimeout(() => localStorage.removeItem(STORAGE_KEY), 100);
        console.log(`[CrossTabSync] [Fallback] Posted message:`, type, payload);
      } catch (error) {
        console.error("[CrossTabSync] [Fallback] Failed to post message:", error);
      }
    }
  }

  /**
   * Subscribe to a specific message type
   */
  subscribe(type: SyncMessage["type"], callback: (payload: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(callback);
    console.log(`[CrossTabSync] Subscribed to:`, type);

    // Return unsubscribe function
    return () => {
      const listenersForType = this.listeners.get(type);
      if (listenersForType) {
        listenersForType.delete(callback);
        if (listenersForType.size === 0) {
          this.listeners.delete(type);
        }
      }
      console.log(`[CrossTabSync] Unsubscribed from:`, type);
    };
  }

  /**
   * Close channel and cleanup
   */
  close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
    console.log("[CrossTabSync] Channel closed");
  }
}

// Singleton instance
export const crossTabSync = new CrossTabSync();

