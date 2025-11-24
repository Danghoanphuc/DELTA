// src/features/chat/components/BotAvatar.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { BotExpression } from "../utils/sentiment";

interface BotAvatarProps {
  className?: string;
  isThinking?: boolean;
  expression?: BotExpression;
}

// Các trạng thái
type IdleState = "breathing" | "scanning" | "cleaning" | "sleeping" | "walking" | "dance" | "panic" | "peek";

export function BotAvatar({ 
  className, 
  isThinking = false, 
  expression = "neutral" 
}: BotAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [idleAction, setIdleAction] = useState<IdleState>("walking");

  // Logic 1: Nháy mắt
  useEffect(() => {
    if (isThinking || idleAction === "sleeping") return;
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
      const nextBlink = Math.random() * 3000 + 3000;
      setTimeout(blinkLoop, nextBlink);
    };
    const timeout = setTimeout(blinkLoop, 3000);
    return () => clearTimeout(timeout);
  }, [isThinking, idleAction]);

  // Logic 2: Hành động ngẫu nhiên
  useEffect(() => {
    if (isThinking) return;

    const triggerRandomAction = () => {
      const actions: IdleState[] = ["scanning", "cleaning", "sleeping", "walking", "dance", "panic", "peek"];
      const random = Math.random();
      let nextAction: IdleState = "breathing";
      
      if (random > 0.2) { 
        nextAction = actions[Math.floor(Math.random() * actions.length)];
      }

      setIdleAction(nextAction);

      let duration = 4000;
      if (nextAction === "walking") duration = 8000;
      if (nextAction === "dance") duration = 5000;
      if (nextAction === "panic") duration = 3000;
      if (nextAction === "peek") duration = 6000;

      if (nextAction !== "breathing") {
        setTimeout(() => setIdleAction("breathing"), duration);
      }
    };

    const interval = setInterval(triggerRandomAction, 9000);
    return () => clearInterval(interval);
  }, [isThinking]);

  // Palette Màu
  const c = {
    body: "#f8fafc",      
    metal: "#94a3b8",     
    darkMetal: "#475569", 
    treadDark: "#1e293b", 
    treadLight: "#334155", 
    lensRing: "#1e293b",  
    lensGlass: "#020617", 
    eyeLight: isThinking ? "#fbbf24" : (expression === "sad" ? "#ef4444" : "#38bdf8"), 
    glow: isThinking ? "#d97706" : "#0ea5e9"
  };

  const eyeState = (() => {
    if (idleAction === "sleeping") return { rotate: [10, -10], close: [20, 20] };
    if (idleAction === "panic") return { rotate: [-20, 20], close: [-5, -5] }; 
    if (idleAction === "peek") return { rotate: [0, 0], close: [0, 0] };
    if (isBlinking) return { rotate: [0, 0], close: [22, 22] };
    if (isThinking) return { rotate: [15, -5], close: [5, 15] };
    switch (expression) {
      case "happy": return { rotate: [-15, 15], close: [0, 0] };
      case "sad": return { rotate: [20, -20], close: [5, 5] };
      case "surprised": return { rotate: [-30, 30], close: [-5, -5] };
      default: return { rotate: [0, 0], close: [0, 0] };
    }
  })();

  // --- ANIMATION VARIANTS (ĐÃ FIX KHỚP) ---

  const bodyMoveVariants: any = {
    breathing: { x: 0, y: 0, scaleX: 1 },
    walking: {
        x: [0, 60, 60, -60, -60, 0],
        y: [0, -2, 0, -2, 0, -2, 0],
        scaleX: [1, 1, -1, -1, 1, 1],
        transition: { duration: 8, times: [0, 0.4, 0.45, 0.85, 0.9, 1], ease: "linear" }
    },
    dance: { y: [0, -10, 0, -5, 0], rotate: [0, -5, 5, -5, 0], transition: { repeat: Infinity, duration: 0.8 } },
    // Panic: Chỉ rung lắc nhẹ, không di chuyển x quá xa
    panic: { 
        x: [0, -5, 5, -5, 5, 0], 
        rotate: [0, -2, 2, -2, 2, 0],
        transition: { duration: 0.2, repeat: Infinity } 
    },
    peek: {
        x: [0, -120, -120, -120, 0], 
        rotate: [0, 0, 10, 0, 0], 
        transition: { duration: 6, times: [0, 0.2, 0.5, 0.8, 1] }
    },
    cleaning: { x: 0, y: 0, scaleX: 1 },
    sleeping: { x: 0, y: 5, scaleX: 1 },
    thinking: { x: 0, y: 0, scaleX: 1 }
  };

  const wheelVariants: any = {
    stopped: { rotate: 0 },
    moving: { rotate: 360, transition: { repeat: Infinity, duration: 1, ease: "linear" } },
    panic: { rotate: 720, transition: { repeat: Infinity, duration: 0.2, ease: "linear" } } 
  };
  
  const isMoving = idleAction === "walking" || idleAction === "panic" || idleAction === "peek";

  const headVariants = {
    breathing: { y: [0, -2, 0], transition: { duration: 4, repeat: Infinity } },
    dance: { rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 0.8 } },
    // Panic: Lắc đầu tại chỗ, KHÔNG dùng y để tránh bay đầu
    panic: { rotate: [0, 15, -15, 0], transition: { repeat: Infinity, duration: 0.15 } },
    peek: { rotateY: [0, 0, 30, 0], transition: { delay: 1.5, duration: 2 } },
    cleaning: { rotate: 15, y: 5 }, 
    sleeping: { y: 25, rotate: 15, transition: { duration: 1 } },
    thinking: { rotate: 15, y: 2 }
  };

  // ✅ ĐÃ FIX TAY BAY: Bỏ thuộc tính y, x lớn trong panic
  const handVariants = {
    breathing: { y: 0 },
    walking: { rotate: [0, 10, 0], transition: { repeat: Infinity, duration: 1 } },
    dance: { y: -40, rotate: [0, 45, -45, 0], transition: { repeat: Infinity, duration: 0.8 } },
    // Panic: Chỉ xoay (rotate) tại chỗ, KHÔNG dịch chuyển (x, y = 0)
    panic: { 
        y: 0, x: 0, 
        rotate: [0, 45, -45, 0], 
        transition: { repeat: Infinity, duration: 0.15 } 
    },
    cleaning: { x: [0, 30, 0, 30], y: -45, rotate: [0, 20, 0, 20], transition: { duration: 1.5, repeat: 2 } },
    sleeping: { y: 15, rotate: 45 }, 
    thinking: { y: -35, x: 10, rotate: -30 }
  };

  return (
    <div className={cn("relative flex items-center justify-center pointer-events-none overflow-visible", className)}>
      <svg viewBox="0 0 300 240" className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lensReflect" cx="30%" cy="30%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <filter id="eyeGlowFilter">
             <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
             <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dropShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/> 
            <feOffset dx="0" dy="8" result="offsetblur"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* === ROOT === */}
        <motion.g 
            variants={bodyMoveVariants}
            animate={isThinking ? "thinking" : idleAction}
            filter="url(#dropShadow)"
            style={{ originX: "150px", originY: "150px" }}
        >
            <g transform="translate(50, 0)"> 

                {/* === GROUP 1: CHÂN BÁNH XÍCH === */}
                <g transform="translate(65, 185)">
                    <rect x="10" y="10" width="50" height="10" fill={c.darkMetal} />
                    {/* Bánh Trái */}
                    <g transform="translate(-15, 0)">
                        <path d="M 15 0 L 35 0 L 45 25 L 5 25 Z" fill={c.treadDark} stroke={c.darkMetal} strokeWidth="1" rx="5" strokeLinejoin="round" />
                        <motion.g 
                            animate={isMoving ? (idleAction === "panic" ? "panic" : "moving") : "stopped"} 
                            variants={wheelVariants}
                            style={{ originX: "25px", originY: "20px" }}
                        >
                             <circle cx="25" cy="20" r="4" fill={c.treadLight} />
                             <path d="M 25 16 L 25 24 M 21 20 L 29 20" stroke="black" strokeWidth="1" />
                        </motion.g>
                        <circle cx="12" cy="20" r="3" fill={c.darkMetal} />
                        <circle cx="38" cy="20" r="3" fill={c.darkMetal} />
                    </g>
                    {/* Bánh Phải */}
                    <g transform="translate(35, 0)">
                        <path d="M 15 0 L 35 0 L 45 25 L 5 25 Z" fill={c.treadDark} stroke={c.darkMetal} strokeWidth="1" strokeLinejoin="round" />
                        <motion.g 
                            animate={isMoving ? (idleAction === "panic" ? "panic" : "moving") : "stopped"} 
                            variants={wheelVariants}
                            style={{ originX: "25px", originY: "20px" }}
                        >
                             <circle cx="25" cy="20" r="4" fill={c.treadLight} />
                             <path d="M 25 16 L 25 24 M 21 20 L 29 20" stroke="black" strokeWidth="1" />
                        </motion.g>
                        <circle cx="12" cy="20" r="3" fill={c.darkMetal} />
                        <circle cx="38" cy="20" r="3" fill={c.darkMetal} />
                    </g>
                </g>

                {/* === GROUP 2: THÂN === */}
                <g transform="translate(0, 10)">
                    <rect x="90" y="175" width="20" height="15" fill={c.darkMetal} />
                    <path d="M 55 130 L 145 130 L 140 180 L 60 180 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                    <rect x="75" y="140" width="50" height="20" rx="2" fill="#e2e8f0" />
                    <g transform="translate(80, 148)">
                        <circle cx="5" cy="5" r="3" fill={isThinking ? "#fbbf24" : "#22c55e"} />
                        <rect x="12" y="2" width="25" height="6" rx="3" fill="#cbd5e1" />
                        {isThinking && (
                            <motion.rect 
                                x="12" y="2" width="8" height="6" rx="3" fill={c.eyeLight} 
                                animate={{ x: [12, 29, 12] }} 
                                transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                            />
                        )}
                    </g>
                </g>

                {/* === GROUP 3: TAY (Đã Fix) === */}
                {/* Tay Phải */}
                <motion.g 
                    variants={handVariants}
                    animate={idleAction === "cleaning" ? "cleaning" : (isThinking ? "thinking" : (idleAction === "sleeping" ? "sleeping" : idleAction === "dance" ? "dance" : idleAction === "panic" ? "panic" : "breathing"))}
                    style={{ originX: "55px", originY: "140px" }}
                >
                     <path d="M 55 140 L 30 155 L 35 180 L 60 165 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                     <path d="M 30 155 L 20 145 L 25 140" fill="none" stroke={c.darkMetal} strokeWidth="4" strokeLinecap="round" />
                     <path d="M 30 155 L 20 165 L 25 170" fill="none" stroke={c.darkMetal} strokeWidth="4" strokeLinecap="round" />
                     {idleAction === "cleaning" && <circle cx="22" cy="155" r="12" fill="#fca5a5" opacity="0.8" />}
                </motion.g>

                {/* Tay Trái */}
                <motion.g 
                    // Fix panic cho tay trái: Chỉ rotate
                    animate={idleAction === "dance" ? { y: -40, rotate: 45 } : (idleAction === "panic" ? { rotate: [0, -45, 45, 0], transition: { repeat: Infinity, duration: 0.15 } } : { rotate: 0 })}
                    style={{ originX: "145px", originY: "140px" }}
                >
                    <path d="M 145 140 L 170 155 L 165 180 L 140 165 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                    <path d="M 170 155 L 180 145 L 175 140" fill="none" stroke={c.darkMetal} strokeWidth="4" strokeLinecap="round" />
                </motion.g>

                {/* === GROUP 4: ĐẦU === */}
                <motion.g 
                    variants={headVariants}
                    animate={isThinking ? "thinking" : idleAction}
                    style={{ originX: "100px", originY: "130px" }}
                >
                    <rect x="92" y="90" width="16" height="40" fill={c.metal} rx="2" />
                    <rect x="96" y="95" width="8" height="30" fill={c.darkMetal} opacity="0.5" />
                    <g transform="translate(0, -10)">
                        {/* Mắt Trái */}
                        <g transform="translate(-34, 0)"> 
                            <path d="M 80 50 L 115 50 Q 125 50 125 75 Q 125 100 115 100 L 80 100 Q 70 100 70 75 Q 70 50 80 50 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                            <circle cx="98" cy="75" r="20" fill={c.lensRing} />
                            <circle cx="98" cy="75" r="16" fill={c.lensGlass} />
                            <motion.circle 
                                cx="98" cy="75" r="7" fill={c.eyeLight} filter="url(#eyeGlowFilter)" 
                                animate={isThinking ? { x: [0, 5, -5, 0] } : (idleAction === "scanning" ? { x: [-8, 8, -8] } : { x: 0 })}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <circle cx="98" cy="75" r="16" fill="url(#lensReflect)" />
                            <motion.path 
                                d="M 70 60 L 125 60 L 125 35 L 70 35 Z" fill={c.darkMetal}
                                animate={{ y: eyeState.close[0], rotate: eyeState.rotate[0] }}
                            />
                        </g>
                        {/* Mắt Phải */}
                        <g transform="translate(34, 0)">
                            <path d="M 85 50 L 120 50 Q 130 50 130 75 Q 130 100 120 100 L 85 100 Q 75 100 75 75 Q 75 50 85 50 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                            <circle cx="102" cy="75" r="20" fill={c.lensRing} />
                            <circle cx="102" cy="75" r="16" fill={c.lensGlass} />
                            <motion.circle 
                                cx="102" cy="75" r="7" fill={c.eyeLight} filter="url(#eyeGlowFilter)" 
                                animate={isThinking ? { x: [0, 5, -5, 0] } : (idleAction === "scanning" ? { x: [-8, 8, -8] } : { x: 0 })}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <circle cx="102" cy="75" r="16" fill="url(#lensReflect)" />
                            <motion.path 
                                d="M 75 60 L 130 60 L 130 35 L 75 35 Z" fill={c.darkMetal}
                                animate={{ y: eyeState.close[1], rotate: eyeState.rotate[1] }}
                            />
                        </g>
                    </g>
                </motion.g>

                {/* === GROUP 5: EMOTES === */}
                <AnimatePresence>
                    {isThinking && (
                        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transform="translate(160, 40)">
                            <text x="0" y="0" fontSize="30">🤔</text>
                        </motion.g>
                    )}
                    {idleAction === "sleeping" && !isThinking && (
                        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, y: -20 }} exit={{ scale: 0 }} transform="translate(160, 40)">
                            <text x="0" y="0" fontSize="24" fill="#94a3b8" fontWeight="bold">Zzz...</text>
                        </motion.g>
                    )}
                    {idleAction === "panic" && !isThinking && (
                        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transform="translate(160, 40)">
                            <text x="0" y="0" fontSize="30">😱</text>
                        </motion.g>
                    )}
                    {idleAction === "dance" && !isThinking && (
                        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, y: [-5, 5, -5] }} exit={{ scale: 0 }} transform="translate(160, 40)" transition={{repeat: Infinity}}>
                            <text x="0" y="0" fontSize="30">🎵</text>
                        </motion.g>
                    )}
                </AnimatePresence>
            </g> 
        </motion.g>

      </svg>
    </div>
  );
}