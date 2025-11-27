// apps/customer-frontend/src/features/chat/utils/textParser.ts

export interface ParsedContent {
  thought: string | null;
  content: string;
}

export const parseThinkingContent = (rawText: string): ParsedContent => {
  if (!rawText || typeof rawText !== "string") {
    return { thought: null, content: "" };
  }

  let content = rawText;
  let thoughts: string[] = [];

  // 1. Safe Regex: Bắt thẻ đóng mở hoàn chỉnh
  // Sử dụng [\s\S] thay vì . để bắt cả newline
  const completeTagRegex = /<think>([\s\S]*?)<\/think>/gi;
  
  let match;
  while ((match = completeTagRegex.exec(rawText)) !== null) {
    if (match[1]) thoughts.push(match[1].trim());
    // Xóa phần đã match khỏi content
    content = content.replace(match[0], "");
  }

  // 2. Handle Streaming (Thẻ mở nhưng chưa đóng)
  // Regex này tìm <think> ở cuối chuỗi mà không có thẻ đóng tương ứng
  const openTagRegex = /<think>([\s\S]*?)$/i;
  const openMatch = content.match(openTagRegex);

  if (openMatch) {
    if (openMatch[1]) thoughts.push(openMatch[1].trim());
    content = content.replace(openMatch[0], ""); // Xóa phần đang stream khỏi content hiển thị
  }

  // 3. Handle Broken Tags (Trường hợp socket cắt đôi chữ <t...hink>)
  // Đây là optional, nhưng tốt cho UX: Xóa các mảnh vỡ tag ở cuối
  content = content.replace(/<\/?t(?:h(?:i(?:n(?:k)?)?)?)?>?$/i, "");

  // 4. Cleanup
  const finalThought = thoughts.join("\n").trim();
  const finalContent = content.trim();

  return {
    thought: finalThought.length > 0 ? finalThought : null,
    content: finalContent
  };
};