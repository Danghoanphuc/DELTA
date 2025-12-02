// apps/customer-backend/src/modules/connections/connection.routes.js
// ✅ SOCIAL: Connection Routes

import { Router } from "express";
import { ConnectionController } from "./connection.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const connectionController = new ConnectionController();

/**
 * @route   POST /api/connections/send
 * @desc    Gửi lời mời kết bạn
 * @access  Private
 */
router.post("/send", protect, connectionController.sendRequest);

/**
 * @route   GET /api/connections/friends
 * @desc    Lấy danh sách bạn bè
 * @access  Private
 */
router.get("/friends", protect, connectionController.getFriends);

/**
 * @route   GET /api/connections (alias)
 * @desc    Lấy danh sách bạn bè
 * @access  Private
 */
router.get("/", protect, connectionController.getFriends);

/**
 * @route   GET /api/connections/pending
 * @desc    Lấy lời mời kết bạn đang chờ (received)
 * @access  Private
 */
router.get("/pending", protect, connectionController.getPendingRequests);

/**
 * @route   GET /api/connections/sent
 * @desc    Lấy lời mời kết bạn đã gửi (sent)
 * @access  Private
 */
router.get("/sent", protect, connectionController.getSentRequests);

/**
 * @route   GET /api/connections/search?q=username
 * @desc    Tìm kiếm users để thêm bạn
 * @access  Private
 */
router.get("/search", protect, connectionController.searchUsers);

/**
 * @route   GET /api/connections/status/:userId
 * @desc    Kiểm tra connection status với user khác
 * @access  Private
 */
router.get("/status/:userId", protect, connectionController.getConnectionStatus);

/**
 * @route   PUT /api/connections/:id/accept
 * @desc    Chấp nhận lời mời kết bạn
 * @access  Private
 */
router.put("/:id/accept", protect, connectionController.acceptConnection);

/**
 * @route   PUT /api/connections/:id/decline
 * @desc    Từ chối lời mời kết bạn
 * @access  Private
 */
router.put("/:id/decline", protect, connectionController.declineConnection);

/**
 * @route   DELETE /api/connections/:id
 * @desc    Hủy kết bạn (unfriend)
 * @access  Private
 */
router.delete("/:id", protect, connectionController.unfriend);

/**
 * @route   POST /api/connections/block
 * @desc    Block user
 * @access  Private
 */
router.post("/block", protect, connectionController.blockUser);

/**
 * @route   DELETE /api/connections/:id/unblock
 * @desc    Unblock user
 * @access  Private
 */
router.delete("/:id/unblock", protect, connectionController.unblockUser);

/**
 * @route   DELETE /api/connections/debug/clear/:userId
 * @desc    DEBUG: Xóa connection với user (để test)
 * @access  Private
 */
router.delete("/debug/clear/:userId", protect, connectionController.debugClearConnection);

export default router;

