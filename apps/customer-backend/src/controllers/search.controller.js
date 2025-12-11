// apps/customer-backend/src/controllers/search.controller.js
// Search Controller - HTTP handlers for search operations

import { SearchService } from "../services/search.service.js";
import { API_CODES } from "../shared/constants/api-codes.constants.js";
import { ApiResponse } from "../shared/utils/api-response.util.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Search Controller
 * Handles HTTP requests for search and filter operations
 */
export class SearchController {
  constructor() {
    this.searchService = new SearchService();
  }

  /**
   * Search threads
   * @route GET /api/search/threads
   */
  searchThreads = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { q, status, page, limit } = req.query;

      Logger.debug(`[SearchCtrl] Searching threads with query: "${q}"`);

      const result = await this.searchService.searchThreads(userId, q, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Tìm thấy ${result.total} threads phù hợp`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search messages
   * @route GET /api/search/messages
   */
  searchMessages = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { q, conversationId, page, limit } = req.query;

      Logger.debug(`[SearchCtrl] Searching messages with query: "${q}"`);

      const result = await this.searchService.searchMessages(userId, q, {
        conversationId,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Tìm thấy ${result.messages.length} tin nhắn phù hợp`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Filter threads
   * @route GET /api/threads/filter
   */
  filterThreads = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const {
        eventId,
        eventType,
        participantUserId,
        status,
        tags,
        startDate,
        endDate,
        page,
        limit,
      } = req.query;

      Logger.debug(`[SearchCtrl] Filtering threads with filters`);

      let result;

      // Determine which filter to apply
      if (eventId && eventType) {
        // Filter by event
        result = await this.searchService.filterThreadsByEvent(
          userId,
          eventId,
          eventType,
          {
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
          }
        );
      } else if (participantUserId) {
        // Filter by participant
        result = await this.searchService.filterThreadsByParticipant(
          userId,
          participantUserId,
          {
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
          }
        );
      } else if (tags) {
        // Filter by tags
        const tagArray = Array.isArray(tags) ? tags : tags.split(",");
        result = await this.searchService.filterThreadsByTags(
          userId,
          tagArray,
          {
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
          }
        );
      } else if (startDate && endDate) {
        // Filter by date range
        result = await this.searchService.filterThreadsByDateRange(
          userId,
          startDate,
          endDate,
          {
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
          }
        );
      } else if (status) {
        // Filter by status only
        result = await this.searchService.filterThreadsByStatus(
          userId,
          status,
          {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
          }
        );
      } else {
        // No specific filter - return user's threads
        result = await this.searchService.filterThreadsByStatus(userId, "all", {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
        });
      }

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Tìm thấy ${result.total} threads phù hợp`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Advanced search with multiple filters
   * @route POST /api/search/advanced
   */
  advancedSearch = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const filters = req.body;

      Logger.debug(`[SearchCtrl] Performing advanced search`);

      const result = await this.searchService.advancedSearch(userId, filters);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Tìm thấy ${result.total} threads phù hợp`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Filter threads by event
   * @route GET /api/threads/event/:eventType/:eventId
   */
  filterByEvent = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { eventType, eventId } = req.params;
      const { status, page, limit } = req.query;

      Logger.debug(
        `[SearchCtrl] Filtering threads by event: ${eventType}/${eventId}`
      );

      const result = await this.searchService.filterThreadsByEvent(
        userId,
        eventId,
        eventType,
        {
          status,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
        }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Tìm thấy ${result.total} threads phù hợp`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Filter threads by participant
   * @route GET /api/threads/participant/:participantUserId
   */
  filterByParticipant = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { participantUserId } = req.params;
      const { status, page, limit } = req.query;

      Logger.debug(
        `[SearchCtrl] Filtering threads by participant: ${participantUserId}`
      );

      const result = await this.searchService.filterThreadsByParticipant(
        userId,
        participantUserId,
        {
          status,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
        }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Tìm thấy ${result.total} threads phù hợp`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Filter threads by status
   * @route GET /api/threads/status/:status
   */
  filterByStatus = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { status } = req.params;
      const { page, limit } = req.query;

      Logger.debug(`[SearchCtrl] Filtering threads by status: ${status}`);

      const result = await this.searchService.filterThreadsByStatus(
        userId,
        status,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
        }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Tìm thấy ${result.total} threads phù hợp`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Filter threads by tags
   * @route GET /api/threads/tags
   */
  filterByTags = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { tags, status, page, limit } = req.query;

      if (!tags) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Tags parameter is required"));
      }

      const tagArray = Array.isArray(tags) ? tags : tags.split(",");

      Logger.debug(
        `[SearchCtrl] Filtering threads by tags: ${tagArray.join(", ")}`
      );

      const result = await this.searchService.filterThreadsByTags(
        userId,
        tagArray,
        {
          status,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
        }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Tìm thấy ${result.total} threads phù hợp`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Filter threads by date range
   * @route GET /api/threads/date-range
   */
  filterByDateRange = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { startDate, endDate, status, page, limit } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(
            ApiResponse.error("startDate and endDate parameters are required")
          );
      }

      Logger.debug(
        `[SearchCtrl] Filtering threads by date range: ${startDate} to ${endDate}`
      );

      const result = await this.searchService.filterThreadsByDateRange(
        userId,
        startDate,
        endDate,
        {
          status,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
        }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            result,
            `Tìm thấy ${result.total} threads phù hợp`
          )
        );
    } catch (error) {
      next(error);
    }
  };
}
