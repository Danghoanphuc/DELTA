// apps/customer-frontend/src/features/social/components/SocialChatWindow/hooks/useVisualViewport.ts
// ✅ Custom hook để handle visual viewport (mobile keyboard)

import { useState, useEffect } from "react";

export function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleResize = () => {
      setViewportHeight(window.visualViewport?.height);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  return viewportHeight;
}

