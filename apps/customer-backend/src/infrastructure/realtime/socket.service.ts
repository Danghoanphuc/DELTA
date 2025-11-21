// apps/customer-backend/src/infrastructure/realtime/socket.service.ts
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import jwt from "jsonwebtoken";
import { type Server as HttpServer } from "http";
import { config } from "../../config/env.config.js";
import { Logger } from "../../shared/utils/index.js";
// Giả sử bạn có types cho models, nếu không có thể dùng any hoặc import model JS
import { User } from "../../shared/models/user.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

// Định nghĩa interface cho Socket đã xác thực
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

  /**
   * Initialize Socket.io server with Redis Adapter
   */
  public initialize(httpServer: HttpServer) {
    if (this.isInitialized) {
      Logger.warn("[SocketService] Already initialized");
      return;
    }

    // 1. Khởi tạo Redis
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    this.redisPubClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

    this.redisSubClient = this.redisPubClient.duplicate();

    // 2. Khởi tạo Socket.IO
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

    // Error handling cho Redis
    this.redisPubClient.on("error", (err) =>
      Logger.error("[SocketService] Redis Pub Error:", err)
    );
    this.redisSubClient.on("error", (err) =>
      Logger.error("[SocketService] Redis Sub Error:", err)
    );

    // 3. Middleware JWT
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token as string;

        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        const decoded: any = jwt.verify(
          token,
          config.auth.accessTokenSecret || "secret"
        );

        if (!decoded || !decoded.userId) {
          return next(new Error("Authentication error: Invalid token"));
        }

        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        socket.userRole = decoded.role;

        next();
      } catch (error) {
        Logger.error("[SocketService] Auth error:", error);
        next(new Error("Authentication error"));
      }
    });

    // 4. Connection Handler
    this.io.on("connection", async (socket: AuthenticatedSocket) => {
      await this.handleConnection(socket);
    });

    this.isInitialized = true;
    Logger.success("[SocketService] Socket.io initialized successfully");
  }

  private async handleConnection(socket: AuthenticatedSocket) {
    const { userId, userRole } = socket;

    if (!userId) return;

    // Join user room
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    Logger.info(`[Socket] Joined room: ${userRoom}`);

    // Join role room
    if (userRole) {
      socket.join(`role:${userRole}`);
    }

    try {
      // Check printer profile
      // Lưu ý: Trong file TS, dùng await User.findById cần đảm bảo User model hỗ trợ TS hoặc dùng any
      const user: any = await User.findById(userId).lean();

      if (user && user.printerProfileId) {
        const printerProfile: any = await PrinterProfile.findById(
          user.printerProfileId
        ).lean();

        if (printerProfile && printerProfile.isVerified) {
          const printerRoom = `printer:${user.printerProfileId}`;
          socket.join(printerRoom);
          socket.printerProfileId = user.printerProfileId.toString();
          Logger.info(`[Socket] Joined PRINTER room: ${printerRoom}`);
        }
      }

      socket.emit("connected", { message: "Connected", userId });

      // Events
      socket.on("typing_start", (data) =>
        this.handleTyping(socket, data, true)
      );
      socket.on("typing_stop", (data) =>
        this.handleTyping(socket, data, false)
      );
    } catch (error) {
      Logger.error(`[Socket] Connection handling error for ${userId}`, error);
    }
  }

  private handleTyping(
    socket: AuthenticatedSocket,
    data: any,
    isTyping: boolean
  ) {
    const { recipientId, conversationId } = data;
    if (recipientId) {
      this.emitToUser(recipientId, "partner_typing", {
        conversationId,
        userId: socket.userId,
        isTyping,
      });
    }
  }

  /**
   * Emit event tới Room cụ thể
   */
  public emitToRoom(room: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  /**
   * ✅ Hàm quan trọng đang bị thiếu ở file cũ
   * Gửi event tới user cụ thể thông qua room "user:ID"
   */
  public emitToUser(userId: string, event: string, data: any) {
    const room = `user:${userId}`;
    this.emitToRoom(room, event, data);
  }

  /**
   * Gửi event tới printer
   */
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
