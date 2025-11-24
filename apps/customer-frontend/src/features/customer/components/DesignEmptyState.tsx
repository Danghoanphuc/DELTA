import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Paintbrush, ImagePlus, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export const DesignEmptyState = () => {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  
  // State để kiểm soát xem có đang dùng chuột không (mặc định là false để chạy animation trước)
  const [isMouseActive, setIsMouseActive] = useState(false);

  useEffect(() => {
    // 1. Kiểm tra xem thiết bị có dùng chuột (pointer: fine) không
    const mediaQuery = window.matchMedia('(pointer: fine)');
    
    const handleMouseMove = (e: MouseEvent) => {
      // Nếu là lần đầu di chuột, set state để tắt animation CSS
      if (!isMouseActive) setIsMouseActive(true);

      const updateEye = (eye: HTMLDivElement) => {
        if (!eye) return;
        const rect = eye.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        // Giới hạn bán kính di chuyển con ngươi (10px)
        const distance = Math.min(10, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 5);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        // JS can thiệp trực tiếp
        eye.style.transform = `translate(${x}px, ${y}px)`;
      };

      updateEye(leftEyeRef.current!);
      updateEye(rightEyeRef.current!);
    };

    // Chỉ add sự kiện nếu là thiết bị có chuột
    if (mediaQuery.matches) {
        window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMouseActive]);

  return (
    <div className="relative py-20 px-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 text-center overflow-hidden group hover:border-blue-200 transition-colors duration-300 selection:bg-none">
      
      {/* Background Decor */}
      <div className="absolute top-10 left-10 text-slate-200 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
         <Paintbrush size={80} strokeWidth={1} />
      </div>
      <div className="absolute bottom-10 right-10 text-slate-200 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
         <ImagePlus size={80} strokeWidth={1} />
      </div>

      <div className="relative z-10 max-w-md mx-auto flex flex-col items-center">
        
        {/* --- CẶP MẮT THẦN THÁNH --- */}
        <div className="flex gap-4 mb-8">
            {/* Mắt Trái */}
            <div className="w-16 h-16 bg-white rounded-full border-[3px] border-slate-900 flex items-center justify-center shadow-sm relative overflow-hidden">
                <div 
                    ref={leftEyeRef} 
                    // Nếu ĐANG dùng chuột -> bỏ class animation để JS điều khiển
                    // Nếu KHÔNG dùng chuột (Mobile) -> chạy class animate-look-around
                    className={`w-6 h-6 bg-slate-900 rounded-full relative will-change-transform ${isMouseActive ? 'transition-transform duration-75 ease-out' : 'animate-look-around'}`}
                >
                    <div className="absolute top-1 right-1.5 w-2 h-2 bg-white rounded-full opacity-90"></div>
                </div>
            </div>
            
            {/* Mắt Phải */}
            <div className="w-16 h-16 bg-white rounded-full border-[3px] border-slate-900 flex items-center justify-center shadow-sm relative overflow-hidden">
                <div 
                    ref={rightEyeRef} 
                    className={`w-6 h-6 bg-slate-900 rounded-full relative will-change-transform ${isMouseActive ? 'transition-transform duration-75 ease-out' : 'animate-look-around'}`}
                    // Thêm delay nhẹ cho mắt phải khi ở chế độ Mobile cho nó "lác" nhẹ tự nhiên hơn
                    style={!isMouseActive ? { animationDelay: '0.1s' } : {}} 
                >
                    <div className="absolute top-1 right-1.5 w-2 h-2 bg-white rounded-full opacity-90"></div>
                </div>
            </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-3">
          Kho ý tưởng đang trống trơn!
        </h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
           {isMouseActive 
             ? "Chúng tôi đang dõi theo con trỏ chuột của bạn để xem ý tưởng tuyệt vời nào sắp xuất hiện."
             : "Chúng tôi đang ngó nghiêng khắp nơi mà chưa thấy thiết kế nào của bạn cả."}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full sm:w-auto">
          <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 hover:scale-105 transition-transform">
            <Link to="/templates">
              <Plus size={16} className="mr-2" />
              Dùng mẫu có sẵn
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="bg-white border-slate-200 hover:bg-slate-50" asChild>
            <Link to="/design/new">
              <Paintbrush size={16} className="mr-2" />
              Tự vẽ từ đầu
            </Link>
          </Button>
        </div>
      </div>

      {/* CSS Animation cho Mobile (Nhìn tùm lum) */}
      <style>{`
        @keyframes look-around {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-8px, -5px); } /* Nhìn trái trên */
          25% { transform: translate(8px, 0px); }   /* Nhìn phải */
          40% { transform: translate(-5px, 8px); }  /* Nhìn dưới trái */
          60% { transform: translate(6px, -6px); }  /* Nhìn phải trên */
          75% { transform: translate(0, 8px); }     /* Nhìn xuống đất */
          90% { transform: translate(-6px, 0); }    /* Nhìn trái */
          100% { transform: translate(0, 0); }
        }
        .animate-look-around {
            animation: look-around 5s infinite cubic-bezier(0.45, 0, 0.55, 1);
        }
      `}</style>
    </div>
  );
};