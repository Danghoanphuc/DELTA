// src/features/zin-bot/ZinAvatar.tsx
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { ZinProps } from "./types";
import { useZinBehavior } from "@/logic/useZinBehavior";
import { useZinTheme, getEyeShutterState } from "@/logic/useZinTheme";
import * as anim from "@/config/animations";

export function ZinAvatar({ 
  className, 
  isThinking = false, 
  emotion = "neutral",
  forcedAction
}: ZinProps) {
  const { isBlinking, idleAction: autoAction } = useZinBehavior(isThinking);
  const currentAction = forcedAction || autoAction;
  const isMoving = ["walking", "panic", "peek", "dance"].includes(currentAction);
  const c = useZinTheme(emotion, isThinking, currentAction);
  const eye = getEyeShutterState(currentAction, emotion, isThinking, isBlinking);

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
            <feOffset dx="0" dy="12" result="offsetblur"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <motion.g 
            variants={anim.bodyMoveVariants}
            animate={currentAction}
            filter="url(#dropShadow)"
            style={{ originX: "150px", originY: "150px" }}
        >
            <g transform="translate(50, 0)"> 
                
                {/* === CHÂN BÁNH XÍCH === */}
                <g transform="translate(65, 185)">
                    <rect x="10" y="10" width="50" height="10" fill={c.darkMetal} />
                    
                    {/* Bánh Trái */}
                    <g transform="translate(-15, 0)">
                        <path d="M 15 0 L 35 0 L 45 25 L 5 25 Z" fill={c.treadDark} stroke={c.darkMetal} strokeWidth="1" strokeLinejoin="round" />
                        <motion.g 
                            animate={isMoving ? (currentAction === "panic" ? "panic" : "moving") : "stopped"} 
                            variants={anim.wheelVariants} 
                            style={{ originX: "25px", originY: "20px" }}
                        >
                             <circle cx="25" cy="20" r="4" fill={c.treadLight} />
                             {/* ✅ FIX: Đổi màu stroke từ "black" sang c.darkMetal để không bị đen thùi lùi */}
                             <path d="M 25 16 L 25 24 M 21 20 L 29 20" stroke={c.darkMetal} strokeWidth="1.5" />
                        </motion.g>
                        <circle cx="12" cy="20" r="3" fill={c.darkMetal} />
                        <circle cx="38" cy="20" r="3" fill={c.darkMetal} />
                    </g>

                    {/* Bánh Phải */}
                    <g transform="translate(35, 0)">
                        <path d="M 15 0 L 35 0 L 45 25 L 5 25 Z" fill={c.treadDark} stroke={c.darkMetal} strokeWidth="1" strokeLinejoin="round" />
                        <motion.g 
                            animate={isMoving ? (currentAction === "panic" ? "panic" : "moving") : "stopped"} 
                            variants={anim.wheelVariants} 
                            style={{ originX: "25px", originY: "20px" }}
                        >
                             <circle cx="25" cy="20" r="4" fill={c.treadLight} />
                             {/* ✅ FIX: Đổi màu stroke */}
                             <path d="M 25 16 L 25 24 M 21 20 L 29 20" stroke={c.darkMetal} strokeWidth="1.5" />
                        </motion.g>
                        <circle cx="12" cy="20" r="3" fill={c.darkMetal} />
                        <circle cx="38" cy="20" r="3" fill={c.darkMetal} />
                    </g>
                </g>

                {/* === THÂN === */}
                <g transform="translate(0, 10)">
                    <rect x="90" y="175" width="20" height="15" fill={c.darkMetal} />
                    <path d="M 55 130 L 145 130 L 140 180 L 60 180 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                    <rect x="75" y="140" width="50" height="20" rx="2" fill="#e2e8f0" />
                    <g transform="translate(80, 148)">
                        <circle cx="5" cy="5" r="3" fill={currentAction === "panic" ? "#ef4444" : (isThinking ? "#fbbf24" : "#22c55e")} />
                        <rect x="12" y="2" width="25" height="6" rx="3" fill="#cbd5e1" />
                        {isThinking && (
                            <motion.rect x="12" y="2" width="8" height="6" rx="3" fill={c.eyeLight} animate={{ x: [12, 29, 12] }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }} />
                        )}
                    </g>
                </g>

                {/* === TAY === */}
                <motion.g variants={anim.handVariants} animate={currentAction} style={{ originX: "55px", originY: "145px" }}>
                     <path d="M 55 135 L 30 155 L 35 180 L 60 160 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                     <path d="M 30 155 L 20 145 L 25 140" fill="none" stroke={c.darkMetal} strokeWidth="4" strokeLinecap="round" />
                     <path d="M 30 155 L 20 165 L 25 170" fill="none" stroke={c.darkMetal} strokeWidth="4" strokeLinecap="round" />
                     {currentAction === "cleaning" && <circle cx="22" cy="155" r="12" fill="#fca5a5" opacity="0.8" />}
                </motion.g>
                <motion.g animate={currentAction === "dance" ? { rotate: 140 } : (currentAction === "panic" ? { rotate: -45 } : { rotate: 0 })} style={{ originX: "145px", originY: "145px" }}>
                    <path d="M 145 135 L 170 155 L 165 180 L 140 160 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                    <path d="M 170 155 L 180 145 L 175 140" fill="none" stroke={c.darkMetal} strokeWidth="4" strokeLinecap="round" />
                </motion.g>

                {/* === ĐẦU & MẮT === */}
                <motion.g variants={anim.headVariants} animate={currentAction} style={{ originX: "100px", originY: "130px" }}>
                    <rect x="92" y="90" width="16" height="45" fill={c.metal} rx="2" />
                    <rect x="96" y="95" width="8" height="35" fill={c.darkMetal} opacity="0.5" />
                    <g transform="translate(0, -10)">
                        <g transform="translate(-34, 0)"> 
                            <path d="M 80 50 L 115 50 Q 125 50 125 75 Q 125 100 115 100 L 80 100 Q 70 100 70 75 Q 70 50 80 50 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                            <circle cx="98" cy="75" r="20" fill={c.lensRing} />
                            <circle cx="98" cy="75" r="16" fill={c.lensGlass} />
                            {currentAction !== "sleeping" && (
                                <motion.circle cx="98" cy="75" r="7" fill={c.eyeLight} filter="url(#eyeGlowFilter)" animate={isThinking ? { x: [0, 5, -5, 0] } : (currentAction === "scanning" ? { x: [-8, 8, -8] } : { x: 0 })} transition={{ duration: 2, repeat: Infinity }} />
                            )}
                            <circle cx="98" cy="75" r="16" fill="url(#lensReflect)" />
                            <motion.path d="M 70 60 L 125 60 L 125 35 L 70 35 Z" fill={c.darkMetal} animate={{ y: eye.close[0], rotate: eye.rotate[0] }} />
                        </g>
                        <g transform="translate(34, 0)">
                            <path d="M 85 50 L 120 50 Q 130 50 130 75 Q 130 100 120 100 L 85 100 Q 75 100 75 75 Q 75 50 85 50 Z" fill={c.body} stroke={c.metal} strokeWidth="2" />
                            <circle cx="102" cy="75" r="20" fill={c.lensRing} />
                            <circle cx="102" cy="75" r="16" fill={c.lensGlass} />
                            {currentAction !== "sleeping" && (
                                <motion.circle cx="102" cy="75" r="7" fill={c.eyeLight} filter="url(#eyeGlowFilter)" animate={isThinking ? { x: [0, 5, -5, 0] } : (currentAction === "scanning" ? { x: [-8, 8, -8] } : { x: 0 })} transition={{ duration: 2, repeat: Infinity }} />
                            )}
                            <circle cx="102" cy="75" r="16" fill="url(#lensReflect)" />
                            <motion.path d="M 75 60 L 130 60 L 130 35 L 75 35 Z" fill={c.darkMetal} animate={{ y: eye.close[1], rotate: eye.rotate[1] }} />
                        </g>
                    </g>
                </motion.g>

                {/* === EMOTES === */}
                <AnimatePresence>
                    {isThinking && (
                        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transform="translate(160, 40)">
                            <text x="0" y="0" fontSize="30">🤔</text>
                        </motion.g>
                    )}
                    {!isThinking && currentAction === "sleeping" && (
                        <motion.g initial={{ scale: 0 }} animate={{ scale: 1, y: -20 }} exit={{ scale: 0 }} transform="translate(160, 40)">
                            <text x="0" y="0" fontSize="24" fill="#94a3b8" fontWeight="bold">Zzz</text>
                        </motion.g>
                    )}
                    {!isThinking && currentAction === "panic" && (
                        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transform="translate(160, 40)">
                            <text x="0" y="0" fontSize="30">😱</text>
                        </motion.g>
                    )}
                    {!isThinking && currentAction === "dance" && (
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