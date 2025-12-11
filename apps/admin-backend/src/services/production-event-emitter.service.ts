/**
 * Production Event Emitter Service
 *
 * Handles real-time event broadcasting for production status changes
 * Uses Redis Pub/Sub for scalability across multiple server instances
 */

import { Redis } from "ioredis";
import { Server as SocketIOServer } from "socket.io";
import { Logger } from "../utils/logger.js";

export interface ProductionStatusEvent {
  orderId: string;
  status: string;
  substage?: string;
  progress?: number;
  notes?: string;
  operatorId: string;
  timestamp: Date;
}

export interface ProductionIssueEvent {
  orderId: string;
  issueType: string;
  description: string;
  reportedBy: string;
  timestamp: Date;
}

export class ProductionEventEmitter {
  private redisPublisher: Redis;
  private redisSubscriber: Redis;
  private io: SocketIOServer | null = null;
  private readonly CHANNEL_PREFIX = "production:";

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    // Create separate Redis clients for pub and sub
    this.redisPublisher = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redisSubscriber = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.setupRedisHandlers();
  }

  /**
   * Set up Redis connection handlers
   */
  private setupRedisHandlers(): void {
    this.redisPublisher.on("connect", () => {
      Logger.success("[ProductionEventEmitter] Redis publisher connected");
    });

    this.redisPublisher.on("error", (err) => {
      Logger.error("[ProductionEventEmitter] Redis publisher error:", err);
    });

    this.redisSubscriber.on("connect", () => {
      Logger.success("[ProductionEventEmitter] Redis subscriber connected");
    });

    this.redisSubscriber.on("error", (err) => {
      Logger.error("[ProductionEventEmitter] Redis subscriber error:", err);
    });

    // Subscribe to production events
    this.redisSubscriber.psubscribe(`${this.CHANNEL_PREFIX}*`, (err) => {
      if (err) {
        Logger.error("[ProductionEventEmitter] Failed to subscribe:", err);
      } else {
        Logger.success(
          "[ProductionEventEmitter] Subscribed to production events"
        );
      }
    });

    // Handle incoming messages
    this.redisSubscriber.on("pmessage", (pattern, channel, message) => {
      this.handleRedisMessage(channel, message);
    });
  }

  /**
   * Initialize Socket.IO server
   * @param io - Socket.IO server instance
   */
  initializeSocketIO(io: SocketIOServer): void {
    this.io = io;
    Logger.success("[ProductionEventEmitter] Socket.IO initialized");
  }

  /**
   * Handle incoming Redis messages
   * @param channel - Redis channel
   * @param message - Message payload
   */
  private handleRedisMessage(channel: string, message: string): void {
    try {
      const data = JSON.parse(message);

      // Extract event type from channel
      const eventType = channel.replace(this.CHANNEL_PREFIX, "");

      // Emit to Socket.IO clients
      if (this.io) {
        this.io.emit(eventType, data);
        Logger.debug(`[ProductionEventEmitter] Emitted ${eventType} event`);
      }
    } catch (error) {
      Logger.error(
        "[ProductionEventEmitter] Error handling Redis message:",
        error
      );
    }
  }

  /**
   * Emit production status update event
   * @param event - Production status event data
   */
  async emitStatusUpdate(event: ProductionStatusEvent): Promise<void> {
    try {
      const channel = `${this.CHANNEL_PREFIX}status:updated`;
      const message = JSON.stringify(event);

      await this.redisPublisher.publish(channel, message);

      Logger.debug(
        `[ProductionEventEmitter] Published status update for order ${event.orderId}`
      );
    } catch (error) {
      Logger.error(
        "[ProductionEventEmitter] Error emitting status update:",
        error
      );
      throw error;
    }
  }

  /**
   * Emit production issue event
   * @param event - Production issue event data
   */
  async emitIssue(event: ProductionIssueEvent): Promise<void> {
    try {
      const channel = `${this.CHANNEL_PREFIX}issue:reported`;
      const message = JSON.stringify(event);

      await this.redisPublisher.publish(channel, message);

      Logger.debug(
        `[ProductionEventEmitter] Published issue for order ${event.orderId}`
      );
    } catch (error) {
      Logger.error("[ProductionEventEmitter] Error emitting issue:", error);
      throw error;
    }
  }

  /**
   * Close Redis connections
   */
  async close(): Promise<void> {
    await this.redisPublisher.quit();
    await this.redisSubscriber.quit();
    Logger.success("[ProductionEventEmitter] Redis connections closed");
  }
}

// Singleton instance
export const productionEventEmitter = new ProductionEventEmitter();
