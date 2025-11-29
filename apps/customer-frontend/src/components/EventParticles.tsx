import { useEventTheme } from "../hooks/useEventTheme";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

/**
 * EventParticles - Hiệu ứng particles nhẹ nhàng
 * Không che nội dung, chỉ tạo mood
 */
export const EventParticles = () => {
  const { activeEvent, hasActiveEvent } = useEventTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!hasActiveEvent || !activeEvent) {
      setParticles([]);
      return;
    }

    // Map event ID to emoji
    const emojiMap: Record<string, string[]> = {
      tet: ["🧧", "🎊", "🏮", "🌸"],
      valentine: ["💝", "💕", "🌹", "💖"],
      "women-day": ["🌸", "🌺", "🌷", "💐"],
      "mid-autumn": ["🏮", "🥮", "🌕", "⭐"],
      christmas: ["🎄", "🎅", "⛄", "🎁"],
      "black-friday": ["⚡", "💥", "🔥", "💰"],
    };

    const emojis = emojiMap[activeEvent.theme.id] || ["✨"];

    // Tạo 8 particles (ít thôi, không làm rối)
    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10,
      size: 0.8 + Math.random() * 0.4,
    }));

    setParticles(newParticles);
  }, [hasActiveEvent, activeEvent]);

  if (particles.length === 0) {
    return null;
  }

  return (
    <div className="event-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            fontSize: `${particle.size}rem`,
            opacity: 0.6,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};
