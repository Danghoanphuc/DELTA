import { useState, useEffect, useRef } from "react";
import { MessageSquare, Gem, Hammer, Gift } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// --- DỮ LIỆU HERITAGE JOURNEY ---
const STEPS = [
  {
    id: "01",
    title: "Tham Vấn Giám Tuyển",
    sub: "Thấu hiểu vị thế",
    icon: MessageSquare,
    desc: "Chúng tôi lắng nghe câu chuyện ngoại giao của bạn để tìm ra 'ngôn ngữ' quà tặng phù hợp nhất.",
    videoUrl: null, // Có thể chèn video cảnh uống trà bàn chuyện
    lottieUrl:
      "https://lottie.host/embed/551c8169-385c-43df-9594-7b4d02cf1fda/w1xsXDO31P.lottie",
  },
  {
    id: "02",
    title: "Lựa Chọn Độc Bản",
    sub: "Chạm vào nguyên bản",
    icon: Gem,
    desc: "Trực tiếp cảm nhận chất liệu (gốm, gỗ, trầm) và duyệt thiết kế cá nhân hóa tinh tế.",
    videoUrl: null,
    lottieUrl:
      "https://lottie.host/embed/a82557c6-8cfb-4f02-9354-6e997161da86/4eAkcsUeDw.lottie",
  },
  {
    id: "03",
    title: "Chế Tác Thủ Công",
    sub: "Nghệ nhân thổi hồn",
    icon: Hammer,
    desc: "Tác phẩm được chế tác tại làng nghề, trải qua quy trình kiểm định 'Kép' nghiêm ngặt.",
    videoUrl: null,
    lottieUrl:
      "https://lottie.host/embed/104fde0e-3ba0-41df-8387-1e3b17a67eca/wMNNzYxYRg.lottie",
  },
  {
    id: "04",
    title: "Nghi Thức Trao Gửi",
    sub: "Giao hảo trọn vẹn",
    icon: Gift,
    desc: "Đóng gói trang trọng với khăn lụa, hộp cứng và thư tay. Giao đến tận bàn làm việc của đối tác.",
    videoUrl: null,
    lottieUrl:
      "https://lottie.host/embed/723ad963-c59f-4eef-aa68-b2c6f6997bbb/IwHjmBuFOB.lottie",
  },
];

export function LPProcess() {
  const [activeStep, setActiveStep] = useState(0);
  // ... (Giữ nguyên logic autoplay) ...
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4000); // Chậm lại chút cho sang
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    startAutoPlay();
  };

  const currentStep = STEPS[activeStep];

  return (
    <section className="py-24 bg-[#F9F8F6] text-stone-900 border-t border-stone-200 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-6 h-[2px] bg-amber-800"></span>
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-amber-800 uppercase">
                The Bespoke Journey
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight">
              Hành trình <br />
              <span className="italic text-stone-500">Chế tác Độc bản.</span>
            </h2>
          </div>
          <div className="text-right max-w-md">
            <p className="text-lg text-stone-600 font-light italic">
              "Không vội vã, không đại trà. Chúng tôi dành thời gian để tạo ra
              tác phẩm xứng tầm với vị thế của bạn."
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              return (
                <div
                  key={index}
                  className={cn(
                    "group relative p-6 rounded-sm transition-all duration-700 cursor-pointer border-l-4 overflow-hidden",
                    isActive
                      ? "bg-white border-amber-800 shadow-xl z-10"
                      : "bg-transparent border-stone-200 hover:bg-stone-100 hover:border-stone-400"
                  )}
                  onClick={() => handleStepClick(index)}
                >
                  <div className="flex items-start gap-6 relative z-10">
                    <span
                      className={cn(
                        "absolute -top-2 -right-2 font-serif text-6xl font-bold transition-colors select-none z-0 opacity-10",
                        isActive ? "text-amber-800" : "text-stone-400"
                      )}
                    >
                      {step.id}
                    </span>
                    <div className="relative shrink-0 mt-1">
                      <div
                        className={cn(
                          "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 border",
                          isActive
                            ? "bg-amber-800 text-white border-amber-800"
                            : "bg-transparent text-stone-400 border-stone-300 group-hover:border-amber-800 group-hover:text-amber-800"
                        )}
                      >
                        <Icon strokeWidth={1.5} className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <p
                        className={cn(
                          "font-mono text-[10px] font-bold tracking-widest uppercase mb-1 transition-colors",
                          isActive ? "text-amber-800" : "text-stone-400"
                        )}
                      >
                        {step.sub}
                      </p>
                      <h3
                        className={cn(
                          "font-serif text-xl font-bold mb-2 transition-colors",
                          isActive ? "text-stone-900" : "text-stone-600"
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
                </div>
              );
            })}
          </div>

          {/* Visual Area */}
          <div className="lg:col-span-7 relative h-full min-h-[400px] lg:min-h-0">
            <div className="w-full h-full rounded-sm overflow-hidden shadow-2xl border-8 border-white bg-[#F9F8F6] relative z-10">
              <iframe
                src={currentStep.lottieUrl}
                className="w-full h-full border-0 bg-transparent grayscale-[50%] sepia-[20%]" // Hiệu ứng màu vintage
                title={`Animation - ${currentStep.title}`}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900/90 to-transparent p-8 pt-24 pointer-events-none">
                <h4 className="font-serif text-3xl font-bold text-[#F9F8F6] mb-2">
                  {currentStep.title}
                </h4>
                <p className="text-stone-300 font-light text-sm tracking-wide">
                  An Nam Curator Process • Step {currentStep.id}
                </p>
              </div>
            </div>

            {/* Decor Blob */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-800/10 rounded-full blur-[80px] -z-10 mix-blend-multiply"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-stone-800/10 rounded-full blur-[80px] -z-10 mix-blend-multiply"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
