// apps/customer-backend/src/controllers/thread.controller.js
// Thread Controller - HTTP Request/Response Handling

import { ThreadService } from "../services/thread.service.js";
import { ApiResponse } from "../shared/utils/api-response.util.js";
import { API_CODES } from "../shared/constants/api-codes.constants.js";

/**
 * Thread Controller
 * Handles HTTP requests for thread operations
 */
export class ThreadController {
  constructor() {
    this.threadService = new ThreadService();
  }

  /**
   * Create a new thread
   * @route POST /api/threads
   */
  createThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const data = req.body;

      const thread = await this.threadService.createThread(userId, data);

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ thread }, "Đã tạo thread thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get thread by ID
   * @route GET /api/threads/:id
   */
  getThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const thread = await this.threadService.getThread(userId, id);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ thread }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get threads by event
   * @route GET /api/threads/event/:referenceId
   * @query referenceType, status, page, limit, sortBy
   */
  getThreadsByEvent = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { referenceId } = req.params;
      const { referenceType, status, page, limit, sortBy } = req.query;

      if (!referenceType) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("referenceType is required"));
      }

      const options = {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        sortBy: sortBy || "lastMessageAt",
      };

      const result = await this.threadService.getThreadsByEvent(
        userId,
        referenceId,
        referenceType,
        options
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get threads by participant (current user)
   * @route GET /api/threads/my-threads
   * @query status, tags, page, limit
   */
  getMyThreads = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { status, tags, page, limit } = req.query;

      const filters = {
        status,
        tags: tags ? tags.split(",") : undefined,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      };

      const result = await this.threadService.getThreadsByParticipant(
        userId,
        filters
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update thread
   * @route PUT /api/threads/:id
   */
  updateThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const data = req.body;

      const thread = await this.threadService.updateThread(userId, id, data);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã cập nhật thread!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete thread
   * @route DELETE /api/threads/:id
   */
  deleteThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      await this.threadService.deleteThread(userId, id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa thread!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resolve thread
   * @route POST /api/threads/:id/resolve
   */
  resolveThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const { resolutionNotes } = req.body;

      const thread = await this.threadService.resolveThread(
        userId,
        id,
        resolutionNotes
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { thread },
            "Đã đánh dấu thread là đã giải quyết!"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reopen thread
   * @route POST /api/threads/:id/reopen
   */
  reopenThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const thread = await this.threadService.reopenThread(userId, id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã mở lại thread!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Archive thread
   * @route POST /api/threads/:id/archive
   */
  archiveThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const thread = await this.threadService.archiveThread(userId, id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã archive thread!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Pin thread
   * @route POST /api/threads/:id/pin
   */
  pinThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const thread = await this.threadService.pinThread(userId, id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã pin thread!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unpin thread
   * @route POST /api/threads/:id/unpin
   */
  unpinThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const thread = await this.threadService.unpinThread(userId, id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã unpin thread!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add participant to thread
   * @route POST /api/threads/:id/participants
   */
  addParticipant = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const { participantUserId, role } = req.body;

      if (!participantUserId) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("participantUserId is required"));
      }

      const thread = await this.threadService.addParticipant(
        userId,
        id,
        participantUserId,
        role
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã thêm người vào thread!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove participant from thread
   * @route DELETE /api/threads/:id/participants/:participantUserId
   */
  removeParticipant = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id, participantUserId } = req.params;

      const thread = await this.threadService.removeParticipant(
        userId,
        id,
        participantUserId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã xóa người khỏi thread!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Leave thread
   * @route POST /api/threads/:id/leave
   */
  leaveThread = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      await this.threadService.leaveThread(userId, id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã rời khỏi thread!"));
    } catch (error) {
      next(error);
    }
  };
}
