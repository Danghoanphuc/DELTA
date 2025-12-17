// apps/admin-frontend/src/components/suppliers/artisan-blocks/BlockPreview.tsx
// Realtime preview of blocks - mimics customer frontend styling

import { ArtisanBlock } from "@/types/artisan-block.types";
import { User, Clock, Volume2 } from "lucide-react";

interface BlockPreviewProps {
  title: string;
  blocks: ArtisanBlock[];
  authorName?: string;
  authorTitle?: string;
  category?: string;
}

export function BlockPreview({
  title,
  blocks,
  authorName,
  authorTitle,
  category,
}: BlockPreviewProps) {
  const readTime = Math.max(
    1,
    Math.ceil(
      blocks.reduce((acc, block) => {
        if (block.type === "text")
          return acc + (block.content.text?.length || 0);
        if (block.type === "curator_note")
          return acc + (block.content.note?.length || 0);
        return acc + 50; // media/table adds ~50 chars worth of read time
      }, 0) / 200 // ~200 chars per minute
    )
  );

  return (
    <div className="h-full overflow-y-auto bg-[#F9F8F6]">
      {/* Article Header */}
      <div className="px-6 py-8 border-b border-stone-200">
        {category && (
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider rounded mb-4">
            {category}
          </span>
        )}

        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 leading-tight mb-4">
          {title || "Tiêu đề bài viết..."}
        </h1>

        <div className="flex items-center gap-4 text-sm text-stone-500">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{authorName || "Tác giả"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readTime} phút đọc</span>
          </div>
        </div>
      </div>

      {/* Blocks Content */}
      <div className="px-6 py-8 space-y-8">
        {blocks.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm">Thêm block để xem preview...</p>
          </div>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="animate-in fade-in duration-300">
              {renderBlockPreview(block)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function renderBlockPreview(block: ArtisanBlock) {
  switch (block.type) {
    // ============ NEW B2B BLOCKS ============
    case "hero":
      return (
        <div className="relative -mx-6 -mt-8">
          {block.data.mediaUrl ? (
            block.data.mediaType === "video" ? (
              <video
                src={block.data.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-[16/9] object-cover"
              />
            ) : (
              <img
                src={block.data.mediaUrl}
                alt={block.data.title}
                className="w-full aspect-[16/9] object-cover"
              />
            )
          ) : (
            <div className="w-full aspect-[16/9] bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
              <span className="text-stone-500 text-sm">Hero Media</span>
            </div>
          )}
          <div
            className="absolute inset-0 flex flex-col justify-end p-6"
            style={{
              background: `linear-gradient(transparent, rgba(0,0,0,${
                (block.data.overlayOpacity || 50) / 100
              }))`,
            }}
          >
            <h2 className="text-xl font-bold text-white mb-1">
              {block.data.title || "Tiêu đề Hero..."}
            </h2>
            {block.data.subtitle && (
              <p className="text-sm text-white/80">{block.data.subtitle}</p>
            )}
          </div>
        </div>
      );

    case "story":
      return (
        <div className="space-y-2">
          {block.data.content ? (
            <div
              className={`story-block-preview text-stone-700 leading-relaxed ${
                block.data.enableDropCap ? "drop-cap" : ""
              }`}
              dangerouslySetInnerHTML={{ __html: block.data.content }}
            />
          ) : (
            <p className="text-stone-300 italic">Nội dung story...</p>
          )}
          {block.data.highlightQuote && (
            <blockquote className="border-l-4 border-orange-400 pl-4 py-2 my-4 text-lg italic text-stone-600">
              "{block.data.highlightQuote}"
            </blockquote>
          )}
          <style>{`
            .story-block-preview p { margin: 0.5rem 0; }
            .story-block-preview.drop-cap p:first-of-type::first-letter { float: left; font-size: 3rem; line-height: 1; font-weight: 700; margin-right: 0.5rem; color: #ea580c; }
            .story-block-preview h2 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.25rem; }
            .story-block-preview h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
            .story-block-preview blockquote { border-left: 3px solid #d6d3d1; padding-left: 0.75rem; font-style: italic; color: #78716c; margin: 0.5rem 0; }
            .story-block-preview ul { list-style-type: disc; padding-left: 1.25rem; margin: 0.25rem 0; }
            .story-block-preview ol { list-style-type: decimal; padding-left: 1.25rem; margin: 0.25rem 0; }
            .story-block-preview a { color: #ea580c; text-decoration: underline; }
            .story-block-preview strong { font-weight: 600; }
            .story-block-preview em { font-style: italic; }
          `}</style>
        </div>
      );

    case "interactive":
      return (
        <div className="space-y-3">
          {block.data.interactiveType === "audio" && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">
                  {block.data.audioLabel || "Nghe âm thanh"}
                </span>
              </div>
              {block.data.audioUrl && (
                <audio
                  src={block.data.audioUrl}
                  controls
                  className="w-full h-10"
                />
              )}
            </div>
          )}
          {block.data.interactiveType === "zoom" && (
            <div className="relative">
              {block.data.zoomImageUrl ? (
                <img
                  src={block.data.zoomImageUrl}
                  alt="Zoom"
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-stone-100 rounded-lg flex items-center justify-center">
                  <span className="text-stone-400 text-sm">Zoom Image</span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                🔍 Zoom
              </div>
              {block.data.zoomCaption && (
                <p className="text-xs text-stone-500 text-center mt-2 italic">
                  {block.data.zoomCaption}
                </p>
              )}
            </div>
          )}
          {block.data.interactiveType === "comparison_slider" && (
            <div className="relative">
              <div className="flex gap-1">
                {block.data.beforeImageUrl ? (
                  <img
                    src={block.data.beforeImageUrl}
                    alt="Before"
                    className="w-1/2 rounded-l-lg"
                  />
                ) : (
                  <div className="w-1/2 aspect-square bg-stone-200 rounded-l-lg flex items-center justify-center">
                    <span className="text-stone-400 text-xs">Before</span>
                  </div>
                )}
                {block.data.afterImageUrl ? (
                  <img
                    src={block.data.afterImageUrl}
                    alt="After"
                    className="w-1/2 rounded-r-lg"
                  />
                ) : (
                  <div className="w-1/2 aspect-square bg-stone-300 rounded-r-lg flex items-center justify-center">
                    <span className="text-stone-400 text-xs">After</span>
                  </div>
                )}
              </div>
              {block.data.comparisonLabel && (
                <p className="text-xs text-stone-500 text-center mt-2">
                  {block.data.comparisonLabel}
                </p>
              )}
            </div>
          )}
        </div>
      );

    case "artifact":
      return (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          {block.data.imageUrl ? (
            <img
              src={block.data.imageUrl}
              alt={block.data.name}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-stone-100 flex items-center justify-center">
              <span className="text-stone-400 text-sm">Product Image</span>
            </div>
          )}
          <div className="p-4">
            <h3 className="font-semibold text-stone-900 mb-1">
              {block.data.name || "Tên sản phẩm..."}
            </h3>
            {block.data.material && (
              <p className="text-xs text-stone-500">
                Chất liệu: {block.data.material}
              </p>
            )}
            {block.data.dimensions && (
              <p className="text-xs text-stone-500">
                Kích thước: {block.data.dimensions}
              </p>
            )}
            {block.data.detailUrl && (
              <a
                href={block.data.detailUrl}
                className="text-xs text-orange-600 mt-2 inline-block"
              >
                Xem chi tiết →
              </a>
            )}
          </div>
        </div>
      );

    case "footer":
      return (
        <div className="bg-stone-900 text-white p-6 rounded-lg -mx-6 mt-4">
          {block.data.curatorQuote && (
            <p className="text-sm italic text-stone-300 mb-3">
              "{block.data.curatorQuote}"
            </p>
          )}
          {block.data.curatorName && (
            <p className="text-xs text-stone-400 mb-4">
              — {block.data.curatorName}
            </p>
          )}
          <div className="flex flex-col gap-2">
            {block.data.primaryCta && (
              <button className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 rounded text-sm font-medium">
                {block.data.primaryCta.label || "Primary CTA"}
              </button>
            )}
            {block.data.secondaryCta && (
              <button className="w-full py-2 px-4 bg-stone-700 hover:bg-stone-600 rounded text-sm font-medium">
                {block.data.secondaryCta.label || "Secondary CTA"}
              </button>
            )}
          </div>
        </div>
      );

    // ============ LEGACY BLOCKS ============
    case "text":
      return (
        <div className="space-y-2">
          {block.content.text ? (
            <div
              className="text-block-preview text-stone-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: block.content.text }}
            />
          ) : (
            <p className="text-stone-300 italic">Nội dung văn bản...</p>
          )}
          {block.content.botSummary && (
            <div className="text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded inline-block">
              🤖 {block.content.botSummary}
            </div>
          )}
          <style>{`
            .text-block-preview p { margin: 0.25rem 0; }
            .text-block-preview h2 { font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
            .text-block-preview h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
            .text-block-preview blockquote { border-left: 3px solid #d6d3d1; padding-left: 0.75rem; font-style: italic; color: #78716c; margin: 0.5rem 0; }
            .text-block-preview ul { list-style-type: disc; padding-left: 1.25rem; margin: 0.25rem 0; }
            .text-block-preview ol { list-style-type: decimal; padding-left: 1.25rem; margin: 0.25rem 0; }
            .text-block-preview a { color: #ea580c; text-decoration: underline; }
            .text-block-preview strong { font-weight: 600; }
            .text-block-preview em { font-style: italic; }
          `}</style>
        </div>
      );

    case "media":
      return (
        <div className="space-y-2">
          {block.content.mediaType === "image" &&
            (block.content.preview || block.content.url ? (
              <img
                src={block.content.preview || block.content.url}
                alt={block.content.alt || "Image"}
                className="w-full max-w-md mx-auto rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-full max-w-md mx-auto aspect-[4/3] bg-stone-100 rounded-lg flex items-center justify-center">
                <span className="text-stone-400 text-sm">Ảnh Macro</span>
              </div>
            ))}

          {block.content.mediaType === "audio" && (
            <div className="max-w-md mx-auto p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-stone-700">
                  Audio
                </span>
              </div>
              {(block.content.preview || block.content.url) && (
                <audio
                  src={block.content.preview || block.content.url}
                  controls
                  className="w-full h-10"
                />
              )}
            </div>
          )}

          {block.content.mediaType === "video_loop" &&
            (block.content.preview || block.content.url ? (
              <video
                src={block.content.preview || block.content.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full max-w-md mx-auto rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-full max-w-md mx-auto aspect-video bg-stone-900 rounded-lg flex items-center justify-center">
                <span className="text-stone-500 text-sm">Video Loop</span>
              </div>
            ))}

          {block.content.caption && (
            <p className="text-xs text-stone-500 text-center italic">
              {block.content.caption}
            </p>
          )}
        </div>
      );

    case "curator_note":
      return (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <p className="text-stone-700 italic leading-relaxed">
            {block.content.note || (
              <span className="text-stone-400">Góc nhìn giám tuyển...</span>
            )}
          </p>
          {block.content.authorName && (
            <p className="text-xs text-amber-700 mt-3 font-medium">
              — {block.content.authorName}
            </p>
          )}
        </div>
      );

    case "comparison_table":
      return (
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {block.content.headers.map((header, i) => (
                    <th
                      key={i}
                      className="px-4 py-2 bg-stone-100 border border-stone-200 font-semibold text-stone-700 text-left"
                    >
                      {header || `Cột ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.content.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-4 py-2 border border-stone-200 text-stone-600"
                      >
                        {cell || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.content.caption && (
            <p className="text-xs text-stone-500 text-center italic">
              {block.content.caption}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}
