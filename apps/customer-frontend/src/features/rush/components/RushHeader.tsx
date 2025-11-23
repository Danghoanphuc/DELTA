import { Zap } from "lucide-react";

export const RushHeader = () => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-6 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 -mx-6">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
        <Zap size={18} fill="currentColor" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-900 leading-none">Printz Express</h1>
        <p className="text-xs text-gray-500">In gấp lấy ngay trong ngày</p>
      </div>
    </div>
    <div className="hidden md:flex items-center gap-4 text-xs font-medium text-gray-500">
       <span className="flex items-center gap-1">🟢 150+ Nhà in online</span>
       <span className="flex items-center gap-1">⚡ Avg. 2h</span>
    </div>
  </div>
);