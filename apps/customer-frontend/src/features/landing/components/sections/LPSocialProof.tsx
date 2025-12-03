// --- COMPONENT CHÍNH ---

export function LPSocialProof() {
  // Logo các đối tác
  const partners = [
    "HEIDELBERG",
    "HP INDIGO",
    "CANON",
    "KONICA MINOLTA",
    "FOGRA CERTIFIED",
    "RICOH",
    "FUJIFILM",
    "KOMORI",
  ];

  return (
    <section className="py-12 border-b border-stone-200 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 mb-6">
        <p className="text-stone-500 font-medium text-sm tracking-widest uppercase text-center">
          Trusted Infrastructure
        </p>
      </div>

      {/* Băng truyền chạy chậm */}
      <div className="relative">
        <div className="flex animate-marquee-slow">
          {/* Nhân đôi danh sách để tạo hiệu ứng liền mạch */}
          {[...partners, ...partners].map((p, i) => (
            <span
              key={i}
              className="text-xl font-bold font-serif text-stone-800 tracking-tighter grayscale opacity-60 mix-blend-multiply px-12 whitespace-nowrap"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-slow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee-slow {
          animation: marquee-slow 40s linear infinite;
        }
        
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
