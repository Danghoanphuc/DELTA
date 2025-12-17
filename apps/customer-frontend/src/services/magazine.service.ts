// apps/customer-frontend/src/services/magazine.service.ts
import api from "@/shared/lib/axios";

export interface MagazinePost {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  subcategory?: string;
  readTime?: number;
  featured: boolean;
  media: Array<{
    type: "image" | "video";
    url: string;
  }>;
  tags: string[];
  createdAt: string;
  authorProfile?: {
    name: string;
    title: string;
    avatar?: string;
    bio?: string;
  };
  highlightQuote?: string;
  ogImage?: string;
}

// Block types for Artisan Block system
export type BlockType =
  | "hero"
  | "story"
  | "interactive"
  | "artifact"
  | "footer" // New B2B blocks
  | "text"
  | "media"
  | "curator_note"
  | "comparison_table"; // Legacy blocks

export type MediaType = "image" | "audio" | "video_loop";
export type InteractiveType = "audio" | "zoom" | "comparison_slider";

export interface ArtisanBlock {
  id: string;
  type: BlockType;
  order: number;
  content?: any; // Legacy blocks use content
  data?: any; // New B2B blocks use data
  settings?: {
    backgroundColor?: string;
    spacing?: "compact" | "normal" | "spacious";
    alignment?: "left" | "center" | "right";
  };
}

export interface MagazinePostDetail extends MagazinePost {
  content?: string; // Legacy HTML content (optional for block-based posts)
  blocks?: ArtisanBlock[]; // New block-based content
  editorMode?: "richtext" | "artisan"; // Track which editor was used
  metaTitle?: string;
  metaDescription?: string;
  schemaType?: string;
  relatedProducts?: any[];
  relatedPosts?: any[];
  views: number;
  likes: number;
  updatedAt?: string;
  videoUrl?: string;
  videoInfo?: {
    videoId: string;
    title: string;
    thumbnailUrl: string;
    authorName: string;
    embedUrl: string;
    watchUrl: string;
  };
  // Supplier info for author profile link
  supplierCode?: string;
  supplierName?: string;
  supplierType?: string;
}

class MagazineService {
  /**
   * Get posts by category
   */
  async getPostsByCategory(
    category: string,
    options?: {
      page?: number;
      limit?: number;
      featured?: boolean;
    }
  ) {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.featured) params.append("featured", "true");

    // Backend route is /magazine/:category
    const categoryPath = category || "all";
    const { data } = await api.get(`/magazine/${categoryPath}?${params}`);
    return data.data;
  }

  /**
   * Get post by slug or ID
   * Backend route: /magazine/posts/:id (admin-backend)
   */
  async getPostBySlug(slugOrId: string) {
    const { data } = await api.get(`/magazine/posts/${slugOrId}`);
    return data.data.post as MagazinePostDetail;
  }
}

export const magazineService = new MagazineService();
