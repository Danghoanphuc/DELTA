// Định nghĩa tất cả trạng thái của Zin
export type ZinEmotion = "neutral" | "happy" | "sad" | "surprised";
export type ZinAction = "breathing" | "scanning" | "cleaning" | "sleeping" | "walking" | "dance" | "panic" | "peek";

export interface ZinProps {
  className?: string;
  isThinking?: boolean; // Trạng thái xử lý của hệ thống
  emotion?: ZinEmotion; // Cảm xúc từ phân tích tin nhắn
  forcedAction?: ZinAction; // Bắt buộc làm hành động gì đó (VD: click vào thì giật mình)
}

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