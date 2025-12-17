// src/components/PageLoader.tsx
import { useEffect, useState } from "react";
import { useSplashStore } from "@/stores/useSplashStore";

const PageLoader = ({
  isLoading = false,
  mode = "loading",
}: {
  isLoading?: boolean;
  mode?: "splash" | "loading";
}) => {
  const { hasShownSplash, setHasShownSplash } = useSplashStore();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (mode === "splash" && !hasShownSplash) {
      const timeout = setTimeout(() => {
        setHasShownSplash(true);
        setVisible(false);
      }, 2500);
      return () => clearTimeout(timeout);
    } else if (!isLoading) {
      setVisible(false);
    }
  }, [mode, isLoading, hasShownSplash]);

  if (!visible && !isLoading) return null;

  return (
    // STYLE: Giấy dó Cream, Logo Serif, Animation mượt
    <div className="fixed inset-0 z-[9999] bg-[#F9F8F6] flex items-center justify-center transition-opacity duration-700 animate-out fade-out">
      {/* Texture nền */}
      <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

      <div className="text-center relative z-10">
        {/* LOGO ANIMATION */}
        <h1 className="font-serif text-5xl md:text-6xl text-stone-900 font-bold tracking-tight mb-4 animate-in zoom-in duration-1000">
          Printz<span className="text-amber-800">.</span>
        </h1>

        <div className="flex flex-col items-center gap-3">
          <div className="h-[2px] w-12 bg-amber-800/50 rounded-full" />
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-stone-500 animate-pulse">
            Printz
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
