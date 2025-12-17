// apps/customer-backend/src/modules/artisan/artisan.routes.ts
// Public routes for artisan/supplier profiles

import { Router } from "express";
import { Supplier } from "../../../../admin-backend/src/models/catalog.models.js";
import { SupplierPost } from "../../../../admin-backend/src/models/supplier-post.model.js";
// @ts-ignore - JS module
import { CatalogProduct } from "../catalog/catalog-product.model.js";

const router = Router();

/**
 * Get artisan/supplier public profile by code
 * @route GET /api/artisans/:code
 */
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    // Find supplier by code (case-insensitive)
    const supplier = await Supplier.findOne({
      code: code.toUpperCase(),
      isActive: true,
    })
      .select(
        "name code type contactInfo.city contactInfo.country capabilities rating isPreferred profile"
      )
      .lean();

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nghệ nhân/nhà cung cấp",
      });
    }

    res.status(200).json({
      success: true,
      data: { artisan: supplier },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get artisan's public posts
 * @route GET /api/artisans/:code/posts
 */
router.get("/:code/posts", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { page = 1, limit = 12 } = req.query;

    // Find supplier first
    const supplier = await Supplier.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).select("_id");

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nghệ nhân/nhà cung cấp",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      SupplierPost.find({
        supplierId: supplier._id,
        visibility: "public",
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select(
          "title excerpt slug category subcategory readTime featured media tags createdAt authorProfile ogImage"
        )
        .lean(),
      SupplierPost.countDocuments({
        supplierId: supplier._id,
        visibility: "public",
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get artisan's products (tác phẩm)
 * @route GET /api/artisans/:code/products
 */
router.get("/:code/products", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { page = 1, limit = 12 } = req.query;

    // Find supplier first
    const supplier = await Supplier.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).select("_id");

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nghệ nhân/nhà cung cấp",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      CatalogProduct.find({
        supplierId: supplier._id,
        status: "active",
        isPublished: true,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select(
          "name slug sku thumbnailUrl images basePrice tags totalSold isFeatured"
        )
        .lean(),
      CatalogProduct.countDocuments({
        supplierId: supplier._id,
        status: "active",
        isPublished: true,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get list of featured artisans
 * @route GET /api/artisans
 */
router.get("/", async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const query: any = {
      isActive: true,
    };

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [artisans, total] = await Promise.all([
      Supplier.find(query)
        .sort({ isPreferred: -1, rating: -1, name: 1 })
        .skip(skip)
        .limit(Number(limit))
        .select(
          "name code type contactInfo.city contactInfo.country capabilities rating isPreferred"
        )
        .lean(),
      Supplier.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        artisans,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
