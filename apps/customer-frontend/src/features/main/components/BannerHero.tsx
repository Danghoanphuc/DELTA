import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

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
      image:
        "https://images.unsplash.com/photo-1634942537034-2531766767d1?q=80&w=2000&auto=format&fit=crop",
      title: "Nhận Diện Thương Hiệu",
      subtitle: "Định hình đẳng cấp doanh nghiệp 2026.",
      cta: "Khám phá BST",
      id: "01",
    },
    {
      image:
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=2000&auto=format&fit=crop",
      title: "Bao Bì Bền Vững",
      subtitle: "Giải pháp giấy tái chế thân thiện môi trường.",
      cta: "Xem giải pháp",
      id: "02",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      6000
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
        "relative w-full overflow-hidden select-none bg-stone-100",
        heightClass,
        className
      )}
    >
      {/* 1. Hình ảnh nền: Scale nhẹ nhàng */}
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
            className="h-full w-full object-cover transition-transform duration-[8000ms] ease-out scale-105"
            style={{ transform: i === index ? "scale(1.1)" : "scale(1.0)" }}
          />
          {/* Gradient lớp phủ: Mềm mại hơn, không đen kịt */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent mix-blend-multiply" />
        </div>
      ))}

      {/* 2. Nội dung: Canh giữa theo chiều dọc */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-20 lg:px-32">
        <div
          key={index}
          className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          {/* Tagline nhỏ */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-8 bg-white/60"></div>
            <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-white/90">
              Printz Studio &trade;
            </span>
          </div>

          {/* Tiêu đề lớn: Serif sang trọng */}
          <h2 className="mb-4 font-serif text-5xl font-medium leading-[1.1] text-white md:text-7xl lg:text-8xl tracking-tight">
            {current.title}
            <span className="text-primary">.</span>
          </h2>

          <p className="mb-8 max-w-lg font-sans text-base font-light text-white/90 md:text-lg leading-relaxed border-l-2 border-primary pl-4">
            {current.subtitle}
          </p>

          <Button className="h-12 rounded-full bg-white px-8 font-sans text-sm font-bold text-black transition-transform hover:scale-105 hover:bg-stone-100">
            {current.cta} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 3. Điều hướng: Dots tinh tế thay vì số khối */}
      <div className="absolute bottom-8 left-6 md:left-20 z-30 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === index ? "w-8 bg-primary" : "w-2 bg-white/50 hover:bg-white"
            )}
          />
        ))}
      </div>
    </div>
  );
};
