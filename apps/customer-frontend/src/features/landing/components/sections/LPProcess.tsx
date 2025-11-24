import { Button } from "@/shared/components/ui/button";
import { ArrowRight, FileInput, Settings2, PackageCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LPProcess() {
  const navigate = useNavigate();
  
  const steps = [
    {
      id: "01",
      icon: FileInput,
      title: "Tải file / Thiết kế",
      desc: "Upload file có sẵn hoặc dùng AI Zin để tạo mẫu thiết kế chỉ trong vài giây.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      id: "02",
      icon: Settings2,
      title: "Xử lý & In ấn",
      desc: "Hệ thống tự động ghép bài và chuyển đến nhà in phù hợp nhất với yêu cầu.",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      id: "03",
      icon: PackageCheck,
      title: "Giao hàng hỏa tốc",
      desc: "Kiểm tra chất lượng (KCS) và giao tận tay bạn qua các đơn vị vận chuyển uy tín.",
      color: "text-pink-600",
      bg: "bg-pink-50"
    }
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Quy trình đơn giản hóa</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Chúng tôi lo phần kỹ thuật phức tạp, bạn chỉ cần tận hưởng kết quả.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Đường nối dashed line mềm mại */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] border-t-2 border-dashed border-slate-200 z-0"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="relative group fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card phong cách App */}
                <div className="relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center text-center hover:-translate-y-2 z-10">
                   {/* Icon Box Gradient Circle */}
                   <div className={`w-16 h-16 ${step.bg} rounded-2xl mb-6 flex items-center justify-center shadow-inner`}>
                      <Icon className={`w-8 h-8 ${step.color}`} />
                   </div>

                   <div className="absolute top-4 right-4 text-xs font-black text-slate-200 text-[40px] leading-none opacity-50 select-none">
                      {step.id}
                   </div>

                   <h4 className="text-xl font-bold mb-3 text-slate-900">{step.title}</h4>
                   <p className="text-slate-600 leading-relaxed">
                     {step.desc}
                   </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 fade-in-up delay-300">
          <Button
            onClick={() => navigate("/process")}
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full px-6"
          >
            Tìm hiểu chi tiết
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}