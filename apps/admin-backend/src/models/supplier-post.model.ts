// apps/admin-backend/src/models/supplier-post.model.ts
// Model for supplier posts (like Facebook posts)

import mongoose, { Schema, Document } from "mongoose";

// Artisan Block types for THE ARTISAN BLOCK CMS
export type ArtisanBlockType =
  | "hero"
  | "story"
  | "interactive"
  | "artifact"
  | "footer"
  | "text"
  | "media"
  | "curator_note"
  | "comparison_table";

export interface IArtisanBlock {
  id: string;
  type: ArtisanBlockType;
  order: number;
  // Legacy blocks use 'content', new blocks use 'data'
  content?: Record<string, any>;
  data?: Record<string, any>;
  settings?: {
    backgroundColor?: string;
    spacing?: "compact" | "normal" | "spacious";
    alignment?: "left" | "center" | "right";
  };
}

export interface ISupplierPost extends Document {
  supplierId: mongoose.Types.ObjectId;
  // Blog-specific fields
  title?: string; // Tiêu đề bài viết (optional for backward compatibility)
  slug?: string; // SEO-friendly URL slug
  excerpt?: string; // Mô tả ngắn
  category?: string; // Danh mục: gifting-culture, heritage-stories, philosophy, curator-notes
  subcategory?: string; // Phân loại nhỏ hơn
  readTime?: number; // Thời gian đọc (phút)
  featured?: boolean; // Đánh dấu nổi bật

  // SEO & Display (Nhóm 1: Vũ khí SEO)
  metaTitle?: string; // SEO title (khác với title hiển thị)
  metaDescription?: string; // SEO description (khác với excerpt)
  ogImage?: string; // Open Graph image cho social share (1200x630px)
  schemaType?: "Article" | "FAQ" | "ProductReview"; // Schema.org type

  // Money Making (Nhóm 2: Điều hướng & Bán hàng)
  relatedProducts?: mongoose.Types.ObjectId[]; // Sản phẩm liên quan (manual selection)
  relatedPosts?: mongoose.Types.ObjectId[]; // Bài viết liên quan (manual selection)
  highlightQuote?: string; // Câu trích dẫn nổi bật (hiển thị trên card)

  // Author & Authority (Nhóm 3: Thẩm quyền)
  authorProfile?: {
    name: string;
    title: string; // VD: "Founder & Curator"
    avatar?: string;
    bio?: string;
  };

  // Content fields - EITHER content (legacy HTML) OR blocks (Artisan Block)
  content?: string; // Legacy HTML content (optional now)
  blocks?: IArtisanBlock[]; // NEW: Artisan Block array
  editorMode?: "richtext" | "artisan"; // Track which editor was used

  media: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
    alt?: string;
    publicId?: string; // Cloudinary public ID for cleanup
  }[];
  visibility: "public" | "private" | "draft";
  likes: number;
  views: number;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  // Image tracking for Cloudinary cleanup
  imagePublicIds: string[]; // All Cloudinary public IDs used in this post (content + media)
  createdAt: Date;
  updatedAt: Date;
}

const supplierPostSchema = new Schema<ISupplierPost>(
  {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    // Blog-specific fields (optional)
    title: { type: String, trim: true },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    }, // SEO-friendly URL
    excerpt: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        // 3 Pillar categories
        "triet-ly-song",
        "goc-giam-tuyen",
        "cau-chuyen-di-san",
        // 5 Ngu Hanh categories
        "ngu-hanh-kim",
        "ngu-hanh-moc",
        "ngu-hanh-thuy",
        "ngu-hanh-hoa",
        "ngu-hanh-tho",
        "",
      ],
    },
    subcategory: { type: String, trim: true },
    readTime: { type: Number }, // in minutes
    featured: { type: Boolean, default: false },

    // SEO & Display
    metaTitle: { type: String, trim: true, maxlength: 60 }, // Google limit
    metaDescription: { type: String, trim: true, maxlength: 160 }, // Google limit
    ogImage: { type: String }, // Open Graph image URL
    schemaType: {
      type: String,
      enum: ["Article", "FAQ", "ProductReview"],
      default: "Article",
    },

    // Money Making
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "CatalogProduct" }],
    relatedPosts: [{ type: Schema.Types.ObjectId, ref: "SupplierPost" }],
    highlightQuote: { type: String, trim: true, maxlength: 200 },

    // Author & Authority
    authorProfile: {
      name: { type: String, trim: true },
      title: { type: String, trim: true }, // VD: "Founder & Curator"
      avatar: { type: String },
      bio: { type: String, trim: true, maxlength: 500 },
    },

    // Content fields - EITHER content (legacy HTML) OR blocks (Artisan Block)
    content: { type: String, trim: true }, // No longer required - can use blocks instead
    blocks: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: [
            "hero",
            "story",
            "interactive",
            "artifact",
            "footer",
            "text",
            "media",
            "curator_note",
            "comparison_table",
          ],
          required: true,
        },
        order: { type: Number, required: true },
        content: { type: Schema.Types.Mixed }, // Legacy blocks
        data: { type: Schema.Types.Mixed }, // New B2B blocks
        settings: {
          backgroundColor: { type: String },
          spacing: { type: String, enum: ["compact", "normal", "spacious"] },
          alignment: { type: String, enum: ["left", "center", "right"] },
        },
      },
    ],
    editorMode: {
      type: String,
      enum: ["richtext", "artisan"],
      default: "richtext",
    },
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        url: { type: String, required: true },
        thumbnail: { type: String },
        alt: { type: String },
        publicId: { type: String }, // Cloudinary public ID for cleanup
      },
    ],
    // Image tracking for Cloudinary cleanup
    imagePublicIds: [{ type: String }],
    visibility: {
      type: String,
      enum: ["public", "private", "draft"],
      default: "public",
    },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD") // Normalize Vietnamese characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .substring(0, 100); // Limit length
}

// Pre-save hook to generate slug from title
supplierPostSchema.pre("save", async function (next) {
  if (this.title && !this.slug) {
    let slug = generateSlug(this.title);
    let slugExists = await mongoose.models.SupplierPost.findOne({ slug });
    let counter = 1;

    // If slug exists, append number
    while (slugExists) {
      slug = `${generateSlug(this.title)}-${counter}`;
      slugExists = await mongoose.models.SupplierPost.findOne({ slug });
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Indexes
supplierPostSchema.index({ supplierId: 1, createdAt: -1 });
supplierPostSchema.index({ visibility: 1, createdAt: -1 });
supplierPostSchema.index({ tags: 1 });
supplierPostSchema.index({ slug: 1 }); // Index for slug lookups
supplierPostSchema.index({ category: 1, featured: -1 }); // For featured posts by category
supplierPostSchema.index({ relatedProducts: 1 }); // For product-post relationships

export const SupplierPost =
  (mongoose.models.SupplierPost as mongoose.Model<ISupplierPost>) ||
  mongoose.model<ISupplierPost>("SupplierPost", supplierPostSchema);
