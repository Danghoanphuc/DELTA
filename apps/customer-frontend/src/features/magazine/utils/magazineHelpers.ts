// apps/customer-frontend/src/features/magazine/utils/magazineHelpers.ts
import { MagazinePost, ArtisanBlock } from "@/services/magazine.service";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
  slug: string;
}

/**
 * Extract first image URL from Artisan Blocks
 * Checks: hero block, media block, artifact block, interactive block (zoom)
 */
function extractImageFromBlocks(blocks?: ArtisanBlock[]): string | null {
  if (!blocks || blocks.length === 0) return null;

  // Sort by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  for (const block of sortedBlocks) {
    // Hero block (new B2B)
    if (block.type === "hero" && block.data?.mediaUrl) {
      return block.data.mediaUrl;
    }
    // Media block (legacy) - image type
    if (
      block.type === "media" &&
      block.content?.mediaType === "image" &&
      block.content?.url
    ) {
      return block.content.url;
    }
    // Artifact block (new B2B)
    if (block.type === "artifact" && block.data?.imageUrl) {
      return block.data.imageUrl;
    }
    // Interactive block - zoom type (new B2B)
    if (
      block.type === "interactive" &&
      block.data?.interactiveType === "zoom" &&
      block.data?.zoomImageUrl
    ) {
      return block.data.zoomImageUrl;
    }
  }

  return null;
}

export function convertToBlogPost(
  post: MagazinePost & { blocks?: ArtisanBlock[] }
): BlogPost {
  const firstImage = post.media?.find((m) => m.type === "image");
  const blockImage = extractImageFromBlocks((post as any).blocks);

  return {
    id: post.slug || post._id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    image:
      post.ogImage || // OG image takes priority (explicitly set)
      firstImage?.url || // Then media array
      blockImage || // Then extract from blocks
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800", // Fallback
    author: post.authorProfile?.name || "Printz Editorial",
    date: post.createdAt,
    readTime: post.readTime ? `${post.readTime} phút đọc` : "5 phút đọc",
    tags: post.tags || [],
    featured: post.featured || false,
  };
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Generate SEO-friendly URL for magazine post
 * New format: /tap-chi/:slug (shorter, better for SEO)
 */
export function getMagazinePostUrl(post: {
  slug?: string;
  _id?: string;
}): string {
  // Prefer slug for SEO, fallback to ID
  const identifier = post.slug || post._id;
  return `/tap-chi/${identifier}`;
}
