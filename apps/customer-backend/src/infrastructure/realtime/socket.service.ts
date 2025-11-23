// apps/customer-backend/src/infrastructure/realtime/socket.service.ts

import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import jwt from "jsonwebtoken";
import { type Server as HttpServer } from "http";
import { config } from "../../config/env.config.js";
import { Logger } from "../../shared/utils/index.js";
import { User } from "../../shared/models/user.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  printerProfileId?: string;
}

class SocketService {
  private io: Server | null = null;
  private redisPubClient: Redis | null = null;
  private redisSubClient: Redis | null = null;
  private isInitialized = false;

  public initialize(httpServer: HttpServer) {
    if (this.isInitialized) {
      Logger.warn("[SocketService] Already initialized");
      return;
    }

    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    this.redisPubClient = new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    this.redisSubClient = this.redisPubClient.duplicate();

    this.io = new Server(httpServer, {
      cors: {
        origin: config.clientUrls || "*",
        credentials: true,
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
      adapter: createAdapter(this.redisPubClient, this.redisSubClient),
    });

    Logger.success("[SocketService] Redis Adapter initialized for Socket.IO");

    this.redisPubClient.on("error", (err) => Logger.error("[SocketService] Redis Pub Error:", err));
    this.redisSubClient.on("error", (err) => Logger.error("[SocketService] Redis Sub Error:", err));

    // Middleware JWT
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token as string;
        if (!token) return next(new Error("Authentication error: No token provided"));

        const decoded: any = jwt.verify(token, config.auth.accessTokenSecret || "secret");
        if (!decoded || !decoded.userId) return next(new Error("Authentication error: Invalid token"));

        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        socket.userRole = decoded.role;

        next();
      } catch (error: any) {
        if (error.name === "TokenExpiredError") {
          return next(new Error("Authentication error: Token expired"));
        }
        return next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", async (socket: AuthenticatedSocket) => {
      await this.handleConnection(socket);
    });

    this.isInitialized = true;
    Logger.success("[SocketService] Socket.io initialized successfully");
  }

  private async handleConnection(socket: AuthenticatedSocket) {
    const { userId, userRole } = socket;
    if (!userId) return;

    // 1. Join Room
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    if (userRole) socket.join(`role:${userRole}`);

    // 2. Printer Room logic
    try {
      const user: any = await User.findById(userId).lean();
      if (user?.printerProfileId) {
        const printerProfile: any = await PrinterProfile.findById(user.printerProfileId).lean();
        if (printerProfile?.isVerified) {
          const printerRoom = `printer:${user.printerProfileId}`;
          socket.join(printerRoom);
          socket.printerProfileId = user.printerProfileId.toString();
        }
      }
    } catch (error) {
      Logger.error(`[Socket] Error joining printer room for ${userId}`, error);
    }

    // 3. ✅ CẬP NHẬT TRẠNG THÁI ONLINE
    await this.updateUserStatus(userId, true);

    socket.emit("connected", { message: "Connected", userId });

    socket.on("typing_start", (data) => this.handleTyping(socket, data, true));
    socket.on("typing_stop", (data) => this.handleTyping(socket, data, false));

    // 4. ✅ XỬ LÝ NGẮT KẾT NỐI (OFFLINE)
    socket.on("disconnect", async () => {
      Logger.info(`[Socket] Disconnected: ${userId}`);
      await this.updateUserStatus(userId, false);
    });
  }

  /**
   * ✅ Helper cập nhật trạng thái user và thông báo cho toàn hệ thống (hoặc bạn bè)
   */
  private async updateUserStatus(userId: string, isOnline: boolean) {
    try {
      console.log(`🔌 [Socket] Updating User ${userId} -> ${isOnline ? 'ONLINE' : 'OFFLINE'}`); // ✅ THÊM LOG NÀY
      
      // 1. Update Database
      await User.findByIdAndUpdate(userId, { 
        isOnline, 
        lastSeen: new Date() 
      });

      // 2. Bắn sự kiện global để Frontend cập nhật UI
      // (Frontend sẽ check nếu user này nằm trong danh sách bạn bè thì đổi màu chấm xanh)
      if (this.io) {
        this.io.emit("user_status_change", { 
            userId, 
            isOnline, 
            lastSeen: new Date() 
        });
        Logger.info(`[Socket] Emitted user_status_change for ${userId}: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      }
    } catch (error) {
      Logger.error(`[Socket] Error updating status for ${userId}:`, error);
    }
  }

  private handleTyping(socket: AuthenticatedSocket, data: any, isTyping: boolean) {
    const { recipientId, conversationId } = data;
    if (recipientId) {
      this.emitToUser(recipientId, "partner_typing", {
        conversationId,
        userId: socket.userId,
        isTyping,
      });
    }
  }

  public emitToRoom(room: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  public emitToUser(userId: string, event: string, data: any) {
    const room = `user:${userId}`;
    this.emitToRoom(room, event, data);
  }

  public emitToPrinter(printerProfileId: string, event: string, data: any) {
    const room = `printer:${printerProfileId}`;
    this.emitToRoom(room, event, data);
  }

  public getIO(): Server {
    if (!this.io) throw new Error("Socket.io not initialized!");
    return this.io;
  }
}

export const socketService = new SocketService();