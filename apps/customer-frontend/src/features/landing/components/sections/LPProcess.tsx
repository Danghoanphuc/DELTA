import { Button } from "@/shared/components/ui/button";
import { UploadCloud, ShieldCheck, Truck, LayoutTemplate } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LPProcess() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: UploadCloud,
      title: "1. Thiết lập Brand Kit",
      desc: "Upload logo, font chữ và tạo template chuẩn cho doanh nghiệp.",
    },
    {
      icon: LayoutTemplate,
      title: "2. Nhân viên tự tạo",
      desc: "Nhân viên đăng nhập, chọn template và điền thông tin cá nhân. Không thể chỉnh sửa sai quy chuẩn.",
    },
    {
      icon: ShieldCheck,
      title: "3. Quản lý phê duyệt",
      desc: "Thông báo được gửi đến Admin. Chỉ in khi được duyệt.",
    },
    {
      icon: Truck,
      title: "4. Giao hàng tận nơi",
      desc: "Sản phẩm được in với tiêu chuẩn cao nhất (Printz Quality) và giao đến văn phòng.",
    },
  ];

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            In ấn chưa bao giờ <br />
            <span className="text-blue-600">Đơn giản & Chuẩn xác</span> đến thế.
          </h2>
          <p className="text-slate-600">
            Loại bỏ 90% thời gian trao đổi email qua lại. Hãy để hệ thống làm
            việc cho bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-slate-100 -z-10"></div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white pt-4 text-center group"
              >
                <div className="w-16 h-16 mx-auto bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed px-2">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
