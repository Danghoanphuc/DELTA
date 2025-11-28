// src/features/chat/components/MarkdownRenderer.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/shared/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUserMessage?: boolean;
}

export function MarkdownRenderer({ content, className, isUserMessage = false }: MarkdownRendererProps) {
  // ✅ FIX COLOR CONTRAST: Ép toàn bộ thẻ con về màu trắng
  const userTextClasses = cn(
      "text-white/95", 
      "[&_p]:text-white/95", 
      "[&_span]:text-white/95",
      "[&_li]:text-white/95", 
      "[&_strong]:text-white", 
      "[&_h1]:text-white [&_h2]:text-white [&_h3]:text-white",
      "[&_a]:text-white [&_a]:underline [&_a]:decoration-white/50",
      "[&_code]:text-white [&_code]:bg-white/20 [&_code]:border-white/20"
  );

  const botTextClasses = cn(
      "text-slate-800 dark:text-slate-100",
      "[&_p]:text-slate-800 dark:[&_p]:text-slate-100",
      "[&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white",
      "[&_a]:text-blue-600 [&_a]:decoration-blue-200"
  );

  // ✅ Glassmorphic styles cho table, code block, blockquote
  const proseClasses = cn(
    "prose prose-sm max-w-none break-words dark:prose-invert",
    // 1. Tinh chỉnh Table: Bo góc, viền mờ, row chẵn lẻ
    "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_table]:border-gray-200 dark:[&_table]:border-gray-700",
    "[&_th]:bg-gray-50 dark:[&_th]:bg-gray-800 [&_th]:p-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-gray-600 dark:[&_th]:text-gray-300 [&_th]:uppercase [&_th]:tracking-wider",
    "[&_td]:p-3 [&_td]:text-sm [&_td]:border-t [&_td]:border-gray-100 dark:[&_td]:border-gray-700",
    "[&_tr:last-child_td]:border-b-0",
    "[&_tr:nth-child(even)_td]:bg-gray-50/50 dark:[&_tr:nth-child(even)_td]:bg-gray-800/30",
    
    // 2. Tinh chỉnh Code Block: Giống kiểu Notion/GitHub
    "[&_pre]:bg-gray-900 dark:[&_pre]:bg-gray-950 [&_pre]:text-gray-50 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:shadow-md [&_pre]:my-4 [&_pre]:overflow-x-auto",
    "[&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0 [&_pre_code]:border-0 [&_pre_code]:font-mono [&_pre_code]:text-sm",
    
    // 3. Blockquote (Trích dẫn): Đường viền màu xanh, nền nhạt
    "[&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 dark:[&_blockquote]:border-blue-400 [&_blockquote]:bg-blue-50/50 dark:[&_blockquote]:bg-blue-900/20 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:pr-2 [&_blockquote]:italic [&_blockquote]:rounded-r-lg [&_blockquote]:my-3"
  );

  return (
    <ReactMarkdown
      className={cn(
        "text-[15px] leading-relaxed break-words",
        isUserMessage ? userTextClasses : botTextClasses,
        !isUserMessage && proseClasses, // Chỉ áp dụng prose classes cho bot messages
        className
      )}
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="pl-1 marker:opacity-70">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:opacity-80 transition-opacity underline decoration-2 underline-offset-2"
          >
            {children}
          </a>
        ),
        code: ({ children, className: codeClassName }) => {
          // Inline code vs code block
          const isInline = !codeClassName?.includes('language-');
          return (
            <code className={cn(
                isInline && "rounded px-1.5 py-0.5 font-mono text-[13px] border",
                !isUserMessage && isInline && "bg-slate-100 text-red-500 border-slate-200 dark:bg-slate-800 dark:text-red-400 dark:border-slate-700"
            )}>
                {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}