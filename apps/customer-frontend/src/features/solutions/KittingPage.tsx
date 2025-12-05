import { Header, Footer } from "@/features/landing/components";
import { LPSocialProof } from "@/features/landing/components/sections/LPSocialProof";
import { Button } from "@/shared/components/ui/button";
import {
  Check,
  Package,
  Users,
  Sparkles,
  Target,
  BoxSelect,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function KittingPage() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Package,
      title: "Đóng gói chuẩn Apple",
      desc: "Hộp quà vuông vức, lót giấy chống sốc, thắt nơ chỉn chu. Người nhận mở ra là thấy 'Wow'.",
    },
    {
      icon: Users,
      title: "Cá nhân hóa từng món",
      desc: "Bình nước khắc tên Tuấn, áo size L. Sổ tay tên Lan, áo size M. Không bao giờ nhầm lẫn.",
    },
    {
      icon: Sparkles,
      title: "Trải nghiệm Unboxing",
      desc: "Biến việc nhận quà thành một khoảnh khắc đáng nhớ, quay Story khoe ngay lên mạng xã hội.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Gửi danh sách",
      desc: "Quăng cho Printz file Excel: Tên nhân viên, size áo, món quà muốn tặng. Xong.",
    },
    {
      number: "02",
      title: "Printz phối đồ",
      desc: "Chúng tôi gom nhặt từng món: Bút, Sổ, Áo... xếp gọn gàng vào hộp theo đúng yêu cầu.",
    },
    {
      number: "03",
      title: "Giao tận tay",
      desc: "Shipper trao tận tay từng nhân viên hoặc chở nguyên xe tải đến văn phòng bạn.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900">
      <Header />

      {/* HERO - PROBLEM STATEMENT */}
      <section className="pt-40 pb-20 px-6 text-center bg-gradient-to-b from-emerald-50 to-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
            <BoxSelect className="w-4 h-4 text-emerald-800" />
            <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
              Dịch vụ Đóng Bộ & Phối Quà
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-8 leading-tight">
            Đóng 500 hộp quà <br />
            <span className="italic text-emerald-800">
              bằng cơm hay bằng "công"?
            </span>
          </h1>

          <p className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Mỗi hộp gồm: Sổ tay, bút, áo, bình nước... Việc gì phải lôi cả phòng
            HR ra ngồi xếp hộp hì hục cả tuần? Hãy để Printz làm việc đó chuyên
            nghiệp hơn.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-stone-900 hover:bg-emerald-800 text-white rounded-full px-10 py-7 text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              Tư vấn đóng gói
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              variant="outline"
              className="border-2 border-stone-200 text-stone-900 hover:border-stone-900 hover:bg-stone-50 rounded-full px-10 py-7 text-lg font-bold shadow-sm hover:shadow-md transition-all"
            >
              Xem mẫu hộp
            </Button>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-emerald-800 uppercase mb-4 block">
              Giải pháp từ Printz
            </span>
            <h2 className="font-serif text-4xl md:text-6xl text-stone-900 mb-6 italic">
              Bạn chỉ việc tặng.
              <br />
              Đóng gói để Printz lo.
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Không cần thuê kho, không cần nhân sự thời vụ. Chúng tôi xử lý từ
              A-Z: In ấn, Gấp hộp, Thắt nơ, Dán nhãn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="p-8 bg-stone-50 rounded-2xl border border-stone-200 hover:border-emerald-800 hover:shadow-lg transition-all group cursor-default"
                >
                  <div className="w-14 h-14 bg-white rounded-xl border border-stone-200 group-hover:border-emerald-800 group-hover:bg-emerald-800 flex items-center justify-center mb-6 transition-all shadow-sm">
                    <Icon
                      className="w-7 h-7 text-stone-900 group-hover:text-white transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-stone-50 border-y border-stone-200">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="text-center mb-16">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-emerald-800 uppercase mb-4 block">
              Quy trình 3 bước
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 italic">
              Đơn giản hóa sự phức tạp
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-0.5 bg-stone-200 -z-10" />

            {steps.map((step, i) => (
              <div
                key={i}
                className="relative bg-stone-50 md:bg-transparent p-4"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-white border-2 border-stone-200 rounded-full flex items-center justify-center text-3xl font-serif font-bold text-stone-300 mb-6 shadow-sm">
                    {step.number}
                  </div>
                  <h3 className="font-bold text-2xl text-stone-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
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
              Khi nào cần dịch vụ này?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Welcome Kit: Combo áo + sổ + bút cho nhân viên mới",
              "Event Gift: Túi quà sự kiện gồm tài liệu & quà lưu niệm",
              "VIP Box: Hộp quà Tết cao cấp rượu + bánh + thiệp",
              "Seasonal Pack: Gói quà Trung Thu gửi đối tác",
            ].map((useCase, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-5 bg-stone-50 rounded-xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check
                    className="w-5 h-5 text-emerald-800"
                    strokeWidth={2.5}
                  />
                </div>
                <p className="text-lg text-stone-700 font-medium">{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAMPLE */}
      <section className="py-24 bg-emerald-900/5 border-y border-emerald-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Target className="w-12 h-12 text-emerald-800 mx-auto mb-6" />
          <h3 className="font-serif text-3xl text-stone-900 mb-4 italic">
            Hãy tưởng tượng nhé!
          </h3>
          <p className="text-lg text-stone-700 leading-relaxed italic">
            "Giả sử, công ty cần tặng 300 bộ quà cho nhân viên. Vấn đề là có 5
            loại size áo, 3 màu sổ tay, và mỗi người ở một địa chỉ khác nhau.
            Nếu tự làm, HR sẽ mất 2 tuần để phân loại và đóng gói. Printz giải
            quyết việc này trong 24h."
          </p>
        </div>
      </section>

      {/* CTA SECTION - REDESIGNED */}
      <section className="py-24 bg-stone-900 text-white text-center relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-emerald-900/30 rounded-full blur-[80px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-emerald-800/20 rounded-full blur-[60px]" />
        </div>

        <div className="max-w-3xl mx-auto px-6 relative z-10 text-white">
          <h2 className="font-serif text-4xl md:text-5xl mb-6 italic text-white">
            Trả lại sự tự do cho HR
          </h2>
          <p className="text-xl text-stone-300 mb-10 leading-relaxed">
            Dừng việc gấp hộp còng lưng. <br />
            Hãy để chúng tôi tạo ra những hộp quà khiến nhân viên của bạn phải
            trầm trồ.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-white text-stone-900 hover:bg-emerald-50 hover:shadow-2xl rounded-full px-10 py-6 text-base font-semibold shadow-lg transition-all duration-300 border border-white/20"
            >
              Đặt lịch Demo
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-full px-10 py-6 text-base font-semibold transition-all duration-300"
            >
              Nhận báo giá
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
