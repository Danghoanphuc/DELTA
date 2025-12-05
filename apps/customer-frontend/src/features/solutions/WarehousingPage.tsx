import { useState, useEffect } from "react";
import { Header, Footer } from "@/features/landing/components";
import { LPSocialProof } from "@/features/landing/components/sections/LPSocialProof";
import { Button } from "@/shared/components/ui/button";
import { Check, Warehouse, Box, Scale, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

export default function WarehousingPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Auto-play logic cho video steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000); // 3s per step
    return () => clearInterval(interval);
  }, []);

  const benefits = [
    {
      icon: Warehouse,
      title: "Free Storage 3 tháng đầu",
      desc: "Ưu đãi độc quyền cho Partner mới. Trải nghiệm hạ tầng kho chuẩn ISO mà không tốn một xu chi phí cố định.",
    },
    {
      icon: Scale,
      title: "Tính phí theo Cubic Feet",
      desc: "Bỏ qua nỗi lo thuê nguyên pallet. Printz tính phí dynamic theo thể tích thực tế món hàng chiếm dụng. Dùng bao nhiêu, trả bấy nhiêu.",
    },
    {
      icon: Clock,
      title: "Ship trong 24h",
      desc: "Kết nối trực tiếp API vận chuyển. Đặt hàng hôm nay, giao hàng ngày mai trên toàn lãnh thổ Việt Nam.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "In số lượng lớn",
      desc: "Tận dụng lợi thế quy mô (Economies of Scale). Đặt in 10,000 items để tối ưu COGS xuống mức thấp nhất.",
      videoPlaceholder: "bg-stone-200", // Thay bằng URL video thực tế
    },
    {
      number: "02",
      title: "Printz lưu kho",
      desc: "Hàng hóa được nhập kho Printz, quản lý bằng barcode, theo dõi real-time trên Dashboard.",
      videoPlaceholder: "bg-stone-300",
    },
    {
      number: "03",
      title: "Ship 1-Click",
      desc: "Khi cần, chỉ cần 1 click hoặc API trigger. Hệ thống tự động pick, pack và ship đến tay người nhận.",
      videoPlaceholder: "bg-stone-400",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900">
      <Header />

      {/* HERO - PROBLEM STATEMENT */}
      <section className="pt-40 pb-20 px-6 text-center bg-gradient-to-b from-stone-50 to-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
            <Warehouse className="w-4 h-4 text-amber-800" />
            <span className="text-sm font-bold text-amber-800 uppercase tracking-wider">
              Warehousing & Distribution
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-8 leading-tight">
            Biến chi phí cố định thành <br />
            <span className="italic text-amber-800">chi phí biến đổi</span>
          </h1>

          <p className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Tại sao phải thuê kho, quản lý nhân sự khi bạn có thể outsourcing
            toàn bộ? Tập trung vào Core Business, vận hành logistics để Printz
            lo.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-stone-900 hover:bg-amber-800 text-white rounded-full px-10 py-7 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              Đặt lịch tư vấn
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              variant="outline"
              className="border-2 border-stone-200 text-stone-900 hover:border-stone-900 hover:bg-stone-50 rounded-full px-10 py-7 text-lg font-bold shadow-sm hover:shadow-md transition-all"
            >
              Tạo tài khoản Free
            </Button>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION - NEW PRICING MODEL */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-amber-800 uppercase mb-4 block">
              Smart Logistics
            </span>
            <h2 className="font-serif text-4xl md:text-6xl text-stone-900 mb-6 italic">
              Lưu kho thông minh.
              <br />
              Tối ưu dòng tiền.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="p-8 bg-stone-50 rounded-2xl border border-stone-200 hover:border-amber-800 hover:shadow-lg transition-all group cursor-default"
                >
                  <div className="w-14 h-14 bg-white rounded-xl border border-stone-200 group-hover:border-amber-800 group-hover:bg-amber-800 flex items-center justify-center mb-6 transition-all shadow-sm">
                    <Icon
                      className="w-7 h-7 text-stone-900 group-hover:text-white transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed text-sm md:text-base">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - INTERACTIVE VIDEO STEPS */}
      <section className="py-24 bg-stone-900 text-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT: SHARED VIDEO CONTAINER */}
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-stone-700 bg-stone-800">
              {/* Video Placeholder - Replace with actual <video> tag */}
              <div
                className={cn(
                  "absolute inset-0 transition-colors duration-500 ease-in-out flex items-center justify-center",
                  steps[activeStep].videoPlaceholder
                )}
              >
                <Play className="w-16 h-16 text-white opacity-50" />
                <p className="absolute bottom-4 text-stone-500 text-xs uppercase tracking-widest font-mono">
                  Video Simulation Area
                </p>
              </div>

              {/* Title Overlay on Video Header */}
              <div className="absolute top-0 left-0 w-full p-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="flex items-center gap-4">
                  <span className="font-serif text-4xl text-amber-500 font-bold">
                    {steps[activeStep].number}
                  </span>
                  <h3 className="font-bold text-2xl text-white tracking-tight">
                    {steps[activeStep].title}
                  </h3>
                </div>
              </div>

              {/* Progress Bar for current step duration */}
              <div
                className="absolute bottom-0 left-0 h-1 bg-amber-600 transition-all duration-[3000ms] ease-linear w-full"
                key={activeStep}
                style={{ width: "100%", animation: "shrink 3s linear" }}
              />
            </div>

            {/* RIGHT: STAIRCASE STEPS */}
            <div className="flex flex-col justify-center space-y-8">
              {steps.map((step, i) => (
                <div
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    "cursor-pointer transition-all duration-500 transform",
                    "border-l-2 pl-6 py-2",
                    // Staircase layout: Indent based on index
                    i === 0 ? "md:ml-0" : "",
                    i === 1 ? "md:ml-12" : "",
                    i === 2 ? "md:ml-24" : "",
                    activeStep === i
                      ? "border-amber-500 opacity-100 scale-105 origin-left"
                      : "border-stone-700 opacity-40 hover:opacity-70"
                  )}
                >
                  <h3
                    className={cn(
                      "font-bold text-xl mb-2 transition-colors",
                      activeStep === i ? "text-white" : "text-stone-400"
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="text-stone-400 leading-relaxed max-w-sm text-sm">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <LPSocialProof />

      {/* USE CASES */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-stone-900 mb-6 italic">
              Ai nên dùng dịch vụ này?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Chuỗi bán lẻ cần phân phối POSM toàn quốc",
              "Doanh nghiệp in ấn phẩm Marketing số lượng lớn",
              "E-commerce Brand cần kho fulfillment chuyên nghiệp",
              "Công ty đa quốc gia quản lý quà tặng nhân viên",
            ].map((useCase, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-amber-800" strokeWidth={2.5} />
                </div>
                <p className="text-lg text-stone-700 font-medium">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-stone-900 text-white text-center relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-900/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 relative z-10 text-white">
          <h2 className="font-serif text-4xl md:text-5xl mb-6 italic text-white">
            Giải phóng văn phòng của bạn
          </h2>
          <p className="text-xl text-stone-300 mb-10">
            Không còn thùng carton, không còn nỗi lo tồn kho. <br />
            Bắt đầu với 3 tháng lưu kho miễn phí ngay hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-white text-stone-900 hover:bg-amber-50 hover:shadow-2xl rounded-full px-10 py-6 text-base font-semibold shadow-lg transition-all duration-300 border border-white/20"
            >
              Book Demo
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-full px-10 py-6 text-base font-semibold transition-all duration-300"
            >
              Tạo tài khoản Free
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
