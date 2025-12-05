import { Check, Laptop, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function LPPlatformFeatures() {
  const values = [
    {
      icon: Sparkles,
      title: "Đơn giản hóa quy trình",
      desc: "Không còn cảnh làm việc với 5-7 nhà cung cấp (in áo riêng, in giấy riêng, ship riêng). Tại Printz, bạn có một đầu mối duy nhất cho mọi nhu cầu.",
    },
    {
      icon: UserCheck,
      title: "Chuyên gia đồng hành",
      desc: "Công nghệ không thể thay thế con người trong sáng tạo. Mỗi khách hàng doanh nghiệp đều có một Account Manager riêng hỗ trợ 1:1.",
    },
    {
      icon: Laptop,
      title: "Công nghệ là đòn bẩy",
      desc: "Chúng tôi xây dựng Dashboard để bạn minh bạch hóa mọi thứ: Tồn kho, Trạng thái đơn hàng và Lịch sử chi tiêu. Bạn nắm quyền kiểm soát, chúng tôi lo vận hành.",
    },
  ];

  return (
    <section className="py-24 bg-stone-900 text-stone-200 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        {/* LEFT: Why Choose Us (Service Focus) */}
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase mb-6 block">
            The Printz Difference
          </span>

          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 leading-tight">
            Hơn cả một nhà in. <br />
            <span className="italic text-stone-500">
              Đối tác vận hành của bạn.
            </span>
          </h2>

          <p className="text-lg text-stone-400 font-light leading-relaxed mb-10 max-w-lg">
            Chúng tôi tin rằng việc in ấn và quà tặng doanh nghiệp nên là một
            trải nghiệm thú vị, không phải là một gánh nặng hành chính.
          </p>

          <div className="space-y-10">
            {values.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-5 group">
                  <div className="mt-1 w-12 h-12 rounded-2xl bg-stone-800 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-900 transition-colors duration-300">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl mb-2 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-stone-400 font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Visual - Kết quả của dịch vụ (Sự hài lòng/Minh bạch) */}
        <div className="relative">
          {/* Card mô phỏng kết quả: Một đơn hàng thành công trọn vẹn */}
          <div className="relative z-10 bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-all duration-500">
            {/* Header Card */}
            <div className="flex justify-between items-center border-b border-stone-100 pb-6 mb-6">
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  Dự án hoàn thành
                </p>
                <h3 className="text-2xl font-serif text-stone-900">
                  Welcome Kit 2025
                </h3>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <Check className="w-6 h-6" />
              </div>
            </div>

            {/* Status Steps - Rất đơn giản */}
            <div className="space-y-6">
              <div className="flex gap-4 opacity-50">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-stone-300"></div>
                  <div className="w-0.5 h-full bg-stone-200"></div>
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">
                    Thiết kế & Duyệt mẫu
                  </p>
                  <p className="text-xs text-stone-500">
                    Hoàn tất 2 ngày trước
                  </p>
                </div>
              </div>

              <div className="flex gap-4 opacity-50">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-stone-300"></div>
                  <div className="w-0.5 h-full bg-stone-200"></div>
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">
                    Sản xuất & Đóng gói
                  </p>
                  <p className="text-xs text-stone-500">Kitting 500 sets</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></div>
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">
                    Đã giao hàng thành công
                  </p>
                  <p className="text-xs text-emerald-600 font-bold">
                    Vừa xong • Ký nhận bởi Lễ tân
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Quote */}
            <div className="mt-8 pt-6 border-t border-stone-100 bg-stone-50 -mx-8 -mb-8 p-6 rounded-b-2xl">
              <p className="text-stone-500 text-sm italic">
                "Dịch vụ tuyệt vời! Toàn bộ 500 hộp quà đều đẹp không tì vết.
                Sếp mình rất ưng."
              </p>
              <p className="text-xs font-bold text-stone-900 mt-2 uppercase tracking-wide">
                — HR Manager, Tech Corp
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/20 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
