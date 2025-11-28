// apps/customer-frontend/src/features/chat/utils/textParser.ts

export interface ParsedLink {
  type: string;
  url: string;
  originalMatch: string;
}

export interface ParsedContent {
  thought: string | null;
  content: string;
  links: ParsedLink[]; // ✅ Thêm field này
}

export const parseThinkingContent = (rawText: string): ParsedContent => {
  if (!rawText || typeof rawText !== "string") {
    return { thought: null, content: "", links: [] };
  }

  let content = rawText;
  let thoughts: string[] = [];
  let links: ParsedLink[] = [];

  // 1. Handle Thinking Tags (Giữ nguyên logic cũ)
  const completeTagRegex = /<think>([\s\S]*?)<\/think>/gi;
  let match;
  while ((match = completeTagRegex.exec(rawText)) !== null) {
    if (match[1]) thoughts.push(match[1].trim());
    content = content.replace(match[0], "");
  }

  const openTagRegex = /<think>([\s\S]*?)$/i;
  const openMatch = content.match(openTagRegex);
  if (openMatch) {
    if (openMatch[1]) thoughts.push(openMatch[1].trim());
    content = content.replace(openMatch[0], ""); 
  }
  content = content.replace(/<\/?t(?:h(?:i(?:n(?:k)?)?)?)?>?$/i, "");

  // 2. ✅ NEW: Handle Link Attachments
  // Format từ useSmartChatInput: [LINK_ATTACHMENT: TYPE] URL
  const linkRegex = /\[LINK_ATTACHMENT:\s*([A-Z0-9_]+)\]\s*(https?:\/\/[^\s]+)/gi;
  
  let linkMatch;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
      links.push({
          type: linkMatch[1].toLowerCase(),
          url: linkMatch[2],
          originalMatch: linkMatch[0]
      });
      // Xóa phần code link khỏi nội dung hiển thị text
      content = content.replace(linkMatch[0], "");
  }

  // 3. Cleanup
  const finalThought = thoughts.join("\n").trim();
  const finalContent = content.trim();

  return {
    thought: finalThought.length > 0 ? finalThought : null,
    content: finalContent,
    links: links // Trả về mảng links
  };
};