// apps/customer-backend/src/routes/test-deployment.routes.js
// Simple test endpoint to verify deployment

import { Router } from "express";

const router = Router();

/**
 * Test deployment endpoint
 * @route GET /api/test-deployment
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Deployment successful!",
    timestamp: new Date().toISOString(),
    version: "2024-12-17-artisan-magazine-fix",
    routes: {
      artisans: "Available at /api/artisans",
      magazine: "Available at /api/magazine/all",
    },
  });
});

export default router;
