// src/modules/artworks/artwork.routes.js
// ✅ Artwork Routes

import { Router } from "express";
import { ArtworkController } from "./artwork.controller.js";
import { authenticate } from "../../shared/middleware/index.js";

const router = Router();
const controller = new ArtworkController();

// All routes require authentication
router.use(authenticate);

// Stats and aggregations (must be before :id routes)
router.get("/stats", controller.getStats);
router.get("/most-used", controller.getMostUsed);
router.get("/tags", controller.getAllTags);

// CRUD operations
router.post("/", controller.uploadArtwork);
router.get("/", controller.getArtworkLibrary);
router.get("/:id", controller.getArtworkDetail);
router.patch("/:id", controller.updateMetadata);
router.delete("/:id", controller.deleteArtwork);

// Validation and approval
router.post("/:id/validate", controller.validateArtwork);
router.post("/:id/approve", controller.approveArtwork);
router.post("/:id/reject", controller.rejectArtwork);

// Version control
router.post("/:id/version", controller.createNewVersion);
router.get("/:id/versions", controller.getVersionHistory);

export default router;
