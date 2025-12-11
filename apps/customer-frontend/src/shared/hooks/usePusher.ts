// apps/customer-frontend/src/shared/hooks/usePusher.ts
/**
 * Pusher hook wrapper
 * Provides simplified interface for Pusher subscriptions
 */

import { useSocket } from "@/contexts/SocketProvider";
import { useCallback } from "react";

export function usePusher() {
  const { pusher, isConnected } = useSocket();

  const subscribe = useCallback(
    (channelName: string) => {
      console.log(
        `[usePusher] Subscribe called - pusher: ${!!pusher}, isConnected: ${isConnected}, channel: ${channelName}`
      );

      if (!pusher) {
        console.error("[usePusher] ❌ Pusher instance not available!");
        return null;
      }

      if (!isConnected) {
        console.warn(
          "[usePusher] ⚠️ Pusher not connected yet, subscribing anyway..."
        );
      }

      // Check if already subscribed
      let channel = pusher.channel(channelName);
      if (channel) {
        console.log(`[usePusher] ✅ Already subscribed to ${channelName}`);
        return channel;
      }

      console.log(`[usePusher] 📡 Subscribing to ${channelName}`);
      channel = pusher.subscribe(channelName);

      if (!channel) {
        console.error(`[usePusher] ❌ Failed to subscribe to ${channelName}`);
        return null;
      }

      console.log(`[usePusher] ✅ Subscribed to ${channelName}`);
      return channel;
    },
    [pusher, isConnected]
  );

  const unsubscribe = useCallback(
    (channelName: string) => {
      if (!pusher) return;

      console.log(`[usePusher] 🧹 Unsubscribing from ${channelName}`);
      pusher.unsubscribe(channelName);
    },
    [pusher]
  );

  return {
    pusher,
    isConnected,
    subscribe,
    unsubscribe,
  };
}
