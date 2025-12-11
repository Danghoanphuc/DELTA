// apps/customer-backend/src/routes/filter.routes.js
// Filter Routes - API endpoints for filtering threads

import { Router } from "express";
import { SearchController } from "../controllers/search.controller.js";
import { authenticate } from "../shared/middleware/auth.middleware.js";

const router = Router();
const controller = new SearchController();

// All routes require authentication
router.use(authenticate);

// ===== Filter Routes =====

/**
 * @route GET /api/threads/filter
 * @desc Filter threads with multiple criteria
 * @query {string} [eventId] - Filter by event ID
 * @query {string} [eventType] - Filter by event type (ORDER, DESIGN, PRODUCT)
 * @query {string} [participantUserId] - Filter by participant user ID
 * @query {string} [status] - Filter by status (active, resolved, archived, all)
 * @query {string} [tags] - Filter by tags (comma-separated)
 * @query {string} [startDate] - Filter by start date (ISO format)
 * @query {string} [endDate] - Filter by end date (ISO format)
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @access Private
 */
router.get("/", controller.filterThreads);

/**
 * @route GET /api/threads/event/:eventType/:eventId
 * @desc Filter threads by event
 * @param {string} eventType - Event type (ORDER, DESIGN, PRODUCT)
 * @param {string} eventId - Event ID
 * @query {string} [status] - Filter by status
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @access Private
 */
router.get("/event/:eventType/:eventId", controller.filterByEvent);

/**
 * @route GET /api/threads/participant/:participantUserId
 * @desc Filter threads by participant
 * @param {string} participantUserId - Participant user ID
 * @query {string} [status] - Filter by status
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @access Private
 */
router.get("/participant/:participantUserId", controller.filterByParticipant);

/**
 * @route GET /api/threads/status/:status
 * @desc Filter threads by status
 * @param {string} status - Thread status (active, resolved, archived, all)
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @access Private
 */
router.get("/status/:status", controller.filterByStatus);

/**
 * @route GET /api/threads/tags
 * @desc Filter threads by tags
 * @query {string} tags - Tags (comma-separated)
 * @query {string} [status] - Filter by status
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @access Private
 */
router.get("/tags", controller.filterByTags);

/**
 * @route GET /api/threads/date-range
 * @desc Filter threads by date range
 * @query {string} startDate - Start date (ISO format)
 * @query {string} endDate - End date (ISO format)
 * @query {string} [status] - Filter by status
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @access Private
 */
router.get("/date-range", controller.filterByDateRange);

export default router;
