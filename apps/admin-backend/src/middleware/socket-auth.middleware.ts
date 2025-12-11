/**
 * Socket.IO Authentication Middleware
 *
 * Authenticates WebSocket connections using JWT tokens
 */

import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Logger } from "../utils/logger.js";

export interface AuthenticatedSocket extends Socket {
  user?: {
    _id: string;
    email: string;
    role: string;
  };
}

/**
 * Socket.IO authentication middleware
 * Verifies JWT token from handshake auth or query
 */
export const socketAuthMiddleware = (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    // Get token from handshake auth or query
    const token =
      socket.handshake.auth?.token || (socket.handshake.query?.token as string);

    if (!token) {
      Logger.warn("[SocketAuth] No token provided");
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      Logger.error("[SocketAuth] JWT_SECRET not configured");
      return next(new Error("Server configuration error"));
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      _id: string;
      email: string;
      role: string;
    };

    // Attach user to socket
    socket.user = decoded;

    Logger.debug(`[SocketAuth] User ${decoded.email} authenticated`);
    next();
  } catch (error) {
    Logger.error("[SocketAuth] Authentication failed:", error);
    next(new Error("Authentication error: Invalid token"));
  }
};
