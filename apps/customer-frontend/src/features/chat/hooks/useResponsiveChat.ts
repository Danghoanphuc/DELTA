// src/features/chat/hooks/useResponsiveChat.ts
// Custom hook để handle responsive design và mobile-first layout

import { useState, useEffect } from "react";

export function useResponsiveChat() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Mobile: < 768px
      setIsTablet(width >= 768 && width < 1024); // Tablet: 768px - 1024px

      // Auto-collapse sidebar on mobile/tablet
      if (width < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Initial check
    checkScreenSize();

    // Listen for resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return {
    isMobile,
    isTablet,
    sidebarCollapsed,
    toggleSidebar,
    // Computed values for safe layout
    sidebarWidth: isMobile ? '100%' : isTablet ? '280px' : '320px',
    mainContentMaxWidth: isMobile ? '100%' : 'none',
  };
}
