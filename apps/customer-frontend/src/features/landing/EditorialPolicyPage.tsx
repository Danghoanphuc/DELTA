// apps/customer-frontend/src/features/landing/EditorialPolicyPage.tsx
// Editorial Policy Page - Chính sách biên tập của Printz
// Critical for SEO: publishingPrinciples schema markup

import { Helmet } from "react-helmet-async";
import { Header, Footer } from "./components";
import { ScrollAnimation } from "@/shared/components/ScrollAnimation";
import { Breadcrumbs } from "@/shared/components/seo/Breadcrumbs";
import {
  Shield,
  CheckCircle,
  Users,
  FileCheck,
  Eye,
  Award,
  BookOpen,
  Scale,
  Heart,
  Sparkles,
} from "lucide-react";

const BRAND_NAME = "Printz";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://printz.vn";

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Helmet>
        <title>Chính Sách Biên Tập | {BRAND_NAME}</title>
        <meta
          name="description"
          content="Tìm hiểu quy trình giám tuyển và biên tập nội dung của Printz. Cam kết về tính xác thực, chất lượng và đạo đức trong việc kể chuyện nghệ nhân Việt Nam."
        />
        <link rel="canonical" href={`${SITE_URL}/editorial-policy`} />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={`Chính Sách Biên Tập | ${BRAND_NAME}`}
        />
        <meta
          property="og:description"
          content="Quy trình giám tuyển và biên tập nội dung của Printz - Cam kết về tính xác thực và chất lượng."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/editorial-policy`} />

        {/* Schema.org - AboutPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Chính Sách Biên Tập Printz",
            description:
              "Quy trình giám tuyển và biên tập nội dung của Printz Magazine",
            url: `${SITE_URL}/editorial-policy`,
            mainEntity: {
              "@type": "Organization",
              name: BRAND_NAME,
              url: SITE_URL,
            },
          })}
        </script>
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=2070&fm=webp')`,
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900" />

        {/* Breadcrumbs */}
        <div className="relative max-w-4xl mx-auto px-4 pt-4 mb-8">
          <Breadcrumbs
            variant="dark"
            items={[{ label: "Chính sách Biên tập" }]}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <ScrollAnimation variant="fadeInUp">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium uppercase tracking-wider">
                Publishing Principles
              </span>
            </div>
          </ScrollAnimation>

          <ScrollAnimation variant="fadeInUp" delay={100}>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Chính Sách Biên Tập
            </h1>
          </ScrollAnimation>

          <ScrollAnimation variant="fadeInUp" delay={200}>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Cam kết của chúng tôi về tính xác thực, chất lượng và đạo đức
              trong việc kể chuyện nghệ nhân Việt Nam.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">
                Sứ Mệnh Biên Tập
              </h2>
              <div className="w-16 h-1 bg-amber-600 mx-auto" />
            </div>
          </ScrollAnimation>

          <ScrollAnimation variant="fadeInUp" delay={100}>
            <div className="prose prose-lg prose-slate max-w-none">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                <strong className="text-slate-900">Printz Magazine</strong> ra
                đời với sứ mệnh kể những câu chuyện chân thực về nghệ nhân và di
                sản thủ công Việt Nam. Chúng tôi tin rằng mỗi tác phẩm thủ công
                đều mang trong mình một câu chuyện đáng được lắng nghe và trân
                trọng.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Đội ngũ{" "}
                <strong className="text-slate-900">
                  Ban Giám Tuyển Printz
                </strong>{" "}
                làm việc trực tiếp với các nghệ nhân để ghi lại, biên tập và
                xuất bản những câu chuyện này một cách trung thực và tôn trọng.
                Chúng tôi không chỉ là người kể chuyện, mà còn là cầu nối giữa
                nghệ nhân và những người yêu thích nghệ thuật thủ công.
              </p>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 md:py-20 px-4 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">
                Nguyên Tắc Cốt Lõi
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Mọi nội dung trên Printz Magazine đều tuân thủ 6 nguyên tắc biên
                tập sau
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle,
                title: "Tính Xác Thực",
                description:
                  "Mọi thông tin về nghệ nhân, kỹ thuật và nguồn gốc sản phẩm đều được xác minh trực tiếp với nghệ nhân hoặc nguồn đáng tin cậy.",
              },
              {
                icon: Users,
                title: "Tôn Trọng Nghệ Nhân",
                description:
                  "Nghệ nhân là tác giả ý tưởng. Chúng tôi chỉ là người biên tập và kể lại câu chuyện của họ với sự đồng ý và phê duyệt.",
              },
              {
                icon: Eye,
                title: "Minh Bạch",
                description:
                  "Chúng tôi công khai quy trình biên tập, nguồn thông tin và mối quan hệ thương mại với các nghệ nhân đối tác.",
              },
              {
                icon: Scale,
                title: "Công Bằng & Khách Quan",
                description:
                  "Nội dung biên tập độc lập với hoạt động kinh doanh. Bài viết không bị ảnh hưởng bởi quan hệ đối tác hay quảng cáo.",
              },
              {
                icon: Heart,
                title: "Bảo Tồn Di Sản",
                description:
                  "Ưu tiên nội dung góp phần bảo tồn và phát huy giá trị di sản văn hóa, kỹ thuật thủ công truyền thống Việt Nam.",
              },
              {
                icon: Sparkles,
                title: "Chất Lượng Cao",
                description:
                  "Mọi bài viết đều trải qua quy trình biên tập nghiêm ngặt về nội dung, hình ảnh và trình bày trước khi xuất bản.",
              },
            ].map((principle, idx) => (
              <ScrollAnimation key={idx} variant="fadeInUp" delay={idx * 100}>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 h-full">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <principle.icon className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Process */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">
                Quy Trình Biên Tập
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Mỗi bài viết trên Printz Magazine đều trải qua quy trình 5 bước
                nghiêm ngặt
              </p>
            </div>
          </ScrollAnimation>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Nghiên Cứu & Tiếp Cận",
                description:
                  "Đội ngũ giám tuyển nghiên cứu và tiếp cận nghệ nhân, tìm hiểu câu chuyện, kỹ thuật và triết lý sáng tạo của họ.",
              },
              {
                step: "02",
                title: "Phỏng Vấn & Ghi Nhận",
                description:
                  "Thực hiện phỏng vấn trực tiếp hoặc qua video call. Ghi nhận câu chuyện bằng chính lời kể của nghệ nhân, chụp ảnh/quay video tại xưởng.",
              },
              {
                step: "03",
                title: "Biên Tập & Sáng Tạo",
                description:
                  "Ban biên tập chuyển hóa nội dung thô thành bài viết hoàn chỉnh, giữ nguyên tinh thần và thông điệp của nghệ nhân.",
              },
              {
                step: "04",
                title: "Xác Minh & Phê Duyệt",
                description:
                  "Gửi bản nháp cho nghệ nhân xem xét và phê duyệt. Chỉnh sửa theo phản hồi để đảm bảo tính chính xác.",
              },
              {
                step: "05",
                title: "Xuất Bản & Theo Dõi",
                description:
                  "Xuất bản bài viết với đầy đủ credit cho nghệ nhân. Theo dõi phản hồi và cập nhật nếu cần thiết.",
              },
            ].map((item, idx) => (
              <ScrollAnimation key={idx} variant="fadeInUp" delay={idx * 100}>
                <div className="flex gap-6 items-start">
                  <div className="shrink-0 w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                    <span className="text-amber-400 font-bold text-lg">
                      {item.step}
                    </span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Authorship */}
      <section className="py-16 md:py-20 px-4 bg-amber-50">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-full px-4 py-2 mb-6">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span className="text-amber-800 text-sm font-medium">
                  Dual Authorship
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">
                Quyền Tác Giả Kép
              </h2>
            </div>
          </ScrollAnimation>

          <ScrollAnimation variant="fadeInUp" delay={100}>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Author - Artisan */}
                <div className="text-center p-6 bg-stone-50 rounded-xl">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-amber-700" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                    Tác Giả Ý Tưởng
                  </h3>
                  <p className="text-amber-700 font-medium mb-3">Nghệ Nhân</p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Nghệ nhân là nguồn gốc của mọi câu chuyện. Họ sở hữu kiến
                    thức, kỹ thuật và triết lý sáng tạo được chia sẻ trong bài
                    viết.
                  </p>
                </div>

                {/* Editor - Printz */}
                <div className="text-center p-6 bg-stone-50 rounded-xl">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                    Biên Tập & Xuất Bản
                  </h3>
                  <p className="text-slate-700 font-medium mb-3">
                    Ban Giám Tuyển Printz
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Printz chịu trách nhiệm biên tập, trình bày và xuất bản nội
                    dung. Đảm bảo chất lượng và tính nhất quán của bài viết.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-200 text-center">
                <p className="text-slate-600 text-sm">
                  Mọi bài viết đều ghi rõ tên nghệ nhân (Author) và được đánh
                  dấu
                  <span className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-full text-xs text-amber-800 font-medium">
                    Biên tập bởi Printz Curators
                  </span>
                  để thể hiện mô hình quyền tác giả kép này.
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Corrections & Updates */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">
                Chính Sách Sửa Lỗi
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Chúng tôi cam kết sửa chữa mọi sai sót một cách nhanh chóng và
                minh bạch
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation variant="fadeInUp" delay={100}>
            <div className="bg-stone-50 rounded-xl p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Sửa Lỗi Nhỏ</h3>
                  <p className="text-slate-600">
                    Lỗi chính tả, ngữ pháp hoặc định dạng sẽ được sửa ngay mà
                    không cần thông báo.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-2">
                    Sửa Lỗi Nội Dung
                  </h3>
                  <p className="text-slate-600">
                    Sai sót về thông tin (tên, ngày tháng, số liệu) sẽ được sửa
                    và ghi chú "Đã cập nhật" kèm ngày sửa ở cuối bài viết.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-2">
                    Đính Chính Quan Trọng
                  </h3>
                  <p className="text-slate-600">
                    Sai sót nghiêm trọng ảnh hưởng đến ý nghĩa bài viết sẽ được
                    đính chính công khai với thông báo rõ ràng ở đầu bài.
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-200">
                  <p className="text-slate-600 text-sm">
                    <strong>Báo lỗi:</strong> Nếu bạn phát hiện sai sót trong
                    bài viết, vui lòng liên hệ{" "}
                    <a
                      href="mailto:editorial@printz.vn"
                      className="text-amber-700 hover:underline"
                    >
                      editorial@printz.vn
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollAnimation variant="fadeInUp">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              Liên Hệ Ban Biên Tập
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Nếu bạn là nghệ nhân muốn chia sẻ câu chuyện, hoặc có câu hỏi về
              chính sách biên tập, hãy liên hệ với chúng tôi.
            </p>
          </ScrollAnimation>

          <ScrollAnimation variant="fadeInUp" delay={100}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:editorial@printz.vn"
                className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <FileCheck className="w-5 h-5" />
                editorial@printz.vn
              </a>
              <a
                href="/lien-he"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/20"
              >
                <Users className="w-5 h-5" />
                Liên hệ chung
              </a>
            </div>
          </ScrollAnimation>

          <ScrollAnimation variant="fadeInUp" delay={200}>
            <p className="text-slate-400 text-sm mt-8">
              Cập nhật lần cuối: Tháng 12, 2025
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <Footer />
    </div>
  );
}
