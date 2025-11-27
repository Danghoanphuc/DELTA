// src/features/chat/utils/logTranslator.ts
// ✅ Bộ "Dịch thuật tư duy": Biến Log kỹ thuật thành "Ngôn ngữ tư duy"

interface LogTranslation {
  regex: RegExp;
  template: (match: RegExpMatchArray) => string;
  icon?: string;
}

// Định nghĩa các quy tắc dịch từ "Log kỹ thuật" sang "Ngôn ngữ tư duy"
const translations: LogTranslation[] = [
  {
    regex: /screenshot|capture|chụp/i,
    template: () => "Đang quan sát thiết kế của bạn...",
    icon: "📸",
  },
  {
    regex: /vision ai|analyze|phân tích|vision|analyzing/i,
    template: () => "Đang phân tích màu sắc và bố cục...",
    icon: "🧠",
  },
  {
    regex: /get .*\/products.*q=(.*?)(?:&|$)/i,
    template: (match) => {
      const searchTerm = decodeURIComponent(match[1] || "");
      return `Đang tìm các sản phẩm liên quan đến "${searchTerm}"...`;
    },
    icon: "🔍",
  },
  {
    regex: /check.*inventory|stock|kho hàng|kiểm tra kho/i,
    template: () => "Đang kiểm tra kho hàng...",
    icon: "📦",
  },
  {
    regex: /upload.*r2|cloudflare|storage/i,
    template: () => "Đang lưu trữ dữ liệu an toàn...",
    icon: "☁️",
  },
  {
    regex: /navigating to (https?:\/\/[^\s]+)/i,
    template: (match) => {
      try {
        const url = new URL(match[1]);
        return `Đang truy cập vào liên kết: ${url.hostname}...`;
      } catch {
        return `Đang truy cập vào liên kết...`;
      }
    },
    icon: "🌐",
  },
  {
    regex: /fetching|đang tải|downloading/i,
    template: () => "Đang tải dữ liệu...",
    icon: "⬇️",
  },
  {
    regex: /processing|đang xử lý/i,
    template: () => "Đang xử lý dữ liệu...",
    icon: "⚙️",
  },
  {
    regex: /error|fail|thất bại|lỗi/i,
    template: () => "Gặp chút khó khăn, đang thử lại...",
    icon: "⚠️",
  },
  {
    regex: /success|thành công|completed/i,
    template: () => "Đã hoàn thành bước này!",
    icon: "✅",
  },
];

/**
 * Dịch log kỹ thuật thành ngôn ngữ tư duy dễ hiểu cho người dùng
 * @param rawLog - Log thô từ backend (ví dụ: "[INFO] Screenshot taken", "GET /products?q=blue")
 * @returns Text đã được "thổi hồn" (ví dụ: "📸 Đang quan sát thiết kế của bạn...")
 */
export const translateLogToThought = (rawLog: string): string => {
  if (!rawLog || typeof rawLog !== "string") {
    return "Đang xử lý...";
  }

  // 1. Tìm rule phù hợp
  for (const rule of translations) {
    const match = rawLog.match(rule.regex);
    if (match) {
      const translatedText = rule.template(match);
      return rule.icon ? `${rule.icon} ${translatedText}` : translatedText;
    }
  }

  // 2. Nếu không khớp rule nào, làm gọn log gốc
  // Bỏ bớt timestamp, id rườm rà, chỉ giữ phần thông tin quan trọng
  let cleaned = rawLog.trim();
  
  // Loại bỏ prefix log level
  cleaned = cleaned.replace(/^\[(INFO|DEBUG|WARN|ERROR)\]\s*/i, "");
  
  // Loại bỏ timestamp patterns
  cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[.\d]*Z?/g, "");
  
  // Loại bỏ method + URL patterns nếu không khớp rule
  cleaned = cleaned.replace(/^(GET|POST|PUT|DELETE)\s+https?:\/\/[^\s]+/i, "");
  
  cleaned = cleaned.trim();
  
  // Nếu log quá dài hoặc quá kỹ thuật, thay bằng message chung
  if (cleaned.length > 50 || /[{}[\]]/.test(cleaned) || cleaned.includes("undefined") || cleaned.includes("null")) {
    return "Đang xử lý dữ liệu chi tiết...";
  }
  
  // Nếu log ngắn gọn và dễ hiểu, giữ nguyên
  if (cleaned.length > 0 && cleaned.length <= 50) {
    return cleaned;
  }
  
  // Fallback cuối cùng
  return "Đang làm việc...";
};

