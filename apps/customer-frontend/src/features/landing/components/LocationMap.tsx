import { MapPin, Navigation } from "lucide-react";

export function LocationMap() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-10 text-center">
          <span className="text-emerald-800 font-bold tracking-widest uppercase text-xs mb-3 block">
            Visit Us
          </span>
          <h2 className="font-serif text-4xl text-stone-900">
            Vị trí của chúng tôi
          </h2>
        </div>

        {/* MAP CONTAINER */}
        <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-stone-200 shadow-2xl">
          {/* 1. LỚP BẢN ĐỒ (IFRAME) */}
          {/* Mẹo: Dùng grayscale-100 để bản đồ thành đen trắng nhìn cho 'Tây' */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.657969874453!2d106.6637653!3d10.9891823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d115b81d7729%3A0xf0289b52e5d7a6!2zVHAuIFRo4bunIEThuqd1IE3hu5l0LCBCw6xuaCBEdiA8!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
          ></iframe>

          {/* 2. LỚP THẺ NỔI (FLOATING CARD) - Giống mẫu Pacdora */}
          <div className="absolute top-6 left-6 md:top-10 md:left-10 bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-100 max-w-xs md:max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                <MapPin
                  className="w-5 h-5 text-emerald-800"
                  fill="currentColor"
                  fillOpacity={0.2}
                />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider mb-1">
                  PRINTZ SOLUTIONS CO., LTD
                </h3>
                <p className="text-stone-500 text-xs leading-relaxed mb-4">
                  Số 123 Đại lộ Bình Dương, P. Phú Thọ, <br />
                  TP. Thủ Dầu Một, Bình Dương.
                </p>

                <a
                  href="https://goo.gl/maps/placeholder"
                  target="_blank"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-stone-900 hover:bg-emerald-800 py-2 px-4 rounded-full transition-colors"
                >
                  <Navigation className="w-3 h-3" /> Chỉ đường
                </a>
              </div>
            </div>
          </div>

          {/* 3. PIN GIẢ (Nằm giữa màn hình để trang trí nếu muốn) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative">
              <span className="absolute -inset-4 bg-emerald-500/30 rounded-full animate-ping"></span>
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <MapPin className="w-6 h-6" />
              </div>
              {/* Cái mũi tên nhỏ chỉ xuống */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-600 rotate-45 border-r-4 border-b-4 border-white"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
