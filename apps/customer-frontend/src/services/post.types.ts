// apps/customer-frontend/src/services/post.types.ts
// Shared types for blog posts and magazine articles

/**
 * Base post interface - shared fields between blog and magazine
 */
export interface BasePost {
  _id: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  content: string;
  category?: string;
  subcategory?: string;
  readTime?: number;
  featured?: boolean;
  media: Array<{
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }>;
  tags: string[];
  views: number;
  likes: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Author/Creator information
 */
export interface PostAuthor {
  _id: string;
  displayName?: string;
  name?: string;
  title?: string;
  avatar?: string;
}

/**
 * Pagination response
 */
export interface PostPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Post list response
 */
export interface PostListResponse<T> {
  posts: T[];
  pagination: PostPagination;
}

/**
 * Category configuration
 */
export interface PostCategory {
  id: string;
  label: string;
  color: string;
  description?: string;
}

/**
 * Post categories mapping
 * 3 Trụ Cột Tinh Thần + 5 Trụ Cột Ngũ Hành = 8 danh mục
 * Keys phải khớp với values trong admin frontend PostFormSidebarSimplified.tsx
 */
export const POST_CATEGORIES: Record<string, PostCategory> = {
  // === 3 TRỤ CỘT TINH THẦN ===
  "triet-ly-song": {
    id: "triet-ly-song",
    label: "Triết Lý Sống",
    color: "bg-emerald-600",
    description: "Triết lý và tư duy về cuộc sống",
  },
  "goc-giam-tuyen": {
    id: "goc-giam-tuyen",
    label: "Góc Giám Tuyển",
    color: "bg-purple-600",
    description: "Góc nhìn từ các chuyên gia giám tuyển",
  },
  "cau-chuyen-di-san": {
    id: "cau-chuyen-di-san",
    label: "Câu Chuyện Di Sản",
    color: "bg-amber-700",
    description: "Những câu chuyện về di sản văn hóa",
  },

  // === 5 TRỤ CỘT NGŨ HÀNH ===
  "ngu-hanh-kim": {
    id: "ngu-hanh-kim",
    label: "Kim - Gốm & Sứ",
    color: "bg-sky-600",
    description: "Nghệ thuật gốm sứ truyền thống",
  },
  "ngu-hanh-moc": {
    id: "ngu-hanh-moc",
    label: "Mộc - Trà & Hương",
    color: "bg-green-600",
    description: "Văn hóa trà đạo và hương liệu",
  },
  "ngu-hanh-thuy": {
    id: "ngu-hanh-thuy",
    label: "Thủy - Lụa & Vải",
    color: "bg-blue-500",
    description: "Nghệ thuật dệt lụa và vải truyền thống",
  },
  "ngu-hanh-hoa": {
    id: "ngu-hanh-hoa",
    label: "Hỏa - Sơn Mài & Gỗ",
    color: "bg-orange-600",
    description: "Nghệ thuật sơn mài và chế tác gỗ",
  },
  "ngu-hanh-tho": {
    id: "ngu-hanh-tho",
    label: "Thổ - Đá & Thủ Công",
    color: "bg-amber-800",
    description: "Nghệ thuật chế tác đá và thủ công mỹ nghệ",
  },
};

/**
 * Get category color class
 */
export function getCategoryColor(category: string): string {
  return POST_CATEGORIES[category]?.color || "bg-stone-600";
}

/**
 * Get category label
 */
export function getCategoryLabel(category: string): string {
  return POST_CATEGORIES[category]?.label || "";
}

/**
 * Format date to Vietnamese locale
 */
export function formatPostDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculate read time from content
 */
export function calculateReadTime(
  content: string,
  wordsPerMinute = 200
): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Get first image from media array
 */
export function getFirstImage(
  media: Array<{ type: string; url: string }>,
  fallback = "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800"
): string {
  const firstImage = media.find((m) => m.type === "image");
  return firstImage?.url || fallback;
}
