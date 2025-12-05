import { Header, Footer } from "./components";
import { Button } from "@/shared/components/ui/button";
import { Users, Target, Award, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HERO */}
      <section className="pt-40 pb-20 px-4 text-center border-b border-stone-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-6xl md:text-8xl text-stone-900 mb-8 italic leading-tight">
            Về Printz.
          </h1>
          <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
            Chúng tôi tin rằng in ấn không chỉ là sản xuất, mà là công cụ để
            doanh nghiệp xây dựng và bảo vệ thương hiệu của mình.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-24 px-4">
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 block">
              Sứ mệnh
            </span>
            <h2 className="font-serif text-5xl text-stone-900 mb-6 italic">
              Chuẩn hóa in ấn doanh nghiệp
            </h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-6">
              Printz được sinh ra từ nỗi đau thực tế: Doanh nghiệp Việt Nam đang
              lãng phí hàng triệu đồng mỗi năm vì in ấn không nhất quán, quy
              trình duyệt đơn thủ công và hóa đơn rời rạc.
            </p>
            <p className="text-lg text-stone-600 leading-relaxed">
              Chúng tôi xây dựng nền tảng để giải quyết vấn đề này - một hệ
              thống giúp doanh nghiệp kiểm soát brand, tự động hóa quy trình và
              minh bạch chi phí.
            </p>
          </div>
          <div className="bg-stone-900 p-12 text-white">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-5xl font-bold text-emerald-400 mb-2">
                  500+
                </div>
                <p className="text-stone-400 text-sm">Doanh nghiệp tin dùng</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-emerald-400 mb-2">
                  50K+
                </div>
                <p className="text-stone-400 text-sm">Đơn hàng hoàn thành</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-emerald-400 mb-2">
                  99%
                </div>
                <p className="text-stone-400 text-sm">Độ chính xác màu sắc</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-emerald-400 mb-2">
                  24h
                </div>
                <p className="text-stone-400 text-sm">
                  Thời gian xử lý trung bình
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 px-4 bg-white border-y border-stone-200">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="font-serif text-4xl text-stone-900 text-center mb-16 italic">
            Giá trị cốt lõi
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: "Chính xác",
                desc: "100% đúng brand guidelines, không sai sót.",
              },
              {
                icon: Users,
                title: "Minh bạch",
                desc: "Giá cả rõ ràng, quy trình công khai.",
              },
              {
                icon: Award,
                title: "Chất lượng",
                desc: "Chỉ làm việc với nhà in đạt chuẩn ISO.",
              },
              {
                icon: Heart,
                title: "Tận tâm",
                desc: "Hỗ trợ 24/7, đồng hành cùng khách hàng.",
              },
            ].map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                    <Icon
                      className="w-8 h-8 text-stone-900"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24 px-4">
        <div className="max-w-[1440px] mx-auto text-center">
          <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 block">
            Đội ngũ
          </span>
          <h2 className="font-serif text-5xl text-stone-900 mb-6 italic">
            Những người kiến tạo
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-16">
            Đội ngũ Printz gồm các chuyên gia từ ngành in ấn, công nghệ và thiết
            kế, cùng chung niềm đam mê chuẩn hóa quy trình in ấn doanh nghiệp.
          </p>
          <Button className="bg-stone-900 hover:bg-emerald-900 text-white px-10 py-6 rounded-none text-base uppercase tracking-widest font-bold">
            Xem vị trí tuyển dụng
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
