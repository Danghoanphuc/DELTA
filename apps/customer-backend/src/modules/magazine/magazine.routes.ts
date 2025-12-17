// apps/customer-backend/src/modules/magazine/magazine.routes.ts
// Public routes for magazine posts

import { Router } from "express";
import { SupplierPost } from "../../models/supplier-post.model.js";
// Import CatalogProduct from customer-backend's own model (not admin-backend)
import "../catalog/catalog-product.model.js";

const router = Router();

/**
 * DEBUG: Check if post exists (regardless of visibility)
 * @route GET /api/magazine/debug/:slug
 */
router.get("/debug/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Find post regardless of visibility
    const post = await SupplierPost.findOne({ slug })
      .select("title slug visibility category createdAt")
      .lean();

    if (!post) {
      // Try to find all posts with similar slug
      const allPosts = await SupplierPost.find({})
        .select("title slug visibility")
        .limit(10)
        .lean();

      return res.status(200).json({
        success: false,
        message: `Post with slug "${slug}" not found`,
        availablePosts: allPosts.map((p) => ({
          slug: p.slug,
          title: p.title,
          visibility: p.visibility,
        })),
      });
    }

    res.status(200).json({
      success: true,
      data: {
        slug: post.slug,
        title: post.title,
        visibility: post.visibility,
        category: post.category,
        isPublic: post.visibility === "public",
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get post by slug (public)
 * IMPORTANT: This route MUST be defined BEFORE /:category to avoid route conflict
 * @route GET /api/magazine/post/:slug
 */
router.get("/post/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await SupplierPost.findOne({
      slug,
      visibility: "public",
    })
      .select(
        "supplierId title excerpt slug category subcategory readTime featured content blocks editorMode media tags " +
          "metaTitle metaDescription ogImage schemaType highlightQuote authorProfile " +
          "relatedProducts relatedPosts views likes createdAt updatedAt videoUrl videoInfo"
      )
      .populate("supplierId", "code name type")
      .populate("relatedProducts", "name slug images thumbnailUrl basePrice")
      .populate("relatedPosts", "title slug excerpt category ogImage media")
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Increment views
    await SupplierPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    // Extract supplier info for author link
    const supplierInfo = post.supplierId as any;
    const responsePost = {
      ...post,
      supplierCode: supplierInfo?.code || null,
      supplierName: supplierInfo?.name || null,
      supplierType: supplierInfo?.type || null,
      supplierId: supplierInfo?._id || post.supplierId,
    };

    res.status(200).json({
      success: true,
      data: { post: responsePost },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get posts by category (public)
 * @route GET /api/magazine/:category
 */
router.get("/:category", async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, featured } = req.query;

    const query: any = {
      visibility: "public",
    };

    // If category is not "all", filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      SupplierPost.find(query)
        .sort({ createdAt: -1, featured: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select(
          "title excerpt slug category subcategory readTime featured media blocks editorMode tags createdAt authorProfile highlightQuote ogImage"
        )
        .lean(),
      SupplierPost.countDocuments(query),
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

export default router;
