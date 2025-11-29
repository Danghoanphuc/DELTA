// apps/customer-frontend/src/features/chat/hooks/useSmoothStream.ts
import { useState, useEffect, useRef } from "react";

/**
 * 🎯 useSmoothStream - Accumulate & Render Strategy
 *
 * Strategy: Tích lũy text trong buffer, chỉ render khi tìm được semantic breakpoint an toàn
 *
 * Semantic Breakpoints:
 * 1. Double newline (\n\n) - Paragraph break
 * 2. Single newline after heading (### Title\n)
 * 3. Single newline after list item (- Item\n)
 * 4. Sentence end with punctuation (. ! ?)
 *
 * @param rawText - Text thô từ backend (accumulating)
 * @param isStreaming - Đang stream hay không
 * @returns displayedText - Text an toàn để render markdown
 */
export function useSmoothStream(rawText: string, isStreaming: boolean): string {
  const [displayedText, setDisplayedText] = useState("");
  const lastSafeIndexRef = useRef(0);

  useEffect(() => {
    // 🚀 FAST PATH: Không stream → Hiển thị toàn bộ
    if (!isStreaming) {
      setDisplayedText(rawText);
      lastSafeIndexRef.current = rawText.length;
      return;
    }

    // 🎯 FIND SAFE BREAKPOINT: Tìm điểm cắt an toàn từ lastSafeIndex
    const findSafeBreakpoint = (text: string, startFrom: number): number => {
      const searchText = text.slice(startFrom);

      // Priority 1: Double newline (paragraph break) - SAFEST
      const doubleNewline = searchText.indexOf("\n\n");
      if (doubleNewline !== -1) {
        return startFrom + doubleNewline + 2; // +2 to include \n\n
      }

      // Priority 2: Heading followed by newline (### Title\n)
      const headingMatch = searchText.match(/^#{1,6}\s+.+?\n/m);
      if (headingMatch && headingMatch.index !== undefined) {
        return startFrom + headingMatch.index + headingMatch[0].length;
      }

      // Priority 3: List item followed by newline (- Item\n or 1. Item\n)
      const listMatch = searchText.match(
        /^[\s]*[-*+]\s+.+?\n|^[\s]*\d+\.\s+.+?\n/m
      );
      if (listMatch && listMatch.index !== undefined) {
        return startFrom + listMatch.index + listMatch[0].length;
      }

      // Priority 4: Sentence end (. ! ? followed by space or newline)
      const sentenceMatch = searchText.match(/[.!?][\s\n]/);
      if (sentenceMatch && sentenceMatch.index !== undefined) {
        return startFrom + sentenceMatch.index + 2; // +2 to include punctuation + space
      }

      // Priority 5: Any newline (fallback)
      const newline = searchText.indexOf("\n");
      if (newline !== -1) {
        return startFrom + newline + 1;
      }

      // No safe breakpoint found - keep current position
      return lastSafeIndexRef.current;
    };

    // 🔍 Tìm breakpoint mới từ vị trí cuối cùng
    const newSafeIndex = findSafeBreakpoint(rawText, lastSafeIndexRef.current);

    // ✅ Chỉ update nếu tìm được breakpoint mới
    if (newSafeIndex > lastSafeIndexRef.current) {
      lastSafeIndexRef.current = newSafeIndex;
      setDisplayedText(rawText.slice(0, newSafeIndex));
    }
  }, [rawText, isStreaming]);

  // 🔄 RESET: Khi bắt đầu stream mới
  useEffect(() => {
    if (isStreaming && rawText.length === 0) {
      lastSafeIndexRef.current = 0;
      setDisplayedText("");
    }
  }, [isStreaming, rawText.length === 0]);

  // 🏁 FINALIZE: Khi stream kết thúc, hiển thị toàn bộ
  useEffect(() => {
    if (!isStreaming && rawText.length > 0) {
      setDisplayedText(rawText);
      lastSafeIndexRef.current = rawText.length;
    }
  }, [isStreaming, rawText]);

  return displayedText;
}
