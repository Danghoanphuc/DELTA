export function LPSocialProof() {
  // Heritage Network
  const partners = [
    "GỐM BÁT TRÀNG (14TH CENTURY)",
    "SƠN MÀI HẠ THÁI",
    "ĐÚC ĐỒNG ĐẠI BÁI",
    "LỤA VẠN PHÚC",
    "TRẦM HƯƠNG KHÁNH HÒA",
    "GỐM CHU ĐẬU",
    "MỘC KIM BỒNG",
    "QUỲ VÀNG KIÊU KỴ",
  ];

  return (
    <section className="py-12 border-b border-stone-200 bg-stone-50 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 mb-6">
        <p className="text-amber-900 font-bold text-xs tracking-[0.3em] uppercase text-center flex items-center justify-center gap-4">
          <span className="w-8 h-[1px] bg-amber-900/30"></span>
          The Heritage Network
          <span className="w-8 h-[1px] bg-amber-900/30"></span>
        </p>
      </div>

      {/* Băng truyền chạy chậm */}
      <div className="relative">
        <div className="flex animate-marquee-slow">
          {[...partners, ...partners].map((p, i) => (
            <span
              key={i}
              className="text-lg font-bold font-serif text-stone-400 tracking-wider hover:text-stone-900 transition-colors cursor-default px-12 whitespace-nowrap"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 60s linear infinite;
        }
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
