import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import vietnamMap from "@/assets/img/vietnam.webp"; // Giữ nguyên ảnh map

export function LPMap() {
  // Heritage Hotspots
  const branches = [
    { id: 1, name: "Hạ Thái (Sơn mài)", top: "20%", left: "32%" }, // Hà Nội
    { id: 2, name: "Phù Lãng (Gốm)", top: "18%", left: "34%" }, // Bắc Ninh
    { id: 3, name: "Phường Đúc (Đồng)", top: "45%", left: "42%" }, // Huế
    { id: 4, name: "Tiên Phước (Trầm)", top: "52%", left: "48%" }, // Quảng Nam
    { id: 5, name: "An Nam Hub", top: "75%", left: "36%" }, // HCM/Bình Dương
  ];

  return (
    <section className="py-24 bg-[#F5F2EB] text-stone-900 overflow-hidden relative border-t border-stone-200">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 grid lg:grid-cols-12 gap-16 items-center">
        {/* LEFT: CONTENT */}
        <div className="lg:col-span-5 relative z-10">
          <div className="inline-flex items-center gap-2 mb-8 border-b-2 border-stone-900 pb-1">
            <span className="w-2 h-2 rounded-full bg-amber-800 animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-stone-900 uppercase">
              Heritage Connection
            </span>
          </div>

          <h2 className="font-serif text-5xl md:text-6xl text-stone-900 mb-8 leading-[1.1]">
            Kết tinh Di sản Việt. <br />
            <span className="italic text-amber-800">Vươn tầm thế giới.</span>
          </h2>

          <p className="font-sans text-xl text-stone-600 font-light leading-relaxed mb-10">
            Từ những lò nung đỏ lửa miền Bắc đến những rừng trầm sâu thẳm miền
            Trung, An Nam Curator kết nối tinh hoa của 63 tỉnh thành về một mối.
          </p>

          <div className="flex gap-12 border-t border-stone-300 pt-8 mb-12">
            <div>
              <p className="text-4xl font-serif font-bold text-stone-900 mb-2">
                12+
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                Làng nghề di sản
              </p>
            </div>
            <div>
              <p className="text-4xl font-serif font-bold text-stone-900 mb-2">
                100%
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                Thủ công mỹ nghệ
              </p>
            </div>
          </div>

          <Button className="bg-stone-900 hover:bg-amber-900 text-[#F9F8F6] px-10 py-7 rounded-sm font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            Khám phá bản đồ di sản <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        {/* RIGHT: MAP CONTAINER */}
        <div className="lg:col-span-7 relative h-[700px] w-full flex items-center justify-center">
          <div className="relative w-full h-full max-w-[500px]">
            <img
              src={vietnamMap}
              alt="Vietnam Map"
              className="w-full h-full object-contain opacity-20 drop-shadow-2xl mix-blend-multiply sepia-[.5]"
            />

            {/* HOTSPOTS */}
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="absolute group cursor-pointer z-20"
                style={{ top: branch.top, left: branch.left }}
              >
                <div className="absolute -inset-4 bg-amber-800/20 rounded-full animate-ping"></div>
                <div className="relative w-3 h-3 bg-amber-800 border border-[#F5F2EB] rounded-full shadow-md transition-transform group-hover:scale-150"></div>

                <div
                  className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none ${
                    branch.left > "60%" ? "right-6" : "left-6"
                  }`}
                >
                  <div className="bg-stone-900 text-[#F5F2EB] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm whitespace-nowrap shadow-xl flex items-center">
                    {branch.name}
                  </div>
                </div>
              </div>
            ))}

            {/* CARD THỐNG KÊ */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:left-0 bg-white/90 backdrop-blur-md p-5 border border-stone-200 shadow-xl max-w-[220px] rounded-sm animate-in fade-in slide-in-from-left-8 duration-1000 delay-500 z-30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                  <MapPin className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">
                    Curatorial Hub
                  </p>
                  <p className="font-serif text-xl font-bold text-stone-900 leading-none">
                    An Nam
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-stone-500 leading-relaxed italic">
                Nơi tập trung, kiểm định và đóng gói các tác phẩm trước khi gửi
                đi toàn thế giới.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
