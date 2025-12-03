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
    // Logic tắt splash sau 2.5s thay vì chạy dòng lệnh
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
    // STYLE: Full screen Cream, Logo chính giữa, Fade out effect
    <div className="fixed inset-0 z-[9999] bg-[#F9F8F6] flex items-center justify-center transition-opacity duration-700 animate-out fade-out">
      <div className="text-center">
        {/* LOGO ANIMATION */}
        <h1 className="font-serif text-5xl md:text-6xl text-stone-900 italic tracking-tight mb-4 animate-in zoom-in duration-1000">
          Printz.
        </h1>

        <div className="flex flex-col items-center gap-2">
          <div className="h-px w-16 bg-stone-900/20" />
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-stone-400">
            System Loading
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
