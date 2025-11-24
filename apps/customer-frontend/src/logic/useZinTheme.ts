import { useMemo } from "react";
import { ZinEmotion, ZinAction, ZinTheme } from "@/features/zin-bot/types";

export const useZinTheme = (emotion: ZinEmotion, isThinking: boolean, action: ZinAction): ZinTheme => {
  return useMemo(() => {
    let eyeLight = "#38bdf8"; // Xanh dương (Mặc định)
    let glow = "#0ea5e9";

    if (action === "sleeping") {
        eyeLight = "#334155"; // Tắt đèn (Xám đậm)
        glow = "transparent";
    } else if (isThinking) {
      eyeLight = "#fbbf24"; // Vàng (Thinking)
      glow = "#d97706";
    } else if (action === "panic" || emotion === "sad") {
      eyeLight = "#ef4444"; // Đỏ (Lỗi/Sợ)
      glow = "#b91c1c";
    } else if (action === "dance" || emotion === "happy") {
      eyeLight = "#22c55e"; // Xanh lá (Vui/Quẩy)
      glow = "#15803d";
    } else if (emotion === "surprised") {
      eyeLight = "#d946ef"; // Tím (Ngạc nhiên)
      glow = "#a21caf";
    }

    return {
      body: "#f8fafc", metal: "#94a3b8", darkMetal: "#475569",
      treadDark: "#1e293b", treadLight: "#334155",
      lensRing: "#1e293b", lensGlass: "#020617",
      eyeLight, glow
    };
  }, [emotion, isThinking, action]);
};

// Tinh chỉnh độ mở của mí mắt (Shutter)
export const getEyeShutterState = (action: ZinAction, emotion: ZinEmotion, isThinking: boolean, isBlinking: boolean) => {
    if (action === "sleeping") return { rotate: [15, -15], close: [24, 24] }; // Nhắm nghiền
    if (action === "panic") return { rotate: [-25, 25], close: [-8, -8] }; // Trợn ngược
    if (isBlinking) return { rotate: [0, 0], close: [24, 24] }; // Chớp mắt
    if (isThinking) return { rotate: [15, -5], close: [8, 18] }; // Mắt to mắt nhỏ (nghi vấn)
    
    switch (emotion) {
      case "happy": return { rotate: [-12, 12], close: [0, 0] }; // Cười hiền
      case "sad": return { rotate: [20, -20], close: [10, 10] }; // Mếu máo
      case "surprised": return { rotate: [-30, 30], close: [-10, -10] }; // Mở to
      default: return { rotate: [0, 0], close: [0, 0] };
    }
};