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
  // ✅ FIX COLOR FORCE: Ép màu bằng class cụ thể cho từng thẻ con để override globals.css
  const userTextClasses = "[&_p]:text-white [&_li]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-white";
  const botTextClasses = "text-gray-800 dark:text-gray-100 [&_p]:text-gray-800 dark:[&_p]:text-gray-100";

  return (
    <ReactMarkdown
      className={cn(
        "text-[15px] leading-relaxed break-words",
        isUserMessage ? userTextClasses : botTextClasses,
        className
      )}
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        // Link người dùng: Màu trắng, gạch chân trắng mờ
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "font-medium hover:opacity-80 transition-opacity",
              isUserMessage 
                ? "text-white underline decoration-white/50" 
                : "text-blue-600 underline decoration-blue-200"
            )}
          >
            {children}
          </a>
        ),
        // Code block: User nền trắng mờ, Bot nền xám
        code: ({ children }) => (
          <code className={cn(
            "rounded px-1.5 py-0.5 font-mono text-sm",
            isUserMessage ? "bg-white/20 text-white border border-white/20" : "bg-gray-100 text-red-500 dark:bg-gray-800"
          )}>
            {children}
          </code>
        ),
        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="pl-1">{children}</li>,
        strong: ({ children }) => <span className="font-bold">{children}</span>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}