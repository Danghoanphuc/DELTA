import { useState, useEffect, useRef } from "react";
import {
  FileSpreadsheet,
  PackageCheck,
  Globe2,
  BarChart3,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils"; // Đảm bảo bạn có utility này hoặc dùng template literal

// --- DỮ LIỆU DEMO ---
// TODO: Thay thế videoUrl bằng link video thật của bạn (nên ngắn ~3s mỗi video)
const STEPS = [
  {
    id: "01",
    title: "Upload & Đồng bộ Data",
    sub: "1 CLICK IMPORT",
    icon: FileSpreadsheet,
    desc: "Kéo thả file Excel danh sách người nhận hoặc kết nối trực tiếp với hệ thống HRIS của bạn. Dữ liệu được chuẩn hóa tự động.",
    videoUrl:
      "https://res.cloudinary.com/demo/video/upload/v1698339053/samples/cld-sample-video.mp4",
  },
  {
    id: "02",
    title: "Sản xuất & Kitting Tự động",
    sub: "KHÔNG CẦN GIÁM SÁT",
    icon: PackageCheck,
    desc: "Lệnh in được chuyển thẳng xuống xưởng. Từng món quà được đóng gói (kitting) chỉn chu theo quy chuẩn thương hiệu.",
    videoUrl:
      "https://res.cloudinary.com/demo/video/upload/v1698339053/samples/cld-sample-video.mp4",
  },
  {
    id: "03",
    title: "Phân phối Linh hoạt",
    sub: "SHIP HOẶC REDEEM LINK",
    icon: Globe2,
    desc: "Gửi thẳng đến địa chỉ có sẵn HOẶC tạo 'Redeem Link' để nhân viên tự điền thông tin nhận quà. Giải quyết bài toán thiếu data.",
    videoUrl:
      "https://res.cloudinary.com/demo/video/upload/v1698339053/samples/cld-sample-video.mp4",
  },
  {
    id: "04",
    title: "Tracking & Báo cáo Real-time",
    sub: "MINH BẠCH TUYỆT ĐỐI",
    icon: BarChart3,
    desc: "Theo dõi hành trình đơn hàng và xem hình ảnh nghiệm thu thực tế (Proof of Delivery) ngay trên Dashboard tập trung.",
    videoUrl:
      "https://res.cloudinary.com/demo/video/upload/v1698339053/samples/cld-sample-video.mp4",
  },
];

export function LPProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hàm bắt đầu/reset vòng lặp tự động
  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 3000); // Chuyển bước sau mỗi 3 giây
  };

  // Khởi chạy vòng lặp khi component mount
  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Đảm bảo video luôn phát lại từ đầu khi chuyển bước
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .catch((e) => console.warn("Video autoplay blocked:", e));
    }
  }, [activeStep]);

  // Xử lý khi click chọn bước thủ công
  const handleStepClick = (index: number) => {
    setActiveStep(index);
    startAutoPlay(); // Reset timer
  };

  return (
    <section className="py-24 bg-[#F9F8F6] text-stone-900 border-t border-stone-200 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-6 h-[2px] bg-[#C63321]"></span>
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#C63321] uppercase">
                Quy trình Zero-Touch
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight">
              Tự động hóa <br />
              <span className="italic text-stone-500">
                hành trình quà tặng.
              </span>
            </h2>
          </div>
          <div className="text-right max-w-md">
            <p className="text-lg text-stone-600 font-light">
              Từ file Excel đến tay người nhận chỉ với vài cú click. Bạn ra
              lệnh, Printz thi hành.
            </p>
          </div>
        </div>

        {/* CONTENT: SPLIT VIEW (Steps Left - Video Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
          {/* LEFT: STEPS LIST */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              return (
                <div
                  key={index}
                  className={cn(
                    "group relative p-6 rounded-2xl transition-all duration-500 cursor-pointer border-2 overflow-hidden",
                    isActive
                      ? "bg-white border-[#C63321]/50 shadow-lg scale-[1.02] z-10"
                      : "bg-transparent border-transparent hover:bg-stone-100/50 hover:border-stone-200"
                  )}
                  onClick={() => handleStepClick(index)}
                >
                  <div className="flex items-start gap-6 relative z-10">
                    {/* Số thứ tự nền */}
                    <span
                      className={cn(
                        "absolute -top-4 -left-2 font-serif text-6xl font-bold transition-colors select-none z-0",
                        isActive ? "text-[#C63321]/5" : "text-stone-200/30"
                      )}
                    >
                      {step.id}
                    </span>

                    {/* Icon & Nội dung */}
                    <div className="relative shrink-0 mt-1">
                      <div
                        className={cn(
                          "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-500",
                          isActive
                            ? "bg-[#C63321] text-white shadow-md rotate-3 scale-110"
                            : "bg-stone-100 text-stone-400 group-hover:text-[#C63321] group-hover:bg-white"
                        )}
                      >
                        <Icon strokeWidth={1.5} className="w-6 h-6" />
                      </div>
                    </div>

                    <div>
                      <p
                        className={cn(
                          "font-mono text-[10px] font-bold tracking-widest uppercase mb-1 transition-colors",
                          isActive ? "text-[#C63321]" : "text-stone-400"
                        )}
                      >
                        {step.sub}
                      </p>
                      <h3
                        className={cn(
                          "font-serif text-xl font-bold mb-2 transition-colors",
                          isActive
                            ? "text-stone-900"
                            : "text-stone-600 group-hover:text-stone-900"
                        )}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={cn(
                          "text-sm leading-relaxed font-light transition-colors line-clamp-2",
                          isActive ? "text-stone-600" : "text-stone-500"
                        )}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar 3s */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-stone-100">
                      <div className="h-full bg-[#C63321] animate-[progress_3s_linear_forward] origin-left"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: VIDEO DEMO CONTAINER */}
          <div className="lg:col-span-7 relative h-full min-h-[400px] lg:min-h-0">
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900 relative z-10">
              {/* Video Player */}
              {/* Sử dụng key={activeStep} để buộc React tái tạo thẻ video, giúp chuyển đổi mượt và tự động phát lại */}
              <video
                ref={videoRef}
                key={activeStep}
                src={STEPS[activeStep].videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                loop={false} // Không loop video đơn lẻ, để hệ thống tự chuyển
              />

              {/* Video Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 pt-20 pointer-events-none">
                <p className="font-mono text-xs font-bold text-[#C63321] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#C63321] animate-pulse"></span>
                  Đang trình diễn: Bước {STEPS[activeStep].id}
                </p>
                <h4 className="font-serif text-2xl font-bold text-white">
                  {STEPS[activeStep].title}
                </h4>
              </div>
            </div>

            {/* Decorative Background Blurs */}
            <div className="absolute top-1/4 -right-20 w-64 h-64 bg-[#C63321]/20 rounded-full blur-[100px] -z-10 mix-blend-multiply"></div>
            <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] -z-10 mix-blend-multiply"></div>
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}
