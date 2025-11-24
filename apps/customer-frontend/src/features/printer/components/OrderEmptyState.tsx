// src/features/printer/components/OrderEmptyState.tsx
import { Radar, Share2, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function OrderEmptyState() {
  return (
    <div className="py-16 text-center bg-white rounded-xl border border-slate-100 shadow-sm">
      
      {/* Radar Animation */}
      <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-50 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-30"></div>
        <div className="relative bg-white p-4 rounded-full shadow-sm border border-blue-100 z-10">
           <Radar size={40} className="text-blue-600 animate-[spin_4s_linear_infinite]" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2">
        Hệ thống đang tìm kiếm đơn hàng...
      </h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-6 text-sm">
        Trong lúc chờ tiếng "Ting Ting", hãy chắc chắn rằng hồ sơ của bạn đã đủ hấp dẫn hoặc chia sẻ cửa hàng ngay.
      </p>

      {/* Actionable Buttons for Printer */}
      <div className="inline-flex flex-col gap-2 w-full max-w-xs px-4">
        <Button variant="outline" className="w-full justify-start text-slate-600 hover:text-blue-600 hover:border-blue-200 group">
           <Share2 size={16} className="mr-2 group-hover:scale-110 transition-transform" />
           Chia sẻ Link Cửa Hàng lên Facebook
        </Button>
        <Button variant="outline" className="w-full justify-start text-slate-600 hover:text-orange-600 hover:border-orange-200 group">
           <Zap size={16} className="mr-2 group-hover:scale-110 transition-transform" />
           Chạy Flash Sale giảm giá 10%
        </Button>
      </div>
    </div>
  );
}