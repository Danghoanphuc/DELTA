// apps/customer-frontend/src/components/OfflineIndicator.tsx

import { WifiOff } from "lucide-react";
import { useState, useEffect } from "react";

export const OfflineIndicator = () => {
  // Bắt đầu với trạng thái hiện tại của kết nối
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Listener cho sự kiện online/offline
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Nếu đang online thì không hiện gì cả
  if (!isOffline) return null;

  return (
    // Hiển thị cố định ở góc dưới bên trái, z-index cao (trên cùng)
    <div className="fixed bottom-4 left-4 z-[9999] bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-up-custom border-l-4 border-red-500 max-w-sm">
      
      {/* Icon xoay chậm, màu đỏ cảnh báo */}
      <div className="bg-white/10 p-2 rounded-full flex items-center justify-center">
        <WifiOff size={24} className="animate-spin-slow text-red-400" />
      </div>
      
      <div>
        <h4 className="font-bold text-sm uppercase tracking-wider text-red-300">
          MẤT KẾT NỐI
        </h4>
        <p className="text-xs text-slate-300 font-mono">
          Đang dò tìm tín hiệu xưởng in...
        </p>
      </div>
      
      {/* CSS Animation: Slide Up khi xuất hiện và Spin chậm */}
      <style>{`
        @keyframes slideUpCustom {
            0% { transform: translateY(100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up-custom { animation: slideUpCustom 0.5s ease-out forwards; }
        
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};