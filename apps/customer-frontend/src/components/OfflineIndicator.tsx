// src/components/OfflineIndicator.tsx
import { WifiOff, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    // STYLE CHANGE: Full width bottom bar hoặc Box cảnh báo gắt (Brutal)
    <div className="fixed bottom-6 left-6 z-[9999] animate-in slide-in-from-bottom-4">
      <div className="bg-red-600 text-white p-4 min-w-[300px] border-4 border-black shadow-[8px_8px_0px_0px_#000000]">
        <div className="flex items-start gap-3">
          <div className="bg-black/20 p-2">
            <WifiOff size={24} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-mono text-lg font-black uppercase tracking-widest leading-none mb-1">
              SYSTEM OFFLINE
            </h4>
            <p className="font-mono text-[10px] uppercase opacity-90">
              Connection lost. Reconnecting...
            </p>
          </div>
        </div>
        {/* Pattern kẻ sọc để tăng độ 'Industrial' */}
        <div className="mt-3 h-2 w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjYjkwMTAxIi8+CjxwYXRoIGQ9Ik0wIDhMMCAwTDggOCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-30"></div>
      </div>
    </div>
  );
};
