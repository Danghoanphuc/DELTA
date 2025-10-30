// src/features/landing/components/sections/LPSocialProof.tsx (CẬP NHẬT)

export function LPSocialProof() {
  const partners = [
    "In Tiến Đạt",
    "In Hồng Đức",
    "In Thiên Phú",
    "In Minh Khai",
    "In Quốc Việt",
    "In An Phát",
    "Xưởng In 247",
    "In Nhanh Siêu Việt",
    "Sài Gòn Print",
  ];

  // Nhân đôi danh sách để tạo hiệu ứng lặp mượt mà
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-12 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-600 mb-8 fade-in-up">
          Đối tác nhà in uy tín
        </p>

        <div className="w-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10"></div>

          {/* 1. SỬA TỪ 'animate-marquee-fast' THÀNH 'animate-marquee' */}
          <div className="flex w-max animate-marquee">
            {duplicatedPartners.map((partner, index) => (
              <div
                key={index}
                className="px-8 py-3 text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0"
                style={{ minWidth: "180px" }} // Đảm bảo các item có độ rộng
              >
                <span className="text-lg font-medium">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
