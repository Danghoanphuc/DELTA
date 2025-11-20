// apps/customer-backend/src/modules/ai/ai.routes.js
// ✨ SMART PIPELINE: AI Routes

import { Router } from "express";
import { AIController } from "./ai.controller.js";
import { protect, isPrinter } from "../../shared/middleware/index.js";

const router = Router();
const aiController = new AIController();

// ✅ Protected routes (chỉ Printer có thể dùng AI)
router.post("/generate-text", protect, isPrinter, aiController.generateText);
router.post(
  "/generate-stream",
  protect,
  isPrinter,
  aiController.generateTextStream
);

export default router;

