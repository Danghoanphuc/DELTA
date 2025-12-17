import { Header, Footer } from "./components";
import { Button } from "@/shared/components/ui/button";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { Quote, Heart, Users, Handshake, Shield, Target } from "lucide-react";
import { ScrollAnimation } from "@/shared/components/ScrollAnimation";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO */}
      <section className="pt-40 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation variant="fadeInDown">
            <h1 className="font-serif text-6xl md:text-8xl text-stone-900 mb-8 italic leading-tight">
              Câu chuyện của Printz
            </h1>
          </ScrollAnimation>
          <ScrollAnimation variant="fadeInUp" delay={200}>
            <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto italic">
              Nơi Di sản gặp gỡ Ngoại giao – Where Heritage meets Diplomacy
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* STEVE JOBS QUOTE */}
      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        {/* Organic background shapes */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <ScrollAnimation variant="scaleIn">
              <Quote className="w-16 h-16 mx-auto mb-8 text-stone-400" />
            </ScrollAnimation>
            <ScrollAnimation variant="fadeIn" delay={200}>
              <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed italic mb-8">
                "Luôn tâm niệm rằng mình sẽ chết là cách tốt nhất tôi biết để
                thoát khỏi cái bẫy của nỗi sợ mất mát. Chúng ta vốn dĩ đã trần
                trụi. Chẳng có lý do gì để không can đảm đi theo tiếng gọi của
                trái tim."
              </blockquote>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={400}>
              <cite className="text-stone-400 font-mono text-sm uppercase tracking-widest">
                — Steve Jobs
              </cite>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeIn" delay={600}>
              <p className="text-stone-300 text-lg mt-8 max-w-3xl mx-auto leading-relaxed">
                Câu nói ấy không chỉ là kim chỉ nam cho một cuộc đời, mà còn là
                khởi nguồn cho một triết lý kinh doanh tại đây. Trong dòng chảy
                vô tận của thời gian, thứ duy nhất còn lại sau những cuộc gặp
                gỡ, những cái bắt tay hay những bản hợp đồng, chính là{" "}
                <strong>Cảm xúc</strong>.
              </p>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* KHỞI NGUYÊN */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <ScrollAnimation variant="fadeInUp">
              <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 block">
                1. Khởi nguyên
              </span>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={200}>
              <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 italic">
                Một sự thức tỉnh văn hóa
              </h2>
            </ScrollAnimation>
          </div>

          <div className="prose prose-lg prose-stone max-w-none">
            <ScrollAnimation variant="scaleIn">
              <div className="bg-[#F9F8F6] p-8 rounded-3xl mb-12 border-2 border-stone-200/50">
                <h3 className="font-serif text-2xl text-stone-900 italic mb-6 text-center">
                  "Chúng ta đang tặng gì cho nhau?"
                </h3>

                <p className="text-lg leading-relaxed mb-6">
                  Giữa một thế giới phẳng, nơi những món quà công nghiệp bóng
                  bẩy nhưng vô hồn lên ngôi, chúng tôi tự hỏi: Liệu một chiếc
                  bút ký khắc tên hay một cuốn sổ da nhập khẩu có đủ để kể câu
                  chuyện về vị thế của người tặng? Liệu nó có đủ sức nặng để giữ
                  chân một đối tác phương xa?
                </p>

                <p className="text-xl font-semibold text-emerald-800 text-center mb-6">
                  Câu trả lời là Không.
                </p>

                <p className="text-lg leading-relaxed">
                  Chúng ta đang thiếu đi những{" "}
                  <strong>"Đại sứ không lời"</strong>. Chúng ta thiếu những vật
                  phẩm mang trong mình hơi thở của đất trời, sự kiên nhẫn của
                  thời gian và chiều sâu của văn hóa Á Đông – thứ duy nhất khiến
                  thế giới phải cúi đầu ngưỡng mộ.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop"
                  className="w-full h-80 object-cover rounded-3xl shadow-lg border-2 border-stone-200/30"
                />
              </div>
              <div className="space-y-6">
                <h3 className="font-serif text-2xl text-stone-900 italic">
                  Sứ mệnh của Người Giám Tuyển
                </h3>
                <p className="text-lg leading-relaxed">
                  Chúng tôi không định vị mình là một xưởng sản xuất quà tặng.
                  Chúng tôi là{" "}
                  <strong>
                    Những Nhà Giám Tuyển Văn Hóa (Heritage Curators)
                  </strong>
                  .
                </p>
                <p className="text-lg leading-relaxed">
                  Sứ mệnh của chúng tôi là đi dọc chiều dài đất nước, gõ cửa
                  những xưởng gốm ẩn mình bên dòng sông Hồng, ngồi trà đàm cùng
                  những nghệ nhân già dưới mái hiên làng nghề sơn mài cổ... để
                  tìm ra những "viên ngọc thô" chưa bị thương mại hóa.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-stone-50 p-8 rounded-3xl border-2 border-emerald-200/60 shadow-lg">
              <p className="text-xl font-semibold text-stone-900 text-center">
                Chúng tôi mang những tuyệt tác ấy về, thổi vào đó một hơi thở
                đương đại, đóng gói chúng trong sự trang trọng của nghi thức
                ngoại giao,
                <br />
                <span className="text-emerald-800 italic">
                  và trao nó vào tay bạn – như một vũ khí thượng hạng để chinh
                  phục lòng người.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHÚNG TÔI LÀ AI */}
      <section className="py-24 px-4 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <ScrollAnimation variant="fadeInUp">
              <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 block">
                2. Chúng tôi là ai?
              </span>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={200}>
              <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 italic">
                "Người kể chuyện Phương Đông qua những vật phẩm độc bản"
              </h2>
            </ScrollAnimation>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                Nếu phương Tây chinh phục thế giới bằng sự chính xác và công
                nghệ, thì phương Đông quyến rũ nhân loại bằng sự{" "}
                <strong>Tĩnh tại (Zen)</strong> và{" "}
                <strong>Chiều sâu (Depth)</strong>.
              </p>
              <p className="text-lg leading-relaxed">
                Chúng tôi cung cấp{" "}
                <strong>
                  Giải pháp Quà tặng Ngoại giao & Văn hóa (Cultural & Diplomatic
                  Gifting Solution)
                </strong>{" "}
                dành riêng cho những doanh nghiệp muốn khẳng định vị thế bằng
                "Quyền lực mềm".
              </p>
              <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200/60">
                <p className="text-base leading-relaxed italic text-stone-700">
                  Chúng tôi không bán một bộ ấm chén. Chúng tôi bán triết lý{" "}
                  <strong>"Giao Hảo"</strong> bên chén trà.
                  <br />
                  <br />
                  Chúng tôi không bán một lư đốt trầm. Chúng tôi bán sự{" "}
                  <strong>"Tĩnh Tại"</strong> giữa thương trường khốc liệt.
                  <br />
                  <br />
                  Chúng tôi không bán một hộp sơn mài. Chúng tôi bán sự{" "}
                  <strong>"Kiên Nhẫn"</strong> mài giũa để đạt đến độ bóng của
                  thành công.
                </p>
              </div>
            </div>
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800&auto=format&fit=crop"
                className="w-full h-80 object-cover rounded-3xl shadow-lg border-2 border-stone-200/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRIẾT LÝ VẬN HÀNH */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <ScrollAnimation variant="fadeInUp">
              <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 block">
                3. Triết lý vận hành
              </span>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={200}>
              <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 italic">
                Cốt lõi của sự khác biệt
              </h2>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={300}>
              <p className="text-lg text-stone-600 italic max-w-3xl mx-auto">
                Tại đây, chúng tôi tôn thờ 3 giá trị cốt lõi, cũng là lời cam
                kết đanh thép nhất gửi tới Quý đối tác
              </p>
            </ScrollAnimation>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <ScrollAnimation variant="scaleIn" delay={100}>
              <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-stone-200/50 text-center hover:shadow-xl transition-all duration-300 hover:border-emerald-200/60">
                <Shield className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
                <h3 className="font-serif text-xl text-stone-900 mb-4 italic">
                  Độc bản Tự nhiên
                </h3>
                <p className="text-stone-600 leading-relaxed text-sm">
                  Chúng tôi từ chối sự hoàn hảo công nghiệp vô hồn. Vết rạn của
                  men gốm hỏa biến, đường vân tự nhiên của gỗ, hay độ sâu không
                  đồng nhất của màu sơn mài... chính là{" "}
                  <strong>"vân tay" của tạo hóa</strong>. Sự không hoàn hảo mới
                  chính là vẻ đẹp độc nhất.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="scaleIn" delay={200}>
              <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-stone-200/50 text-center hover:shadow-xl transition-all duration-300 hover:border-blue-200/60">
                <Target className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-serif text-xl text-stone-900 mb-4 italic">
                  Giới hạn & Chọn lọc
                </h3>
                <p className="text-stone-600 leading-relaxed text-sm">
                  Không sản xuất đại trà. Không bán tràn lan. Mỗi bộ sưu tập quà
                  tặng của chúng tôi đều được{" "}
                  <strong>giới hạn số lượng (Limited Edition)</strong> và đánh
                  số thứ tự. Khi bạn tặng một món quà từ chúng tôi, bạn đang
                  trao đi một tác phẩm nghệ thuật có giấy khai sinh.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="scaleIn" delay={300}>
              <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-stone-200/50 text-center hover:shadow-xl transition-all duration-300 hover:border-purple-200/60">
                <Heart className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-serif text-xl text-stone-900 mb-4 italic">
                  Tôn trọng Nguyên bản
                </h3>
                <p className="text-stone-600 leading-relaxed text-sm">
                  Chúng tôi không lai căng. Chúng tôi kể câu chuyện văn hóa Việt
                  Nam nhưng dưới lăng kính thẩm mỹ đương đại{" "}
                  <strong>(Contemporary Indochine)</strong> và triết lý Á Đông.
                  Sang trọng nhưng không phô trương. Kín đáo nhưng đầy nội lực.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 px-4 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <ScrollAnimation variant="fadeInUp">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 block">
                4. Tại sao chọn chúng tôi?
              </span>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={200}>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 italic">
                Bởi vì bạn hiểu rằng...
              </h2>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={300}>
              <p className="text-stone-300 text-lg max-w-3xl mx-auto leading-relaxed">
                Ở vị thế của bạn và đối tác, tiền bạc không còn là thước đo duy
                nhất.
                <strong className="text-white">
                  {" "}
                  Sự Trân Trọng và Tầm Vóc Văn Hóa
                </strong>{" "}
                mới là thứ định đoạt mối quan hệ.
              </p>
            </ScrollAnimation>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollAnimation variant="fadeInUp" delay={100}>
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                <h3 className="font-serif text-xl mb-4 italic">
                  Tư duy Giám tuyển
                </h3>
                <p className="text-stone-300 leading-relaxed">
                  Chúng tôi thay bạn chắt lọc những tinh hoa nhất, loại bỏ những
                  chi tiết rườm rà, sến súa thường thấy ở hàng thủ công mỹ nghệ
                  đại trà.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeInUp" delay={200}>
              <div className="text-center">
                <Handshake className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                <h3 className="font-serif text-xl mb-4 italic">
                  Giải pháp Trọn gói
                </h3>
                <p className="text-stone-300 leading-relaxed">
                  Từ ý tưởng câu chuyện, thiết kế bao bì mang dấu ấn doanh
                  nghiệp, đến chế tác và vận chuyển an toàn tuyệt đối.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeInUp" delay={300}>
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                <h3 className="font-serif text-xl mb-4 italic">
                  Cam kết Dịch vụ
                </h3>
                <p className="text-stone-300 leading-relaxed">
                  Chúng tôi phục vụ khách hàng B2B với tiêu chuẩn của một "Quản
                  gia cao cấp" (Concierge) – Tỉ mỉ, Riêng tư và Tận tâm.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* FOUNDER MESSAGE */}
      <section className="py-24 px-4 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <ScrollAnimation variant="fadeInUp">
              <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 block">
                5. Lời kết từ nhà sáng lập
              </span>
            </ScrollAnimation>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollAnimation variant="scaleIn">
              <div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop"
                  className="w-full h-96 object-cover rounded-3xl shadow-lg border-2 border-stone-200/30"
                />
              </div>
            </ScrollAnimation>
            <ScrollAnimation variant="fadeInUp" delay={200}>
              <div className="space-y-6">
                <blockquote className="text-lg leading-relaxed italic text-stone-700">
                  "Cảm ơn bạn đã dừng chân tại đây, giữa muôn vàn lựa chọn ngoài
                  kia.
                  <br />
                  <br />
                  Tôi tin rằng, mỗi món quà được trao đi là một thông điệp không
                  lời. Nó nói lên bạn là ai, bạn trân trọng mối quan hệ này đến
                  nhường nào, và cái 'Tầm' văn hóa của doanh nghiệp bạn đang ở
                  đâu.
                  <br />
                  <br />
                  Đừng để những món quà vô tri làm nhạt nhòa đi dấu ấn của bạn.
                  Hãy để chúng tôi giúp bạn kể câu chuyện về sự Tĩnh Tại, về Di
                  Sản và về tấm lòng hiếu khách của người phương Đông – một cách
                  đầy kiêu hãnh.
                  <br />
                  <br />
                  Bởi vì, như Steve Jobs đã nói, chúng ta vốn dĩ trần trụi. Hãy
                  để lại những gì đẹp đẽ và chân thật nhất cho cuộc đời này."
                </blockquote>
                <div className="pt-6 border-t border-stone-300">
                  <p className="font-semibold text-stone-900">Đặng Hoàn Phúc</p>
                  <p className="text-stone-600 font-mono text-sm uppercase tracking-widest">
                    Founder & Head Curator
                  </p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollAnimation variant="fadeInUp">
            <h2 className="font-serif text-4xl md:text-5xl mb-6 italic">
              Sẵn sàng nâng tầm vị thế ngoại giao của bạn?
            </h2>
          </ScrollAnimation>
          <ScrollAnimation variant="fadeInUp" delay={200}>
            <p className="text-stone-300 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
              Đừng tặng quà chỉ vì phải tặng. Hãy tặng để khắc ghi dấu ấn.
              <br />
              Liên hệ với Nhà Giám Tuyển của chúng tôi để nhận tư vấn riêng cho
              doanh nghiệp của bạn.
            </p>
          </ScrollAnimation>
          <ScrollAnimation variant="scaleIn" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Khám phá Bộ sưu tập Di sản
              </Button>
              <Button className="bg-transparent border-2 border-white hover:bg-white hover:text-stone-900 text-white px-8 py-6 rounded-2xl text-base font-semibold transition-all duration-300">
                Tư vấn riêng
              </Button>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <Footer />
    </div>
  );
}
