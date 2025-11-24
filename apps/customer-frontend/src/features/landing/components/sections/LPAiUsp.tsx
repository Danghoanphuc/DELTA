import { Button } from "@/shared/components/ui/button";
import { Sparkles, MessageCircle, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import zinAvatar from "@/assets/img/zin-avatar.svg";

export function LPAiUsp() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Gradient Deep Blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>
      
      {/* Orbs trang trí */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: Text */}
          <div className="fade-in-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full border border-white/20 text-xs font-medium text-purple-300 mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Zin AI Assistant 2.0</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
              Trợ lý thiết kế <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Thông minh & Tận tâm.
              </span>
            </h2>
            
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Gặp gỡ Zin - AI được đào tạo chuyên sâu về in ấn. Zin giúp bạn kiểm tra lỗi file, gợi ý chất liệu giấy và tối ưu chi phí in ấn trong tích tắc.
            </p>

            <Button
              onClick={() => navigate("/chat")}
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-6 rounded-2xl font-bold text-lg shadow-xl shadow-white/10 transition-all hover:scale-105"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Chat với Zin ngay
            </Button>
          </div>

          {/* RIGHT: Chat UI (Glassmorphism) */}
          <div className="relative fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
               {/* Chat Header */}
               <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
                     <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={zinAvatar} alt="Zin" className="w-full h-full object-cover" />
                     </div>
                  </div>
                  <div>
                     <h4 className="text-white font-bold text-lg">Zin AI</h4>
                     <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-slate-400 text-xs">Đang trực tuyến</span>
                     </div>
                  </div>
               </div>

               {/* Chat Bubbles */}
               <div className="space-y-4 font-sans">
                  {/* Zin Msg */}
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-xs text-white">Z</div>
                     <div className="bg-white/10 text-slate-100 p-4 rounded-2xl rounded-tl-none border border-white/5 max-w-[85%]">
                        Chào bạn! 👋 Mình có thể giúp gì cho dự án in ấn của bạn hôm nay?
                     </div>
                  </div>

                  {/* User Msg */}
                  <div className="flex gap-3 flex-row-reverse">
                     <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-lg max-w-[85%]">
                        Mình muốn in 500 hộp giấy, loại nào rẻ mà vẫn sang trọng nhỉ?
                     </div>
                  </div>

                   {/* Zin Msg + Suggestion */}
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-xs text-white">Z</div>
                     <div className="space-y-2 max-w-[90%]">
                        <div className="bg-white/10 text-slate-100 p-4 rounded-2xl rounded-tl-none border border-white/5">
                           Với số lượng 500, mình đề xuất dòng <b>Giấy Ivory 300gsm</b>. Cán màng mờ sẽ giúp hộp sang hơn và chống nước nhẹ.
                        </div>
                        {/* Product Suggestion Card */}
                        <div className="bg-slate-800/80 p-3 rounded-xl border border-white/10 flex gap-3 items-center hover:bg-slate-800 transition-colors cursor-pointer">
                           <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0"></div>
                           <div className="flex-1">
                              <p className="text-white text-sm font-bold">Hộp Ivory 300 - Cán mờ</p>
                              <p className="text-blue-400 text-xs">Giá ước tính: 4.500đ/hộp</p>
                           </div>
                           <Button size="sm" variant="ghost" className="text-white hover:bg-white/20"><ArrowRight className="w-4 h-4"/></Button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}