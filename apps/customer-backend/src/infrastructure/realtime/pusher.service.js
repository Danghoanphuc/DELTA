// apps/customer-backend/src/infrastructure/realtime/pusher.service.js
// ✅ Pusher Service - Thay thế Socket.io (giữ nguyên interface để tương thích)

import Pusher from "pusher";
import { Logger } from "../../shared/utils/index.js";

class SocketService {
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
        Logger.info("[Pusher] Initialized successfully");
      } else {
        Logger.warn(
          "[Pusher] Missing configuration (PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET)"
        );
        this.pusher = null;
      }
    } catch (error) {
      console.error("[Pusher] Initialization error:", error);
      Logger.error("[Pusher] Initialization error:", error);
      this.pusher = null;
    }
  }

  // ✅ Expose pusher property để health check có thể truy cập
  get pusherInstance() {
    return this.pusher;
  }

  /**
   * Mock hàm init worker cũ (không cần thiết với Pusher)
   * Giữ lại để tương thích với code cũ
   */
  initializeWorker() {
    Logger.info("[Pusher] Worker mode initialized (no-op)");
  }

  /**
   * Mock hàm initialize cho HTTP server (không cần thiết với Pusher)
   * Giữ lại để tương thích với code cũ
   */
  initialize(httpServer) {
    Logger.info("[Pusher] Server mode initialized (no-op)");
  }

  /**
   * Gửi event tới User cụ thể
   * Channel quy ước: "private-user-{userId}" hoặc "public-user-{userId}" (nếu chưa có auth)
   * @param {String} userId - User ID
   * @param {String} eventName - Event name
   * @param {Object} data - Event data
   */
  emitToUser(userId, eventName, data) {
    if (!this.pusher || !userId) {
      Logger.warn(
        `[Pusher] Cannot emit - pusher: ${!!this.pusher}, userId: ${!!userId}`
      );
      return;
    }

    const channel = `private-user-${userId}`;

    Logger.info(`[Pusher] 📤 Emitting ${eventName} to ${channel}`, {
      dataKeys: Object.keys(data || {}),
      messageId: data?._id || data?.messageId,
      conversationId: data?.conversationId,
    });

    this.pusher
      .trigger(channel, eventName, data)
      .then(() => {
        Logger.info(
          `[Pusher] ✅ Successfully emitted ${eventName} to ${channel}`
        );
      })
      .catch((err) => {
        Logger.error(`[Pusher] ❌ Emit Error to ${channel}:`, err);
      });
  }

  /**
   * Tương thích ngược với Worker
   * @param {String} userId - User ID
   * @param {String} eventName - Event name
   * @param {Object} data - Event data
   */
  emitFromWorker(userId, eventName, data) {
    this.emitToUser(userId, eventName, data);
  }

  /**
   * Gửi event tới Printer (tương thích với code cũ)
   * @param {String} printerId - Printer ID
   * @param {String} eventName - Event name
   * @param {Object} data - Event data
   */
  emitToPrinter(printerId, eventName, data) {
    if (!this.pusher || !printerId) return;

    const channel = `public-printer-${printerId}`;

    this.pusher.trigger(channel, eventName, data).catch((err) => {
      Logger.error(`[Pusher] Emit Error to ${channel}:`, err);
    });
  }

  /**
   * Gửi event tới Role (tương thích với code cũ)
   * @param {String} role - Role name (admin, printer, etc.)
   * @param {String} eventName - Event name
   * @param {Object} data - Event data
   */
  emitToRole(role, eventName, data) {
    if (!this.pusher || !role) return;

    const channel = `public-role-${role}`;

    this.pusher.trigger(channel, eventName, data).catch((err) => {
      Logger.error(`[Pusher] Emit Error to ${channel}:`, err);
    });
  }

  /**
   * Mock hàm getIO (tương thích với code cũ)
   * @returns {null} Pusher không có IO object như Socket.io
   */
  getIO() {
    Logger.warn("[Pusher] getIO() called - Pusher doesn't have IO object");
    return null;
  }

  /**
   * Mock hàm isUserConnected (tương thích với code cũ)
   * @param {String} userId - User ID
   * @returns {Promise<boolean>} Always returns false (Pusher doesn't track connections server-side)
   */
  async isUserConnected(userId) {
    Logger.warn(
      "[Pusher] isUserConnected() called - Pusher doesn't track connections server-side"
    );
    return false;
  }

  /**
   * Mock hàm getStats (tương thích với code cũ)
   * @returns {Promise<Object>} Empty stats object
   */
  async getStats() {
    Logger.warn(
      "[Pusher] getStats() called - Pusher doesn't provide connection stats"
    );
    return {
      totalConnections: 0,
      users: {},
    };
  }

  /**
   * Authenticate Pusher channel (dùng cho private channels)
   * @param {String} socketId - Pusher socket ID
   * @param {String} channelName - Channel name
   * @returns {Object} Auth signature
   */
  authenticate(socketId, channelName) {
    if (!this.pusher) {
      throw new Error("Pusher not initialized");
    }
    return this.pusher.authorizeChannel(socketId, channelName);
  }
}

export const socketService = new SocketService();
