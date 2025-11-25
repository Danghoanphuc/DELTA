// src/features/zin-bot/config/animations.ts
import { Variants } from "framer-motion";

// --- 1. THÂN (BODY) ---
// ✅ FIX: Giảm khoảng cách di chuyển để không bị văng xa
export const bodyMoveVariants: Variants = {
  breathing: { 
    x: 0, y: [0, -2, 0], scaleX: 1, 
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } 
  },
  walking: {
    // ✅ FIX: Giảm từ ±15px xuống ±10px - di chuyển nhẹ nhàng hơn
    x: [0, 10, 10, -10, -10, 0], 
    y: [0, -0.5, 0, -0.5, 0, -0.5, 0], 
    scaleX: [1, 1, -1, -1, 1, 1],
    transition: { duration: 12, times: [0, 0.4, 0.45, 0.85, 0.9, 1], ease: "linear", repeat: Infinity, repeatDelay: 2 }
  },
  dance: {
    // ✅ FIX: Giảm nhảy từ -4px xuống -3px - nhẹ nhàng hơn
    y: [0, -3, 0, -1.5, 0],
    rotate: [0, -1.5, 1.5, -1.5, 0],
    transition: { repeat: Infinity, duration: 0.8 }
  },
  panic: {
    // ✅ FIX: Giảm rung từ ±2px xuống ±1.5px - rung nhẹ hơn
    x: [0, -1.5, 1.5, -1.5, 1.5, 0], 
    y: 0.5, 
    rotate: [0, -0.8, 0.8, -0.8, 0.8, 0],
    transition: { duration: 0.3, repeat: Infinity }
  },
  peek: {
    // ✅ FIX: Giảm từ -30px xuống -20px - chỉ nhìn sang một chút nhẹ nhàng
    x: [0, -20, -20, -20, 0],
    rotate: [0, 0, 3, 0, 0],
    transition: { duration: 6, times: [0, 0.2, 0.5, 0.8, 1] }
  },
  cleaning: { x: 0, y: 0, scaleX: 1 },
  sleeping: { x: 0, y: 5, scaleX: 1 }, 
  thinking: { x: 0, y: 0, scaleX: 1 }
};

// --- 2. ĐẦU (HEAD) ---
// ✅ FIX: Giảm góc quay và khoảng cách để đầu không văng quá xa
export const headVariants: Variants = {
  breathing: { y: [0, -1, 0], rotate: 0, transition: { duration: 4, repeat: Infinity } },
  dance: { 
    // ✅ FIX: Giảm từ ±5 độ xuống ±3 độ - nhẹ nhàng hơn
    rotate: [0, 3, -3, 0], 
    transition: { repeat: Infinity, duration: 0.8 } 
  },
  panic: { 
    // ✅ FIX: Giảm từ ±10 độ xuống ±7 độ, giảm y từ 3 xuống 2
    rotate: [0, 7, -7, 0], 
    y: 2, 
    transition: { repeat: Infinity, duration: 0.2 } 
  }, 
  peek: { 
    // ✅ FIX: Giảm từ 15 độ xuống 10 độ - nhẹ nhàng hơn
    rotateY: [0, 0, 10, 0], 
    transition: { delay: 1.5, duration: 2 } 
  },
  cleaning: { rotate: 8, y: 2 },
  sleeping: { y: 15, rotate: 8, transition: { duration: 1.5, ease: "easeInOut" } }, 
  thinking: { rotate: 8, y: 1 } 
};

// --- 3. TAY TRÁI (LEFT ARM) - ✅ GIẢI PHÁP: CHỈ ROTATE, KHÔNG DÙNG X/Y ---
// ✅ NGUYÊN TẮC VÀNG: Tay di chuyển HOÀN TOÀN theo body, chỉ rotate nhẹ quanh điểm vai
// Không bao giờ dùng x, y vì sẽ làm tay rời khỏi body khi body di chuyển
export const handVariants: Variants = {
  breathing: { rotate: 0 },
  walking: { 
    // ✅ CHỈ ROTATE: Tay đưa ra trước/sau nhẹ nhàng, body sẽ tự động mang tay theo
    rotate: [0, 3, -3, 0], 
    transition: { 
      repeat: Infinity, 
      duration: 1.5, 
      ease: "linear"
    } 
  },
  dance: { 
    // ✅ CHỈ ROTATE: Tay giơ lên cao nhưng vẫn gắn với body
    rotate: [0, 70, 60, 70], 
    transition: { repeat: Infinity, duration: 0.8 } 
  },
  panic: { 
    // ✅ CHỈ ROTATE: Rung nhẹ tại chỗ
    rotate: [0, 12, -8, 12], 
    transition: { repeat: Infinity, duration: 0.2 } 
  },
  cleaning: { 
    // ✅ DUY NHẤT: Cleaning cần x/y để với tới kính, nhưng giảm tối đa
    x: [0, 8, 0, 8], 
    y: -12, 
    rotate: [0, 6, 0, 6], 
    transition: { duration: 1.5, repeat: 2 } 
  },
  sleeping: { rotate: 10 }, 
  thinking: { 
    // ✅ CHỈ ROTATE: Tay đưa lên cằm, không dùng x/y
    rotate: -70
  },
  scanning: { rotate: 0 },
  peek: { rotate: 0 }
};

// --- 3B. TAY PHẢI (RIGHT ARM) - ✅ ĐỒNG BỘ ĐỐI XỨNG: CHỈ ROTATE ---
// ✅ NGUYÊN TẮC VÀNG: Giống tay trái, chỉ rotate, không dùng x/y
export const rightHandVariants: Variants = {
  breathing: { rotate: 0 },
  walking: { 
    // ✅ ĐỐI XỨNG: Khi tay trái đưa ra trước (+3), tay phải đưa ra sau (-3)
    rotate: [0, -3, 3, 0], 
    transition: { 
      repeat: Infinity, 
      duration: 1.5, 
      ease: "linear"
    } 
  },
  dance: { 
    // ✅ ĐỐI XỨNG: Tay phải giơ lên cao đối diện
    rotate: [0, -70, -60, -70], 
    transition: { repeat: Infinity, duration: 0.8 } 
  },
  panic: { 
    // ✅ ĐỐI XỨNG: Rung ngược chiều với tay trái
    rotate: [0, -12, 8, -12], 
    transition: { repeat: Infinity, duration: 0.2 } 
  },
  cleaning: { rotate: 0 }, // Tay phải không làm gì khi cleaning
  sleeping: { rotate: -10 }, 
  thinking: { 
    // ✅ ĐỐI XỨNG: Tay phải giơ lên đối diện, chỉ rotate
    rotate: 70
  },
  scanning: { rotate: 0 },
  peek: { rotate: 0 }
};

// --- 4. BÁNH XE ---
export const wheelVariants: Variants = {
  stopped: { rotate: 0 },
  moving: { rotate: 360, transition: { repeat: Infinity, duration: 1.5, ease: "linear" } },
  panic: { rotate: 720, transition: { repeat: Infinity, duration: 0.3, ease: "linear" } }
};