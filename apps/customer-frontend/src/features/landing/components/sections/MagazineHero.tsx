import { Play } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router-dom";

export function MagazineHero() {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-stone-900">
      {/* 1. VIDEO BACKGROUND - Cái hồn của Tạp chí */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-stone-900/20 z-10" />{" "}
        {/* Overlay làm tối để nổi chữ */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-80"
          poster="https://res.cloudinary.com/da3xfws3n/video/upload/so_0,f_jpg,q_auto:low/v1765900394/1216_ljztet.jpg"
        >
          <source
            src="https://res.cloudinary.com/da3xfws3n/video/upload/q_auto:low,vc_h264/v1765900394/1216_ljztet.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* 2. NỘI DUNG CHÍNH - Triết lý Giám tuyển */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="inline-block py-1 px-3 border border-white/30 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold tracking-[0.2em] text-white uppercase mb-6">
            The Artisan Issue No.01
          </span>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-[1.1] text-shadow-lg">
            "Chạm Vào Vẻ Đẹp <br />
            <span className="italic text-amber-200">Nguyên Bản</span>"
          </h1>

          <p className="text-lg md:text-xl text-stone-200 font-light max-w-2xl mx-auto mb-10 leading-relaxed text-shadow-sm">
            Trong thế giới công nghiệp. chúng tôi tìm về những giá trị thủ công
            thuần khiết nhất. Nơi mỗi tác phẩm là một dấu ấn độc bản của nghệ
            nhân..
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              onClick={() => navigate("/shop")}
              className="h-14 px-10 bg-white text-stone-900 hover:bg-amber-50 rounded-sm font-bold text-sm tracking-widest uppercase transition-all shadow-xl hover:scale-105"
            >
              Khám phá Bộ sưu tập
            </Button>

            <Button
              onClick={() =>
                document
                  .getElementById("editors-pick")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              variant="outline"
              className="h-14 px-8 border-white bg-white/10 text-white hover:bg-white hover:text-stone-900 rounded-sm font-bold text-sm tracking-widest uppercase backdrop-blur-sm transition-all"
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              Xem Phim Ngắn
            </Button>
          </div>
        </div>
      </div>

      {/* 3. SCROLL INDICATOR */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <span className="text-white/50 text-xs uppercase tracking-widest">
          Cuộn để đọc
        </span>
      </div>
    </section>
  );
}
