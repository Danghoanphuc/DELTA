// apps/customer-frontend/src/features/delivery-checkin/hooks/useThreadRealtime.ts
/**
 * Hook for real-time thread updates via Pusher
 */

import { useEffect } from "react";
import { usePusher } from "../../../shared/hooks/usePusher";

interface UseThreadRealtimeOptions {
  threadId: string | null;
  onMessageReceived?: (message?: any) => void;
  enabled?: boolean;
}

export function useThreadRealtime({
  threadId,
  onMessageReceived,
  enabled = true,
}: UseThreadRealtimeOptions) {
  const { subscribe, unsubscribe } = usePusher();

  useEffect(() => {
    if (!enabled || !threadId) {
      console.log(
        "[ThreadRealtime] Skipped - enabled:",
        enabled,
        "threadId:",
        threadId
      );
      return;
    }

    const channelName = `thread-${threadId}`;
    console.log("[ThreadRealtime] 📡 Subscribing to:", channelName);

    // Subscribe to thread channel
    const channel = subscribe(channelName);

    if (!channel) {
      console.error("[ThreadRealtime] ❌ Failed to subscribe to channel");
      return;
    }

    console.log("[ThreadRealtime] ✅ Channel subscribed:", channelName);

    // Listen for subscription success
    channel.bind("pusher:subscription_succeeded", () => {
      console.log("[ThreadRealtime] ✅ Subscription succeeded:", channelName);
    });

    channel.bind("pusher:subscription_error", (error: any) => {
      console.error("[ThreadRealtime] ❌ Subscription error:", error);
    });

    // Listen for new messages
    channel.bind("message:new", (data: any) => {
      console.log("[ThreadRealtime] 📨 New message received:", data);
      if (onMessageReceived && data.message) {
        console.log("[ThreadRealtime] Adding message:", data.message);
        onMessageReceived(data.message);
      }
    });

    // Listen for message updates
    channel.bind("message:update", (data: any) => {
      console.log("[ThreadRealtime] Message updated:", data);
      if (onMessageReceived) {
        onMessageReceived();
      }
    });

    // Listen for message deletes
    channel.bind("message:delete", (data: any) => {
      console.log("[ThreadRealtime] Message deleted:", data);
      if (onMessageReceived) {
        onMessageReceived();
      }
    });

    // Cleanup on unmount
    return () => {
      console.log("[ThreadRealtime] 🧹 Cleaning up:", channelName);
      if (channel) {
        channel.unbind_all();
      }
      unsubscribe(channelName);
    };
  }, [threadId, enabled, subscribe, unsubscribe, onMessageReceived]);
}
