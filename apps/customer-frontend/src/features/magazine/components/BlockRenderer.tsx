// apps/customer-frontend/src/features/magazine/components/BlockRenderer.tsx
// Renders artisan blocks for customer-facing magazine posts

import {
  Volume2,
  Download,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import type {
  ArtisanBlock as ServiceArtisanBlock,
  BlockType,
  InteractiveType,
} from "@/services/magazine.service";

// Re-export types for external use
export type { BlockType, InteractiveType };

type MediaType = "image" | "audio" | "video_loop";

interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
  settings?: {
    backgroundColor?: string;
    spacing?: "compact" | "normal" | "spacious";
    alignment?: "left" | "center" | "right";
  };
}

// ============ NEW B2B BLOCKS ============

interface HeroBlock extends BaseBlock {
  type: "hero";
  data: {
    mediaType: "video" | "image";
    mediaUrl: string;
    posterUrl?: string;
    title: string;
    subtitle?: string;
    overlayOpacity?: number;
  };
}

interface StoryBlock extends BaseBlock {
  type: "story";
  data: {
    content: string;
    enableDropCap?: boolean;
    highlightQuote?: string;
  };
}

interface InteractiveBlock extends BaseBlock {
  type: "interactive";
  data: {
    interactiveType: InteractiveType;
    audioUrl?: string;
    audioLabel?: string;
    zoomImageUrl?: string;
    zoomCaption?: string;
    beforeImageUrl?: string;
    afterImageUrl?: string;
    comparisonLabel?: string;
  };
}

interface ArtifactBlock extends BaseBlock {
  type: "artifact";
  data: {
    productId?: string;
    imageUrl: string;
    name: string;
    material?: string;
    dimensions?: string;
    detailUrl?: string;
  };
}

interface FooterBlock extends BaseBlock {
  type: "footer";
  data: {
    curatorQuote?: string;
    curatorName?: string;
    primaryCta?: {
      label: string;
      url: string;
      icon?: "download" | "external";
    };
    secondaryCta?: {
      label: string;
      url: string;
      icon?: "chat" | "phone" | "email";
    };
  };
}

// ============ LEGACY BLOCKS ============

interface TextBlock extends BaseBlock {
  type: "text";
  content: {
    text: string;
    botSummary?: string;
  };
}

interface MediaBlock extends BaseBlock {
  type: "media";
  content: {
    mediaType: MediaType;
    url?: string;
    caption?: string;
    alt?: string;
  };
}

interface CuratorNoteBlock extends BaseBlock {
  type: "curator_note";
  content: {
    note: string;
    authorName?: string;
  };
}

interface ComparisonTableBlock extends BaseBlock {
  type: "comparison_table";
  content: {
    headers: string[];
    rows: string[][];
    caption?: string;
  };
}

type ArtisanBlock =
  | HeroBlock
  | StoryBlock
  | InteractiveBlock
  | ArtifactBlock
  | FooterBlock
  | TextBlock
  | MediaBlock
  | CuratorNoteBlock
  | ComparisonTableBlock;

interface BlockRendererProps {
  blocks: ServiceArtisanBlock[] | ArtisanBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      {sortedBlocks.map((block) => (
        <div key={block.id} className="animate-in fade-in duration-500">
          {renderBlock(block as ArtisanBlock)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: ArtisanBlock) {
  switch (block.type) {
    // New B2B blocks
    case "hero":
      return <HeroBlockView block={block} />;
    case "story":
      return <StoryBlockView block={block} />;
    case "interactive":
      return <InteractiveBlockView block={block} />;
    case "artifact":
      return <ArtifactBlockView block={block} />;
    case "footer":
      return <FooterBlockView block={block} />;
    // Legacy blocks
    case "text":
      return <TextBlockView block={block} />;
    case "media":
      return <MediaBlockView block={block} />;
    case "curator_note":
      return <CuratorNoteView block={block} />;
    case "comparison_table":
      return <ComparisonTableView block={block} />;
    default:
      return null;
  }
}

// ============ NEW B2B BLOCK COMPONENTS ============

// Hero Block - Visual Hook with video/image and title overlay
function HeroBlockView({ block }: { block: HeroBlock }) {
  const {
    mediaType,
    mediaUrl,
    posterUrl,
    title,
    subtitle,
    overlayOpacity = 50,
  } = block.data;

  return (
    <div className="relative -mx-4 md:-mx-8 lg:-mx-16">
      {mediaUrl ? (
        mediaType === "video" ? (
          <video
            src={mediaUrl}
            poster={posterUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full aspect-[16/9] md:aspect-[21/9] object-cover"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={title}
            className="w-full aspect-[16/9] md:aspect-[21/9] object-cover"
          />
        )
      ) : (
        <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-stone-800 to-stone-900" />
      )}
      <div
        className="absolute inset-0 flex flex-col justify-end p-6 md:p-12"
        style={{
          background: `linear-gradient(transparent 30%, rgba(0,0,0,${
            overlayOpacity / 100
          }))`,
        }}
      >
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 max-w-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base md:text-lg text-white/80 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// Story Block - Educational content with drop-cap support
function StoryBlockView({ block }: { block: StoryBlock }) {
  const { content, enableDropCap, highlightQuote } = block.data;
  const isHtml = content?.includes("<");

  return (
    <div className="space-y-6">
      {isHtml ? (
        <div
          className={`story-block-content text-stone-700 leading-relaxed text-lg ${
            enableDropCap ? "drop-cap-enabled" : ""
          }`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p
          className={`text-stone-700 leading-relaxed text-lg whitespace-pre-wrap ${
            enableDropCap
              ? "first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:text-orange-600"
              : ""
          }`}
        >
          {content}
        </p>
      )}

      {highlightQuote && (
        <blockquote className="relative my-8 py-6 px-8 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 rounded-r-xl">
          <span className="absolute -top-4 left-4 text-6xl text-orange-200 font-serif">
            "
          </span>
          <p className="text-xl md:text-2xl italic text-stone-700 relative z-10">
            {highlightQuote}
          </p>
        </blockquote>
      )}

      <style>{`
        .story-block-content p { margin: 0.75rem 0; }
        .story-block-content.drop-cap-enabled p:first-of-type::first-letter { 
          float: left; font-size: 4rem; line-height: 1; font-weight: 700; 
          margin-right: 0.75rem; margin-top: 0.25rem; color: #ea580c; 
        }
        .story-block-content h2 { font-size: 1.75rem; font-weight: 600; margin: 1.5rem 0 0.75rem; color: #1c1917; }
        .story-block-content h3 { font-size: 1.375rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: #1c1917; }
        .story-block-content blockquote { border-left: 4px solid #d6d3d1; padding-left: 1.25rem; font-style: italic; color: #78716c; margin: 1rem 0; }
        .story-block-content ul { list-style-type: disc; padding-left: 1.75rem; margin: 0.75rem 0; }
        .story-block-content ol { list-style-type: decimal; padding-left: 1.75rem; margin: 0.75rem 0; }
        .story-block-content li { margin: 0.375rem 0; }
        .story-block-content a { color: #ea580c; text-decoration: underline; }
        .story-block-content a:hover { color: #c2410c; }
        .story-block-content strong { font-weight: 600; color: #1c1917; }
        .story-block-content em { font-style: italic; }
      `}</style>
    </div>
  );
}

// Interactive Block - Audio, Zoom, Comparison Slider
function InteractiveBlockView({ block }: { block: InteractiveBlock }) {
  const {
    interactiveType,
    audioUrl,
    audioLabel,
    zoomImageUrl,
    zoomCaption,
    beforeImageUrl,
    afterImageUrl,
    comparisonLabel,
  } = block.data;

  if (interactiveType === "audio") {
    return (
      <div className="max-w-xl mx-auto p-6 md:p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center shadow-inner">
            <Volume2 className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-stone-800">
              {audioLabel || "Âm thanh chất liệu"}
            </p>
            <p className="text-sm text-stone-500">
              Nghe để cảm nhận chất lượng
            </p>
          </div>
        </div>
        {audioUrl && (
          <audio
            src={audioUrl}
            controls
            className="w-full h-12"
            preload="metadata"
          />
        )}
      </div>
    );
  }

  if (interactiveType === "zoom") {
    return (
      <figure className="space-y-3">
        <div className="relative overflow-hidden rounded-xl shadow-lg cursor-zoom-in group">
          {zoomImageUrl ? (
            <img
              src={zoomImageUrl}
              alt={zoomCaption || "Chi tiết sản phẩm"}
              className="w-full h-auto transition-transform duration-500 group-hover:scale-150"
            />
          ) : (
            <div className="w-full aspect-square bg-stone-100 flex items-center justify-center">
              <span className="text-stone-400">Zoom Image</span>
            </div>
          )}
          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 text-white text-sm rounded-full flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            Hover để zoom
          </div>
        </div>
        {zoomCaption && (
          <figcaption className="text-sm text-stone-500 text-center italic">
            {zoomCaption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (interactiveType === "comparison_slider") {
    return (
      <figure className="space-y-3">
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          <div className="flex">
            <div className="w-1/2 relative">
              {beforeImageUrl ? (
                <img
                  src={beforeImageUrl}
                  alt="Before"
                  className="w-full h-auto"
                />
              ) : (
                <div className="w-full aspect-square bg-stone-200 flex items-center justify-center">
                  <span className="text-stone-400">Before</span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                Trước
              </span>
            </div>
            <div className="w-1/2 relative">
              {afterImageUrl ? (
                <img
                  src={afterImageUrl}
                  alt="After"
                  className="w-full h-auto"
                />
              ) : (
                <div className="w-full aspect-square bg-stone-300 flex items-center justify-center">
                  <span className="text-stone-400">After</span>
                </div>
              )}
              <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                Sau
              </span>
            </div>
          </div>
        </div>
        {comparisonLabel && (
          <figcaption className="text-sm text-stone-500 text-center">
            {comparisonLabel}
          </figcaption>
        )}
      </figure>
    );
  }

  return null;
}

// Artifact Block - B2B Product Display
function ArtifactBlockView({ block }: { block: ArtifactBlock }) {
  const { imageUrl, name, material, dimensions, detailUrl } = block.data;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full aspect-square object-cover"
          />
        ) : (
          <div className="w-full aspect-square bg-stone-100 flex items-center justify-center">
            <span className="text-stone-400">Product Image</span>
          </div>
        )}
        <div className="absolute top-3 left-3 px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded">
          B2B
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">{name}</h3>
        <div className="space-y-1 text-sm text-stone-600">
          {material && (
            <p>
              <span className="text-stone-400">Chất liệu:</span> {material}
            </p>
          )}
          {dimensions && (
            <p>
              <span className="text-stone-400">Kích thước:</span> {dimensions}
            </p>
          )}
        </div>
        {detailUrl && (
          <a
            href={detailUrl}
            className="inline-flex items-center gap-1 mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            Xem chi tiết Artifact
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}

// Footer Block - CTA Conversion
function FooterBlockView({ block }: { block: FooterBlock }) {
  const { curatorQuote, curatorName, primaryCta, secondaryCta } = block.data;

  const getSecondaryIcon = (icon?: string) => {
    switch (icon) {
      case "chat":
        return <MessageCircle className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-8 md:p-12 rounded-2xl -mx-4 md:-mx-8 mt-8">
      {curatorQuote && (
        <div className="mb-6">
          <p className="text-lg md:text-xl italic text-stone-300 leading-relaxed">
            "{curatorQuote}"
          </p>
          {curatorName && (
            <p className="mt-3 text-sm text-stone-400">— {curatorName}</p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {primaryCta && (
          <a
            href={primaryCta.url}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-orange-600 hover:bg-orange-700 rounded-xl text-base font-semibold transition-colors"
          >
            {primaryCta.icon === "download" && <Download className="w-5 h-5" />}
            {primaryCta.icon === "external" && (
              <ExternalLink className="w-5 h-5" />
            )}
            {primaryCta.label}
          </a>
        )}
        {secondaryCta && (
          <a
            href={secondaryCta.url}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-stone-700 hover:bg-stone-600 rounded-xl text-base font-semibold transition-colors"
          >
            {getSecondaryIcon(secondaryCta.icon)}
            {secondaryCta.label}
          </a>
        )}
      </div>
    </div>
  );
}

// ============ LEGACY BLOCK COMPONENTS ============

// Text Block Component - renders HTML from TipTap editor
function TextBlockView({ block }: { block: TextBlock }) {
  // Check if content is HTML (contains tags) or plain text
  const isHtml = block.content.text?.includes("<");

  return (
    <div className="space-y-2">
      {isHtml ? (
        <div
          className="text-block-content text-stone-700 leading-relaxed text-lg"
          dangerouslySetInnerHTML={{ __html: block.content.text }}
        />
      ) : (
        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap text-lg">
          {block.content.text}
        </p>
      )}
      {/* Bot summary is hidden from users, only for SEO/AI */}
      {block.content.botSummary && (
        <meta name="description" content={block.content.botSummary} />
      )}
      {/* Styles for HTML content */}
      <style>{`
        .text-block-content p { margin: 0.5rem 0; }
        .text-block-content h2 { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.5rem; color: #1c1917; }
        .text-block-content h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; color: #1c1917; }
        .text-block-content blockquote { border-left: 4px solid #d6d3d1; padding-left: 1rem; font-style: italic; color: #78716c; margin: 1rem 0; }
        .text-block-content ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .text-block-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .text-block-content li { margin: 0.25rem 0; }
        .text-block-content a { color: #ea580c; text-decoration: underline; }
        .text-block-content a:hover { color: #c2410c; }
        .text-block-content strong { font-weight: 600; color: #1c1917; }
        .text-block-content em { font-style: italic; }
        .text-block-content u { text-decoration: underline; }
      `}</style>
    </div>
  );
}

// Media Block Component
function MediaBlockView({ block }: { block: MediaBlock }) {
  const { mediaType, url, caption, alt } = block.content;

  if (!url) return null;

  return (
    <figure className="space-y-3">
      {mediaType === "image" && (
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          <img
            src={url}
            alt={alt || caption || "Ảnh chi tiết sản phẩm"}
            className="w-full max-w-2xl mx-auto h-auto object-contain"
            loading="lazy"
          />
          {/* Zoom indicator */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            Macro
          </div>
        </div>
      )}

      {mediaType === "audio" && (
        <div className="max-w-xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center shadow-inner">
              <Volume2 className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800">
                Âm thanh chất liệu
              </p>
              <p className="text-xs text-stone-500">
                Nghe tiếng gõ, cảm nhận chất lượng
              </p>
            </div>
          </div>
          <audio
            src={url}
            controls
            className="w-full h-12"
            preload="metadata"
          />
        </div>
      )}

      {mediaType === "video_loop" && (
        <div className="relative max-w-xl mx-auto overflow-hidden rounded-xl shadow-lg bg-black">
          <video
            src={url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto"
          />
          {/* Loop indicator */}
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
            <svg
              className="w-3 h-3 animate-spin"
              style={{ animationDuration: "3s" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            360°
          </div>
        </div>
      )}

      {caption && (
        <figcaption className="text-sm text-stone-500 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Curator Note Component (Yellow Box)
function CuratorNoteView({ block }: { block: CuratorNoteBlock }) {
  return (
    <aside className="relative my-8">
      {/* Decorative quote mark */}
      <div className="absolute -top-4 -left-2 text-6xl text-amber-200 font-serif leading-none select-none">
        "
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-6 rounded-r-xl shadow-sm">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Góc Giám Tuyển
          </span>
        </div>

        <p className="text-stone-700 italic leading-relaxed text-lg font-serif">
          {block.content.note}
        </p>

        {block.content.authorName && (
          <p className="mt-4 text-sm text-amber-800 font-medium">
            — {block.content.authorName}
          </p>
        )}
      </div>
    </aside>
  );
}

// Comparison Table Component (Mobile-first)
function ComparisonTableView({ block }: { block: ComparisonTableBlock }) {
  const { headers, rows, caption } = block.content;

  return (
    <figure className="my-8 space-y-3">
      {/* Mobile: Card layout */}
      <div className="block md:hidden space-y-4">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm"
          >
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className="flex justify-between py-2 border-b border-stone-100 last:border-0"
              >
                <span className="text-sm font-medium text-stone-500">
                  {headers[cellIndex] || `Cột ${cellIndex + 1}`}
                </span>
                <span className="text-sm text-stone-800 text-right">
                  {cell || "—"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop: Traditional table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 bg-stone-100 border border-stone-200 text-left text-sm font-semibold text-stone-700"
                >
                  {header || `Cột ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-stone-50 transition-colors"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 border border-stone-200 text-sm text-stone-600"
                  >
                    {cell || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {caption && (
        <figcaption className="text-sm text-stone-500 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Helper to check if post uses blocks
export function isBlockBasedPost(post: any): boolean {
  return Array.isArray(post?.blocks) && post.blocks.length > 0;
}
