// apps/customer-backend/src/modules/admin/circuit-breaker.routes.js
import express from "express";
import { CircuitBreakerController } from "./circuit-breaker.controller.js";

const router = express.Router();

// GET /admin/circuit-breakers/status - Xem trạng thái
router.get("/status", CircuitBreakerController.getStatus);

// POST /admin/circuit-breakers/reset - Reset tất cả
router.post("/reset", CircuitBreakerController.resetAll);

// POST /admin/circuit-breakers/:name/reset - Reset một cái
router.post("/:name/reset", CircuitBreakerController.resetOne);

export default router;
