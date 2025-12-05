import { Header, Footer } from "./components";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export default function ProcessPage() {
  const phases = [
    {
      id: "01",
      title: "Discovery & Design",
      desc: "Khởi tạo dự án và thiết lập quy chuẩn thương hiệu.",
      steps: [
        "Đăng ký tài khoản Doanh nghiệp (Corporate Account)",
        "Upload Brand Kit (Logo, Color, Font)",
        "Thiết lập Template & Phân quyền nhân viên",
      ],
    },
    {
      id: "02",
      title: "Ordering & Approval",
      desc: "Vận hành đặt hàng tự động hóa.",
      steps: [
        "Nhân viên tạo lệnh in trên Portal",
        "Hệ thống tự động kiểm tra lỗi file (Pre-flight)",
        "Quản lý duyệt đơn hàng (Manager Approval)",
      ],
    },
    {
      id: "03",
      title: "Production & QC",
      desc: "Sản xuất với tiêu chuẩn công nghiệp.",
      steps: [
        "Điều phối tới nhà máy đạt chuẩn G7/ISO",
        "In ấn & Gia công sau in (Cán, Ép kim, Bế)",
        "Kiểm định chất lượng 2 lớp (Double QC Check)",
      ],
    },
    {
      id: "04",
      title: "Delivery & Billing",
      desc: "Giao nhận và đối soát minh bạch.",
      steps: [
        "Đóng gói quy chuẩn Printz Packaging",
        "Giao hàng tận văn phòng",
        "Xuất hóa đơn VAT tổng hợp cuối tháng",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HEADER */}
      <section className="pt-40 pb-24 px-4 bg-stone-50 border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto text-center">
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-4 block">
            Workflow
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-6 italic">
            How we work.
          </h1>
          <p className="text-xl text-stone-500 max-w-2xl mx-auto font-light">
            Quy trình 4 bước được chuẩn hóa để đảm bảo chất lượng và tiết kiệm
            thời gian cho doanh nghiệp.
          </p>
        </div>
      </section>

      {/* PROCESS STEPS */}
      <section className="max-w-[1440px] mx-auto">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className="grid md:grid-cols-12 border-b border-stone-200 min-h-[300px] group hover:bg-[#F9F8F6] transition-colors"
          >
            {/* Col 1: Number */}
            <div className="md:col-span-2 p-12 md:border-r border-stone-200">
              <span className="font-mono text-6xl text-stone-200 font-light group-hover:text-emerald-900 transition-colors">
                {phase.id}
              </span>
            </div>

            {/* Col 2: Content */}
            <div className="md:col-span-4 p-12 md:border-r border-stone-200 flex flex-col justify-center">
              <h3 className="font-serif text-3xl font-bold text-stone-900 mb-4">
                {phase.title}
              </h3>
              <p className="text-stone-500 font-light text-lg">{phase.desc}</p>
            </div>

            {/* Col 3: Details */}
            <div className="md:col-span-6 p-12 flex flex-col justify-center">
              <ul className="space-y-4">
                {phase.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 w-4 h-4 border border-stone-300 rounded-none flex items-center justify-center group-hover:border-emerald-600 group-hover:bg-emerald-600 transition-colors">
                      <Check className="w-3 h-3 text-white opacity-0 group-hover:opacity-100" />
                    </div>
                    <span className="font-mono text-sm text-stone-600 uppercase tracking-wide">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-stone-900 text-white">
        <h2 className="font-serif text-4xl mb-8 italic text-white">
          Ready to optimize your workflow?
        </h2>
        <Button
          asChild
          className="bg-white text-stone-900 hover:bg-emerald-400 px-10 py-6 rounded-none text-sm font-bold uppercase tracking-widest"
        >
          <Link to="/app">Start Free Trial</Link>
        </Button>
      </section>

      <Footer />
    </div>
  );
}
