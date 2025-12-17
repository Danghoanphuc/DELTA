// apps/admin-backend/src/controllers/public-catalog.controller.ts
// Public controller for catalog products (no auth required)
// Used by customer-frontend to display products

import { Request, Response } from "express";
import {
  CatalogProduct,
  ProductCategory,
  Supplier,
} from "../models/catalog.models.js";
import { API_CODES, ApiResponse } from "../shared/utils/api-response.js";
import { Logger } from "../shared/utils/index.js";
import mongoose from "mongoose";

export class PublicCatalogController {
  /**
   * Get list of products (public)
   * GET /api/products
   * Query params: page, limit, category, sort, search
   */
  getProducts = async (req: Request, res: Response) => {
    try {
      const {
        page = "1",
        limit = "20",
        category,
        sort = "popular",
        search,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = Math.min(parseInt(limit as string, 10), 50); // Max 50 per page
      const skip = (pageNum - 1) * limitNum;

      // Build query - only active and published products
      const query: any = {
        status: "active",
        isPublished: true,
      };

      // Filter by category (support both slug and ObjectId)
      if (category && category !== "all") {
        const categoryStr = String(category);
        const isObjectId =
          mongoose.Types.ObjectId.isValid(categoryStr) &&
          categoryStr.length === 24 &&
          /^[a-f0-9]{24}$/i.test(categoryStr);

        if (isObjectId) {
          query.categoryId = category;
        } else {
          // Find category by slug or path
          const categoryDoc = await ProductCategory.findOne({
            $or: [
              { slug: categoryStr },
              { path: { $regex: categoryStr, $options: "i" } },
            ],
          }).lean();
          if (categoryDoc) {
            query.categoryId = categoryDoc._id;
          }
        }
      }

      // Search by name, description, tags
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(String(search), "i")] } },
        ];
      }

      // Build sort options
      let sortOptions: any = { createdAt: -1 };
      switch (sort) {
        case "popular":
          sortOptions = { totalSold: -1, isFeatured: -1, createdAt: -1 };
          break;
        case "newest":
          sortOptions = { createdAt: -1 };
          break;
        case "price-asc":
          sortOptions = { basePrice: 1 };
          break;
        case "price-desc":
          sortOptions = { basePrice: -1 };
          break;
        case "rating":
          sortOptions = { averageRating: -1, reviewCount: -1 };
          break;
        default:
          sortOptions = { isFeatured: -1, totalSold: -1, createdAt: -1 };
      }

      const [products, total] = await Promise.all([
        CatalogProduct.find(query)
          .select(
            "name slug sku thumbnailUrl images basePrice tags totalSold isFeatured averageRating reviewCount categoryPath shortDescription"
          )
          .populate("categoryId", "name slug path")
          .populate("supplierId", "name code profile.avatar")
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        CatalogProduct.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      Logger.debug(
        `[PublicCatalog] Fetched ${products.length} products (page ${pageNum}/${totalPages})`
      );

      // Return in format expected by customer-frontend useShop hook
      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          data: products,
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        })
      );
    } catch (error: any) {
      Logger.error("[PublicCatalog] Error fetching products:", error);
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(
          ApiResponse.error("FETCH_ERROR", "Không thể tải danh sách sản phẩm")
        );
    }
  };

  /**
   * Get product detail by ID or slug (public)
   * GET /api/products/:idOrSlug
   */
  getProductById = async (req: Request, res: Response) => {
    try {
      const { idOrSlug } = req.params;

      // Check if it's an ObjectId or slug
      const isObjectId =
        mongoose.Types.ObjectId.isValid(idOrSlug) &&
        idOrSlug.length === 24 &&
        /^[a-f0-9]{24}$/i.test(idOrSlug);

      const query: any = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

      // Only return active and published products
      query.status = "active";
      query.isPublished = true;

      const product = await CatalogProduct.findOne(query)
        .populate("categoryId", "name slug path")
        .populate("supplierId", "name code type profile contactInfo")
        .lean();

      if (!product) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("NOT_FOUND", "Không tìm thấy sản phẩm"));
      }

      Logger.debug(`[PublicCatalog] Fetched product: ${product.slug}`);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          product,
        })
      );
    } catch (error: any) {
      Logger.error("[PublicCatalog] Error fetching product:", error);
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(
          ApiResponse.error("FETCH_ERROR", "Không thể tải thông tin sản phẩm")
        );
    }
  };

  /**
   * Get list of categories (public)
   * GET /api/categories
   */
  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await ProductCategory.find({ isActive: true })
        .select("name slug path level parentId productCount icon description")
        .sort({ level: 1, sortOrder: 1 })
        .lean();

      // Build tree structure
      const tree = this.buildCategoryTree(categories);

      Logger.debug(`[PublicCatalog] Fetched ${categories.length} categories`);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          categories: tree,
          flat: categories,
        })
      );
    } catch (error: any) {
      Logger.error("[PublicCatalog] Error fetching categories:", error);
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(
          ApiResponse.error("FETCH_ERROR", "Không thể tải danh mục sản phẩm")
        );
    }
  };

  /**
   * Get featured products (public)
   * GET /api/products/featured
   */
  getFeaturedProducts = async (req: Request, res: Response) => {
    try {
      const { limit = "8" } = req.query;
      const limitNum = Math.min(parseInt(limit as string, 10), 20);

      const products = await CatalogProduct.find({
        status: "active",
        isPublished: true,
        isFeatured: true,
      })
        .select(
          "name slug sku thumbnailUrl images basePrice tags totalSold isFeatured averageRating"
        )
        .populate("categoryId", "name slug")
        .sort({ totalSold: -1, createdAt: -1 })
        .limit(limitNum)
        .lean();

      Logger.debug(
        `[PublicCatalog] Fetched ${products.length} featured products`
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          products,
        })
      );
    } catch (error: any) {
      Logger.error("[PublicCatalog] Error fetching featured products:", error);
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(
          ApiResponse.error("FETCH_ERROR", "Không thể tải sản phẩm nổi bật")
        );
    }
  };

  /**
   * Get products by category (public)
   * GET /api/categories/:slug/products
   */
  getProductsByCategory = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const { page = "1", limit = "20", sort = "popular" } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = Math.min(parseInt(limit as string, 10), 50);
      const skip = (pageNum - 1) * limitNum;

      // Find category by slug
      const category = await ProductCategory.findOne({
        slug,
        isActive: true,
      }).lean();

      if (!category) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("NOT_FOUND", "Không tìm thấy danh mục"));
      }

      // Build sort options
      let sortOptions: any = { createdAt: -1 };
      switch (sort) {
        case "popular":
          sortOptions = { totalSold: -1, isFeatured: -1 };
          break;
        case "newest":
          sortOptions = { createdAt: -1 };
          break;
        case "price-asc":
          sortOptions = { basePrice: 1 };
          break;
        case "price-desc":
          sortOptions = { basePrice: -1 };
          break;
      }

      const [products, total] = await Promise.all([
        CatalogProduct.find({
          categoryId: category._id,
          status: "active",
          isPublished: true,
        })
          .select(
            "name slug sku thumbnailUrl images basePrice tags totalSold isFeatured averageRating"
          )
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        CatalogProduct.countDocuments({
          categoryId: category._id,
          status: "active",
          isPublished: true,
        }),
      ]);

      Logger.debug(
        `[PublicCatalog] Fetched ${products.length} products for category: ${slug}`
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          category,
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
      Logger.error("[PublicCatalog] Error fetching category products:", error);
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(ApiResponse.error("FETCH_ERROR", "Không thể tải sản phẩm"));
    }
  };

  // Helper: Build category tree
  private buildCategoryTree(categories: any[]) {
    const map = new Map();
    const roots: any[] = [];

    categories.forEach((cat) => {
      map.set(cat._id.toString(), { ...cat, children: [] });
    });

    categories.forEach((cat) => {
      const node = map.get(cat._id.toString());
      if (cat.parentId) {
        const parent = map.get(cat.parentId.toString());
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
