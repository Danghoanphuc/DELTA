// apps/customer-backend/src/controllers/participant.controller.js
// Participant Controller - HTTP Request Handlers

import { ParticipantService } from "../services/participant.service.js";
import { ParticipantRepository } from "../repositories/participant.repository.js";
import { ApiResponse } from "../shared/utils/api-response.util.js";
import { API_CODES } from "../shared/constants/api-codes.constants.js";

/**
 * Participant Controller
 * Handles HTTP requests for participant management
 */
export class ParticipantController {
  constructor() {
    this.participantService = new ParticipantService();
    this.participantRepository = new ParticipantRepository();
  }

  /**
   * Get participants for a thread
   * @route GET /api/threads/:threadId/participants
   */
  getParticipants = async (req, res, next) => {
    try {
      const { threadId } = req.params;

      const participants = await this.participantRepository.getParticipants(
        threadId
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ participants }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add participants to thread
   * @route POST /api/threads/:threadId/participants
   */
  addParticipants = async (req, res, next) => {
    try {
      const { threadId } = req.params;
      const { userIds, role } = req.body;

      const result = await this.participantService.addParticipants(
        threadId,
        userIds,
        role
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Đã thêm ${result.added.length} người vào thread`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove participant from thread
   * @route DELETE /api/threads/:threadId/participants/:userId
   */
  removeParticipant = async (req, res, next) => {
    try {
      const { threadId, userId } = req.params;

      await this.participantService.removeParticipant(threadId, userId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa người dùng khỏi thread"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update participant role
   * @route PUT /api/threads/:threadId/participants/:userId/role
   */
  updateParticipantRole = async (req, res, next) => {
    try {
      const { threadId, userId } = req.params;
      const { role } = req.body;

      const thread = await this.participantService.updateParticipantRole(
        threadId,
        userId,
        role
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã cập nhật vai trò"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get threads by participant
   * @route GET /api/participants/my-threads
   */
  getMyThreads = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { status, referenceType, tags, page = 1, limit = 20 } = req.query;

      const filters = {
        status,
        referenceType,
        tags: tags ? tags.split(",") : undefined,
        skip: (page - 1) * limit,
        limit: parseInt(limit),
      };

      const result = await this.participantRepository.getThreadsByParticipant(
        userId,
        filters
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          threads: result.threads,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Auto-add stakeholders to thread
   * @route POST /api/threads/:threadId/participants/auto-add
   */
  autoAddStakeholders = async (req, res, next) => {
    try {
      const { threadId } = req.params;
      const { referenceId, referenceType } = req.body;

      const result = await this.participantService.autoAddStakeholders(
        threadId,
        referenceId,
        referenceType
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Đã tự động thêm ${result.added.length} stakeholders`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle mention - add mentioned user to thread
   * @route POST /api/threads/:threadId/participants/mention
   */
  handleMention = async (req, res, next) => {
    try {
      const { threadId } = req.params;
      const { mentionedUserId } = req.body;

      const result = await this.participantService.handleMention(
        threadId,
        mentionedUserId
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update last seen
   * @route POST /api/threads/:threadId/participants/last-seen
   */
  updateLastSeen = async (req, res, next) => {
    try {
      const { threadId } = req.params;
      const userId = req.user._id;

      await this.participantService.updateLastSeen(threadId, userId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã cập nhật last seen"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active participants
   * @route GET /api/threads/:threadId/participants/active
   */
  getActiveParticipants = async (req, res, next) => {
    try {
      const { threadId } = req.params;
      const { minutesThreshold = 5 } = req.query;

      const activeParticipants =
        await this.participantService.getActiveParticipants(
          threadId,
          parseInt(minutesThreshold)
        );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ activeParticipants }));
    } catch (error) {
      next(error);
    }
  };
}
