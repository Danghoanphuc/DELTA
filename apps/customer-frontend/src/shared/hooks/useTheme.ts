import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // If theme is explicitly saved, use it; otherwise use system preference
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    setIsDark(shouldBeDark);

    // Apply theme to document
    const root = document.documentElement;
    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Listen for system theme changes when no explicit preference is saved
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    // Only listen to system changes if no explicit theme is saved
    if (savedTheme === null) {
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        const root = document.documentElement;
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    const root = document.documentElement;
    if (newTheme) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { isDark, toggleTheme };
};
