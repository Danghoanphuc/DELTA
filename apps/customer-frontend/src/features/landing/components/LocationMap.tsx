import { MapPin, Navigation } from "lucide-react";

export function LocationMap() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8 text-center">
          <span className="text-emerald-800 font-bold tracking-widest uppercase text-xs mb-3 block">
            Visit Us
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900">
            Vị trí của chúng tôi
          </h2>
        </div>

        {/* MAP CONTAINER */}
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-stone-100 shadow-lg">
          {/* 1. LỚP BẢN ĐỒ (IFRAME) */}
          <iframe
            // 👇 Link chuẩn Phúc vừa gửi
            src="https://www.google.com/maps/embed?pb=!1m13!1m11!1m3!1d526.061925288212!2d106.6364624000473!3d11.09032946471015!2m2!1f0!2f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1svi!2s!4v1765465707774!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            // ✨ STYLE PACDORA CỐ ĐỊNH (Đã bỏ hover):
            // Luôn giữ grayscale và độ sáng cao để map nhìn sạch, sang.
            className="w-full h-full filter grayscale contrast-[0.9] brightness-[1.05]"
          ></iframe>

          {/* 2. LỚP THẺ NỔI (FLOATING CARD) */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/95 backdrop-blur-md p-5 rounded-lg shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-stone-50 max-w-[280px] md:max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-1">
                  PRINTZ SOLUTIONS
                </h3>
                {/* 👇 Địa chỉ text chuẩn */}
                <p className="text-stone-500 text-xs leading-relaxed mb-3 font-medium">
                  Đường DK6A, Phường Thới Hòa, <br />
                  TP. Hồ Chí Minh.
                </p>

                <a
                  href="https://goo.gl/maps/placeholder" // Phúc có thể thay link Google Maps view tại đây
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-stone-900 hover:bg-emerald-800 py-1.5 px-3 rounded-sm transition-colors"
                >
                  <Navigation className="w-3 h-3" /> Chỉ đường
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
