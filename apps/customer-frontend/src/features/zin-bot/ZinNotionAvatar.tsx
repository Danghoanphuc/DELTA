// src/features/zin-bot/ZinNotionAvatar.tsx
// ✅ FINAL UPDATE: Màu sắc & Căn chỉnh phụ kiện
// - Cốc cà phê vẽ lại chuẩn dáng take-away, có màu nâu.
// - Tai nghe, Mũ nồi được căn chỉnh ôm sát đầu.
// - Tất cả phụ kiện đều có màu sắc đặc trưng (Vàng, Đỏ, Xanh...).

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { ZinProps } from "./types";
import { useZinBehavior } from "@/logic/useZinBehavior";
import { useZinStore } from "@/stores/useZinStore";

// Bảng màu phụ kiện (Notion Palette)
const COLORS = {
  beret: "#e11d48",   // Đỏ mận
  crown: "#fbbf24",   // Vàng kim
  coffee: "#78350f",  // Nâu cà phê
  glassesLens: "#171717", // Đen kính
  glassesFrame: "#d97706", // Vàng đồng khung kính
  headphone: "#374151", // Xám xanh đen
  flower: "#ec4899",  // Hồng
  mask: "#0ea5e9",    // Xanh y tế
  strokeDark: "#1e293b" // Màu nét vẽ tối
};

export function ZinNotionAvatar({
  className,
  isThinking = false,
  emotion = "neutral",
  forcedAction,
}: ZinProps) {
  const { isBlinking, idleAction: autoAction } = useZinBehavior(isThinking, emotion);
  const currentAction = forcedAction || autoAction;
  const { accessory } = useZinStore();

  const getIconState = () => {
    if (isThinking) return "face"; 
    if (currentAction === "sleeping") return "sleep";
    if (currentAction === "panic") return "confused";
    return "face";
  };

  const activeState = getIconState();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-300",
        // Màu chữ mặc định cho các nét vẽ cơ bản
        "text-slate-800 dark:text-slate-200", 
        !className?.includes("w-") && "w-10 h-10", 
        className
      )}
    >
      {/* Vòng loading */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            className="absolute inset-[-15%] rounded-full border-[1.8px] border-dashed border-slate-400 dark:border-slate-500"
            style={{ borderRightColor: "transparent", borderTopColor: "transparent" }} 
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </AnimatePresence>

      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full overflow-visible">
        <AnimatePresence mode="wait">
          
          {/* === 1. FACE (MẶT CỦ LẠC) === */}
          {activeState === "face" && (
            <motion.g
              key="face"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              style={{ transformOrigin: "50px 50px" }}
            >
              {/* FORM MẶT */}
              <path d="M50 15 C 75 15, 88 35, 85 55 C 82 78, 68 88, 50 88 C 32 88, 15 75, 15 50 C 15 28, 25 15, 50 15 Z" />
              <path d="M48 45 L 48 56 L 54 56" strokeWidth="2.5" />

              {/* BIỂU CẢM (MẮT/MIỆNG) */}
              {isThinking ? (
                <g key="thinking">
                   <motion.circle cx="35" cy="40" r="3" fill="currentColor" stroke="none" animate={{ cx: [35, 38, 35], cy: [40, 38, 40] }} transition={{ duration: 2, repeat: Infinity }} />
                   <motion.circle cx="65" cy="40" r="3" fill="currentColor" stroke="none" animate={{ cx: [65, 68, 65], cy: [40, 38, 40] }} transition={{ duration: 2, repeat: Infinity }} />
                   <path d="M40 72 Q 45 68 50 72 T 60 72" />
                   <motion.path d="M75 25 Q 78 20 81 25 Q 84 30 78 35 Q 72 30 75 25" strokeWidth="1.5" animate={{ y: [0, 5], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                </g>
              ) : (
                <g key="normal">
                   {/* Ẩn mắt nếu đeo kính râm */}
                   {accessory !== "glasses" && (
                     isBlinking ? (
                       <> <path d="M32 45 L 38 45" strokeWidth="2" /> <path d="M62 45 L 68 45" strokeWidth="2" /> </>
                     ) : (
                       <> 
                        <circle cx="35" cy="45" r="3" fill="currentColor" stroke="none" /> 
                        <circle cx="65" cy="45" r="3.5" fill="currentColor" stroke="none" /> 
                       </>
                     )
                   )}
                   {/* Miệng */}
                   {emotion === "happy" || emotion === "love" || emotion === "magic" ? <path d="M38 68 Q 50 78 62 68" /> : emotion === "sad" ? <path d="M40 72 Q 50 62 60 72" /> : emotion === "surprised" ? <circle cx="50" cy="70" r="4" /> : <path d="M42 70 Q 50 73 58 68" />}
                   {/* Hiệu ứng Magic */}
                   {(emotion === "magic" || currentAction === "dance") && (
                      <>
                        <motion.path d="M20 20 L 25 20 M 22.5 17.5 L 22.5 22.5" strokeWidth="2" animate={{ scale: [0, 1.2, 0], rotate: 45 }} transition={{ repeat: Infinity, duration: 1 }} />
                        <motion.path d="M85 80 L 90 80 M 87.5 77.5 L 87.5 82.5" strokeWidth="2" animate={{ scale: [0, 1.2, 0], rotate: 45 }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.5 }} />
                      </>
                   )}
                </g>
              )}

              {/* --- PHỤ KIỆN CÓ MÀU & ĐÃ CĂN CHỈNH --- */}
              
              {/* 🧢 Mũ Nồi (Đỏ - Căn chỉnh lại vị trí ôm đầu) */}
              {accessory === "beret" && (
                <motion.path 
                  d="M25 22 C 20 15, 70 12, 80 22 C 82 28, 75 30, 75 30 L 25 30 Z M 50 12 L 52 8" 
                  fill={COLORS.beret} stroke={COLORS.strokeDark} strokeWidth="2"
                  initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} 
                />
              )}

              {/* 👓 Kính Râm (Đen + Vàng đồng) */}
              {accessory === "glasses" && (
                <motion.g initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                   <path d="M22 42 H 46 L 46 52 C 46 56, 40 58, 34 58 C 28 58, 22 56, 22 52 Z" fill={COLORS.glassesLens} stroke="none" />
                   <path d="M54 42 H 78 L 78 52 C 78 56, 72 58, 66 58 C 60 58, 54 56, 54 52 Z" fill={COLORS.glassesLens} stroke="none" />
                   <g stroke={COLORS.glassesFrame} strokeWidth="2.5" fill="none">
                     <line x1="46" y1="45" x2="54" y2="45" />
                     <line x1="22" y1="45" x2="15" y2="40" />
                     <line x1="78" y1="45" x2="85" y2="40" />
                     <path d="M22 42 H 46 L 46 52 C 46 56, 40 58, 34 58 C 28 58, 22 56, 22 52 Z" />
                     <path d="M54 42 H 78 L 78 52 C 78 56, 72 58, 66 58 C 60 58, 54 56, 54 52 Z" />
                   </g>
                   <path d="M26 45 L 38 45 M 58 45 L 70 45" stroke="white" strokeWidth="1.5" opacity="0.3" />
                </motion.g>
              )}

              {/* 👑 Vương Miện (Vàng kim) */}
              {accessory === "crown" && (
                <motion.g initial={{ y: -20, opacity: 0 }} animate={{ y: -8, opacity: 1 }}>
                  <path d="M32 25 L 32 10 L 44 22 L 50 5 L 56 22 L 68 10 L 68 25 Z" fill={COLORS.crown} stroke={COLORS.strokeDark} strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="32" cy="25" r="2" fill={COLORS.beret} stroke="none"/>
                  <circle cx="68" cy="25" r="2" fill={COLORS.beret} stroke="none"/>
                  <circle cx="50" cy="25" r="2" fill={COLORS.beret} stroke="none"/>
                </motion.g>
              )}

              {/* ☕ CÀ PHÊ (Vẽ lại dáng cốc take-away, màu nâu) */}
              {accessory === "coffee" && (
                <motion.g initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                   {/* Thân cốc */}
                   <path d="M75 60 L 80 90 L 95 90 L 100 60 Z" fill="#f5f5f5" stroke={COLORS.coffee} strokeWidth="2" />
                   {/* Đai cầm màu nâu */}
                   <path d="M77 70 L 79 82 L 96 82 L 98 70 Z" fill={COLORS.coffee} stroke={COLORS.strokeDark} strokeWidth="1.5" />
                   {/* Nắp cốc */}
                   <path d="M73 60 L 102 60 L 100 55 L 75 55 Z" fill={COLORS.coffee} stroke={COLORS.strokeDark} strokeWidth="2" />
                   {/* Khói nhẹ */}
                   <motion.path d="M88 50 Q 92 45 88 40" stroke={COLORS.coffee} strokeWidth="1.5" opacity="0.5" animate={{ y: -8, opacity: 0 }} transition={{ duration: 2.5, repeat: Infinity }} />
                </motion.g>
              )}

              {/* 🎧 Tai Nghe (Xám xanh đen - Căn chỉnh ôm đầu) */}
              {accessory === "headphone" && (
                 <motion.g initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    {/* Khung trên đầu - Căn chỉnh lại độ cong */}
                    <path d="M18 50 L 18 40 C 18 12, 82 12, 82 40 L 82 50" stroke={COLORS.headphone} strokeWidth="5.5" fill="none" strokeLinecap="round" />
                    {/* Ốp tai 2 bên - Căn chỉnh vị trí */}
                    <rect x="10" y="42" width="12" height="26" rx="4" fill={COLORS.headphone} stroke={COLORS.strokeDark} strokeWidth="1.5" />
                    <rect x="78" y="42" width="12" height="26" rx="4" fill={COLORS.headphone} stroke={COLORS.strokeDark} strokeWidth="1.5" />
                 </motion.g>
              )}

              {/* 🌸 Hoa (Hồng) */}
              {accessory === "flower" && (
                 <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ originX: "75px", originY: "25px" }}>
                    <path d="M75 25 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" fill={COLORS.flower} stroke={COLORS.strokeDark} strokeWidth="1.5" />
                    <path d="M75 20 L 75 15 M 80 25 L 85 25 M 75 30 L 75 35 M 70 25 L 65 25" stroke={COLORS.strokeDark} strokeWidth="2" />
                    <circle cx="75" cy="25" r="2.5" fill="#fde047" stroke="none" />
                 </motion.g>
              )}

              {/* 😷 Khẩu trang (Xanh y tế) */}
              {accessory === "mask" && (
                 <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <path d="M25 58 Q 50 88 75 58 L 75 52 Q 50 48 25 52 Z" fill={COLORS.mask} stroke={COLORS.strokeDark} strokeWidth="2" />
                    <line x1="25" y1="52" x2="15" y2="45" stroke={COLORS.mask} strokeWidth="2" opacity="0.6" />
                    <line x1="75" y1="52" x2="85" y2="45" stroke={COLORS.mask} strokeWidth="2" opacity="0.6" />
                 </motion.g>
              )}

            </motion.g>
          )}

          {/* === 2. CÁC TRẠNG THÁI KHÁC (Sleep & Confused) giữ nguyên màu mặc định === */}
          {activeState === "confused" && (
             <motion.g key="confused" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} style={{ transformOrigin: "50px 50px" }}>
                <path d="M35 35 Q 50 10 65 35 Q 80 60 50 70" />
                <circle cx="50" cy="85" r="4" fill="currentColor" stroke="none" />
             </motion.g>
          )}
           {activeState === "sleep" && (
             <motion.g key="sleep" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ transformOrigin: "50px 50px" }}>
                <path d="M25 55 Q 50 55 75 55" strokeDasharray="4 4" opacity="0.5" />
                <text x="50" y="35" fontSize="30" fill="currentColor" stroke="none" textAnchor="middle" className="font-bold font-sans">Zzz</text>
             </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}