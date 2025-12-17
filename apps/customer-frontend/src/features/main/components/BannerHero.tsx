import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BannerHeroProps {
  className?: string;
  aspectRatio?: "default" | "superSlim";
}

export const BannerHero = ({
  className = "",
  aspectRatio = "default",
}: BannerHeroProps) => {
  const slides = [
    {
      id: "01",
      image:
        "https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=2000&auto=format&fit=crop", // Ảnh gốm tối màu
      title: "Tinh Hoa Giao Hảo",
      subtitle:
        "Bộ sưu tập quà tặng ngoại giao dành riêng cho đối tác chiến lược.",
      cta: "Xem Bộ Sưu Tập",
    },
    {
      id: "02",
      image:
        "https://images.unsplash.com/photo-1606103920295-9a091573f160?q=80&w=2000&auto=format&fit=crop", // Ảnh trà/zen
      title: "Gói Quà Tĩnh Tại",
      subtitle: "Gửi gắm sự bình an và thấu hiểu qua hương trầm và trà đạo.",
      cta: "Khám Phá Ngay",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      8000 // Chậm lại cho sang
    );
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];

  const heightClass =
    aspectRatio === "superSlim"
      ? "h-[250px] md:h-[300px]"
      : "h-[450px] md:h-[550px]";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden select-none bg-stone-900",
        heightClass,
        className
      )}
    >
      {/* 1. Hình ảnh nền */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover transition-transform duration-[10000ms] ease-out scale-105"
            style={{ transform: i === index ? "scale(1.1)" : "scale(1.0)" }}
          />
          {/* Overlay màu phim cũ + noise */}
          <div className="absolute inset-0 bg-stone-900/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* 2. Nội dung */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-20 lg:px-24">
        <div
          key={index}
          className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="h-[1px] w-12 bg-amber-500/80"></div>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-500">
              An Nam Curator
            </span>
          </div>

          <h2 className="mb-6 font-serif text-5xl font-medium leading-[1.1] text-[#F9F8F6] md:text-7xl tracking-wide">
            {current.title}
          </h2>

          <p className="mb-10 max-w-lg font-sans text-base font-light text-stone-200 md:text-lg leading-relaxed border-l border-amber-500/50 pl-6">
            {current.subtitle}
          </p>

          <Button className="h-14 rounded-sm bg-amber-800 hover:bg-amber-900 px-10 font-bold uppercase tracking-widest text-xs text-white transition-all shadow-lg hover:shadow-amber-900/20">
            {current.cta} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 3. Điều hướng */}
      <div className="absolute bottom-8 right-6 md:right-20 z-30 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1 transition-all duration-500",
              i === index
                ? "w-8 bg-amber-500"
                : "w-4 bg-white/30 hover:bg-white"
            )}
          />
        ))}
      </div>
    </div>
  );
};
