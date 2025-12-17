import { Header, Footer } from "./components";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight, MapPin, Clock, Briefcase } from "lucide-react";

export default function CareersPage() {
  const openings = [
    {
      title: "Chuyên viên Tư vấn Quà tặng B2B",
      subtitle: "Cultural Gifting Consultant",
      department: "Tư vấn",
      location: "TP.HCM",
      type: "Full-time",
      description:
        "Không cần chèo kéo khách. Nhiệm vụ của bạn là lắng nghe nhu cầu ngoại giao của Doanh nghiệp và tư vấn set quà phù hợp nhất về mặt văn hóa & ý nghĩa.",
      requirements: "Tinh tế, am hiểu văn hóa cơ bản, giọng nói truyền cảm.",
    },
    {
      title: "Nhân viên Giám tuyển & Kiểm định",
      subtitle: "QC & Curation Specialist",
      department: "Chất lượng",
      location: "TP.HCM",
      type: "Full-time",
      description:
        "'Người gác cổng' chất lượng. Trực tiếp cầm, nắm, soi từng chiếc chén, từng hộp sơn mài. Chỉ những tác phẩm hoàn hảo nhất mới được dán tem 'Verified'.",
      requirements:
        "Mắt thẩm mỹ tốt, tính cách tỉ mỉ, cầu toàn (OCD là một lợi thế).",
    },
    {
      title: "Người Kể Chuyện Thương Hiệu",
      subtitle: "Content Storyteller",
      department: "Marketing",
      location: "TP.HCM / Remote",
      type: "Full-time",
      description:
        "Viết những câu chuyện thổi hồn cho sản phẩm. Biến một cục đất nung thành một tác phẩm triết học.",
      requirements: "Văn phong sâu sắc, giàu cảm xúc, vốn từ Hán Việt tốt.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HERO */}
      <section className="pt-40 pb-20 px-4 text-center border-b-4 border-stone-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-stone-600 mb-4">
            Join The Curators
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-8 font-bold leading-tight">
            Cùng Kiến Tạo
            <br />
            Vị Thế Văn Hóa
          </h1>
          <p className="text-xl text-stone-700 leading-relaxed max-w-2xl mx-auto font-medium">
            Chúng tôi không tìm nhân viên. Chúng tôi tìm những{" "}
            <strong>người đồng hành</strong> đam mê cái đẹp và khao khát kể
            chuyện phương Đông.
          </p>
        </div>
      </section>

      {/* WHY JOIN US */}
      <section className="py-24 px-4 bg-stone-50">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="font-serif text-4xl text-stone-900 mb-16 text-center font-bold uppercase tracking-wide">
            Văn Hóa Làm Việc
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Sống cùng Cái Đẹp",
                desc: "Văn phòng làm việc không phải là công xưởng. Đó là một không gian thưởng trà, ngắm gốm và đắm mình trong mùi hương trầm. Mỗi ngày đi làm là một ngày được nuôi dưỡng thẩm mỹ.",
              },
              {
                title: "Làm việc với Nghệ nhân",
                desc: "Bạn sẽ là cầu nối giữa những bàn tay tài hoa tại làng nghề và những phòng họp sang trọng nhất Việt Nam. Bạn đang góp phần bảo tồn di sản.",
              },
              {
                title: "Tôn trọng sự Tĩnh tại",
                desc: "Chúng tôi không cổ vũ văn hóa 'Hustle' (bán mạng) độc hại. Chúng tôi đề cao hiệu suất trong sự tỉnh thức (Mindful Productivity).",
              },
            ].map((item, i) => (
              <div key={i} className="border-2 border-stone-900 p-8 bg-white">
                <h3 className="font-bold text-xl text-stone-900 mb-4 uppercase tracking-wide">
                  {item.title}
                </h3>
                <p className="text-stone-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPENINGS */}
      <section className="py-24 px-4 bg-white border-y-4 border-stone-900">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="font-serif text-4xl text-stone-900 mb-16 font-bold uppercase tracking-wide text-center">
            Vị Trí Đang Tuyển
          </h2>
          <div className="space-y-8">
            {openings.map((job, i) => (
              <div
                key={i}
                className="border-2 border-stone-900 p-8 bg-stone-50 hover:bg-white transition-colors"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="font-bold text-2xl text-stone-900 mb-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-stone-600 uppercase tracking-wider">
                        {job.subtitle}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-stone-800 leading-relaxed font-medium mb-3">
                        <strong>Mô tả:</strong> {job.description}
                      </p>
                      <p className="text-stone-700 leading-relaxed">
                        <strong>Yêu cầu:</strong> {job.requirements}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-stone-600 mb-6">
                      <span className="flex items-center gap-2 border border-stone-300 px-3 py-1">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-2 border border-stone-300 px-3 py-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-2 border border-stone-300 px-3 py-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      className="border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white px-8 py-3 font-bold uppercase tracking-wider"
                    >
                      Ứng tuyển ngay <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center bg-stone-100">
        <div className="max-w-2xl mx-auto border-4 border-stone-900 p-12 bg-white">
          <h2 className="font-serif text-4xl text-stone-900 mb-6 font-bold">
            Chưa tìm thấy vị trí phù hợp?
          </h2>
          <p className="text-lg text-stone-800 mb-8 leading-relaxed">
            Nếu bạn tin rằng mình thuộc về{" "}
            <strong>thế giới của cái đẹp và văn hóa</strong>, đừng ngần ngại gửi
            Portfolio cho chúng tôi. Chúng tôi luôn dành chỗ cho những{" "}
            <strong>tâm hồn đồng điệu</strong>.
          </p>
          <Button className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-6 text-base uppercase tracking-widest font-bold">
            Gửi Portfolio
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
