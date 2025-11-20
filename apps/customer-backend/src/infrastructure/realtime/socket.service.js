// apps/customer-backend/src/infrastructure/realtime/socket.service.js
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import IORedis from "ioredis";
import jwt from "jsonwebtoken";
import { config } from "../../config/env.config.js";
import { Logger } from "../../shared/utils/index.js";
import { User } from "../../shared/models/user.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

/**
 * SocketService - Singleton để quản lý Socket.io connections
 * 
 * ✅ REFACTOR: Nâng cấp với Redis Adapter cho Horizontal Scaling
 * 
 * Features:
 * - JWT Authentication cho socket connections
 * - Redis Adapter: Hỗ trợ multi-instance scaling
 * - Room-based messaging (user:userId, printer:printerId, role:admin)
 * - Không còn lưu socketId trong memory (anti-pattern cho cluster)
 */
class SocketService {
  constructor() {
    /** @type {Server|null} */
    this.io = null;
    
    /** @type {IORedis.Redis|null} Redis Pub client */
    this.redisPubClient = null;
    
    /** @type {IORedis.Redis|null} Redis Sub client */
    this.redisSubClient = null;
    
    this.isInitialized = false;
  }

  /**
   * Initialize Socket.io server with Redis Adapter
   * ✅ REFACTOR: Tích hợp Redis Adapter cho horizontal scaling
   * @param {import('http').Server} httpServer - HTTP server instance
   */
  initialize(httpServer) {
    if (this.isInitialized) {
      Logger.warn("[SocketService] Already initialized");
      return;
    }

    // ✅ REFACTOR: Khởi tạo Redis clients cho Adapter
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    this.redisPubClient = new IORedis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        Logger.warn(`[SocketService] Redis Pub retrying... attempt ${times}`);
        return delay;
      },
    });

    this.redisSubClient = this.redisPubClient.duplicate();

    // ✅ REFACTOR: Khởi tạo Socket.IO với Redis Adapter
    this.io = new Server(httpServer, {
      cors: {
        origin: config.clientUrls,
        credentials: true,
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
      adapter: createAdapter(this.redisPubClient, this.redisSubClient),
    });

    Logger.success("[SocketService] Redis Adapter initialized for Socket.IO");

    // ✅ REFACTOR: Event listeners cho Redis connections
    this.redisPubClient.on("error", (err) => {
      Logger.error("[SocketService] Redis Pub Client Error:", err);
    });

    this.redisSubClient.on("error", (err) => {
      Logger.error("[SocketService] Redis Sub Client Error:", err);
    });

    // ✅ Middleware: JWT Authentication
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          Logger.warn("[SocketService] Connection rejected: No token provided");
          return next(new Error("Authentication error: No token provided"));
        }

        // Verify JWT
        const decoded = jwt.verify(token, config.auth.accessTokenSecret);
        
        if (!decoded || !decoded.userId) {
          Logger.warn("[SocketService] Connection rejected: Invalid token");
          return next(new Error("Authentication error: Invalid token"));
        }

        // Attach user info to socket
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        socket.userRole = decoded.role;

        Logger.info(
          `[SocketService] Socket authenticated: userId=${decoded.userId}, email=${decoded.email}`
        );

        next();
      } catch (error) {
        Logger.error("[SocketService] Authentication error:", error);
        next(new Error("Authentication error"));
      }
    });

    // ✅ Connection Handler
    this.io.on("connection", async (socket) => {
      await this.handleConnection(socket);
    });

    this.isInitialized = true;
    Logger.success("[SocketService] Socket.io initialized successfully");
  }

  /**
   * Handle new socket connection
   * ✅ REFACTOR: Không còn track socketId trong Map, chỉ dùng rooms
   * @param {import('socket.io').Socket} socket
   */
  async handleConnection(socket) {
    const { userId, userEmail, userRole } = socket;

    Logger.info(
      `[SocketService] Client connected: socketId=${socket.id}, userId=${userId}, role=${userRole}`
    );

    try {
      // ✅ REFACTOR: Join user room (for user-specific notifications)
      const userRoom = `user:${userId}`;
      socket.join(userRoom);
      Logger.info(`[SocketService] Socket ${socket.id} joined room: ${userRoom}`);

      // ✅ REFACTOR: Join role-based room (for admin broadcast, etc.)
      if (userRole) {
        const roleRoom = `role:${userRole}`;
        socket.join(roleRoom);
        Logger.info(`[SocketService] Socket ${socket.id} joined role room: ${roleRoom}`);
      }

      // ✅ REFACTOR: Check if user is a Printer and join printer room
      const user = await User.findById(userId).lean();
      
      if (user && user.printerProfileId) {
        const printerProfile = await PrinterProfile.findById(
          user.printerProfileId
        ).lean();

        if (printerProfile && printerProfile.isVerified) {
          const printerRoom = `printer:${user.printerProfileId}`;
          socket.join(printerRoom);
          socket.printerProfileId = user.printerProfileId.toString();
          
          Logger.info(
            `[SocketService] Socket ${socket.id} joined PRINTER room: ${printerRoom}`
          );
        }
      }

      // Send welcome message
      socket.emit("connected", {
        message: "Connected to PrintZ real-time service",
        userId: userId,
        timestamp: new Date().toISOString(),
      });

      // ✅ Handle disconnection
      socket.on("disconnect", (reason) => {
        this.handleDisconnection(socket, reason);
      });

      // ✅ Handle custom events (optional)
      socket.on("ping", () => {
        socket.emit("pong", { timestamp: Date.now() });
      });

      // ✅ Handle user requesting to join specific rooms (optional)
      socket.on("subscribe", (data) => {
        this.handleSubscribe(socket, data);
      });

      // ✅ SOCIAL & ENTERPRISE: Setup event listeners
      this.setupConnectionEvents(socket);
      this.setupTypingEvents(socket);
      this.setupReadReceiptEvents(socket);
    } catch (error) {
      Logger.error(
        `[SocketService] Error handling connection for userId ${userId}:`,
        error
      );
    }
  }

  /**
   * Handle socket disconnection
   * ✅ REFACTOR: Chỉ log disconnect, không cần cleanup Map nữa (rooms tự động cleanup)
   * @param {import('socket.io').Socket} socket
   * @param {string} reason
   */
  handleDisconnection(socket, reason) {
    const { userId, userRole } = socket;

    Logger.info(
      `[SocketService] Client disconnected: socketId=${socket.id}, userId=${userId}, role=${userRole}, reason=${reason}`
    );

    // ✅ REFACTOR: Socket.IO tự động remove socket khỏi rooms khi disconnect
    // Không cần manual cleanup nữa
  }

  /**
   * Handle custom subscribe events
   * @param {import('socket.io').Socket} socket
   * @param {object} data
   */
  handleSubscribe(socket, data) {
    const { room } = data;
    
    if (!room) return;

    // Validate room access
    if (room.startsWith("user:") && room === `user:${socket.userId}`) {
      socket.join(room);
      Logger.info(`[SocketService] Socket ${socket.id} subscribed to ${room}`);
    } else if (room.startsWith("printer:") && socket.printerProfileId) {
      socket.join(room);
      Logger.info(`[SocketService] Socket ${socket.id} subscribed to ${room}`);
    } else {
      Logger.warn(
        `[SocketService] Socket ${socket.id} attempted to join unauthorized room: ${room}`
      );
    }
  }

  /**
   * Emit event to a specific room
   * @param {string} room - Room name (e.g., "user:123", "printer:456")
   * @param {string} event - Event name
   * @param {object} data - Event payload
   */
  emitToRoom(room, event, data) {
    if (!this.io) {
      Logger.warn("[SocketService] Socket.io not initialized");
      return;
    }

    this.io.to(room).emit(event, data);
    
    Logger.info(
      `[SocketService] Emitted event "${event}" to room "${room}"`,
      { dataPreview: JSON.stringify(data).substring(0, 100) }
    );
  }

  /**
   * Emit event to a specific user (all their connected sockets across all instances)
   * ✅ REFACTOR: Sử dụng room-based approach với Redis Adapter
   * @param {string} userId - User ID
   * @param {string} event - Event name
   * @param {object} data - Event payload
   */
  emitToUser(userId, event, data) {
    const room = `user:${userId}`;
    this.emitToRoom(room, event, data);
  }

  /**
   * Emit event to a specific printer (all their connected sockets across all instances)
   * ✅ REFACTOR: Sử dụng room-based approach với Redis Adapter
   * @param {string} printerProfileId - Printer Profile ID
   * @param {string} event - Event name
   * @param {object} data - Event payload
   */
  emitToPrinter(printerProfileId, event, data) {
    const room = `printer:${printerProfileId}`;
    this.emitToRoom(room, event, data);
  }

  /**
   * ✅ NEW: Emit event to all users with a specific role
   * @param {string} role - User role (e.g., 'admin', 'printer', 'customer')
   * @param {string} event - Event name
   * @param {object} data - Event payload
   */
  emitToRole(role, event, data) {
    const room = `role:${role}`;
    this.emitToRoom(room, event, data);
  }

  /**
   * Broadcast event to all connected clients
   * @param {string} event - Event name
   * @param {object} data - Event payload
   */
  broadcast(event, data) {
    if (!this.io) {
      Logger.warn("[SocketService] Socket.io not initialized");
      return;
    }

    this.io.emit(event, data);
    Logger.info(`[SocketService] Broadcasted event "${event}" to all clients`);
  }

  /**
   * Get connection statistics
   * ✅ REFACTOR: Updated để hoạt động với Redis Adapter (không còn this.userSockets)
   * @returns {Promise<object>}
   */
  async getStats() {
    if (!this.io) {
      return { connected: 0, rooms: 0 };
    }

    try {
      const sockets = await this.io.fetchSockets();
      const rooms = this.io.sockets.adapter.rooms;

      return {
        connectedSockets: sockets.length,
        totalRooms: rooms.size,
        // ✅ REFACTOR: Không còn track connectedUsers trong memory nữa
        // Có thể query Redis nếu cần: await this.io.in('user:*').fetchSockets()
      };
    } catch (error) {
      Logger.error("[SocketService] Error getting stats:", error);
      return { connected: 0, rooms: 0 };
    }
  }

  /**
   * Check if a user is currently connected (across all instances)
   * ✅ REFACTOR: Query rooms thay vì check Map
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async isUserConnected(userId) {
    if (!this.io) return false;

    try {
      const room = `user:${userId}`;
      const sockets = await this.io.in(room).fetchSockets();
      return sockets.length > 0;
    } catch (error) {
      Logger.error(`[SocketService] Error checking user connection for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get Socket.io instance
   * @returns {Server|null}
   */
  getIO() {
    return this.io;
  }

  // =====================================================
  // ✅ SOCIAL: CONNECTION EVENTS
  // =====================================================

  /**
   * Setup connection-related socket events
   * @param {import('socket.io').Socket} socket
   */
  setupConnectionEvents(socket) {
    // Listen for connection request status change
    socket.on("connection_request_sent", (data) => {
      const { recipientId, requestId } = data;
      
      // Notify recipient user about new connection request
      this.emitToUser(recipientId, "connection_request_received", {
        requestId,
        requesterId: socket.userId,
        timestamp: new Date().toISOString(),
      });
      
      Logger.info(`[SocketService] Connection request sent from ${socket.userId} to ${recipientId}`);
    });

    // Listen for connection accepted event
    socket.on("connection_accepted", (data) => {
      const { requesterId, connectionId } = data;
      
      // Notify requester that connection was accepted
      this.emitToUser(requesterId, "connection_accepted", {
        connectionId,
        accepterId: socket.userId,
        timestamp: new Date().toISOString(),
      });
      
      Logger.info(`[SocketService] Connection accepted: ${requesterId} ↔ ${socket.userId}`);
    });
  }

  // =====================================================
  // ✅ ENTERPRISE: TYPING INDICATOR EVENTS
  // =====================================================

  /**
   * Setup typing indicator events
   * @param {import('socket.io').Socket} socket
   */
  setupTypingEvents(socket) {
    // User started typing
    socket.on("typing_start", (data) => {
      const { conversationId, recipientId } = data;
      
      if (!conversationId || !recipientId) return;

      // Emit to recipient only
      this.emitToUser(recipientId, "partner_typing", {
        conversationId,
        userId: socket.userId,
        isTyping: true,
        timestamp: Date.now(),
      });
      
      Logger.debug(`[SocketService] User ${socket.userId} started typing in ${conversationId}`);
    });

    // User stopped typing
    socket.on("typing_stop", (data) => {
      const { conversationId, recipientId } = data;
      
      if (!conversationId || !recipientId) return;

      // Emit to recipient only
      this.emitToUser(recipientId, "partner_typing", {
        conversationId,
        userId: socket.userId,
        isTyping: false,
        timestamp: Date.now(),
      });
      
      Logger.debug(`[SocketService] User ${socket.userId} stopped typing in ${conversationId}`);
    });
  }

  // =====================================================
  // ✅ ENTERPRISE: READ RECEIPT EVENTS
  // =====================================================

  /**
   * Setup read receipt events
   * @param {import('socket.io').Socket} socket
   */
  setupReadReceiptEvents(socket) {
    // User marked conversation as read
    socket.on("mark_read", async (data) => {
      const { conversationId, messageId, recipientId } = data;
      
      if (!conversationId) return;

      try {
        // Update message status in DB (optional - implement in repository if needed)
        // await this.chatRepository.markMessageAsRead(messageId, socket.userId);

        // Emit to sender that message was read
        if (recipientId) {
          this.emitToUser(recipientId, "message_read", {
            conversationId,
            messageId,
            readBy: socket.userId,
            timestamp: Date.now(),
          });
        }
        
        Logger.debug(`[SocketService] User ${socket.userId} marked ${conversationId} as read`);
      } catch (error) {
        Logger.error("[SocketService] Error marking message as read:", error);
      }
    });

    // Message delivered acknowledgement
    socket.on("message_delivered", (data) => {
      const { messageId, senderId } = data;
      
      if (!messageId || !senderId) return;

      // Notify sender that message was delivered
      this.emitToUser(senderId, "message_delivered_ack", {
        messageId,
        deliveredTo: socket.userId,
        timestamp: Date.now(),
      });
      
      Logger.debug(`[SocketService] Message ${messageId} delivered to ${socket.userId}`);
    });
  }
}

// Export singleton instance
export const socketService = new SocketService();

