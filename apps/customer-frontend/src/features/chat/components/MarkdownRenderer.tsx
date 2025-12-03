// apps/customer-frontend/src/features/chat/components/MarkdownRenderer.tsx
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/shared/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUserMessage?: boolean;
  isStreaming?: boolean;
}

export const MarkdownRenderer = memo(
  ({
    content,
    className,
    isUserMessage = false,
    isStreaming = false,
  }: MarkdownRendererProps) => {
    const safeContent = content || "";

    // ✅ FIX: Style chung cho cả 2 để đồng bộ 100%
    // - Font: Sans (Manrope)
    // - Size: 16px (text-base)
    // - Leading: 1.7 (relaxed) cho thoáng mắt
    const baseProseClasses =
      "text-base leading-[1.7] font-sans tracking-normal";

    const userTextClasses = cn(
      baseProseClasses,
      "text-black dark:text-white font-medium", // User chữ đen, đậm hơn chút
      "[&_p]:mb-0"
    );

    const botTextClasses = cn(
      baseProseClasses,
      "text-stone-900 dark:text-stone-100 font-normal", // Bot chữ xám đen rất đậm

      // --- HEADINGS (Vẫn giữ Serif để sang trọng, nhưng to rõ) ---
      "[&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-black dark:[&_h1]:text-white",
      "[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-black dark:[&_h2]:text-white",
      "[&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-black",

      // --- PARAGRAPHS & LISTS ---
      "[&_p]:mb-3 last:[&_p]:mb-0",
      "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1",
      "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1",
      "[&_li]:pl-1",

      // --- BOLD & EMPHASIS ---
      "[&_strong]:font-bold [&_strong]:text-black dark:[&_strong]:text-white",
      "[&_b]:font-bold [&_b]:text-black dark:[&_b]:text-white",

      // --- BLOCKQUOTE (Trích dẫn) ---
      "[&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-stone-300 [&_blockquote]:bg-stone-50 [&_blockquote]:py-2 [&_blockquote]:pr-2 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:text-stone-700 [&_blockquote]:rounded-r",

      // --- CODE ---
      "[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:bg-stone-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-red-600 [&_code]:border [&_code]:border-stone-200"
    );

    const plugins = useMemo(() => [remarkGfm], []);

    return (
      <div
        className={cn(
          "markdown-body break-words w-full",
          isUserMessage ? userTextClasses : botTextClasses,
          // Cursor nhấp nháy khi đang stream
          !isUserMessage &&
            isStreaming &&
            "after:content-['▋'] after:ml-1 after:animate-pulse after:text-stone-900",
          className
        )}
      >
        <ReactMarkdown
          remarkPlugins={plugins}
          components={{
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-700 hover:underline decoration-2 underline-offset-2 transition-colors"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4 rounded border border-stone-200 shadow-sm">
                <table className="w-full text-sm text-left border-collapse bg-white">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-stone-100 px-4 py-3 font-bold text-stone-900 border-b border-stone-200 text-left whitespace-nowrap">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 border-b border-stone-100 last:border-0 align-top">
                {children}
              </td>
            ),
          }}
        >
          {safeContent}
        </ReactMarkdown>
      </div>
    );
  }
);

MarkdownRenderer.displayName = "MarkdownRenderer";
