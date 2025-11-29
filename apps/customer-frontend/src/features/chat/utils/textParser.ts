// apps/customer-frontend/src/features/chat/utils/textParser.ts

export interface ParsedLink {
  type: string;
  url: string;
  originalMatch: string;
  title?: string;
}

export interface ParsedContent {
  thought: string | null;
  content: string;
  links: ParsedLink[];
}

export interface ParsedMessageResult {
  hasVisibleContent: boolean;
  cleanContent: string;
  thoughts: string[];
  links: ParsedLink[];
}

// 1. REGEX TẬP TRUNG: Một nơi duy nhất định nghĩa "Rác hệ thống"
export const SYSTEM_LOG_REGEX =
  /^([\p{Emoji}\u200B-\u200D\uFE0F\s]*)(Đang|Analyzing|Processing|Thinking|Searching|Saving|Reading|Generating|Zin đang|Zin đã|Chụp|Lưu|Tải)\s+/iu;

// Helper helpers
const detectLinkType = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.includes("canva.com")) return "canva";
  if (lower.includes("drive.google.com") || lower.includes("docs.google.com"))
    return "drive";
  return "general";
};

// Hàm cũ (giữ lại để tương thích ngược nếu cần, nhưng nên migrate dần)
export const parseThinkingContent = (rawText: string): ParsedContent => {
  const { cleanContent, thoughts, links } = parseMessageDisplay(rawText);
  return {
    thought: thoughts.length > 0 ? thoughts.join("\n") : null,
    content: cleanContent,
    links,
  };
};

// 2. HÀM XỬ LÝ CHÍNH (Dùng cho cả Bubble và Content)
export const parseMessageDisplay = (
  rawText: string | any
): ParsedMessageResult => {
  const text = typeof rawText === "string" ? rawText : rawText?.text || "";

  if (!text)
    return {
      hasVisibleContent: false,
      cleanContent: "",
      thoughts: [],
      links: [],
    };

  let content = text;
  let thoughts: string[] = [];
  let links: ParsedLink[] = [];

  // A. Tách thẻ <think>
  const completeTagRegex = /<think>([\s\S]*?)<\/think>/gi;
  let match;
  while ((match = completeTagRegex.exec(text)) !== null) {
    if (match[1]) thoughts.push(match[1].trim());
    content = content.replace(match[0], "");
  }

  // B. Xử lý thẻ think chưa đóng (stream dở dang)
  const openTagRegex = /<think>([\s\S]*?)$/i;
  const openMatch = content.match(openTagRegex);
  if (openMatch) {
    if (openMatch[1]) thoughts.push(openMatch[1].trim());
    content = content.replace(openMatch[0], "");
  }
  content = content.replace(/<\/?t(?:h(?:i(?:n(?:k)?)?)?)?>?$/i, "");

  // C. Parse Link Attachment [LINK_ATTACHMENT:...]
  const attachmentRegex = /\[LINK_ATTACHMENT:\s*([A-Z0-9_]+)\]\s*([^\s\]]+)/gi;
  let attMatch;
  while ((attMatch = attachmentRegex.exec(content)) !== null) {
    links.push({
      type: attMatch[1].toLowerCase(),
      url: attMatch[2].trim(),
      originalMatch: attMatch[0],
    });
  }
  content = content.replace(attachmentRegex, "").trim();

  // D. Săn Raw URL
  const rawUrlRegex = /(https?:\/\/[^\s]+)/g;
  let urlMatch;
  while ((urlMatch = rawUrlRegex.exec(content)) !== null) {
    const foundUrl = urlMatch[0];
    if (!links.some((l) => l.url === foundUrl)) {
      links.push({
        type: detectLinkType(foundUrl),
        url: foundUrl,
        originalMatch: foundUrl,
      });
    }
  }
  content = content.replace(rawUrlRegex, "").trim();

  // E. 🔥 LỌC LOG (Sử dụng Regex tập trung)
  const lines = content.split("\n");
  const cleanLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false; // Bỏ dòng trống
    // Nếu dòng dính log -> Coi như là thought (suy nghĩ) -> Đẩy vào thoughts
    if (SYSTEM_LOG_REGEX.test(trimmed)) {
      thoughts.push(trimmed);
      return false; // Không hiển thị ở content
    }
    return true;
  });

  const cleanContent = cleanLines.join("\n").trim();

  // F. Quyết định hiển thị
  const hasVisibleContent = cleanContent.length > 0 || links.length > 0;

  return {
    hasVisibleContent,
    cleanContent,
    thoughts,
    links,
  };
};
