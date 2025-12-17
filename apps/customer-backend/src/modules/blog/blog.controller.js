// apps/customer-backend/src/modules/blog/blog.controller.js
// Controller for public blog/supplier posts

import mongoose from "mongoose";
import { ApiResponse } from "../../shared/utils/api-response.util.js";
import { Logger } from "../../shared/utils/logger.util.js";

// Import SupplierPost model from admin-backend (shared database)
let SupplierPost;
try {
  // Try to get existing model
  SupplierPost = mongoose.model("SupplierPost");
} catch (error) {
  // If not exists, create it
  const supplierPostSchema = new mongoose.Schema({
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    slug: { type: String, unique: true, sparse: true },
    // Blog-specific fields
    title: { type: String },
    excerpt: { type: String },
    category: { type: String },
    subcategory: { type: String },
    readTime: { type: Number },
    featured: { type: Boolean, default: false },
    // Original fields
    content: String,
    media: [
      {
        type: { type: String, enum: ["image", "video"] },
        url: String,
        thumbnail: String,
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "draft"],
      default: "public",
    },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    tags: [String],
    authorProfile: {
      name: { type: String },
      title: { type: String },
      avatar: { type: String },
      bio: { type: String },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  SupplierPost = mongoose.model("SupplierPost", supplierPostSchema);
}

export class BlogController {
  /**
   * Get all public supplier posts for blog
   * @route GET /api/blog/posts
   */
  async getPosts(req, res, next) {
    try {
      const { category, search, page = 1, limit = 20 } = req.query;

      const query = { visibility: "public" };

      // Filter by tags if category provided
      if (category && category !== "all") {
        query.tags = { $in: [category] };
      }

      // Search in content
      if (search) {
        query.$or = [
          { content: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [posts, total] = await Promise.all([
        SupplierPost.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        SupplierPost.countDocuments(query),
      ]);

      // Increment views for each post
      const postIds = posts.map((p) => p._id);
      await SupplierPost.updateMany(
        { _id: { $in: postIds } },
        { $inc: { views: 1 } }
      );

      Logger.info(`[BlogCtrl] Fetched ${posts.length} public posts`);

      res.json(
        ApiResponse.success({
          posts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        })
      );
    } catch (error) {
      Logger.error("[BlogCtrl] Error fetching posts:", error);
      next(error);
    }
  }

  /**
   * Get single post by ID or slug
   * @route GET /api/blog/posts/:idOrSlug
   */
  async getPostById(req, res, next) {
    try {
      const { id } = req.params;

      // Try to find by slug first, then by ID
      let post;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // It's a MongoDB ObjectId
        post = await SupplierPost.findOne({
          _id: id,
          visibility: "public",
        }).lean();
      } else {
        // It's a slug
        post = await SupplierPost.findOne({
          slug: id,
          visibility: "public",
        }).lean();
      }

      if (!post) {
        return res
          .status(404)
          .json(ApiResponse.error("Bài viết không tồn tại"));
      }

      // Increment views using the actual post ID
      await SupplierPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

      Logger.info(`[BlogCtrl] Fetched post: ${id}`);

      res.json(ApiResponse.success({ post }));
    } catch (error) {
      Logger.error("[BlogCtrl] Error fetching post:", error);
      next(error);
    }
  }

  /**
   * Like a post
   * @route POST /api/blog/posts/:id/like
   */
  async likePost(req, res, next) {
    try {
      const { id } = req.params;

      const post = await SupplierPost.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!post) {
        return res
          .status(404)
          .json(ApiResponse.error("Bài viết không tồn tại"));
      }

      res.json(ApiResponse.success({ likes: post.likes }));
    } catch (error) {
      Logger.error("[BlogCtrl] Error liking post:", error);
      next(error);
    }
  }
}
