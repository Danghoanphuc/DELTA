// apps/admin-frontend/src/hooks/useAdminThreadRealtime.ts
/**
 * Hook for real-time thread updates via Pusher (Admin)
 */

import { useEffect, useRef } from "react";
import Pusher from "pusher-js";

interface UseAdminThreadRealtimeOptions {
  threadId: string | null;
  onMessageReceived?: (message?: any) => void;
  enabled?: boolean;
}

// Initialize Pusher client
let pusherClient: Pusher | null = null;

function getPusherClient(): Pusher | null {
  if (pusherClient) return pusherClient;

  const pusherKey = import.meta.env.VITE_PUSHER_KEY;
  const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || "ap1";

  console.log("[Pusher] Initializing with:", {
    key: pusherKey ? `${pusherKey.substring(0, 10)}...` : "NOT SET",
    cluster: pusherCluster,
  });

  if (!pusherKey) {
    console.error("[Pusher] ❌ VITE_PUSHER_KEY not configured!");
    return null;
  }

  pusherClient = new Pusher(pusherKey, {
    cluster: pusherCluster,
    forceTLS: true,
  });

  pusherClient.connection.bind("connected", () => {
    console.log("[Pusher] ✅ Connected successfully");
  });

  pusherClient.connection.bind("error", (err: any) => {
    console.error("[Pusher] ❌ Connection error:", err);
  });

  return pusherClient;
}

export function useAdminThreadRealtime({
  threadId,
  onMessageReceived,
  enabled = true,
}: UseAdminThreadRealtimeOptions) {
  // Use ref to avoid re-subscribing when callback changes
  const callbackRef = useRef(onMessageReceived);

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    if (!enabled || !threadId) {
      console.log(
        "[AdminThreadRealtime] Skipped - enabled:",
        enabled,
        "threadId:",
        threadId
      );
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) {
      console.error("[AdminThreadRealtime] ❌ Pusher client not available");
      return;
    }

    const channelName = `thread-${threadId}`;
    console.log(
      "[AdminThreadRealtime] 📡 Subscribing to channel:",
      channelName
    );

    const channel = pusher.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log(
        "[AdminThreadRealtime] ✅ Successfully subscribed to:",
        channelName
      );
    });

    channel.bind("pusher:subscription_error", (error: any) => {
      console.error("[AdminThreadRealtime] ❌ Subscription error:", error);
    });

    // Listen for new messages
    channel.bind("message:new", (data: any) => {
      console.log("[AdminThreadRealtime] 📨 New message received:", data);
      if (callbackRef.current && data.message) {
        console.log("[AdminThreadRealtime] Adding message:", data.message);
        callbackRef.current(data.message);
      }
    });

    // Listen for message updates
    channel.bind("message:update", (data: any) => {
      console.log("[AdminThreadRealtime] Message updated:", data);
      if (callbackRef.current) {
        callbackRef.current();
      }
    });

    // Listen for message deletes
    channel.bind("message:delete", (data: any) => {
      console.log("[AdminThreadRealtime] Message deleted:", data);
      if (callbackRef.current) {
        callbackRef.current();
      }
    });

    // Cleanup on unmount
    return () => {
      console.log("[AdminThreadRealtime] 🧹 Cleaning up:", channelName);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [threadId, enabled]); // Remove onMessageReceived from dependencies
}
