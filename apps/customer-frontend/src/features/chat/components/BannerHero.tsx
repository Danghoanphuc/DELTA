// features/chat/components/BannerHero.tsx (CẬP NHẬT)
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

interface BannerHeroProps {
  className?: string;
}

export const BannerHero = ({ className = "" }: BannerHeroProps) => {
  const slides = [
    {
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763440704/thi%E1%BA%BFt_k%E1%BA%BF_cho_t%C3%B4i_banner_web_to_print_gi%E1%BB%9Bi_thi%E1%BB%87u_v%E1%BB%81_s%E1%BB%B1_ki%E1%BB%87n_ra_m%E1%BA%AFt_n%E1%BB%81n_t%E1%BA%A3ng_PRINTZ.VN_in_%E1%BA%A5n_tr%E1%BB%B1c_tuy%E1%BA%BFn_leh8il.jpg",
      alt: "Banner Printz - Giải pháp AI",
    },
    {
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763440574/thi%E1%BA%BFt_k%E1%BA%BF_cho_t%C3%B4i_banner_web_to_print_gi%E1%BB%9Bi_thi%E1%BB%87u_v%E1%BB%81_s%E1%BB%B1_ki%E1%BB%87n_gi%E1%BA%A3m_gi%C3%A1_c%C3%A1c_s%E1%BA%A3n_ph%E1%BA%A9m_in_%E1%BA%A5n_cho_ng%C3%A0y_nh%C3%A0_gi%C3%A1o_vi%E1%BB%87t_nam_20_11_r4zmqs.jpg",
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
  }, []);
  const current = slides[index];

  return (
    <div className={cn("w-full aspect-[2/1] rounded-lg overflow-hidden relative", className)}>
      <img
        src={current.image}
        alt={current.alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-6 rounded-full ${
              i === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};