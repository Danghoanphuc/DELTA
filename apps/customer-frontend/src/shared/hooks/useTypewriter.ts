// src/shared/hooks/useTypewriter.ts
// Hook logic lõi để tạo hiệu ứng gõ chữ từng ký tự (Typewriter Effect)

import { useState, useEffect, useRef } from "react";

export function useTypewriter(text: string, speed = 30) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset khi text thay đổi hoàn toàn (tin nhắn mới)
    setDisplayedText("");
    setIsTyping(true);
    indexRef.current = 0;

    const typeChar = () => {
      const currentIndex = indexRef.current;

      if (currentIndex < text.length) {
        // Tăng tốc độ hiển thị cho các đoạn văn bản dài để user đỡ chờ
        const jump = text.length > 500 ? 5 : 2;

        setDisplayedText((prev) => text.slice(0, currentIndex + jump));
        indexRef.current += jump;

        // Random speed một chút cho tự nhiên (human-like)
        const randomSpeed = Math.random() * (speed / 2) + speed / 2;
        setTimeout(typeChar, randomSpeed);
      } else {
        setDisplayedText(text); // Đảm bảo hiển thị đủ cuối cùng
        setIsTyping(false);
      }
    };

    // Bắt đầu gõ
    const timeoutId = setTimeout(typeChar, 100);
    return () => clearTimeout(timeoutId);
  }, [text, speed]);

  return { displayedText, isTyping };
}

