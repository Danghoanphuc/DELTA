// apps/admin-backend/src/controllers/supplier-post.controller.ts
// ✅ SOLID: Single Responsibility - HTTP handling only

import { Request, Response } from "express";
import { SupplierPostService } from "../services/supplier-post.service.js";
import { API_CODES, ApiResponse } from "../shared/utils/api-response.js";
import { Logger } from "../shared/utils/logger.js";

export class SupplierPostController {
  private supplierPostService: SupplierPostService;

  constructor() {
    this.supplierPostService = new SupplierPostService();
  }

  /**
   * Get all posts (for related posts picker)
   * @route GET /api/admin/supplier-posts
   */
  getAllPosts = async (req: Request, res: Response, next: Function) => {
    try {
      const { visibility, category, limit } = req.query;

      const result = await this.supplierPostService.getAllPosts({
        visibility: visibility as string,
        category: category as string,
        limit: limit ? parseInt(limit as string) : 100,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create post
   * @route POST /api/admin/suppliers/:supplierId/posts
   */
  createPost = async (req: Request, res: Response, next: Function) => {
    try {
      const { supplierId } = req.params;
      const userId = (req as any).user._id;

      const post = await this.supplierPostService.createPost(
        supplierId,
        userId,
        req.body
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ post }, "Đã đăng bài thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get posts by supplier
   * @route GET /api/admin/suppliers/:supplierId/posts
   */
  getPostsBySupplier = async (req: Request, res: Response, next: Function) => {
    try {
      const { supplierId } = req.params;
      const { visibility, page, limit } = req.query;

      const result = await this.supplierPostService.getPostsBySupplier(
        supplierId,
        {
          visibility: visibility as string,
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
        }
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get post by ID
   * @route GET /api/admin/supplier-posts/:id
   */
  getPostById = async (req: Request, res: Response, next: Function) => {
    try {
      const { id } = req.params;

      const post = await this.supplierPostService.getPostById(id);

      // Increment views
      await this.supplierPostService.incrementViews(id);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ post }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update post
   * @route PUT /api/admin/supplier-posts/:id
   */
  updatePost = async (req: Request, res: Response, next: Function) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Temporary: Use a default admin ID if user is not authenticated
      const userId = user?._id || "000000000000000000000000";

      const post = await this.supplierPostService.updatePost(
        id,
        userId,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ post }, "Đã cập nhật bài viết!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete post
   * @route DELETE /api/admin/supplier-posts/:id
   */
  deletePost = async (req: Request, res: Response, next: Function) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Temporary: Use a default admin ID if user is not authenticated
      const userId = user?._id || "000000000000000000000000";

      await this.supplierPostService.deletePost(id, userId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa bài viết!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle like
   * @route POST /api/admin/supplier-posts/:id/like
   */
  toggleLike = async (req: Request, res: Response, next: Function) => {
    try {
      const { id } = req.params;
      const { increment } = req.body;

      const likes = await this.supplierPostService.toggleLike(
        id,
        increment !== false
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ likes }));
    } catch (error) {
      next(error);
    }
  };
}
