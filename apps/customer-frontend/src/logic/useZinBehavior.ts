import { useState, useEffect } from "react";
import { ZinAction, ZinEmotion } from "@/features/zin-bot/types";

interface UseZinBehaviorOptions {
  isThinking?: boolean;
  emotion?: ZinEmotion;
}

// ✅ CẢI THIỆN: Chọn hành động dựa trên cảm xúc, không ngẫu nhiên
export const useZinBehavior = (isThinking: boolean = false, emotion: ZinEmotion = "neutral") => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [idleAction, setIdleAction] = useState<ZinAction>("breathing");

  // ✅ 1. Loop Nháy mắt
  useEffect(() => {
    if (isThinking || idleAction === "sleeping") return;
    
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
      
      // Random blink time: 2s - 6s
      const nextBlink = Math.random() * 4000 + 2000;
      timeoutId = setTimeout(blink, nextBlink);
    };

    let timeoutId = setTimeout(blink, 3000);
    return () => clearTimeout(timeoutId);
  }, [isThinking, idleAction]);

  // ✅ 2. Chọn hành động dựa trên cảm xúc (Context-Aware Behavior)
  useEffect(() => {
    if (isThinking) {
      setIdleAction("scanning"); // Khi đang nghĩ, scan
      return;
    }

    // ✅ Map cảm xúc -> hành động phù hợp
    const getActionFromEmotion = (emotion: ZinEmotion): ZinAction => {
      switch (emotion) {
        case "happy":
          // Vui -> nhảy múa hoặc đi dạo
          return Math.random() > 0.5 ? "dance" : "walking";
        case "sad":
          // Buồn -> ngủ hoặc peek (nhìn lén)
          return Math.random() > 0.6 ? "sleeping" : "peek";
        case "surprised":
          // Ngạc nhiên -> peek hoặc scanning (nhìn quanh)
          return Math.random() > 0.5 ? "peek" : "scanning";
        case "neutral":
        default:
          // Trung tính -> breathing (thở), walking, hoặc scanning
          const neutralActions: ZinAction[] = ["breathing", "walking", "scanning", "cleaning"];
          // 60% breathing, 30% walking, 10% scanning/cleaning
          const rand = Math.random();
          if (rand < 0.6) return "breathing";
          if (rand < 0.9) return "walking";
          return neutralActions[Math.floor(Math.random() * 2) + 2];
      }
    };

    // Chọn hành động dựa trên cảm xúc
    const actionFromEmotion = getActionFromEmotion(emotion);
    setIdleAction(actionFromEmotion);

    // Thời gian diễn cho từng hành động (phụ thuộc cảm xúc)
    let duration = 4000;
    switch (actionFromEmotion) {
      case "walking": 
        duration = emotion === "happy" ? 10000 : 8000; // Vui đi lâu hơn
        break;
      case "dance": 
        duration = 6000; // Nhảy múa
        break;
      case "peek": 
        duration = emotion === "surprised" ? 5000 : 6000;
        break;
      case "sleeping": 
        duration = 8000; // Ngủ
        break;
      case "scanning": 
        duration = emotion === "surprised" ? 5000 : 4000;
        break;
      case "cleaning": 
        duration = 4000;
        break;
      default: 
        duration = 4000;
    }

    // Sau khi kết thúc hành động, quay về breathing
    if (actionFromEmotion !== "breathing") {
      const timeoutId = setTimeout(() => {
        setIdleAction("breathing");
      }, duration);
      return () => clearTimeout(timeoutId);
    }
  }, [isThinking, emotion]);

  return { isBlinking, idleAction };
};