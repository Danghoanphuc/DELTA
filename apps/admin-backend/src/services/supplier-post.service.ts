// apps/admin-backend/src/services/supplier-post.service.ts
// ✅ SOLID: Single Responsibility - Business logic for supplier posts

import { SupplierPost, ISupplierPost } from "../models/supplier-post.model.js";
import { Logger } from "../shared/utils/logger.js";
import {
  NotFoundException,
  ValidationException,
  ForbiddenException,
} from "../shared/exceptions/index.js";
import { cloudinaryService } from "../infrastructure/storage/cloudinary.service.js";
import mongoose from "mongoose";

// Interface cho pending images (ảnh chưa upload, gửi từ frontend)
interface PendingImage {
  id: string; // Temporary ID từ frontend (để map lại sau khi upload)
  data: string; // Base64 data hoặc URL nếu đã upload
  type: "base64" | "url"; // Loại data
  alt?: string;
}

// Interface cho pending media (từ Artisan Blocks)
interface PendingMedia {
  blockId: string; // Block ID để map lại
  data: string; // Base64 data (data:image/..., data:video/..., data:audio/...)
  type: string; // MIME type (image/jpeg, video/mp4, audio/mp3...)
  name: string; // Original filename
}

/**
 * Extract Cloudinary public ID from a single URL
 * Cloudinary URL formats:
 * - https://res.cloudinary.com/{cloud}/image/upload/v1234567890/folder/file.webp
 * - https://res.cloudinary.com/{cloud}/image/upload/folder/file.webp
 */
function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;

  try {
    // Match pattern: /upload/v{version}/ or /upload/ followed by the public_id
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?(?:\?|$)/i);
    if (match && match[1]) {
      // Remove file extension if present
      return match[1].replace(/\.[a-z]+$/i, "");
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

/**
 * Extract Cloudinary public IDs from URLs in content and media
 */
function extractCloudinaryPublicIds(
  content?: string,
  media?: Array<{ url: string; publicId?: string }>
): string[] {
  const publicIds: string[] = [];

  // Extract from content (HTML with <img> tags) - only if content exists
  if (content) {
    const urlRegex =
      /https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video|raw)\/upload\/[^\s"'<>]+/gi;
    const urls = content.match(urlRegex) || [];

    for (const url of urls) {
      const publicId = extractPublicIdFromUrl(url);
      if (publicId && !publicIds.includes(publicId)) {
        publicIds.push(publicId);
      }
    }
  }

  // Extract from media array
  if (media && media.length > 0) {
    for (const item of media) {
      // If publicId is already stored, use it
      if (item.publicId && !publicIds.includes(item.publicId)) {
        publicIds.push(item.publicId);
        continue;
      }

      // Otherwise extract from URL
      const publicId = extractPublicIdFromUrl(item.url);
      if (publicId && !publicIds.includes(publicId)) {
        publicIds.push(publicId);
      }
    }
  }

  Logger.debug(
    `[SupplierPostSvc] Extracted ${publicIds.length} Cloudinary public IDs`
  );
  return publicIds;
}

export class SupplierPostService {
  /**
   * Generate unique slug - adds suffix if slug already exists
   */
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await SupplierPost.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Upload pending images (base64) lên Cloudinary
   * Trả về map từ tempId -> cloudinary URL
   */
  private async uploadPendingImages(
    pendingImages: PendingImage[],
    folder: string = "supplier-posts"
  ): Promise<Map<string, { url: string; publicId: string }>> {
    const uploadedMap = new Map<string, { url: string; publicId: string }>();

    if (!pendingImages || pendingImages.length === 0) {
      return uploadedMap;
    }

    Logger.debug(
      `[SupplierPostSvc] Uploading ${pendingImages.length} pending images...`
    );

    // Upload từng ảnh (có thể parallel nhưng để sequential cho dễ debug)
    for (const img of pendingImages) {
      try {
        // Nếu đã là URL (đã upload trước đó), skip
        if (img.type === "url") {
          // Extract publicId từ URL nếu có
          const publicId = extractPublicIdFromUrl(img.data);
          uploadedMap.set(img.id, {
            url: img.data,
            publicId: publicId || "",
          });
          continue;
        }

        // Upload base64 lên Cloudinary
        if (img.type === "base64" && img.data) {
          // Chuyển base64 thành buffer
          const base64Data = img.data.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          const result = await cloudinaryService.uploadImage(buffer, {
            folder,
            withWatermark: true,
          } as any);

          uploadedMap.set(img.id, {
            url: result.secure_url,
            publicId: result.public_id,
          });

          Logger.debug(
            `[SupplierPostSvc] Uploaded image ${img.id} -> ${result.public_id}`
          );
        }
      } catch (error: any) {
        Logger.error(
          `[SupplierPostSvc] Failed to upload image ${img.id}:`,
          error.message
        );
        // Không throw, tiếp tục upload các ảnh khác
      }
    }

    Logger.success(
      `[SupplierPostSvc] Uploaded ${uploadedMap.size}/${pendingImages.length} images`
    );
    return uploadedMap;
  }

  /**
   * Thay thế temp image IDs trong content HTML bằng Cloudinary URLs
   */
  private replaceImageUrlsInContent(
    content: string,
    uploadedMap: Map<string, { url: string; publicId: string }>
  ): string {
    let updatedContent = content;

    // Thay thế các placeholder dạng {{img:tempId}} hoặc data:image URLs
    uploadedMap.forEach(({ url }, tempId) => {
      // Pattern 1: {{img:tempId}}
      const placeholder = `{{img:${tempId}}}`;
      updatedContent = updatedContent.replace(
        new RegExp(placeholder, "g"),
        url
      );

      // Pattern 2: data:image/... với id trong attribute
      // <img data-temp-id="tempId" src="data:image/..." />
      const imgTagRegex = new RegExp(
        `<img([^>]*?)data-temp-id=["']${tempId}["']([^>]*?)src=["'][^"']+["']([^>]*?)>`,
        "gi"
      );
      updatedContent = updatedContent.replace(
        imgTagRegex,
        `<img$1$2src="${url}"$3>`
      );
    });

    return updatedContent;
  }

  /**
   * Upload pending media (base64) từ Artisan Blocks lên Cloudinary
   * Trả về map từ blockId -> cloudinary URL
   */
  private async uploadPendingMedia(
    pendingMedia: PendingMedia[],
    folder: string = "supplier-posts"
  ): Promise<Map<string, { url: string; publicId: string }>> {
    const uploadedMap = new Map<string, { url: string; publicId: string }>();

    if (!pendingMedia || pendingMedia.length === 0) {
      return uploadedMap;
    }

    Logger.debug(
      `[SupplierPostSvc] Uploading ${pendingMedia.length} pending media files...`
    );

    for (const media of pendingMedia) {
      try {
        // Determine resource type from MIME type
        let resourceType: "image" | "video" | "raw" = "image";
        if (media.type.startsWith("video/")) {
          resourceType = "video";
        } else if (media.type.startsWith("audio/")) {
          resourceType = "raw"; // Cloudinary uses 'raw' for audio
        }

        // Extract base64 data (remove data:xxx;base64, prefix)
        const base64Match = media.data.match(/^data:([^;]+);base64,(.+)$/);
        if (!base64Match) {
          Logger.warn(
            `[SupplierPostSvc] Invalid base64 format for block ${media.blockId}`
          );
          continue;
        }

        const base64Data = base64Match[2];
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to Cloudinary based on resource type
        let result: any;

        if (resourceType === "image") {
          result = await cloudinaryService.uploadImage(buffer, {
            folder,
            withWatermark: true,
          } as any);
        } else if (resourceType === "video") {
          result = await cloudinaryService.uploadVideo(buffer, {
            folder,
          } as any);
        } else {
          // For audio, use uploadAudio
          result = await cloudinaryService.uploadAudio(buffer, {
            folder,
          } as any);
        }

        uploadedMap.set(media.blockId, {
          url: result.secure_url,
          publicId: result.public_id,
        });

        Logger.debug(
          `[SupplierPostSvc] Uploaded media for block ${media.blockId} (${resourceType})`
        );
      } catch (error: any) {
        Logger.error(
          `[SupplierPostSvc] Failed to upload media for block ${media.blockId}:`,
          error.message
        );
        // Continue with other uploads
      }
    }

    Logger.success(
      `[SupplierPostSvc] Uploaded ${uploadedMap.size}/${pendingMedia.length} media files`
    );
    return uploadedMap;
  }

  /**
   * Replace media placeholders in blocks with actual Cloudinary URLs
   * Placeholder formats:
   * - {{media:blockId}} - legacy media block
   * - {{media:blockId:fieldName}} - new B2B blocks
   */
  private replaceMediaUrlsInBlocks(
    blocks: any[],
    uploadedMap: Map<string, { url: string; publicId: string }>
  ): any[] {
    return blocks.map((block) => {
      // Check for placeholder in content.url (legacy media block)
      if (block.type === "media" && block.content?.url) {
        const match = block.content.url.match(/^\{\{media:([^}]+)\}\}$/);
        if (match) {
          const blockId = match[1];
          const uploaded = uploadedMap.get(blockId);
          if (uploaded) {
            return {
              ...block,
              content: {
                ...block.content,
                url: uploaded.url,
              },
            };
          }
        }
      }

      // Check for placeholder in data fields (new B2B blocks)
      if (block.data) {
        const updatedData = { ...block.data };
        let hasChanges = false;

        // Check all URL fields in data
        const urlFields = [
          "mediaUrl",
          "posterUrl",
          "audioUrl",
          "zoomImageUrl",
          "beforeImageUrl",
          "afterImageUrl",
          "imageUrl",
        ];

        for (const field of urlFields) {
          if (updatedData[field]) {
            // Match both formats: {{media:blockId}} and {{media:blockId:field}}
            const match = updatedData[field].match(
              /^\{\{media:([^:}]+)(?::([^}]+))?\}\}$/
            );
            if (match) {
              // Key format: "blockId" or "blockId:field"
              const key = match[2] ? `${match[1]}:${match[2]}` : match[1];
              const uploaded = uploadedMap.get(key);
              if (uploaded) {
                updatedData[field] = uploaded.url;
                hasChanges = true;
              }
            }
          }
        }

        if (hasChanges) {
          return { ...block, data: updatedData };
        }
      }

      return block;
    });
  }

  /**
   * Create a new post
   * Ảnh được upload khi submit (không upload trước)
   */
  async createPost(
    supplierId: string,
    userId: string,
    data: {
      // Content
      title?: string;
      excerpt?: string;
      category?: string;
      subcategory?: string;
      readTime?: number;
      featured?: boolean;
      content?: string; // Legacy HTML content (optional)
      blocks?: Array<{
        // NEW: Artisan Block array
        id: string;
        type: string;
        order: number;
        content?: Record<string, any>;
        data?: Record<string, any>;
        settings?: Record<string, any>;
      }>;
      editorMode?: "richtext" | "artisan"; // Track editor type
      media?: Array<{
        type: "image" | "video";
        url: string;
        thumbnail?: string;
        alt?: string;
      }>;
      visibility?: "public" | "private" | "draft";
      tags?: string[];
      // SEO
      slug?: string;
      metaTitle?: string;
      metaDescription?: string;
      ogImage?: string;
      schemaType?: "Article" | "FAQ" | "ProductReview";
      // Sales
      relatedProducts?: string[];
      relatedPosts?: string[];
      highlightQuote?: string;
      // Author
      authorProfile?: {
        name: string;
        title: string;
        avatar?: string;
        bio?: string;
      };
      // NEW: Pending images để upload khi submit (legacy)
      pendingImages?: PendingImage[];
      // NEW: Pending media từ Artisan Blocks
      pendingMedia?: PendingMedia[];
    }
  ): Promise<ISupplierPost> {
    Logger.debug(`[SupplierPostSvc] Creating post for supplier: ${supplierId}`);

    // Validation - must have either content (HTML) or blocks (Artisan)
    const hasContent = data.content && data.content.trim().length > 0;
    const hasBlocks = data.blocks && data.blocks.length > 0;

    if (!hasContent && !hasBlocks) {
      throw new ValidationException(
        "Nội dung bài viết không được để trống (cần có content hoặc blocks)"
      );
    }

    // Upload pending images trước (legacy)
    let finalContent = data.content;
    let finalMedia = data.media || [];
    let finalBlocks = data.blocks;

    if (data.pendingImages && data.pendingImages.length > 0) {
      const uploadedMap = await this.uploadPendingImages(
        data.pendingImages,
        `supplier-posts/${supplierId}`
      );

      // Thay thế URLs trong content
      if (finalContent) {
        finalContent = this.replaceImageUrlsInContent(
          finalContent,
          uploadedMap
        );
      }

      // Cập nhật media array với URLs mới
      finalMedia = finalMedia.map((m) => {
        if (m.url.startsWith("data:") || m.url.startsWith("{{img:")) {
          // Tìm trong uploadedMap
          const tempId = m.url.match(/{{img:([^}]+)}}/)?.[1] || "";
          const uploaded = uploadedMap.get(tempId);
          if (uploaded) {
            return { ...m, url: uploaded.url };
          }
        }
        return m;
      });
    }

    // Upload pending media từ Artisan Blocks
    if (data.pendingMedia && data.pendingMedia.length > 0) {
      Logger.debug(
        `[SupplierPostSvc] Processing ${data.pendingMedia.length} pending media from blocks...`
      );

      const uploadedMediaMap = await this.uploadPendingMedia(
        data.pendingMedia,
        `supplier-posts/${supplierId}`
      );

      // Replace placeholders in blocks with actual URLs
      if (finalBlocks && finalBlocks.length > 0) {
        finalBlocks = this.replaceMediaUrlsInBlocks(
          finalBlocks,
          uploadedMediaMap
        );
      }
    }

    const postData: any = {
      supplierId: new mongoose.Types.ObjectId(supplierId),
      media: finalMedia,
      visibility: data.visibility || "public",
      tags: data.tags || [],
      createdBy: new mongoose.Types.ObjectId(userId),
      editorMode: data.editorMode || (data.blocks ? "artisan" : "richtext"),
    };

    // Set content OR blocks based on editor mode
    if (finalBlocks && finalBlocks.length > 0) {
      postData.blocks = finalBlocks;
      postData.content = ""; // Empty for block-based posts
    } else {
      postData.content = finalContent;
    }

    // Add blog fields if provided
    if (data.title) postData.title = data.title;
    if (data.excerpt) postData.excerpt = data.excerpt;
    if (data.category) postData.category = data.category;
    if (data.subcategory) postData.subcategory = data.subcategory;
    if (data.readTime) postData.readTime = data.readTime;
    if (data.featured !== undefined) postData.featured = data.featured;

    // SEO fields - ensure unique slug
    if (data.slug) {
      postData.slug = await this.generateUniqueSlug(data.slug);
    }
    if (data.metaTitle) postData.metaTitle = data.metaTitle;
    if (data.metaDescription) postData.metaDescription = data.metaDescription;
    if (data.ogImage) postData.ogImage = data.ogImage;
    if (data.schemaType) postData.schemaType = data.schemaType;

    // Sales fields
    if (data.relatedProducts && data.relatedProducts.length > 0) {
      postData.relatedProducts = data.relatedProducts.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }
    if (data.relatedPosts && data.relatedPosts.length > 0) {
      postData.relatedPosts = data.relatedPosts.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }
    if (data.highlightQuote) postData.highlightQuote = data.highlightQuote;

    // Author profile - auto-fill from supplier if not provided
    if (data.authorProfile && data.authorProfile.name) {
      postData.authorProfile = data.authorProfile;
    } else {
      // Fetch supplier info to build authorProfile
      const { Supplier } = await import("../models/catalog.models.js");
      const supplier = await Supplier.findById(supplierId)
        .select("name type logo")
        .lean();
      if (supplier) {
        const typeLabels: Record<string, string> = {
          manufacturer: "Nhà sản xuất",
          distributor: "Nhà phân phối",
          printer: "Nhà in ấn",
          dropshipper: "Dropshipper",
          artisan: "Nghệ nhân",
        };
        const supplierName = (supplier as any).name;
        const supplierType = (supplier as any).type as string;
        postData.authorProfile = {
          name: supplierName,
          title: typeLabels[supplierType] || "Đối tác",
          avatar: (supplier as any).logo || "",
          bio: `${supplierName} - ${
            typeLabels[supplierType] || "Đối tác"
          } cung cấp sản phẩm chất lượng cao cho Printz.`,
        };
        Logger.debug(
          `[SupplierPostSvc] Auto-filled authorProfile from supplier: ${supplierName}`
        );
      }
    }

    // Extract and store Cloudinary public IDs for cleanup
    postData.imagePublicIds = extractCloudinaryPublicIds(
      data.content,
      data.media
    );

    const post = await SupplierPost.create(postData);

    Logger.success(
      `[SupplierPostSvc] Created post: ${post._id} (${postData.imagePublicIds.length} images tracked)`
    );
    return post;
  }

  /**
   * Get posts by supplier
   */
  async getPostsBySupplier(
    supplierId: string,
    options: {
      visibility?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { visibility = "all", page = 1, limit = 20 } = options;

    const query: any = { supplierId: new mongoose.Types.ObjectId(supplierId) };
    if (visibility !== "all") {
      query.visibility = visibility;
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      SupplierPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "displayName email")
        .lean(),
      SupplierPost.countDocuments(query),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all posts (for related posts picker and public magazine)
   */
  async getAllPosts(
    options: {
      visibility?: string;
      category?: string;
      limit?: number;
      featured?: boolean;
    } = {}
  ) {
    const { visibility = "public", category, limit = 100, featured } = options;

    const query: any = {};
    if (visibility && visibility !== "all") {
      query.visibility = visibility;
    }
    if (category) {
      query.category = category;
    }
    if (featured !== undefined) {
      query.featured = featured;
    }

    const posts = await SupplierPost.find(query)
      .sort({ featured: -1, createdAt: -1 }) // Featured posts first
      .limit(limit)
      .select(
        "_id title slug excerpt category subcategory ogImage tags media featured readTime authorProfile createdAt"
      )
      .lean();

    return { posts };
  }

  /**
   * Get post by ID
   */
  async getPostById(postId: string): Promise<ISupplierPost> {
    const post = await SupplierPost.findById(postId)
      .populate("supplierId", "name code")
      .populate("createdBy", "displayName email")
      .lean();

    if (!post) {
      throw new NotFoundException("Post", postId);
    }

    return post as unknown as ISupplierPost;
  }

  /**
   * Get post by slug or ID (for public access)
   * Supports both MongoDB ObjectId and slug lookup
   */
  async getPostBySlugOrId(identifier: string): Promise<ISupplierPost> {
    // Check if identifier is a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

    let post;
    if (isObjectId) {
      post = await SupplierPost.findById(identifier)
        .populate("supplierId", "name code profile")
        .populate("relatedProducts", "name slug thumbnailUrl basePrice images")
        .populate("relatedPosts", "title slug ogImage excerpt category media")
        .lean();
    } else {
      // Find by slug
      post = await SupplierPost.findOne({ slug: identifier })
        .populate("supplierId", "name code profile")
        .populate("relatedProducts", "name slug thumbnailUrl basePrice images")
        .populate("relatedPosts", "title slug ogImage excerpt category media")
        .lean();
    }

    if (!post) {
      throw new NotFoundException("Post", identifier);
    }

    // Add supplierCode and authorProfile for frontend
    const supplierData = post.supplierId as any;
    const enrichedPost = {
      ...post,
      supplierCode: supplierData?.code,
      authorProfile: {
        name: supplierData?.name,
        title:
          supplierData?.type === "artisan" ? "Nghệ nhân" : "Đối tác chế tác",
        avatar: supplierData?.profile?.avatar,
        bio: supplierData?.profile?.bio,
      },
    };

    return enrichedPost as unknown as ISupplierPost;
  }

  /**
   * Update post
   * Ảnh mới được upload khi submit (không upload trước)
   */
  async updatePost(
    postId: string,
    userId: string,
    data: {
      // Content
      title?: string;
      excerpt?: string;
      category?: string;
      subcategory?: string;
      readTime?: number;
      featured?: boolean;
      content?: string;
      blocks?: Array<{
        // NEW: Artisan Block array
        id: string;
        type: string;
        order: number;
        content?: Record<string, any>;
        data?: Record<string, any>;
        settings?: Record<string, any>;
      }>;
      editorMode?: "richtext" | "artisan";
      media?: Array<{
        type: "image" | "video";
        url: string;
        thumbnail?: string;
        alt?: string;
      }>;
      visibility?: "public" | "private" | "draft";
      tags?: string[];
      // SEO
      slug?: string;
      metaTitle?: string;
      metaDescription?: string;
      ogImage?: string;
      schemaType?: "Article" | "FAQ" | "ProductReview";
      // Sales
      relatedProducts?: string[];
      relatedPosts?: string[];
      highlightQuote?: string;
      // Author
      authorProfile?: {
        name: string;
        title: string;
        avatar?: string;
        bio?: string;
      };
      // NEW: Pending images để upload khi submit (legacy)
      pendingImages?: PendingImage[];
      // NEW: Pending media từ Artisan Blocks
      pendingMedia?: PendingMedia[];
    }
  ): Promise<ISupplierPost> {
    Logger.debug(`[SupplierPostSvc] Updating post: ${postId}`);

    const post = await SupplierPost.findById(postId);
    if (!post) {
      throw new NotFoundException("Post", postId);
    }

    // Authorization check
    if (post.createdBy.toString() !== userId) {
      throw new ForbiddenException("Bạn không có quyền chỉnh sửa bài viết này");
    }

    // Upload pending images trước (nếu có) - legacy
    let finalContent = data.content;
    let finalMedia = data.media;
    let finalBlocks = data.blocks;

    if (data.pendingImages && data.pendingImages.length > 0) {
      const uploadedMap = await this.uploadPendingImages(
        data.pendingImages,
        `supplier-posts/${post.supplierId}`
      );

      // Thay thế URLs trong content
      if (finalContent) {
        finalContent = this.replaceImageUrlsInContent(
          finalContent,
          uploadedMap
        );
      }

      // Cập nhật media array với URLs mới
      if (finalMedia) {
        finalMedia = finalMedia.map((m) => {
          if (m.url.startsWith("data:") || m.url.startsWith("{{img:")) {
            const tempId = m.url.match(/{{img:([^}]+)}}/)?.[1] || "";
            const uploaded = uploadedMap.get(tempId);
            if (uploaded) {
              return { ...m, url: uploaded.url };
            }
          }
          return m;
        });
      }
    }

    // Upload pending media từ Artisan Blocks
    if (data.pendingMedia && data.pendingMedia.length > 0) {
      Logger.debug(
        `[SupplierPostSvc] Processing ${data.pendingMedia.length} pending media from blocks...`
      );

      const uploadedMediaMap = await this.uploadPendingMedia(
        data.pendingMedia,
        `supplier-posts/${post.supplierId}`
      );

      // Replace placeholders in blocks with actual URLs
      if (finalBlocks && finalBlocks.length > 0) {
        finalBlocks = this.replaceMediaUrlsInBlocks(
          finalBlocks,
          uploadedMediaMap
        );
      }
    }

    // Update content fields - handle both legacy and block-based
    if (finalBlocks !== undefined) {
      post.blocks = finalBlocks as any;
      post.editorMode = "artisan";
      // Clear content for block-based posts
      if (finalBlocks.length > 0) {
        post.content = "";
      }
    } else if (finalContent !== undefined) {
      post.content = finalContent;
      post.editorMode = "richtext";
    }
    if (finalMedia !== undefined) post.media = finalMedia;
    if (data.visibility !== undefined) post.visibility = data.visibility;
    if (data.tags !== undefined) post.tags = data.tags;

    // Update blog fields
    if (data.title !== undefined) post.title = data.title;
    if (data.excerpt !== undefined) post.excerpt = data.excerpt;
    if (data.category !== undefined) post.category = data.category;
    if (data.subcategory !== undefined) post.subcategory = data.subcategory;
    if (data.readTime !== undefined) post.readTime = data.readTime;
    if (data.featured !== undefined) post.featured = data.featured;

    // Update SEO fields - ensure unique slug (exclude current post)
    if (data.slug !== undefined && data.slug !== post.slug) {
      const existingPost = await SupplierPost.findOne({
        slug: data.slug,
        _id: { $ne: postId },
      });
      if (existingPost) {
        // Generate unique slug
        let newSlug = data.slug;
        let counter = 1;
        while (
          await SupplierPost.findOne({ slug: newSlug, _id: { $ne: postId } })
        ) {
          newSlug = `${data.slug}-${counter}`;
          counter++;
        }
        post.slug = newSlug;
      } else {
        post.slug = data.slug;
      }
    }
    if (data.metaTitle !== undefined) post.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined)
      post.metaDescription = data.metaDescription;
    if (data.ogImage !== undefined) post.ogImage = data.ogImage;
    if (data.schemaType !== undefined) post.schemaType = data.schemaType;

    // Update Sales fields
    if (data.relatedProducts !== undefined) {
      post.relatedProducts = data.relatedProducts.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }
    if (data.relatedPosts !== undefined) {
      post.relatedPosts = data.relatedPosts.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }
    if (data.highlightQuote !== undefined)
      post.highlightQuote = data.highlightQuote;

    // Update Author profile - auto-fill from supplier if not provided or empty
    if (data.authorProfile !== undefined && data.authorProfile?.name) {
      post.authorProfile = data.authorProfile;
    } else if (!post.authorProfile?.name && post.supplierId) {
      // Auto-fill from supplier if post doesn't have authorProfile
      const { Supplier } = await import("../models/catalog.models.js");
      const supplier = await Supplier.findById(post.supplierId)
        .select("name type logo")
        .lean();
      if (supplier) {
        const typeLabels: Record<string, string> = {
          manufacturer: "Nhà sản xuất",
          distributor: "Nhà phân phối",
          printer: "Nhà in ấn",
          dropshipper: "Dropshipper",
          artisan: "Nghệ nhân",
        };
        const supplierName = (supplier as any).name;
        const supplierType = (supplier as any).type as string;
        post.authorProfile = {
          name: supplierName,
          title: typeLabels[supplierType] || "Đối tác",
          avatar: (supplier as any).logo || "",
          bio: `${supplierName} - ${
            typeLabels[supplierType] || "Đối tác"
          } cung cấp sản phẩm chất lượng cao cho Printz.`,
        };
      }
    }

    // Re-extract and update Cloudinary public IDs
    post.imagePublicIds = extractCloudinaryPublicIds(
      post.content,
      post.media as Array<{ url: string; publicId?: string }>
    );

    await post.save();

    Logger.success(
      `[SupplierPostSvc] Updated post: ${postId} (${post.imagePublicIds.length} images tracked)`
    );
    return post;
  }

  /**
   * Delete post and cleanup Cloudinary images
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    Logger.debug(`[SupplierPostSvc] Deleting post: ${postId}`);

    const post = await SupplierPost.findById(postId);
    if (!post) {
      throw new NotFoundException("Post", postId);
    }

    // Authorization check
    if (post.createdBy.toString() !== userId) {
      throw new ForbiddenException("Bạn không có quyền xóa bài viết này");
    }

    // Cleanup Cloudinary images
    const imagePublicIds = post.imagePublicIds || [];
    if (imagePublicIds.length > 0) {
      Logger.debug(
        `[SupplierPostSvc] Cleaning up ${imagePublicIds.length} images from Cloudinary...`
      );

      // Delete images in parallel (don't block if some fail)
      const deleteResults = await Promise.allSettled(
        imagePublicIds.map((publicId) =>
          cloudinaryService.deleteImage(publicId)
        )
      );

      const successCount = deleteResults.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const failCount = deleteResults.filter(
        (r) => r.status === "rejected"
      ).length;

      if (failCount > 0) {
        Logger.warn(
          `[SupplierPostSvc] Failed to delete ${failCount}/${imagePublicIds.length} images`
        );
      }
      Logger.success(
        `[SupplierPostSvc] Deleted ${successCount}/${imagePublicIds.length} images from Cloudinary`
      );
    }

    await SupplierPost.findByIdAndDelete(postId);

    Logger.success(`[SupplierPostSvc] Deleted post: ${postId}`);
  }

  /**
   * Increment views
   */
  async incrementViews(postId: string): Promise<void> {
    await SupplierPost.findByIdAndUpdate(postId, { $inc: { views: 1 } });
  }

  /**
   * Toggle like
   */
  async toggleLike(postId: string, increment: boolean): Promise<number> {
    const post = await SupplierPost.findByIdAndUpdate(
      postId,
      { $inc: { likes: increment ? 1 : -1 } },
      { new: true }
    );

    if (!post) {
      throw new NotFoundException("Post", postId);
    }

    return post.likes;
  }
}
