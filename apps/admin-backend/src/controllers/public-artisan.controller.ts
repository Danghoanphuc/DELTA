// apps/admin-backend/src/controllers/public-artisan.controller.ts
// Public controller for artisan/supplier profiles (no auth required)

import { Request, Response } from "express";
import { Supplier, CatalogProduct } from "../models/catalog.models.js";
import { SupplierPost } from "../models/supplier-post.model.js";
import { API_CODES, ApiResponse } from "../shared/utils/api-response.js";
import { Logger } from "../shared/utils/index.js";

export class PublicArtisanController {
  /**
   * Get list of artisans/suppliers (public)
   * GET /api/artisans
   */
  getArtisans = async (req: Request, res: Response) => {
    try {
      const { type, page = "1", limit = "12" } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build query - only active suppliers
      const query: any = { isActive: true };
      if (type) {
        query.type = type;
      }

      const [artisans, total] = await Promise.all([
        Supplier.find(query)
          .select(
            "name code type contactInfo capabilities rating isPreferred profile"
          )
          .sort({ isPreferred: -1, rating: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Supplier.countDocuments(query),
      ]);

      Logger.debug(
        `[PublicArtisan] Fetched ${artisans.length} artisans (page ${pageNum})`
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          artisans,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        })
      );
    } catch (error: any) {
      Logger.error("[PublicArtisan] Error fetching artisans:", error);
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(
          ApiResponse.error("FETCH_ERROR", "Không thể tải danh sách nghệ nhân")
        );
    }
  };

  /**
   * Get artisan profile by code (public)
   * GET /api/artisans/:code
   */
  getArtisanByCode = async (req: Request, res: Response) => {
    try {
      const { code } = req.params;

      const artisan = await Supplier.findOne({
        code: code.toUpperCase(),
        isActive: true,
      })
        .select("-leadTimeHistory -performanceMetrics.lastUpdated")
        .lean();

      if (!artisan) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("NOT_FOUND", "Không tìm thấy nghệ nhân"));
      }

      Logger.debug(`[PublicArtisan] Fetched artisan: ${code}`);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          artisan,
        })
      );
    } catch (error: any) {
      Logger.error("[PublicArtisan] Error fetching artisan:", error);
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(
          ApiResponse.error("FETCH_ERROR", "Không thể tải thông tin nghệ nhân")
        );
    }
  };

  /**
   * Get artisan's posts (public)
   * GET /api/artisans/:code/posts
   */
  getArtisanPosts = async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const { page = "1", limit = "10" } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Find supplier first
      const supplier = await Supplier.findOne({
        code: code.toUpperCase(),
        isActive: true,
      }).lean();

      if (!supplier) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("NOT_FOUND", "Không tìm thấy nghệ nhân"));
      }

      const [posts, total] = await Promise.all([
        SupplierPost.find({
          supplierId: supplier._id,
          visibility: "public", // Fixed: use visibility instead of status
        })
          .select(
            "title excerpt slug category subcategory readTime featured media tags createdAt ogImage"
          )
          .sort({ featured: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        SupplierPost.countDocuments({
          supplierId: supplier._id,
          visibility: "public", // Fixed: use visibility instead of status
        }),
      ]);

      // Add author profile to posts
      const postsWithAuthor = posts.map((post) => ({
        ...post,
        authorProfile: {
          name: supplier.name,
          title: supplier.type === "artisan" ? "Nghệ nhân" : "Xưởng chế tác",
          avatar: supplier.profile?.avatar,
          bio: supplier.profile?.bio,
        },
      }));

      Logger.debug(
        `[PublicArtisan] Fetched ${posts.length} posts for artisan: ${code}`
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          posts: postsWithAuthor,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        })
      );
    } catch (error: any) {
      Logger.error("[PublicArtisan] Error fetching artisan posts:", error);
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(ApiResponse.error("FETCH_ERROR", "Không thể tải bài viết"));
    }
  };

  /**
   * Get artisan's products (public)
   * GET /api/artisans/:code/products
   */
  getArtisanProducts = async (req: Request, res: Response) => {
    try {
      const { code } = req.params;
      const { page = "1", limit = "12" } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Find supplier first
      const supplier = await Supplier.findOne({
        code: code.toUpperCase(),
        isActive: true,
      }).lean();

      if (!supplier) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("NOT_FOUND", "Không tìm thấy nghệ nhân"));
      }

      const [products, total] = await Promise.all([
        CatalogProduct.find({
          supplierId: supplier._id,
          status: "active",
        })
          .select(
            "name slug sku thumbnailUrl images basePrice tags totalSold isFeatured"
          )
          .sort({ isFeatured: -1, totalSold: -1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        CatalogProduct.countDocuments({
          supplierId: supplier._id,
          status: "active",
        }),
      ]);

      Logger.debug(
        `[PublicArtisan] Fetched ${products.length} products for artisan: ${code}`
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          products,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        })
      );
    } catch (error: any) {
      Logger.error("[PublicArtisan] Error fetching artisan products:", error);
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(ApiResponse.error("FETCH_ERROR", "Không thể tải sản phẩm"));
    }
  };
}
