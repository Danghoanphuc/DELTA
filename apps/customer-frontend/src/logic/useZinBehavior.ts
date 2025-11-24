import { useState, useEffect } from "react";
import { ZinAction } from "@/features/zin-bot/types";

export const useZinBehavior = (isThinking: boolean) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [idleAction, setIdleAction] = useState<ZinAction>("walking");

  // 1. Loop Nháy mắt
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

  // 2. Loop Hành động ngẫu nhiên (Random Behavior)
  useEffect(() => {
    if (isThinking) return;

    const triggerAction = () => {
      const actions: ZinAction[] = ["scanning", "cleaning", "sleeping", "walking", "dance", "panic", "peek"];
      // Tăng tỉ lệ đi dạo và nhảy
      const weightedActions = [...actions, "walking", "walking", "dance"]; 
      
      const random = Math.random();
      let nextAction: ZinAction = "breathing";
      
      // 70% khả năng sẽ làm trò gì đó thay vì đứng thở
      if (random > 0.3) {
        nextAction = weightedActions[Math.floor(Math.random() * weightedActions.length)] as ZinAction;
      }

      setIdleAction(nextAction);

      // Thời gian diễn cho từng hành động
      let duration = 4000;
      switch (nextAction) {
          case "walking": duration = 12000; break; // Đi lâu hơn
          case "dance": duration = 6000; break;
          case "peek": duration = 6000; break;
          case "sleeping": duration = 8000; break;
          case "panic": duration = 3000; break;
          default: duration = 4000;
      }

      if (nextAction !== "breathing") {
        timeoutId = setTimeout(() => setIdleAction("breathing"), duration);
      }
    };

    let timeoutId = setInterval(triggerAction, 10000); // Check mỗi 10s
    return () => clearInterval(timeoutId);
  }, [isThinking]);

  return { isBlinking, idleAction };
};