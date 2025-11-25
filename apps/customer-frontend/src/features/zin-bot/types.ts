// src/features/zin-bot/types.ts
export type ZinEmotion = 
  | "neutral" 
  | "happy" 
  | "sad" 
  | "surprised" 
  | "love" 
  | "cool" 
  | "wink" 
  | "magic"; // ✅ Thêm cái này

export type ZinAction = "breathing" | "scanning" | "cleaning" | "sleeping" | "walking" | "dance" | "panic" | "peek";

export interface ZinTheme {
  body: string;
  metal: string;
  darkMetal: string;
  treadDark: string;
  treadLight: string;
  lensRing: string;
  lensGlass: string;
  eyeLight: string;
  glow: string;
}

export interface ZinProps {
  className?: string;
  isThinking?: boolean;
  emotion?: ZinEmotion;
  forcedAction?: ZinAction;
}