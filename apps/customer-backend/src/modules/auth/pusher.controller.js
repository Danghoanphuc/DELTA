// apps/customer-backend/src/modules/auth/pusher.controller.js
// ✅ Pusher Authentication Controller

import { socketService } from "../../infrastructure/realtime/pusher.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { Logger } from "../../shared/utils/index.js";

export class PusherController {
  /**
   * Authenticate Pusher private channel
   * POST /api/auth/pusher/auth
   */
  authenticate = async (req, res, next) => {
    try {
      const { socket_id, channel_name } = req.body;
      const userId = req.user?._id?.toString();

      if (!userId) {
        return res.status(401).json(
          ApiResponse.error("Unauthorized: User not authenticated")
        );
      }

      if (!socket_id || !channel_name) {
        return res.status(400).json(
          ApiResponse.error("Bad Request: Missing socket_id or channel_name")
        );
      }

      // ✅ Bảo mật: Chỉ cho phép user subscribe vào channel của chính mình
      // Quy ước channel: private-user-{userId}
      if (channel_name.startsWith("private-user-")) {
        const channelUserId = channel_name.replace("private-user-", "");
        if (channelUserId !== userId) {
          Logger.warn(
            `[Pusher Auth] User ${userId} attempted to access channel ${channel_name}`
          );
          return res.status(403).json(
            ApiResponse.error("Forbidden: Cannot subscribe to other user's channel")
          );
        }
      }

      // ✅ Tạo auth signature
      const auth = socketService.authenticate(socket_id, channel_name);
      
      Logger.info(`[Pusher Auth] Authenticated user ${userId} for channel ${channel_name}`);
      res.send(auth);
    } catch (error) {
      Logger.error("[Pusher Auth] Error:", error);
      next(error);
    }
  };
}

