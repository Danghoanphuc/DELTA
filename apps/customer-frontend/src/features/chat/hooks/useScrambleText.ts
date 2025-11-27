// apps/customer-frontend/src/features/chat/hooks/useScrambleText.ts
import { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEF0123456789!@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソ";

interface UseScrambleTextOptions {
  text: string;
  duration?: number;
  tick?: number;
  playOnMount?: boolean;
}

export function useScrambleText({ 
  text, 
  duration = 800, 
  tick = 40, 
  playOnMount = false,
}: UseScrambleTextOptions) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  
  const isFirstMount = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevTextRef = useRef<string>(text);

  useEffect(() => {
    const textChanged = prevTextRef.current !== text;
    
    // Logic quyết định có chạy hiệu ứng không
    const shouldPlay = 
      (isFirstMount.current && playOnMount) || // 1. Mới xuất hiện + Được phép chạy
      (!isFirstMount.current && textChanged);  // 2. Đã xuất hiện + Có đổi chữ

    if (shouldPlay) {
      // Cleanup cũ
      if (timerRef.current) clearInterval(timerRef.current);
      
      setIsScrambling(true);
      let iteration = 0;
      const totalFrames = duration / tick; 
      const charPerFrame = text.length / totalFrames; 

      timerRef.current = setInterval(() => {
        setDisplayText(prev => {
          return text
            .split("")
            .map((char, index) => {
              if (index < iteration) return text[index];
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("");
        });

        iteration += Math.max(charPerFrame, 1/2);

        if (iteration >= text.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDisplayText(text);
          setIsScrambling(false);
        }
      }, tick);
      
      prevTextRef.current = text;
    } else if (isFirstMount.current && !playOnMount) {
      // Nếu lần đầu mà không được chạy -> Set text tĩnh luôn
      setDisplayText(text);
      prevTextRef.current = text;
    }

    if (isFirstMount.current) {
      isFirstMount.current = false;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, playOnMount, duration, tick]); 

  return { displayText, isScrambling };
}