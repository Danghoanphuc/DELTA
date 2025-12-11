// src/modules/artworks/artwork.controller.js
// ✅ Artwork Controller - HTTP request handlers

import { ArtworkService } from "./artwork.service.js";
import { ApiResponse } from "../../shared/utils/api-response.util.js";
import { API_CODES } from "../../shared/constants/api-codes.constants.js";

export class ArtworkController {
  constructor() {
    this.artworkService = new ArtworkService();
  }

  /**
   * Upload artwork
   * @route POST /api/artworks
   */
  uploadArtwork = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;

      // File data should come from multer/S3 upload middleware
      const fileData = {
        fileName: req.body.fileName,
        originalFileName: req.body.originalFileName,
        fileUrl: req.body.fileUrl,
        thumbnailUrl: req.body.thumbnailUrl,
        fileSize: parseInt(req.body.fileSize),
        fileFormat: req.body.fileFormat,
        dimensions: req.body.dimensions
          ? JSON.parse(req.body.dimensions)
          : undefined,
        resolution: req.body.resolution
          ? parseInt(req.body.resolution)
          : undefined,
        colorMode: req.body.colorMode,
        colorCount: req.body.colorCount
          ? parseInt(req.body.colorCount)
          : undefined,
        hasTransparency: req.body.hasTransparency === "true",
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        description: req.body.description,
      };

      const artwork = await this.artworkService.uploadArtwork(
        organizationId,
        userId,
        fileData
      );

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success({ artwork }, "Artwork uploaded successfully")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get artwork library
   * @route GET /api/artworks
   */
  getArtworkLibrary = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const options = {
        status: req.query.status,
        tags: req.query.tags ? req.query.tags.split(",") : undefined,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
      };

      const result = await this.artworkService.getArtworkLibrary(
        organizationId,
        options
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get artwork detail
   * @route GET /api/artworks/:id
   */
  getArtworkDetail = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { id } = req.params;

      const artwork = await this.artworkService.getArtwork(organizationId, id);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ artwork }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate artwork
   * @route POST /api/artworks/:id/validate
   */
  validateArtwork = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { id } = req.params;
      const requirements = req.body;

      const result = await this.artworkService.validateArtwork(
        organizationId,
        id,
        requirements
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Approve artwork
   * @route POST /api/artworks/:id/approve
   */
  approveArtwork = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;
      const { id } = req.params;

      const artwork = await this.artworkService.approveArtwork(
        organizationId,
        id,
        userId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ artwork }, "Artwork approved"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reject artwork
   * @route POST /api/artworks/:id/reject
   */
  rejectArtwork = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;
      const { id } = req.params;
      const { errors } = req.body;

      const artwork = await this.artworkService.rejectArtwork(
        organizationId,
        id,
        userId,
        errors
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ artwork }, "Artwork rejected"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new version
   * @route POST /api/artworks/:id/version
   */
  createNewVersion = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;
      const { id } = req.params;

      const fileData = {
        fileName: req.body.fileName,
        originalFileName: req.body.originalFileName,
        fileUrl: req.body.fileUrl,
        thumbnailUrl: req.body.thumbnailUrl,
        fileSize: parseInt(req.body.fileSize),
        fileFormat: req.body.fileFormat,
        dimensions: req.body.dimensions
          ? JSON.parse(req.body.dimensions)
          : undefined,
        resolution: req.body.resolution
          ? parseInt(req.body.resolution)
          : undefined,
        colorMode: req.body.colorMode,
        colorCount: req.body.colorCount
          ? parseInt(req.body.colorCount)
          : undefined,
        hasTransparency: req.body.hasTransparency === "true",
      };

      const newVersion = await this.artworkService.createNewVersion(
        organizationId,
        id,
        userId,
        fileData
      );

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success({ artwork: newVersion }, "New version created")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete artwork
   * @route DELETE /api/artworks/:id
   */
  deleteArtwork = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;
      const { id } = req.params;

      await this.artworkService.deleteArtwork(organizationId, id, userId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Artwork deleted"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get version history
   * @route GET /api/artworks/:id/versions
   */
  getVersionHistory = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { id } = req.params;

      const history = await this.artworkService.getVersionHistory(
        organizationId,
        id
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ history }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update artwork metadata
   * @route PATCH /api/artworks/:id
   */
  updateMetadata = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { id } = req.params;
      const { tags, description, notes } = req.body;

      const artwork = await this.artworkService.updateMetadata(
        organizationId,
        id,
        { tags, description, notes }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ artwork }, "Metadata updated"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get artwork statistics
   * @route GET /api/artworks/stats
   */
  getStats = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;

      const stats = await this.artworkService.getStats(organizationId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ stats }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get most used artworks
   * @route GET /api/artworks/most-used
   */
  getMostUsed = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const limit = parseInt(req.query.limit) || 10;

      const artworks = await this.artworkService.getMostUsed(
        organizationId,
        limit
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ artworks }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all tags
   * @route GET /api/artworks/tags
   */
  getAllTags = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;

      const tags = await this.artworkService.getAllTags(organizationId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ tags }));
    } catch (error) {
      next(error);
    }
  };
}
