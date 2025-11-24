// src/features/zin-bot/config/animations.ts
import { Variants } from "framer-motion";

// --- 1. THÂN (BODY) ---
export const bodyMoveVariants: Variants = {
  breathing: { 
    x: 0, y: [0, -3, 0], scaleX: 1, 
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } 
  },
  walking: {
    x: [0, 50, 50, -50, -50, 0], 
    y: [0, -2, 0, -2, 0, -2, 0], 
    scaleX: [1, 1, -1, -1, 1, 1],
    transition: { duration: 12, times: [0, 0.4, 0.45, 0.85, 0.9, 1], ease: "linear", repeat: Infinity, repeatDelay: 2 }
  },
  dance: {
    y: [0, -8, 0, -4, 0],
    rotate: [0, -3, 3, -3, 0],
    transition: { repeat: Infinity, duration: 0.8 }
  },
  panic: {
    x: [0, -3, 3, -3, 3, 0], 
    y: 2, 
    rotate: [0, -1, 1, -1, 1, 0],
    transition: { duration: 0.3, repeat: Infinity }
  },
  peek: {
    x: [0, -110, -110, -110, 0],
    rotate: [0, 0, 8, 0, 0],
    transition: { duration: 6, times: [0, 0.2, 0.5, 0.8, 1] }
  },
  cleaning: { x: 0, y: 0, scaleX: 1 },
  sleeping: { x: 0, y: 8, scaleX: 1 }, 
  thinking: { x: 0, y: 0, scaleX: 1 }
};

// --- 2. ĐẦU (HEAD) ---
export const headVariants: Variants = {
  breathing: { y: [0, -2, 0], rotate: 0, transition: { duration: 4, repeat: Infinity } },
  dance: { rotate: [0, 8, -8, 0], transition: { repeat: Infinity, duration: 0.8 } },
  panic: { rotate: [0, 15, -15, 0], y: 5, transition: { repeat: Infinity, duration: 0.2 } }, 
  peek: { rotateY: [0, 0, 25, 0], transition: { delay: 1.5, duration: 2 } },
  cleaning: { rotate: 12, y: 4 },
  sleeping: { y: 22, rotate: 12, transition: { duration: 1.5, ease: "easeInOut" } }, 
  thinking: { rotate: 12, y: 2 } 
};

// --- 3. TAY (ARMS) - ĐÃ FIX LỖI VĂNG TAY ---
// Quy tắc: Không bao giờ dùng x, y lớn. Chỉ dùng rotate.
export const handVariants: Variants = {
  breathing: { rotate: 0, y: 0, x: 0 },
  walking: { 
    rotate: [0, 8, -8, 0], 
    transition: { repeat: Infinity, duration: 1.5, ease: "linear" } 
  },
  dance: { 
    // ✅ FIX: Thay vì nhấc tay (y), ta xoay tay lên cao (rotate 140 độ)
    // Tay sẽ giơ lên trời "quẩy" nhưng gốc vẫn dính ở vai
    rotate: [0, 140, 100, 140], 
    transition: { repeat: Infinity, duration: 0.8 } 
  },
  panic: { 
    rotate: [0, 40, -20, 40], 
    transition: { repeat: Infinity, duration: 0.2 } 
  },
  cleaning: { 
    // Cleaning là ngoại lệ duy nhất cần x/y vì tay phải với tới kính
    // Nhưng đã căn chỉnh để không bị rời quá xa
    x: [0, 25, 0, 25], y: -40, rotate: [0, 15, 0, 15], 
    transition: { duration: 1.5, repeat: 2 } 
  },
  sleeping: { rotate: 20, y: 5 }, 
  thinking: { rotate: -125, x: -12, y: -8 } 
};

// --- 4. BÁNH XE ---
export const wheelVariants: Variants = {
  stopped: { rotate: 0 },
  moving: { rotate: 360, transition: { repeat: Infinity, duration: 1.5, ease: "linear" } },
  panic: { rotate: 720, transition: { repeat: Infinity, duration: 0.3, ease: "linear" } }
};