// Utility to track all navigation calls for debugging
// Usage: Wrap navigate() calls with trackNavigate()

let navigationHistory: Array<{
  timestamp: number;
  from: string;
  to: string;
  source: string;
}> = [];

export function trackNavigate(
  to: string,
  source: string,
  navigate: (to: string, options?: any) => void,
  options?: any
) {
  const from = window.location.pathname;
  const timestamp = Date.now();

  navigationHistory.push({ timestamp, from, to, source });

  console.log(`[Navigation] ${source}: ${from} → ${to}`, {
    options,
    history: navigationHistory.slice(-5), // Last 5 navigations
  });

  navigate(to, options);
}

export function getNavigationHistory() {
  return navigationHistory;
}

export function clearNavigationHistory() {
  navigationHistory = [];
}
