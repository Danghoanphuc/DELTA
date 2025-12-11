// apps/admin-backend/src/infrastructure/realtime/pusher.service.ts
/**
 * Pusher Service for Admin Backend
 * Real-time communication service
 */

import Pusher from "pusher";
import { config } from "../../config/env.config.js";

class PusherService {
  private pusher: Pusher | null = null;

  constructor() {
    try {
      if (
        process.env.PUSHER_APP_ID &&
        process.env.PUSHER_KEY &&
        process.env.PUSHER_SECRET
      ) {
        this.pusher = new Pusher({
          appId: process.env.PUSHER_APP_ID,
          key: process.env.PUSHER_KEY,
          secret: process.env.PUSHER_SECRET,
          cluster: process.env.PUSHER_CLUSTER || "ap1",
          useTLS: true,
        });
        console.log("[Pusher] Initialized successfully");
      } else {
        console.warn(
          "[Pusher] Missing configuration (PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET)"
        );
      }
    } catch (error) {
      console.error("[Pusher] Initialization error:", error);
      this.pusher = null;
    }
  }

  get pusherInstance() {
    return this.pusher;
  }

  /**
   * Emit event to user's private channel
   */
  emitToUser(userId: string, eventName: string, data: any) {
    if (!this.pusher || !userId) {
      console.warn(
        `[Pusher] Cannot emit - pusher: ${!!this.pusher}, userId: ${!!userId}`
      );
      return;
    }

    const channel = `private-user-${userId}`;

    this.pusher
      .trigger(channel, eventName, data)
      .then(() => {
        console.log(`[Pusher] ✅ Emitted ${eventName} to ${channel}`);
      })
      .catch((err) => {
        console.error(`[Pusher] ❌ Emit Error to ${channel}:`, err);
      });
  }

  /**
   * Emit event to public channel
   */
  trigger(channel: string, eventName: string, data: any) {
    if (!this.pusher) {
      console.warn("[Pusher] Cannot trigger - pusher not initialized");
      return;
    }

    this.pusher
      .trigger(channel, eventName, data)
      .then(() => {
        console.log(`[Pusher] ✅ Triggered ${eventName} on ${channel}`);
      })
      .catch((err) => {
        console.error(`[Pusher] ❌ Trigger Error on ${channel}:`, err);
      });
  }
}

export const pusherService = new PusherService();
