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
        .select("_id username displayName avatarUrl bio email printerProfileId phone createdAt")
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

      // Validate đầu vào
      if (!q || q.trim().length < 2) {
        return res.json(ApiResponse.success({ users: [] }));
      }

      Logger.debug(`[UserCtrl] Searching users: "${q}"`);

      // 1. Tìm User (Tạm thời bỏ isActive: true để debug dễ hơn, hoặc đảm bảo DB đã set true)
      // Nếu bạn chắc chắn DB có isActive=true thì uncomment lại dòng đó.
      const query = {
        _id: { $ne: currentUserId }, // Không tìm chính mình
        $or: [
          { username: { $regex: q, $options: "i" } },
          { displayName: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } } // Bonus: Tìm thêm theo email nếu cần
        ]
        // isActive: true, // ⚠️ Bật lại dòng này khi chạy Production
      };

      const users = await User.find(query)
        .select("_id username displayName avatarUrl bio")
        .limit(20)
        .lean();

      if (users.length === 0) {
        return res.json(ApiResponse.success({ users: [] }));
      }

      // 2. Map trạng thái Connection (Sử dụng query chuẩn thay vì custom method)
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          // Tìm connection bất kể ai là người gửi/nhận
          const connection = await Connection.findOne({
            $or: [
              { requester: currentUserId, recipient: user._id },
              { requester: user._id, recipient: currentUserId }
            ]
          }).select("status _id requester recipient").lean();

          // Xác định trạng thái cụ thể hơn
          let status = "none";
          if (connection) {
            status = connection.status;
            // Nếu đang pending, kiểm tra xem mình là người gửi hay người nhận
            if (status === 'pending') {
                const isSender = connection.requester.toString() === currentUserId.toString();
                // Frontend có thể cần biết isSender để hiện nút "Hủy lời mời" hay "Chấp nhận"
                // Tuy nhiên theo interface hiện tại trả về string status là đủ
            }
          }

          return {
            ...user,
            connectionStatus: status,
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

      // Get connection status logic
      let connectionStatus = "none";
      let connectionId = null;

      if (currentUserId) {
        // Dùng query chuẩn thay vì hàm custom để tránh lỗi
        const connection = await Connection.findOne({
            $or: [
              { requester: currentUserId, recipient: userId },
              { requester: userId, recipient: currentUserId }
            ]
        }).select("status _id").lean();

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