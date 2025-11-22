// src/features/chat/components/BannerHero.tsx
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

interface BannerHeroProps {
  className?: string;
  // Chấp nhận mọi string để tránh lỗi type, nhưng gợi ý các giá trị chuẩn
  aspectRatio?: "video" | "wide" | "slim" | "superSlim" | "auto" | string; 
}

export const BannerHero = ({ 
  className = "", 
  aspectRatio = "superSlim" 
}: BannerHeroProps) => {
  const slides = [
    {
      image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763440704/thi%E1%BA%BFt_k%E1%BA%BF_cho_t%C3%B4i_banner_web_to_print_gi%E1%BB%9Bi_thi%E1%BB%87u_v%E1%BB%81_s%E1%BB%B1_ki%E1%BB%87n_ra_m%E1%BA%AFt_n%E1%BB%81n_t%E1%BA%A3ng_PRINTZ.VN_in_%E1%BA%A5n_tr%E1%BB%B1c_tuy%E1%BA%BFn_leh8il.jpg",
      alt: "Banner Printz - Giải pháp AI",
    },
    {
      image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763440574/thi%E1%BA%BFt_k%E1%BA%BF_cho_t%C3%B4i_banner_web_to_print_gi%E1%BB%9Bi_thi%E1%BB%87u_v%E1%BB%81_s%E1%BB%B1_ki%E1%BB%87n_gi%E1%BA%A3m_gi%C3%A1_c%C3%A1c_s%E1%BA%A3n_ph%E1%BA%A9m_in_%E1%BA%A5n_cho_ng%C3%A0y_nh%C3%A0_gi%C3%A1o_vi%E1%BB%87t_nam_20_11_r4zmqs.jpg",
      alt: "Banner Printz - Studio sáng tạo",
    },
     {
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763440876/thi%E1%BA%BFt_k%E1%BA%BF_cho_t%C3%B4i_banner_web_to_print_gi%E1%BB%9Bi_thi%E1%BB%87u_v%E1%BB%81_s%E1%BB%B1_ki%E1%BB%87n_gi%E1%BA%A3m_gi%C3%A1_c%C3%A1c_s%E1%BA%A3n_ph%E1%BA%A9m_in_%E1%BA%A5n_cho_t%E1%BA%BFt_d%C6%B0%C6%A1ng_l%E1%BB%8Bch_2026_bkssjn.jpg",
      alt: "Banner Printz - Studio sáng tạo",
    },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];

  // Map tỷ lệ
  const ratioMap: Record<string, string> = {
    video: "aspect-video",
    wide: "aspect-[2/1]",
    slim: "aspect-[2.5/1]",
    // ✅ Mobile: 3/1, Desktop: 6/1 (An toàn hơn 7/1)
    superSlim: "aspect-[3/1] md:aspect-[6/1]", 
    auto: "",
  };

  // ✅ FALLBACK AN TOÀN: Nếu không tìm thấy key, dùng aspect-video
  const ratioClass = ratioMap[aspectRatio] || "aspect-video";

  return (
    <div className={cn(
      "w-full overflow-hidden relative shadow-sm group bg-gray-200", 
      // ✅ Thêm min-h để đảm bảo không bao giờ bị mất hình (Mobile min 120px, Desktop min 200px)
      "min-h-[120px] md:min-h-[180px]",
      ratioClass,
      className
    )}>
      {/* Overlay nhẹ */}
      <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none" />
      
      <img
        src={current.image}
        alt={current.alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
        {slides.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm",
              i === index ? "w-6 bg-white" : "w-2 bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
};