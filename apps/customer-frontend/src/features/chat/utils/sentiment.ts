// src/features/chat/utils/sentiment.ts

export type BotExpression = "neutral" | "happy" | "sad" | "surprised" | "thinking";

export const analyzeSentiment = (text?: string): BotExpression => {
  if (!text) return "neutral";
  
  const lowerText = text.toLowerCase();

  // 1. Tích cực / Thành công / Chào hỏi
  const happyKeywords = [
    "xin chào", "chào", "hi", "hello", 
    "thành công", "tuyệt", "tốt", "ok", "được", "xong", 
    "cảm ơn", "hay quá", "haha", "hihi", "vui", 
    "chúc mừng", "đã đặt", "hoàn thành"
  ];
  
  // 2. Tiêu cực / Lỗi / Xin lỗi
  const sadKeywords = [
    "lỗi", "error", "thất bại", "xin lỗi", "tiếc", 
    "không được", "chậm", "buồn", "hủy", "sai", 
    "chưa được", "khó quá"
  ];

  // 3. Ngạc nhiên / Wow
  const surprisedKeywords = [
    "wow", "bất ngờ", "thật á", "ghê", "đỉnh", 
    "nhanh", "tốc độ", "lớn"
  ];

  if (happyKeywords.some(k => lowerText.includes(k))) return "happy";
  if (sadKeywords.some(k => lowerText.includes(k))) return "sad";
  if (surprisedKeywords.some(k => lowerText.includes(k))) return "surprised";

  return "neutral";
};