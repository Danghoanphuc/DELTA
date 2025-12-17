// apps/customer-frontend/src/features/magazine/MagazineHomePage.tsx
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Header, Footer } from "@/features/landing/components";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowRight,
  Compass,
  Wind,
  Droplet,
  Flame,
  Mountain,
  Sparkles,
  Gem,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

// --- COMPONENTS CON (HELPER) ---

// 1. Hiệu ứng hạt giấy (Grainy Texture) - Tạo cảm giác giấy in
const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

// 2. Component Animation (Reveal) - Hiệu ứng xuất hiện mượt mà
const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- DỮ LIỆU MẪU ---

const PILLARS = [
  {
    id: "triet-ly-song",
    title: "Triết Lý Sống",
    subtitle: "Zen & Mindfulness",
    desc: "Tìm lại sự tĩnh tại giữa dòng chảy hỗn mang.",
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=800&fit=crop",
    colSpan: "lg:col-span-2",
  },
  {
    id: "goc-giam-tuyen",
    title: "Góc Giám Tuyển",
    subtitle: "Curator's Eye",
    desc: "Những tiêu chuẩn khắt khe sau tấm màn nhung.",
    img: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800&h=800&fit=crop",
    colSpan: "lg:col-span-1",
  },
  {
    id: "cau-chuyen-di-san",
    title: "Di Sản Việt",
    subtitle: "Heritage Stories",
    desc: "Tiếng vọng từ ngàn xưa trong hình hài đương đại.",
    img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&h=600&fit=crop",
    colSpan: "lg:col-span-3",
  },
];

const ELEMENTS = [
  {
    id: "kim",
    name: "Kim",
    label: "Kim",
    icon: Gem,
    color: "bg-slate-200 text-slate-800",
    img: "https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=800",
  },
  {
    id: "moc",
    name: "Mộc",
    label: "Mộc",
    icon: Wind,
    color: "bg-emerald-100 text-emerald-900",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800",
  },
  {
    id: "thuy",
    name: "Thủy",
    label: "Thủy",
    icon: Droplet,
    color: "bg-blue-100 text-blue-900",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800",
  },
  {
    id: "hoa",
    name: "Hỏa",
    label: "Hỏa",
    icon: Flame,
    color: "bg-rose-100 text-rose-900",
    img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800",
  },
  {
    id: "tho",
    name: "Thổ",
    label: "Thổ",
    icon: Mountain,
    color: "bg-amber-100 text-amber-900",
    img: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?q=80&w=800",
  },
];

export default function MagazineHomePage() {
  const containerRef = useRef(null);
  // State cho phần Ngũ Hành (Hover đổi nền)
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const activeElementData =
    ELEMENTS.find((e) => e.id === activeElement) || ELEMENTS[0];

  return (
    <div
      ref={containerRef}
      className="bg-[#FDFCF8] min-h-screen font-sans selection:bg-amber-200 selection:text-amber-900"
    >
      <NoiseOverlay />
      <Header />

      {/* --- HERO SECTION: FIXED & REDESIGNED (STYLE VOGUE/KINFOLK) --- */}
      <section className="relative h-[95vh] w-full overflow-hidden flex flex-col items-center justify-center bg-stone-900 text-white">
        {/* Lớp Ảnh Nền (Background Image) - Có Overlay tối để làm nổi chữ */}
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1507646227500-4d389b0012be?q=80&w=1800"
            alt="Magazine Cover"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Gradient overlay để đảm bảo tương phản */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-stone-950/60" />
        </div>

        {/* Nội dung chính (Z-index cao hơn ảnh) */}
        <div className="relative z-10 w-full max-w-[1400px] h-full flex flex-col px-4 md:px-8 py-20">
          {/* 1. MASTHEAD: TÊN TẠP CHÍ (Hiệu ứng Mix-blend đẳng cấp) */}
          <div className="flex-none pt-12 md:pt-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-serif text-[13vw] md:text-[160px] leading-[0.8] tracking-tighter text-stone-100 mix-blend-overlay select-none"
            >
              THE CURATOR
            </motion.h1>
          </div>

          {/* 2. COVER LINES (Thông tin phụ 2 bên) */}
          <div className="flex-1 flex flex-row justify-between items-center w-full pointer-events-none opacity-80 mix-blend-screen">
            <div className="hidden md:block border-l border-white/30 pl-4 py-2 text-left">
              <p className="font-mono text-xs uppercase tracking-[0.3em] mb-1">
                Vol. 01
              </p>
              <p className="font-serif italic text-lg">2025 Edition</p>
            </div>
            <div className="hidden md:block border-r border-white/30 pr-4 py-2 text-right">
              <p className="font-mono text-xs uppercase tracking-[0.3em] mb-1">
                Issue
              </p>
              <p className="font-serif italic text-lg">The Heritage</p>
            </div>
          </div>

          {/* 3. MAIN HEADLINE (Tiêu đề bài viết chính - Nằm dưới cùng) */}
          <div className="flex-none pb-12 md:pb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <p className="font-serif italic text-2xl md:text-3xl text-amber-200/90 mb-4 font-light">
                Ấn phẩm đặc biệt
              </p>
              <h2 className="font-serif text-5xl md:text-8xl text-white leading-tight drop-shadow-2xl mb-8">
                Nghệ Thuật <br className="md:hidden" />
                <span className="font-light italic text-stone-100">
                  Giao Hảo
                </span>
              </h2>

              <Link
                to="#kham-pha"
                className="inline-block px-10 py-4 border border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-stone-900 transition-all duration-300 uppercase tracking-[0.2em] text-xs font-medium"
              >
                Khám phá ngay
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-b from-transparent via-white/50 to-transparent"
          animate={{ height: ["0%", "30%", "0%"], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </section>

      {/* --- SECTION 1: BENTO GRID (TRỤ CỘT TINH THẦN) --- */}
      <section
        id="kham-pha"
        className="py-32 px-4 md:px-8 max-w-[1400px] mx-auto"
      >
        <Reveal className="mb-20 text-center">
          <span className="text-amber-800 font-mono text-xs tracking-[0.3em] uppercase block mb-4">
            Mục lục tâm hồn
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-stone-900 italic">
            Ba Trụ Cột Tinh Thần
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[450px]">
          {PILLARS.map((item, index) => (
            <Reveal
              key={item.id}
              delay={index * 0.1}
              className={cn(
                "group relative overflow-hidden rounded-sm cursor-pointer shadow-sm hover:shadow-2xl transition-shadow duration-500",
                item.colSpan
              )}
            >
              <Link
                to={`/tap-chi/${item.id}`}
                className="block w-full h-full relative"
              >
                {/* Image Scale Effect */}
                <div className="absolute inset-0 bg-stone-900">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber-200 mb-3 block">
                      {item.subtitle}
                    </span>
                    <h3 className="font-serif text-4xl md:text-5xl mb-4 leading-none">
                      {item.title}
                    </h3>
                    <p className="text-white/80 font-light text-lg max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- SECTION 2: NGŨ HÀNH (ĐÃ FIX MÀU CHỮ & CONTRAST) --- */}
      <section
        className="relative py-32 bg-slate-900 overflow-hidden text-white transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: activeElement ? undefined : "#0f172a" }}
      >
        {/* Background Dynamic */}
        <AnimatePresence mode="wait">
          {activeElement && (
            <motion.div
              key={activeElement}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-0"
            >
              <img
                src={activeElementData.img}
                className="w-full h-full object-cover filter blur-lg scale-110"
                alt=""
              />
              <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-20">
          {/* Left: Intro */}
          <div className="flex-1 text-center lg:text-left">
            <Reveal>
              <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center mb-8 mx-auto lg:mx-0 bg-white/5 backdrop-blur-md">
                <Sparkles className="w-8 h-8 text-amber-200" />
              </div>

              <h2 className="font-serif text-5xl md:text-7xl mb-6 text-white leading-tight">
                <span className="block text-slate-400 text-2xl md:text-3xl mb-3 font-sans font-light uppercase tracking-[0.2em]">
                  Ngũ Hành
                </span>
                <span className="italic text-amber-100">Tinh Hoa</span>
              </h2>

              <p className="text-xl text-slate-300 max-w-lg mx-auto lg:mx-0 mb-10 font-light leading-relaxed">
                Vạn vật sinh ra từ 5 nguyên tố. Chúng tôi phân loại quà tặng dựa
                trên năng lượng của chất liệu để phù hợp với bản mệnh người
                nhận.
              </p>

              <Button
                variant="outline"
                className="bg-white text-slate-900 hover:bg-amber-100 hover:text-slate-900 border-none uppercase tracking-[0.2em] text-xs py-7 px-10 transition-all shadow-lg hover:shadow-xl font-bold"
              >
                Khám phá bộ sưu tập
              </Button>
            </Reveal>
          </div>

          {/* Right: Interactive Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
            {ELEMENTS.map((el, i) => (
              <Reveal key={el.id} delay={i * 0.1}>
                <Link
                  to={`/tap-chi/ngu-hanh/${el.id}`}
                  onMouseEnter={() => setActiveElement(el.id)}
                  onMouseLeave={() => setActiveElement(null)}
                  className={cn(
                    "group relative h-48 border border-white/10 flex flex-col items-center justify-center gap-4 transition-all duration-500 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-sm overflow-hidden",
                    activeElement === el.id &&
                      "bg-white/20 border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-105 z-10"
                  )}
                >
                  <el.icon
                    className={cn(
                      "w-10 h-10 transition-colors duration-300",
                      activeElement === el.id
                        ? "text-amber-200"
                        : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <div className="text-center z-10">
                    <span
                      className={cn(
                        "font-serif text-3xl block transition-colors duration-300",
                        activeElement === el.id
                          ? "text-white"
                          : "text-slate-300"
                      )}
                    >
                      {el.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-slate-400 mt-1 block">
                      {el.label}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}

            <Reveal delay={0.5}>
              <Link
                to="/tap-chi"
                className="h-48 flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-amber-500/50 text-slate-500 hover:text-amber-200 transition-all duration-300 group"
              >
                <div className="p-4 rounded-full border border-white/5 group-hover:bg-amber-900/20 mb-3">
                  <ArrowRight className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-widest">
                  Xem tất cả
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: NEWSLETTER (CLEAN & MINIMAL) --- */}
      <section className="py-40 px-4 text-center bg-[#FDFCF8]">
        <Reveal>
          <Compass className="w-10 h-10 mx-auto mb-8 text-stone-300" />
          <h3 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 italic">
            Bản tin Di sản
          </h3>
          <p className="text-stone-500 mb-12 font-light">
            Chỉ gửi những điều đẹp đẽ nhất vào ngày Rằm hàng tháng.
          </p>

          <div className="max-w-lg mx-auto relative group">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="w-full bg-transparent border-b border-stone-300 py-4 pr-20 outline-none text-stone-900 placeholder:text-stone-300 text-xl font-serif focus:border-amber-800 transition-colors"
            />
            <button className="absolute right-0 top-0 bottom-0 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-amber-800 transition-colors">
              Gửi đi
            </button>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
