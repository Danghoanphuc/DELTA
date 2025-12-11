// apps/customer-backend/src/routes/thread.routes.js
// Thread Routes

import { Router } from "express";
import { ThreadController } from "../controllers/thread.controller.js";
import { authenticate } from "../shared/middleware/auth.middleware.js";

const router = Router();
const controller = new ThreadController();

// All routes require authentication
router.use(authenticate);

// Thread CRUD
router.post("/", controller.createThread);
router.get("/my-threads", controller.getMyThreads);
router.get("/event/:referenceId", controller.getThreadsByEvent);
router.get("/:id", controller.getThread);
router.put("/:id", controller.updateThread);
router.delete("/:id", controller.deleteThread);

// Thread Status Management
router.post("/:id/resolve", controller.resolveThread);
router.post("/:id/reopen", controller.reopenThread);
router.post("/:id/archive", controller.archiveThread);

// Thread Pinning
router.post("/:id/pin", controller.pinThread);
router.post("/:id/unpin", controller.unpinThread);

// Participant Management
router.post("/:id/participants", controller.addParticipant);
router.delete(
  "/:id/participants/:participantUserId",
  controller.removeParticipant
);
router.post("/:id/leave", controller.leaveThread);

export default router;
