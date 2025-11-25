// src/features/chat/utils/sentiment.ts
import { ZinEmotion } from "@/features/zin-bot/types";

// Mở rộng type biểu cảm
export type BotExpression = ZinEmotion | "thinking" | "confused" | "waiting";

// Từ điển cảm xúc "Bắt trend"
const KEYWORDS = {
  // 😍 Thả thính / Yêu thương
  love: [
    "yêu", "love", "thả tim", "tym", "crush", "dễ thương", "cute", 
    "đáng yêu", "thích quá", "moa", "kiss", "xinh", "đẹp"
  ],
  
  // 😎 Cool ngầu / Tự tin
  cool: [
    "ngầu", "vip", "xịn", "đỉnh", "pro", "chất", "uy tín", 
    "good job", "tuyệt vời", "xuất sắc", "trùm", "bá cháy"
  ],
  
  // 😉 Nháy mắt / Đùa giỡn
  wink: [
    "nháy mắt", "bí mật", "hihi", "kaka", "đùa", "giỡn", 
    "tin được không", "đoán xem", "hehe"
  ],

  // 😂 Vui vẻ
  happy: [
    "haha", "hihi", "tuyệt", "thành công", "chúc mừng", "vui", 
    "hay quá", "great", "awesome", "congrats", "cảm ơn", 
    "xong rồi", "đã xong", "ok nha", "chốt", "được đấy"
  ],

  // 😭 Buồn / Lỗi
  sad: [
    "xin lỗi", "tiếc", "buồn", "sorry", "failed", "thất bại", 
    "không thể", "rất tiếc", "đáng tiếc", "oops", "huhu", 
    "sai rồi", "toang", "hỏng"
  ],

  // 😲 Ngạc nhiên
  surprised: [
    "wow", "thật sao", "bất ngờ", "amazing", "trời", "u là trời", 
    "ghê vậy", "thật á", "không ngờ", "chưa từng thấy", "ảo ma", 
    "OMG", "kinh khủng"
  ],

  // 😵 Bối rối / Lỗi kỹ thuật
  confused: [
    "không hiểu", "là sao", "bối rối", "phức tạp", "khó quá", 
    "chưa rõ", "kiểm tra lại", "bug", "lỗi", "error", "404", 
    "lag", "chậm"
  ]
};

/**
 * Phân tích nội dung tin nhắn để đoán cảm xúc
 */
export function analyzeSentiment(text: string): BotExpression {
  if (!text) return "neutral";
  
  const lowerText = text.toLowerCase();

  // Ưu tiên check các Easter Eggs trước
  if (KEYWORDS.love.some(k => lowerText.includes(k))) return "love";
  if (KEYWORDS.cool.some(k => lowerText.includes(k))) return "cool";
  if (KEYWORDS.wink.some(k => lowerText.includes(k))) return "wink";

  // Check các cảm xúc cơ bản
  if (KEYWORDS.confused.some(k => lowerText.includes(k))) return "confused";
  if (KEYWORDS.happy.some(k => lowerText.includes(k))) return "happy";
  if (KEYWORDS.sad.some(k => lowerText.includes(k))) return "sad";
  if (KEYWORDS.surprised.some(k => lowerText.includes(k))) return "surprised";

  // Mặc định mặt ngố
  return "neutral";
}