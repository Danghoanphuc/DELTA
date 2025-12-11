// apps/customer-backend/src/routes/participant.routes.js
// Participant Routes

import { Router } from "express";
import { ParticipantController } from "../controllers/participant.controller.js";
import { authenticate } from "../shared/middleware/index.js";

const router = Router();
const controller = new ParticipantController();

// All routes require authentication
router.use(authenticate);

// ===== PARTICIPANT MANAGEMENT =====

/**
 * @route GET /api/threads/:threadId/participants
 * @desc Get all participants for a thread
 * @access Private
 */
router.get("/threads/:threadId/participants", controller.getParticipants);

/**
 * @route POST /api/threads/:threadId/participants
 * @desc Add participants to thread
 * @access Private
 * @body { userIds: string[], role?: string }
 */
router.post("/threads/:threadId/participants", controller.addParticipants);

/**
 * @route DELETE /api/threads/:threadId/participants/:userId
 * @desc Remove participant from thread
 * @access Private
 */
router.delete(
  "/threads/:threadId/participants/:userId",
  controller.removeParticipant
);

/**
 * @route PUT /api/threads/:threadId/participants/:userId/role
 * @desc Update participant role
 * @access Private
 * @body { role: string }
 */
router.put(
  "/threads/:threadId/participants/:userId/role",
  controller.updateParticipantRole
);

// ===== MY THREADS =====

/**
 * @route GET /api/participants/my-threads
 * @desc Get threads where current user is participant
 * @access Private
 * @query { status?, referenceType?, tags?, page?, limit? }
 */
router.get("/participants/my-threads", controller.getMyThreads);

// ===== AUTO-ADD & MENTIONS =====

/**
 * @route POST /api/threads/:threadId/participants/auto-add
 * @desc Auto-add stakeholders to thread
 * @access Private
 * @body { referenceId: string, referenceType: string }
 */
router.post(
  "/threads/:threadId/participants/auto-add",
  controller.autoAddStakeholders
);

/**
 * @route POST /api/threads/:threadId/participants/mention
 * @desc Handle mention - add mentioned user to thread
 * @access Private
 * @body { mentionedUserId: string }
 */
router.post(
  "/threads/:threadId/participants/mention",
  controller.handleMention
);

// ===== ACTIVITY TRACKING =====

/**
 * @route POST /api/threads/:threadId/participants/last-seen
 * @desc Update last seen timestamp
 * @access Private
 */
router.post(
  "/threads/:threadId/participants/last-seen",
  controller.updateLastSeen
);

/**
 * @route GET /api/threads/:threadId/participants/active
 * @desc Get active participants (recently active)
 * @access Private
 * @query { minutesThreshold?: number }
 */
router.get(
  "/threads/:threadId/participants/active",
  controller.getActiveParticipants
);

export default router;
