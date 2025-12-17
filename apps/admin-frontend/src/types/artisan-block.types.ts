// apps/admin-frontend/src/types/artisan-block.types.ts
// Type definitions for THE ARTISAN BLOCK system - B2B Curator Structure

// ============================================
// BLOCK TYPES - The 5-Block Structure
// ============================================

export type BlockType =
  | "hero" // Visual Hook - Video/Image with title overlay
  | "story" // Educational Content - Rich text with drop-caps
  | "interactive" // Proof of Quality - Audio/Zoom/Comparison
  | "artifact" // Contextual Product - B2B view with packaging
  | "footer" // Conversion - CTA buttons
  // Legacy types (backward compatible)
  | "text"
  | "media"
  | "curator_note"
  | "comparison_table";

export type InteractiveType = "audio" | "zoom" | "comparison_slider";
export type MediaType = "image" | "audio" | "video_loop";

// ============================================
// BASE BLOCK INTERFACE
// ============================================

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
  settings?: {
    backgroundColor?: string;
    spacing?: "compact" | "normal" | "spacious";
    alignment?: "left" | "center" | "right";
  };
}

// ============================================
// 1. HERO BLOCK - Visual Hook
// ============================================

export interface HeroBlock extends BaseBlock {
  type: "hero";
  data: {
    mediaType: "video" | "image";
    mediaUrl: string;
    posterUrl?: string; // Video poster/thumbnail
    title: string;
    subtitle?: string;
    overlayOpacity?: number; // 0-100
  };
}

// ============================================
// 2. STORY BLOCK - Educational Content
// ============================================

export interface StoryBlock extends BaseBlock {
  type: "story";
  data: {
    content: string; // HTML from TipTap
    enableDropCap?: boolean; // First letter large
    highlightQuote?: string; // Pull quote
  };
}

// ============================================
// 3. INTERACTIVE BLOCK - Proof of Quality
// ============================================

export interface InteractiveBlock extends BaseBlock {
  type: "interactive";
  data: {
    interactiveType: InteractiveType;
    // Audio Player
    audioUrl?: string;
    audioLabel?: string; // "Tap to hear the ceramic sound"
    // Zoom Viewer
    zoomImageUrl?: string;
    zoomCaption?: string;
    // Comparison Slider
    beforeImageUrl?: string;
    afterImageUrl?: string;
    comparisonLabel?: string; // "Before/After firing"
  };
}

// ============================================
// 4. ARTIFACT BLOCK - Contextual Product (B2B)
// ============================================

export interface ArtifactBlock extends BaseBlock {
  type: "artifact";
  data: {
    productId?: string; // Link to product
    imageUrl: string; // Product WITH packaging
    name: string;
    material?: string;
    dimensions?: string;
    detailUrl?: string; // "View Artifact Details" link
    // Price is intentionally NOT included (B2B)
  };
}

// ============================================
// 5. FOOTER BLOCK - Conversion
// ============================================

export interface FooterBlock extends BaseBlock {
  type: "footer";
  data: {
    curatorQuote?: string;
    curatorName?: string;
    primaryCta?: {
      label: string; // "Download Corporate Catalogue"
      url: string; // PDF URL
      icon?: "download" | "external";
    };
    secondaryCta?: {
      label: string; // "Contact Curator"
      url: string; // Zalo/Contact URL
      icon?: "chat" | "phone" | "email";
    };
  };
}

// ============================================
// LEGACY BLOCKS (Backward Compatible)
// ============================================

export interface TextBlock extends BaseBlock {
  type: "text";
  content: {
    text: string;
    botSummary?: string;
  };
}

export interface MediaBlock extends BaseBlock {
  type: "media";
  content: {
    mediaType: "image" | "audio" | "video_loop";
    url?: string;
    file?: File;
    preview?: string;
    caption?: string;
    alt?: string;
  };
}

export interface CuratorNoteBlock extends BaseBlock {
  type: "curator_note";
  content: {
    note: string;
    authorName?: string;
  };
}

export interface ComparisonTableBlock extends BaseBlock {
  type: "comparison_table";
  content: {
    headers: string[];
    rows: string[][];
    caption?: string;
  };
}

// ============================================
// UNION TYPE
// ============================================

export type ArtisanBlock =
  | HeroBlock
  | StoryBlock
  | InteractiveBlock
  | ArtifactBlock
  | FooterBlock
  | TextBlock
  | MediaBlock
  | CuratorNoteBlock
  | ComparisonTableBlock;

// ============================================
// CONSTANTS
// ============================================

export const BLOCK_LIMITS = {
  TEXT_MAX_CHARS: 300,
  TEXT_MAX_LINES: 5,
  TABLE_MAX_COLUMNS: 3,
  TABLE_MAX_ROWS: 10,
  CURATOR_NOTE_MAX_CHARS: 500,
  BOT_SUMMARY_MAX_CHARS: 150,
  STORY_MAX_CHARS: 2000,
  HERO_TITLE_MAX_CHARS: 100,
  QUOTE_MAX_CHARS: 300,
} as const;

// Block metadata for UI
export const BLOCK_META: Record<
  BlockType,
  { label: string; description: string; icon: string }
> = {
  hero: {
    label: "Hero",
    description: "Video/Image với title overlay",
    icon: "film",
  },
  story: {
    label: "Story",
    description: "Nội dung giáo dục, storytelling",
    icon: "book-open",
  },
  interactive: {
    label: "Interactive",
    description: "Audio, Zoom, So sánh",
    icon: "sparkles",
  },
  artifact: {
    label: "Artifact",
    description: "Sản phẩm B2B với packaging",
    icon: "package",
  },
  footer: {
    label: "Footer",
    description: "CTA chuyển đổi",
    icon: "mouse-pointer-click",
  },
  // Legacy
  text: { label: "Văn bản", description: "Tối đa 300 ký tự", icon: "type" },
  media: { label: "Media", description: "Ảnh, Audio, Video", icon: "image" },
  curator_note: {
    label: "Góc Giám Tuyển",
    description: "Quan điểm cá nhân",
    icon: "message-square-quote",
  },
  comparison_table: {
    label: "Bảng So Sánh",
    description: "Tối đa 3 cột",
    icon: "table",
  },
};

// ============================================
// HELPERS
// ============================================

export function isBlockBasedPost(post: any): boolean {
  return Array.isArray(post?.blocks) && post.blocks.length > 0;
}

export function isNewBlockType(type: BlockType): boolean {
  return ["hero", "story", "interactive", "artifact", "footer"].includes(type);
}

export function createEmptyBlock(type: BlockType, order: number): ArtisanBlock {
  const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  switch (type) {
    case "hero":
      return {
        id,
        type: "hero",
        order,
        data: { mediaType: "image", mediaUrl: "", title: "" },
      };
    case "story":
      return {
        id,
        type: "story",
        order,
        data: { content: "", enableDropCap: true },
      };
    case "interactive":
      return {
        id,
        type: "interactive",
        order,
        data: { interactiveType: "audio" },
      };
    case "artifact":
      return {
        id,
        type: "artifact",
        order,
        data: { imageUrl: "", name: "" },
      };
    case "footer":
      return {
        id,
        type: "footer",
        order,
        data: {},
      };
    // Legacy
    case "text":
      return { id, type: "text", order, content: { text: "" } };
    case "media":
      return { id, type: "media", order, content: { mediaType: "image" } };
    case "curator_note":
      return { id, type: "curator_note", order, content: { note: "" } };
    case "comparison_table":
      return {
        id,
        type: "comparison_table",
        order,
        content: {
          headers: ["Tiêu chí", "Sản phẩm A", "Sản phẩm B"],
          rows: [["", "", ""]],
        },
      };
    default:
      return { id, type: "text", order, content: { text: "" } };
  }
}
