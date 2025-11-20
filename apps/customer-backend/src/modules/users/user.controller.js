// apps/customer-backend/src/modules/users/user.controller.js
// ✅ SOCIAL: Add search users functionality

import { User } from "../../shared/models/user.model.js";
import { Connection } from "../../shared/models/connection.model.js";
import { Logger } from "../../shared/utils/index.js";
import { ApiResponse, API_CODES } from "../../shared/utils/index.js";

export class UserController {
  /**
   * Get current logged-in user info
   * GET /api/users/me
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId)
        .select("_id username displayName avatarUrl bio email createdAt")
        .lean();

      if (!user) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("User not found"));
      }

      res.json(ApiResponse.success({ user }));
    } catch (error) {
      Logger.error("[UserCtrl] Error getting current user:", error);
      next(error);
    }
  }

  /**
   * ✅ SOCIAL: Search users by username or displayName
   * GET /api/users/search?q=keyword
   */
  async searchUsers(req, res, next) {
    try {
      const { q } = req.query;
      const currentUserId = req.user._id;

      if (!q || q.trim().length < 2) {
        return res.json(ApiResponse.success({ users: [] }));
      }

      Logger.debug(`[UserCtrl] Searching users: "${q}"`);

      // Search by username or displayName (case-insensitive)
      const users = await User.find({
        _id: { $ne: currentUserId }, // Exclude current user
        $or: [
          { username: { $regex: q, $options: "i" } },
          { displayName: { $regex: q, $options: "i" } },
        ],
        isActive: true,
      })
        .select("_id username displayName avatarUrl bio")
        .limit(20)
        .lean();

      // Get connection status for each user
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          const connection = await Connection.findConnectionByUsers(
            currentUserId,
            user._id
          );

          return {
            ...user,
            connectionStatus: connection ? connection.status : "none",
            connectionId: connection ? connection._id : null,
          };
        })
      );

      res.json(ApiResponse.success({ users: usersWithStatus }));
    } catch (error) {
      Logger.error("[UserCtrl] Error searching users:", error);
      next(error);
    }
  }

  /**
   * Get user profile by ID
   * GET /api/users/:userId
   */
  async getUserProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?._id;

      const user = await User.findById(userId)
        .select("_id username displayName avatarUrl bio createdAt")
        .lean();

      if (!user) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("User not found"));
      }

      // Get connection status
      let connectionStatus = "none";
      let connectionId = null;

      if (currentUserId) {
        const connection = await Connection.findConnectionByUsers(
          currentUserId,
          userId
        );

        if (connection) {
          connectionStatus = connection.status;
          connectionId = connection._id;
        }
      }

      res.json(
        ApiResponse.success({
          user: {
            ...user,
            connectionStatus,
            connectionId,
          },
        })
      );
    } catch (error) {
      Logger.error("[UserCtrl] Error getting user profile:", error);
      next(error);
    }
  }
}
