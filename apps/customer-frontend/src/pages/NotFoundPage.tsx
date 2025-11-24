import React from "react";
import { Link } from "react-router-dom";
import { Home, RefreshCcw, Wrench } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Noise & Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto text-center">
        
        {/* --- MÁY IN "NỔI LOẠN" --- */}
        <div className="relative mb-16">
          {/* Bong bóng thoại của máy in (Hài hước) */}
          <div className="absolute -right-36 -top-8 bg-black text-white text-[10px] font-bold px-3 py-2 rounded-xl rounded-bl-none shadow-xl animate-bounce z-30 whitespace-nowrap">
            NÓNG QUÁ CHỦ TỊCH ƠI! 🔥
          </div>

          {/* Khói bốc lên (Particle effects) */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
             <span className="smoke-puff left-1/4 bg-gray-300 w-6 h-6 rounded-full absolute opacity-0"></span>
             <span className="smoke-puff left-1/2 bg-gray-400 w-8 h-8 rounded-full absolute opacity-0 delay-100"></span>
             <span className="smoke-puff left-3/4 bg-gray-200 w-5 h-5 rounded-full absolute opacity-0 delay-300"></span>
          </div>

          {/* THÂN MÁY IN (Rung lắc dữ dội) */}
          <div className="w-48 h-32 bg-slate-800 rounded-lg shadow-2xl border-b-[6px] border-slate-900 relative flex items-center justify-center mx-auto animate-hard-shake">
             
             {/* Khe giấy trên */}
             <div className="absolute top-0 w-32 h-2 bg-slate-900 rounded-b-md"></div>
             
             {/* Giấy bị kẹt (Vò nát & Xoay) */}
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-16 bg-white border border-gray-300 shadow-sm rounded-sm flex items-center justify-center p-2 transform rotate-6 animate-paper-stuck overflow-hidden">
                <div className="absolute inset-0 bg-red-50 opacity-20"></div>
                <div className="text-[8px] font-mono text-slate-400 text-center leading-tight">
                  FILE_NOT_FOUND<br/>
                  SYSTEM_OVERLOAD<br/>
                  <span className="font-bold text-red-500 text-xs">CRASH!!!</span>
                </div>
             </div>

             {/* Mắt máy in (Nhân hóa - Đang chóng mặt) */}
             <div className="flex gap-4 mb-2">
                <div className="w-8 h-2 bg-slate-900 rounded-full overflow-hidden relative">
                    <div className="w-2 h-2 bg-red-500 rounded-full absolute top-0 left-0 animate-ping"></div>
                </div>
             </div>

             {/* Logo Printz */}
             <div className="absolute bottom-2 text-slate-500 text-[9px] font-black tracking-[0.2em] opacity-50">
                 PRINTZ PRO MAX
             </div>

             {/* Đèn báo động (Nhấp nháy liên tục) */}
             <div className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-red-600 animate-ping shadow-[0_0_15px_rgba(220,38,38,0.8)] z-20"></div>
             
             {/* Giấy vụn bay ra (Particles) */}
             <div className="absolute -bottom-2 -left-4 w-3 h-3 bg-white shadow-sm rounded-sm animate-fly-debris-1"></div>
             <div className="absolute -bottom-4 -right-2 w-4 h-4 bg-white shadow-sm rounded-sm animate-fly-debris-2"></div>
          </div>
          
          {/* Bóng đổ dưới chân máy (Cũng rung theo) */}
          <div className="w-40 h-4 bg-black/10 rounded-[100%] mx-auto mt-2 blur-sm animate-pulse"></div>
        </div>

        {/* --- NỘI DUNG "MẶN MÒI" --- */}
        <div className="space-y-5">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
            404: Máy in <span className="text-red-600 underline decoration-wavy decoration-4 underline-offset-4">Đình Công!</span>
          </h1>
          
          <div className="max-w-lg mx-auto bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-left relative">
            {/* Tag mô phỏng Terminal */}
            <div className="absolute -top-3 left-4 bg-slate-900 text-green-400 text-[10px] font-mono px-2 py-1 rounded">
              console.log(error)
            </div>
            <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed mt-2">
              <span className="font-bold text-slate-900">Sự cố:</span> Trang bạn tìm không tồn tại, hoặc con A.I phụ trách in ấn đã trốn đi uống trà sữa rồi. 🥤
            </p>
            <p className="text-slate-500 text-xs mt-2 border-t border-slate-100 pt-2 italic">
              *Đội kỹ thuật đang dụ nó quay lại bằng RAM mới. Vui lòng quay xe!*
            </p>
          </div>
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link 
              to="/" 
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-full font-bold shadow-lg shadow-slate-300 hover:bg-slate-800 hover:scale-105 transition-all active:scale-95"
          >
              <Home size={18} />
              Về Trang Chủ (An Toàn)
          </Link>
          
          <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-slate-900 border-2 border-slate-200 rounded-full font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
          >
              <RefreshCcw size={18} className="animate-spin-slow" />
              Thử Vận May Lần Nữa
          </button>
        </div>

      </div>

      {/* --- CSS ANIMATIONS (Custom) --- */}
      <style>{`
        /* Rung lắc dữ dội */
        @keyframes hard-shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-3px, -2px) rotate(-2deg); }
            20% { transform: translate(-5px, 0px) rotate(3deg); }
            // 30% { transform: translate(5px, 2px) rotate(0deg); }
            // 40% { transform: translate(1px, -1px) rotate(1deg); }
            // 50% { transform: translate(-1px, 2px) rotate(-1deg); }
            // 60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(5px, 1px) rotate(-2deg); }
            // 80% { transform: translate(-1px, -1px) rotate(4deg); }
            // 90% { transform: translate(1px, 2px) rotate(0deg); }
            // 100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-hard-shake { animation: hard-shake 0.4s infinite; }

        /* Giấy kẹt co giật */
        @keyframes paper-stuck {
             0%, 100% { transform: translate(-50%, 0) rotate(6deg) scale(1); }
             50% { transform: translate(-50%, 2px) rotate(4deg) scale(0.98); }
        }
        .animate-paper-stuck { animation: paper-stuck 0.2s infinite; }

        /* Khói */
        @keyframes smoke {
            0% { transform: translateY(0) scale(0.5); opacity: 0.6; }
            100% { transform: translateY(-80px) scale(2); opacity: 0; }
        }
        .smoke-puff { animation: smoke 1.5s infinite ease-out; }

        /* Giấy vụn bay */
        @keyframes fly-debris-1 {
            0% { transform: translate(0,0) rotate(0); opacity: 1; }
            100% { transform: translate(-40px, 40px) rotate(180deg); opacity: 0; }
        }
        .animate-fly-debris-1 { animation: fly-debris-1 1s infinite linear; }

        @keyframes fly-debris-2 {
            0% { transform: translate(0,0) rotate(0); opacity: 1; }
            100% { transform: translate(40px, 30px) rotate(-180deg); opacity: 0; }
        }
        .animate-fly-debris-2 { animation: fly-debris-2 1.2s infinite linear; animation-delay: 0.5s; }

        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default NotFoundPage;