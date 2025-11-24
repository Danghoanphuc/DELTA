import { Button } from "@/shared/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";

export function LPHero() {
  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-100">
      {/* Nền Grid Xanh Nhẹ nhàng */}
      <div className="absolute inset-0 bg-grid-blue"></div>
      
      {/* Hiệu ứng Glow mềm mại (giống App) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT: CONTENT */}
          <div className="space-y-8 fade-in-up">
            {/* Tagline: Xanh Printz */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-600 uppercase tracking-wide">
              <Sparkles className="w-3 h-3 text-blue-500 fill-blue-500" />
              Hệ sinh thái in ấn 4.0
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Thiết kế Online. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                In ấn Tức thì.
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Kết nối trực tiếp thiết kế của bạn với hệ thống máy in công nghiệp hàng đầu. Chất lượng chuẩn xác, trải nghiệm mượt mà như mua sắm trên sàn TMĐT.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {/* Nút Primary: Gradient Blue-Purple (Giống App) */}
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-7 text-lg rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 border-0"
              >
                <Link to="/app">
                  <Zap className="mr-2 w-5 h-5 fill-white" />
                  Bắt đầu ngay
                </Link>
              </Button>
              
              {/* Nút Secondary */}
              <Button
                asChild
                variant="outline"
                className="px-8 py-7 text-lg rounded-2xl border-2 border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 bg-white/80 backdrop-blur"
              >
                <Link to="/chat">
                  Chat với AI Zin
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-slate-500 pt-4">
               <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
               </div>
               <p><span className="font-bold text-slate-900">2.000+</span> Doanh nghiệp tin dùng</p>
            </div>
          </div>

          {/* RIGHT: VISUAL - App Mockup bay lơ lửng */}
          <div className="relative hidden lg:block fade-in-up" style={{ animationDelay: '200ms' }}>
             <div className="relative z-10 animate-float">
                {/* Giả lập khung cửa sổ App */}
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
                    <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <div className="ml-4 flex-1 h-6 bg-white rounded-md border border-slate-200 shadow-sm"></div>
                    </div>
                    {/* Placeholder ảnh App - Bạn thay link ảnh thật vào đây */}
                    <div className="aspect-[16/10] bg-slate-100 relative group overflow-hidden">
                        <ImageWithFallback 
                          src="https://cdn.dribbble.com/userupload/16538183/file/original-a82987113110530743b573511100366b.png?resize=1200x900&vertical=center" 
                          alt="Printz App Dashboard" 
                          className="w-full h-full object-cover" 
                        />
                        {/* Hiệu ứng quét sáng khi hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                </div>

                {/* Floating Elements (Mấy cái thẻ bay bay) */}
                <div className="absolute -right-8 top-16 bg-white p-3 rounded-xl shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                    <div className="w-20 h-28 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex flex-col items-center justify-center border border-cyan-200">
                        <div className="w-8 h-8 rounded-full bg-white mb-2 shadow-sm flex items-center justify-center">🎨</div>
                        <span className="text-[10px] font-bold text-cyan-800">Design</span>
                    </div>
                </div>
                <div className="absolute -left-6 bottom-20 bg-white p-3 rounded-xl shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                    <div className="w-28 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex flex-col items-center justify-center border border-purple-200">
                        <span className="text-xs font-bold text-purple-800 mb-1">In Nhanh 2h</span>
                         <div className="h-1.5 w-16 bg-white rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-purple-500"></div>
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