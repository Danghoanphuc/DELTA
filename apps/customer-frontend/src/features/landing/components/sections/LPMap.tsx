import { MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { VietnamMap } from "@/shared/components/VietnamMap";

export function LPMap() {
  // Tọa độ các điểm trên bản đồ Việt Nam (tương đối theo khung hình chữ nhật đứng)
  const activePoints = [
    { top: "15%", left: "45%", label: "Hà Nội", status: "active" },
    { top: "18%", left: "55%", label: "Hải Phòng", status: "active" },
    { top: "45%", left: "60%", label: "Đà Nẵng", status: "active" },
    { top: "75%", left: "40%", label: "TP.HCM", status: "active" }, // Hotspot chính
    { top: "73%", left: "48%", label: "Biên Hòa", status: "active" },
    { top: "82%", left: "35%", label: "Cần Thơ", status: "pending" },
  ];

  return (
    // Sử dụng màu nền Giấy Dó từ globals.css (hoặc hardcode màu kem ấm)
    <section className="py-24 bg-[#F9F8F6] text-stone-900 overflow-hidden relative border-t border-stone-200">
      {/* Texture giấy dó mờ (Nền) */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-8 grid lg:grid-cols-12 gap-16 items-center">
        {/* LEFT: CONTENT (Editorial Style) */}
        <div className="lg:col-span-5 relative z-10">
          {/* Badge kiểu con dấu */}
          <div className="inline-flex items-center gap-2 mb-8 border-b-2 border-stone-900 pb-1">
            <span className="w-2 h-2 rounded-full bg-[#C63321] animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-stone-900 uppercase">
              Live Coverage
            </span>
          </div>

          <h2 className="font-serif text-5xl md:text-6xl text-stone-900 mb-8 leading-[1.1]">
            Mang thương hiệu <br />
            <span className="italic text-[#C63321]">đi khắp Việt Nam.</span>
          </h2>

          <p className="font-sans text-xl text-stone-600 font-light leading-relaxed mb-10">
            Từ những đô thị sầm uất đến các tỉnh thành xa xôi. Printz là "đôi
            chân" đưa thông điệp của bạn hiện diện tại 63 tỉnh thành với sự
            chính xác tuyệt đối.
          </p>

          {/* Stats - Style tạp chí (Số to, nét mảnh) */}
          <div className="flex gap-12 border-t border-stone-300 pt-8 mb-12">
            <div>
              <p className="text-4xl font-serif font-bold text-stone-900 mb-2">
                63
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                Tỉnh thành
              </p>
            </div>
            <div>
              <p className="text-4xl font-serif font-bold text-stone-900 mb-2">
                100%
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                Nghiệm thu hình ảnh
              </p>
            </div>
            <div>
              <p className="text-4xl font-serif font-bold text-stone-900 mb-2">
                24h
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                Xử lý đơn gấp
              </p>
            </div>
          </div>

          {/* CTA Button - Đỏ son */}
          <Button className="bg-[#C63321] hover:bg-[#A02010] text-[#F9F8F6] px-10 py-7 rounded-none font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            Kích hoạt phủ sóng thương hiệu{" "}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <p className="mt-4 text-xs font-mono text-stone-400 italic">
            *Bắt đầu hành trình chinh phục thị trường của bạn ngay hôm nay.
          </p>
        </div>

        {/* RIGHT: MAP VISUALIZATION (Vietnam Silhouette) */}
        <div className="lg:col-span-7 relative h-[700px] w-full flex items-center justify-center">
          {/* Nền Grid mờ màu mực tàu nhạt */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(28,25,23,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(28,25,23,0.03)_1px,transparent_1px)] bg-[size:60px_60px] rounded-3xl border border-stone-200"></div>

          {/* KHUNG BẢN ĐỒ VIỆT NAM (Container) */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden">
            {/* Static Map Background - Mapbox Static Image API (Free tier) */}
            <div className="absolute inset-0">
              <img
                src="https://api.mapbox.com/styles/v1/mapbox/light-v11/static/106.6297,16.0544,5,0/800x700@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
                alt="Vietnam Map"
                className="w-full h-full object-cover grayscale opacity-25"
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#F9F8F6]/60 via-transparent to-[#F9F8F6]/60"></div>
            </div>

            {/* Vietnam Silhouette overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[400px] h-full">
                <VietnamMap className="w-full h-full opacity-15" />

                {/* Các điểm Hotspots (Màu Đỏ Son) */}
                {activePoints.map((point, index) => (
                  <div
                    key={index}
                    className="absolute group/point"
                    style={{ top: point.top, left: point.left }}
                  >
                    {/* Vòng lan tỏa (Pulse) - Đỏ loãng */}
                    <div className="absolute -inset-4 bg-[#C63321]/10 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    <div className="absolute -inset-2 bg-[#C63321]/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-75"></div>

                    {/* Điểm chính (Dot) - Đỏ son đậm */}
                    <div className="relative w-3 h-3 rounded-full bg-[#C63321] shadow-[0_0_10px_rgba(198,51,33,0.5)] border border-[#F9F8F6]"></div>

                    {/* Label kiểu bản đồ quy hoạch */}
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/point:opacity-100 transition-all duration-500 flex items-center">
                      <div className="h-px w-8 bg-stone-900"></div>
                      <span className="ml-2 font-serif font-bold text-stone-900 text-lg whitespace-nowrap bg-[#F9F8F6] px-2 py-1 shadow-sm border border-stone-200">
                        {point.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FLOATING CARD: Nghiệm thu (Style bưu thiếp/giấy) */}
          <div className="absolute bottom-12 right-0 md:right-12 bg-white p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-stone-200 max-w-sm rotate-3 hover:rotate-0 transition-transform duration-500 duration-700 ease-out">
            {/* Ghim giấy (Visual trick) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#C63321] shadow-sm z-10"></div>

            <div className="flex items-start gap-4">
              <div className="mt-1 w-10 h-10 rounded-none border border-stone-200 flex items-center justify-center bg-stone-50 text-[#C63321]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-stone-900">
                  Giao hàng thành công
                </p>
                <p className="font-mono text-[10px] text-stone-400 uppercase tracking-widest mb-3">
                  Vừa xong • 14:30 PM
                </p>

                <div className="space-y-2 border-l-2 border-[#C63321] pl-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                    <MapPin className="w-3 h-3 text-[#C63321]" />
                    CN Quận 1, TP.HCM
                  </div>
                  <p className="text-sm text-stone-900">
                    Đã nhận đủ: <strong>500/500</strong> Giftsets
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
