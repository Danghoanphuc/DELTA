import { Fingerprint, Scale, ShieldCheck, Check } from "lucide-react";

export function LPPlatformFeatures() {
  const values = [
    {
      icon: Fingerprint,
      title: "Độc bản Tự nhiên (Wabi-sabi)",
      desc: "Chúng tôi tôn vinh những vết rạn của gốm, những mắt gỗ tự nhiên. Không có hai món quà nào giống hệt nhau, cũng như mối quan hệ của bạn là duy nhất.",
    },
    {
      icon: Scale,
      title: "Tư duy Giám tuyển",
      desc: "Chúng tôi không bán hàng đại trà. Chúng tôi chắt lọc những gì tinh túy nhất của văn hóa Á Đông, loại bỏ sự rườm rà để đạt đến sự sang trọng tối giản.",
    },
    {
      icon: ShieldCheck,
      title: "Bảo hiểm Cảm xúc",
      desc: "Cam kết 1 đổi 1 trong 24h nếu vỡ hỏng. Bảo hành trọn đời về nguồn gốc chất liệu. Bạn trao quà, chúng tôi trao sự an tâm.",
    },
  ];

  return (
    <section className="py-24 bg-stone-900 text-stone-200 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-20 items-center relative z-10">
        {/* LEFT: Values */}
        <div>
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-amber-500 uppercase mb-6 block">
            Core Values
          </span>

          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 leading-tight">
            Không chỉ là Quà tặng. <br />
            <span className="italic text-stone-500">
              Đó là Nghệ thuật Giao hảo.
            </span>
          </h2>

          <p className="text-lg text-stone-400 font-light leading-relaxed mb-10 max-w-lg">
            Trong thế giới công nghiệp, chúng tôi chọn lối đi hẹp của sự tỉ mỉ.
            Nơi giá trị không nằm ở số lượng, mà ở chiều sâu văn hóa.
          </p>

          <div className="space-y-10">
            {values.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-5 group">
                  <div className="mt-1 w-12 h-12 rounded-sm bg-stone-800 flex items-center justify-center text-amber-500 shrink-0 group-hover:bg-amber-900 transition-colors duration-300">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xl mb-2 group-hover:text-amber-500 transition-colors">
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

        {/* RIGHT: Visual - Card Demo */}
        <div className="relative">
          {/* Card mô phỏng kết quả: Một đơn hàng thành công */}
          <div className="relative z-10 bg-[#F9F8F6] rounded-sm p-8 shadow-2xl max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-all duration-700 border border-stone-800">
            {/* Header Card */}
            <div className="flex justify-between items-center border-b border-stone-200 pb-6 mb-6">
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  Dự án hoàn thành
                </p>
                <h3 className="text-2xl font-serif text-stone-900 italic">
                  Quà Tết Ất Tỵ
                </h3>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-800">
                <Check className="w-6 h-6" />
              </div>
            </div>

            {/* Status Steps */}
            <div className="space-y-6">
              <div className="flex gap-4 opacity-50">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-stone-300"></div>
                  <div className="w-0.5 h-full bg-stone-200"></div>
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">
                    Giám tuyển & Phôi gốm
                  </p>
                  <p className="text-xs text-stone-500">
                    Đã chọn 50 phôi men Hỏa biến
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
                    Khắc Laser & Dát vàng
                  </p>
                  <p className="text-xs text-stone-500">
                    Hoàn tất khắc tên 50 VIP
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-600 ring-4 ring-amber-100"></div>
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">
                    Đã trao tác phẩm
                  </p>
                  <p className="text-xs text-amber-700 font-bold">
                    Vừa xong • Ký nhận bởi Trợ lý TGĐ
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Quote */}
            <div className="mt-8 pt-6 border-t border-stone-200 bg-stone-100 -mx-8 -mb-8 p-6 rounded-b-sm">
              <p className="text-stone-600 text-sm italic font-serif">
                "Bộ ấm trà thực sự đẳng cấp. Đối tác Nhật Bản của tôi rất thích
                câu chuyện về men Hỏa biến mà các bạn đã kể."
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 bg-stone-300 rounded-full"></div>
                <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  — CEO, Real Estate Group
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-600/20 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
