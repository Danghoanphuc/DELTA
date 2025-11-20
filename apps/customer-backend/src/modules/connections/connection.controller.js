// apps/customer-backend/src/modules/connections/connection.controller.js
// ✅ SOCIAL: Connection Controller

import { ConnectionService } from "./connection.service.js";
import { Logger } from "../../shared/utils/index.js";

export class ConnectionController {
  constructor() {
    this.connectionService = new ConnectionService();
  }

  /**
   * POST /api/connections/request
   * Gửi lời mời kết bạn
   */
  sendRequest = async (req, res, next) => {
    try {
      const requesterId = req.user._id;
      const { recipientId, message } = req.body;

      Logger.debug(
        `[ConnectionCtrl] Send request: ${requesterId} → ${recipientId}`
      );

      const connection = await this.connectionService.sendConnectionRequest(
        requesterId,
        recipientId,
        message
      );

      res.status(201).json({
        success: true,
        message: "Đã gửi lời mời kết bạn",
        data: { connection },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/connections
   * Lấy danh sách bạn bè
   */
  getFriends = async (req, res, next) => {
    try {
      const userId = req.user._id;

      Logger.debug(`[ConnectionCtrl] Get friends for user: ${userId}`);

      const friends = await this.connectionService.getFriends(userId);

      res.json({
        success: true,
        data: { friends, count: friends.length },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/connections/pending
   * Lấy lời mời đang chờ (received)
   */
  getPendingRequests = async (req, res, next) => {
    try {
      const userId = req.user._id;

      Logger.debug(
        `[ConnectionCtrl] Get pending requests for user: ${userId}`
      );

      const requests = await this.connectionService.getPendingRequests(userId);

      res.json({
        success: true,
        data: { requests, count: requests.length },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/connections/sent
   * Lấy lời mời đã gửi (sent)
   */
  getSentRequests = async (req, res, next) => {
    try {
      const userId = req.user._id;

      Logger.debug(`[ConnectionCtrl] Get sent requests for user: ${userId}`);

      const requests = await this.connectionService.getSentRequests(userId);

      res.json({
        success: true,
        data: { requests, count: requests.length },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/connections/:id/accept
   * Chấp nhận lời mời kết bạn
   */
  acceptConnection = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id: connectionId } = req.params;

      Logger.debug(
        `[ConnectionCtrl] Accept connection: ${connectionId} by user: ${userId}`
      );

      const connection = await this.connectionService.acceptConnection(
        connectionId,
        userId
      );

      res.json({
        success: true,
        message: "Đã chấp nhận lời mời kết bạn",
        data: { connection },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/connections/:id/decline
   * Từ chối lời mời kết bạn
   */
  declineConnection = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id: connectionId } = req.params;

      Logger.debug(
        `[ConnectionCtrl] Decline connection: ${connectionId} by user: ${userId}`
      );

      await this.connectionService.declineConnection(connectionId, userId);

      res.json({
        success: true,
        message: "Đã từ chối lời mời kết bạn",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/connections/:id
   * Hủy kết bạn
   */
  unfriend = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id: connectionId } = req.params;

      Logger.debug(
        `[ConnectionCtrl] Unfriend: ${connectionId} by user: ${userId}`
      );

      await this.connectionService.unfriend(connectionId, userId);

      res.json({
        success: true,
        message: "Đã hủy kết bạn",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/connections/block
   * Block user
   */
  blockUser = async (req, res, next) => {
    try {
      const requesterId = req.user._id;
      const { recipientId } = req.body;

      Logger.debug(
        `[ConnectionCtrl] Block user: ${requesterId} → ${recipientId}`
      );

      const connection = await this.connectionService.blockUser(
        requesterId,
        recipientId
      );

      res.json({
        success: true,
        message: "Đã chặn người dùng",
        data: { connection },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/connections/:id/unblock
   * Unblock user
   */
  unblockUser = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id: connectionId } = req.params;

      Logger.debug(
        `[ConnectionCtrl] Unblock: ${connectionId} by user: ${userId}`
      );

      await this.connectionService.unblockUser(connectionId, userId);

      res.json({
        success: true,
        message: "Đã bỏ chặn người dùng",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/connections/search?q=...
   * Search users để thêm bạn
   */
  searchUsers = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { q: query, limit = 20 } = req.query;

      Logger.debug(`[ConnectionCtrl] Search users: query="${query}"`);

      const users = await this.connectionService.searchUsers(
        query,
        userId,
        parseInt(limit)
      );

      res.json({
        success: true,
        data: { users, count: users.length },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/connections/status/:userId
   * Kiểm tra connection status với user khác
   */
  getConnectionStatus = async (req, res, next) => {
    try {
      const currentUserId = req.user._id;
      const { userId: targetUserId } = req.params;

      Logger.debug(
        `[ConnectionCtrl] Get connection status: ${currentUserId} ↔ ${targetUserId}`
      );

      const status = await this.connectionService.getConnectionStatus(
        currentUserId,
        targetUserId
      );

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/connections/debug/clear/:userId
   * DEBUG: Xóa connection với user (để test)
   */
  debugClearConnection = async (req, res, next) => {
    try {
      const currentUserId = req.user._id;
      const { userId: targetUserId } = req.params;

      Logger.warn(
        `[ConnectionCtrl] DEBUG: Clearing connection: ${currentUserId} ↔ ${targetUserId}`
      );

      await this.connectionService.debugClearConnection(
        currentUserId,
        targetUserId
      );

      res.json({
        success: true,
        message: "Đã xóa connection để test",
      });
    } catch (error) {
      next(error);
    }
  };
}

