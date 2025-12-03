import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";

export function LPHero() {
  return (
    <section className="relative bg-[#F9F8F6] min-h-[90vh] flex items-center overflow-hidden">
      {/* TEXTURE OVERLAY (Giả giấy) */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="w-full max-w-[1440px] mx-auto grid lg:grid-cols-2 h-full">
        {/* LEFT: Editorial Content */}
        <div className="relative z-10 px-8 py-20 lg:p-24 flex flex-col justify-center border-r border-stone-200/50">
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-stone-500 uppercase mb-8">
            Est. 2025 — Printz Corporate
          </span>

          <h1 className="font-yrsa text-6xl md:text-8xl text-stone-900 leading-[0.95] tracking-tight mb-8">
            Make it <br />
            <span className="italic font-light">Real.</span>
          </h1>

          <p className="text-xl text-stone-600 font-light leading-relaxed max-w-md mb-12">
            Nền tảng quản trị thương hiệu vật lý dành cho doanh nghiệp hiện đại.
            Từ danh thiếp đến bao bì, chúng tôi đảm bảo sự hoàn hảo trong từng
            điểm chạm.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Button
              asChild
              className="bg-stone-900 text-white hover:bg-emerald-900 rounded-none px-10 py-7 text-base font-medium tracking-wide transition-all duration-300"
            >
              <Link to="/business">Giải pháp Doanh nghiệp</Link>
            </Button>
            <Link
              to="/shop"
              className="group flex items-center gap-2 px-4 py-3 text-stone-900 font-bold border-b-2 border-transparent hover:border-stone-900 transition-all"
            >
              Xem mẫu sản phẩm{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* RIGHT: Product Showcase (Tràn viền) */}
        <div className="relative h-[50vh] lg:h-auto bg-stone-200 overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1629079377484-82a0889c2522?q=80&w=2000&auto=format&fit=crop"
            className="w-full h-full object-cover grayscale-[20%] contrast-[1.1] hover:scale-105 transition-transform duration-[2s] ease-out"
            alt="Luxury Business Card"
          />

          {/* Badge "Luxe" */}
          <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur px-6 py-4 border border-stone-100 max-w-xs">
            <p className="font-serif text-lg italic text-stone-900">
              "Printz Luxe Paper"
            </p>
            <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider">
              600gsm • Cotton Texture • Foil
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
