// features/shop/components/PacdoraBanner.tsx
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface PacdoraBannerProps {
  onSearch: (term: string) => void;
}

export const PacdoraBanner = ({ onSearch }: PacdoraBannerProps) => {
  const [term, setTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term);
  };

  return (
    // 🔥 GIẢM HEIGHT: min-h-[240px], giảm padding p-6 md:p-8
    // 🔥 ĐỔI NỀN: Dùng gradient nhẹ màu xanh tím nhạt (đặc trưng Web2Print) thay vì xám xịt
    <div className="rounded-[24px] bg-gradient-to-br from-[#F8F9FF] to-[#EBF4FF] border border-blue-50 p-6 md:p-8 relative overflow-hidden flex items-center min-h-[240px]">
      
      {/* Background Decoration (Hạt grain hoặc pattern mờ) */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Content Column (7 phần) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-blue-100 shadow-sm w-fit">
            <Sparkles size={12} className="text-blue-600" />
            <span className="text-[11px] font-bold text-blue-700 tracking-wide uppercase">Printz Studio AI</span>
          </div>

          {/* 🔥 COPY MỚI: Tập trung vào giá trị thật */}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
             Từ bản vẽ 3D đến <span className="text-blue-600">sản phẩm thực tế</span>
          </h1>
          
          <p className="text-sm text-slate-600 max-w-lg leading-relaxed">
            Truy cập kho thư viện mockup bao bì, tem nhãn và ấn phẩm văn phòng khổng lồ. Tùy chỉnh trực quan, báo giá tức thì và in ấn giao ngay.
          </p>

          {/* Search Bar - Nhỏ gọn hơn */}
          <form onSubmit={handleSearch} className="relative max-w-md w-full mt-2">
            <div className="relative flex items-center">
              <div className="absolute left-3 text-gray-400 pointer-events-none">
                <Search size={18} />
              </div>
              <Input 
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="pl-10 pr-12 h-11 rounded-xl border-gray-200 shadow-sm focus-visible:ring-blue-500 bg-white text-sm transition-all hover:border-blue-300"
                placeholder="Tìm kiếm hộp giấy, túi zip, namecard..."
              />
              <Button 
                size="icon" 
                type="submit"
                className="absolute right-1 top-1 h-9 w-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                 <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        </div>

        {/* Image Column (5 phần) - Cần ảnh minh họa Web2Print xịn hơn */}
        <div className="hidden lg:block lg:col-span-5 relative h-full min-h-[200px]">
           {/* Thay bằng ảnh thật của sản phẩm in ấn */}
           <img 
              src="https://placehold.co/600x400/png?text=Product+Mockup" 
              className="absolute right-0 bottom-[-40px] w-full object-contain drop-shadow-xl transform hover:scale-105 transition-transform duration-700"
              alt="Printz Mockup Collection"
           />
        </div>
      </div>
    </div>
  );
};