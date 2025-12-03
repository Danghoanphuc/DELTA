import { Check } from "lucide-react";

export function LPAiUsp() {
  return (
    <section className="py-32 bg-stone-900 text-stone-200 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        {/* LEFT: Copy */}
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase mb-6 block">
            Printz Intelligence™
          </span>
          <h2 className="font-serif text-5xl md:text-6xl text-white mb-8 leading-tight">
            Design Engineering <br />
            <span className="italic text-stone-500">Automated.</span>
          </h2>
          <p className="text-lg text-stone-400 font-light leading-relaxed mb-10 max-w-md">
            Hệ thống tự động kiểm tra lỗi file (Pre-flight), cảnh báo độ phân
            giải và tối ưu vùng biên cắt (Bleed). Đảm bảo bản in vật lý khớp
            100% với bản thiết kế số.
          </p>

          <ul className="space-y-4">
            {[
              "Tự động phát hiện ảnh vỡ nét (Low DPI)",
              "Cảnh báo lệch màu (RGB to CMYK)",
              "Tối ưu khổ giấy để tiết kiệm 30% chi phí",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-4 text-stone-300 font-light"
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: Visual (Technical UI) */}
        <div className="relative border border-stone-700 bg-stone-800/50 p-1">
          {/* Giả lập giao diện Pre-flight check */}
          <div className="bg-[#1a1a1a] p-8 min-h-[400px] flex flex-col justify-between font-mono text-xs">
            {/* Header UI */}
            <div className="flex justify-between border-b border-stone-800 pb-4 mb-4">
              <span className="text-stone-500">
                FILE_ID: A4_BROCHURE_FINAL.PDF
              </span>
              <span className="text-emerald-500 flex items-center gap-2">
                ● SYSTEM ONLINE
              </span>
            </div>

            {/* Scanning Effect */}
            <div className="flex-1 relative flex items-center justify-center border border-dashed border-stone-700 bg-stone-900/50">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 border-2 border-emerald-500 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-white tracking-widest">ANALYZING GEOMETRY</p>
                <p className="text-stone-600">No bleeding issues found.</p>
              </div>

              {/* Scan line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>

            {/* Footer UI */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-800 mt-4 text-stone-500">
              <div>
                <p className="text-[10px] uppercase">Color Profile</p>
                <p className="text-white">CMYK / Fogra39</p>
              </div>
              <div>
                <p className="text-[10px] uppercase">Resolution</p>
                <p className="text-white">
                  300 DPI <span className="text-emerald-500">✓</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase">Dimensions</p>
                <p className="text-white">210 x 297 mm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Noise */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
    </section>
  );
}
