// Public controller for magazine posts (no auth required)
import { Request, Response } from "express";
import { SupplierPostService } from "../services/supplier-post.service.js";
import { API_CODES, ApiResponse } from "../shared/utils/api-response.js";

export class PublicMagazineController {
  private supplierPostService: SupplierPostService;

  constructor() {
    this.supplierPostService = new SupplierPostService();
  }

  /**
   * Get all public posts
   * @route GET /magazine
   */
  getAllPosts = async (req: Request, res: Response) => {
    try {
      const { category, limit, featured } = req.query;

      const result = await this.supplierPostService.getAllPosts({
        visibility: "public", // Force public only
        category: category as string,
        limit: limit ? parseInt(limit as string) : 20,
        featured: featured === "true",
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(ApiResponse.error("FETCH_ERROR", "Không thể tải bài viết"));
    }
  };

  /**
   * Get posts by category
   * @route GET /magazine/:category
   */
  getPostsByCategory = async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const { limit, featured, page } = req.query;

      const result = await this.supplierPostService.getAllPosts({
        visibility: "public", // Force public only
        category: category !== "all" ? category : undefined,
        limit: limit ? parseInt(limit as string) : 20,
        featured: featured === "true",
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(ApiResponse.error("FETCH_ERROR", "Không thể tải bài viết"));
    }
  };

  /**
   * Get post by ID or slug (public only)
   * Supports both MongoDB ObjectId and slug lookup
   */
  getPostById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Use new method that supports both ID and slug
      const post = await this.supplierPostService.getPostBySlugOrId(id);

      // Check if post is public
      if (post.visibility !== "public") {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("NOT_FOUND", "Bài viết không tồn tại"));
      }

      // Increment views (use post._id for consistency)
      const postId = (post as any)._id?.toString();
      if (postId) {
        await this.supplierPostService.incrementViews(postId);
      }

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ post }));
    } catch (error) {
      res
        .status(API_CODES.NOT_FOUND)
        .json(ApiResponse.error("NOT_FOUND", "Bài viết không tồn tại"));
    }
  };
}
