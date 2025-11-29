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
    // 1. Bảo vệ: Nếu content null/undefined -> Render chuỗi rỗng để tránh crash
    const safeContent = content || "";

    // 2. Style Classes
    const userTextClasses = cn(
      "text-white/95",
      "[&_p]:text-white/95",
      "[&_code]:text-white [&_code]:bg-white/20 [&_code]:border-white/20"
    );

    const botTextClasses = cn(
      "text-slate-800 dark:text-slate-100",
      "[&_p]:text-slate-800 dark:[&_p]:text-slate-100",
      // Blockquote style
      "[&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:bg-gray-50 [&_blockquote]:rounded-r-lg [&_blockquote]:my-3",
      // List style
      "[&_li]:my-0.5"
    );

    // 3. Memoize plugins để tránh re-init liên tục khi streaming
    const plugins = useMemo(() => [remarkGfm], []);

    return (
      <div
        className={cn(
          "markdown-body text-[15px] leading-relaxed break-words",
          isUserMessage ? userTextClasses : botTextClasses,
          !isUserMessage &&
            "prose prose-sm max-w-none break-words dark:prose-invert",
          // 🔥 FIX: Con trỏ nhấp nháy chỉ hiện khi đang stream
          !isUserMessage &&
            isStreaming &&
            "after:content-['▋'] after:ml-1 after:animate-pulse after:text-blue-500 after:inline-block",
          className
        )}
      >
        <ReactMarkdown
          remarkPlugins={plugins}
          components={{
            p: ({ children }) => (
              <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="pl-1 marker:opacity-70">{children}</li>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline decoration-1 underline-offset-2 transition-colors"
              >
                {children}
              </a>
            ),
            code: ({ children, className: codeClassName }) => {
              const isInline = !codeClassName?.includes("language-");
              return isInline ? (
                <code
                  className={cn(
                    "rounded px-1.5 py-0.5 font-mono text-[13px] border",
                    !isUserMessage &&
                      "bg-slate-100 text-red-500 border-slate-200 dark:bg-slate-800 dark:text-red-400 dark:border-slate-700"
                  )}
                >
                  {children}
                </code>
              ) : (
                <code className={codeClassName}>{children}</code>
              );
            },
            // Xử lý table để không bị vỡ layout
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-gray-50 px-3 py-2 font-semibold text-gray-700 border-b">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 border-b last:border-0">{children}</td>
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
