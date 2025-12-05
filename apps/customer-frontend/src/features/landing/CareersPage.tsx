import { Header, Footer } from "./components";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight, MapPin, Clock, Briefcase } from "lucide-react";

export default function CareersPage() {
  const openings = [
    {
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "TP.HCM",
      type: "Full-time",
      description:
        "Xây dựng nền tảng in ấn B2B với React, Node.js và microservices.",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "TP.HCM / Remote",
      type: "Full-time",
      description:
        "Thiết kế trải nghiệm người dùng cho nền tảng quản trị thương hiệu.",
    },
    {
      title: "Business Development Manager",
      department: "Sales",
      location: "TP.HCM",
      type: "Full-time",
      description:
        "Phát triển mối quan hệ với doanh nghiệp và mở rộng thị trường.",
    },
    {
      title: "Print Production Specialist",
      department: "Operations",
      location: "TP.HCM",
      type: "Full-time",
      description: "Quản lý quy trình sản xuất và đảm bảo chất lượng in ấn.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HERO */}
      <section className="pt-40 pb-20 px-4 text-center border-b border-stone-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-6xl md:text-8xl text-stone-900 mb-8 italic leading-tight">
            Join Printz.
          </h1>
          <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
            Gia nhập đội ngũ đang kiến tạo tương lai của ngành in ấn doanh
            nghiệp tại Việt Nam.
          </p>
        </div>
      </section>

      {/* WHY PRINTZ */}
      <section className="py-24 px-4">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            {[
              {
                title: "Tác động thực tế",
                desc: "Sản phẩm bạn xây dựng được hàng nghìn doanh nghiệp sử dụng mỗi ngày.",
              },
              {
                title: "Đội ngũ tài năng",
                desc: "Làm việc cùng những người giỏi nhất trong lĩnh vực của họ.",
              },
              {
                title: "Phát triển nhanh",
                desc: "Cơ hội học hỏi và thăng tiến trong môi trường startup năng động.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <h3 className="font-bold text-2xl text-stone-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPENINGS */}
      <section className="py-24 px-4 bg-white border-y border-stone-200">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="font-serif text-4xl text-stone-900 mb-12 italic">
            Vị trí đang tuyển
          </h2>
          <div className="space-y-6">
            {openings.map((job, i) => (
              <div
                key={i}
                className="border border-stone-200 p-8 hover:border-stone-900 transition-colors group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl text-stone-900 mb-3 group-hover:text-emerald-800 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-stone-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white rounded-none px-8 py-6 font-bold uppercase tracking-widest shrink-0"
                  >
                    Ứng tuyển <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl text-stone-900 mb-6 italic">
            Không thấy vị trí phù hợp?
          </h2>
          <p className="text-lg text-stone-600 mb-8">
            Gửi CV và portfolio của bạn. Chúng tôi luôn tìm kiếm những tài năng
            xuất sắc.
          </p>
          <Button className="bg-stone-900 hover:bg-emerald-900 text-white px-10 py-6 rounded-none text-base uppercase tracking-widest font-bold">
            Gửi CV tự do
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
