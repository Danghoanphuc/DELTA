import { MapPin, Navigation, Copy } from "lucide-react";

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

        {/* MAP CONTAINER - CÓ VIỀN ĐEN + BO GÓC LỚN */}
        <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border-2 border-stone-900 shadow-xl">
          {/* 1. LỚP BẢN ĐỒ (IFRAME) */}
          <iframe
            // 👇 Link Map View (Chế độ bản đồ phẳng)
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.123456789!2d106.608333!3d11.083333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d1xxxxxxxxxx%3A0x123456789!2sTh%E1%BB%A7%20D%E1%BA%A7u%20M%E1%BB%99t%2C%20B%C3%ACnh%20D%C6%B0%C6%A1ng!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            // ✨ BỘ LỌC PACDORA "XỊN" (Sáng, Mát, Có màu nhẹ):
            // - saturate-[0.3]: Giảm màu vàng chóe xuống còn 30%.
            // - hue-rotate-[190deg]: Chuyển tông màu sang xanh dương mát mắt.
            // - brightness-[1.05]: Tăng độ sáng để map nhìn sạch sẽ.
            className="w-full h-full filter saturate-[0.3] hue-rotate-[190deg] brightness-[1.05] contrast-[0.95]"
          ></iframe>

          {/* 2. LỚP THẺ NỔI (CARD) - CÓ VIỀN ĐEN */}
          <div className="absolute top-6 left-6 bg-white p-5 rounded-xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,0.1)] max-w-[280px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Tiêu đề Box */}
            <div className="border-b border-stone-100 pb-3 mb-3">
              <h3 className="font-bold text-stone-900 text-[11px] uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Trụ sở chính
              </h3>
            </div>

            <div className="space-y-1 mb-4">
              <h4 className="font-bold text-base text-stone-900">
                PRINTZ SOLUTIONS
              </h4>
              <p className="text-stone-500 text-xs leading-relaxed font-medium">
                Đường DK6A, Phường Thới Hòa,
                <br />
                TP. Hồ Chí Minh.
              </p>
            </div>

            {/* Nút bấm */}
            <div className="flex gap-2">
              <a
                // Link chỉ đường (Google Maps App)
                href="https://www.google.com/maps/search/?api=1&query=Đường+DK6A,+Phường+Thới+Hòa"
                target="_blank"
                className="flex-1 inline-flex justify-center items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-stone-900 hover:bg-emerald-800 py-2.5 px-3 rounded-md transition-colors"
              >
                <Navigation className="w-3 h-3" /> Chỉ đường
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    "Đường DK6A, Phường Thới Hòa, TP. Hồ Chí Minh"
                  );
                  alert("Đã copy địa chỉ!");
                }}
                className="inline-flex justify-center items-center p-2.5 text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md transition-colors"
                title="Copy địa chỉ"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. PIN VỊ TRÍ (Custom Pin ở giữa) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-8 pointer-events-none">
            <div className="relative group">
              {/* Pin Head */}
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl border-[3px] border-white z-10 relative">
                <MapPin className="w-6 h-6 fill-white" />
              </div>
              {/* Pin Tail */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-600 rotate-45 border-r-[3px] border-b-[3px] border-white"></div>
              {/* Shadow dưới đất */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/20 rounded-[100%] blur-[2px]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
