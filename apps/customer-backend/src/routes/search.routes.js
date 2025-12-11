// apps/customer-backend/src/routes/search.routes.js
// Search Routes - API endpoints for search and filter operations

import { Router } from "express";
import { SearchController } from "../controllers/search.controller.js";
import { authenticate } from "../shared/middleware/auth.middleware.js";

const router = Router();
const controller = new SearchController();

// All routes require authentication
router.use(authenticate);

// ===== Search Routes =====

/**
 * @route GET /api/search/threads
 * @desc Search threads by text query
 * @query {string} q - Search query
 * @query {string} [status] - Filter by status (active, resolved, archived, all)
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @access Private
 */
router.get("/threads", controller.searchThreads);

/**
 * @route GET /api/search/messages
 * @desc Search messages by text query
 * @query {string} q - Search query
 * @query {string} [conversationId] - Filter by conversation/thread
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @access Private
 */
router.get("/messages", controller.searchMessages);

/**
 * @route POST /api/search/advanced
 * @desc Advanced search with multiple filters
 * @body {object} filters - Search filters
 * @access Private
 */
router.post("/advanced", controller.advancedSearch);

export default router;
