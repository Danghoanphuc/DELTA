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
              Câu chuyện của Printz.
            </h1>
          </ScrollAnimation>
          <ScrollAnimation variant="fadeInUp" delay={200}>
            <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto italic">
              Our Story & Philosophy
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
                Một sự thức tỉnh về mục đích kinh doanh
              </h2>
            </ScrollAnimation>
          </div>

          <div className="prose prose-lg prose-stone max-w-none">
            <ScrollAnimation variant="scaleIn">
              <div className="bg-[#F9F8F6] p-8 rounded-3xl mb-12 border-2 border-stone-200/50">
                <h3 className="font-serif text-2xl text-stone-900 italic mb-6 text-center">
                  Vậy, "Trái tim" của chúng tôi đặt ở đâu? (What is our heart?)
                </h3>

                <p className="text-lg leading-relaxed mb-6">
                  Trái tim của Printz không nằm ở những cỗ máy in chạy hết công
                  suất. Không nằm ở kho hàng rộng bao nhiêu mét vuông. Cũng
                  không nằm ở những con số doanh thu vô hồn.
                </p>

                <p className="text-xl font-semibold text-emerald-800 text-center mb-6">
                  Trái tim của chúng tôi đặt ở Cảm Xúc.
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
                <p className="text-lg leading-relaxed">
                  Đó là cảm xúc hãnh diện của một Founder khi lần đầu cầm trên
                  tay chiếc danh thiếp ép kim sắc sảo mang tên mình.
                </p>
                <p className="text-lg leading-relaxed">
                  Đó là sự ấm áp của một khách thân thiết khi nhận được chiếc
                  hộp "Cảm ơn" chỉn chu trong ngày quan trọng của họ.
                </p>
                <p className="text-lg leading-relaxed">
                  Đó là cái gật đầu hài lòng của đối tác khi nhận món quà tri ân
                  tinh tế vào dịp cuối năm.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-stone-50 p-8 rounded-3xl border-2 border-emerald-200/60 shadow-lg">
              <p className="text-xl font-semibold text-stone-900 text-center">
                Chúng tôi nhận ra rằng: Thứ chúng tôi tạo ra không phải là sản
                phẩm in ấn.
                <br />
                <span className="text-emerald-800 italic">
                  Thứ chúng tôi kiến tạo là TRẢI NGHIỆM THƯƠNG HIỆU.
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
                "Người kể chuyện Thương hiệu qua những Điểm chạm Vật lý."
              </h2>
            </ScrollAnimation>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                Trong một thế giới mà mọi thứ đang bị "số hóa", những giá trị
                vật lý (Physical Touchpoints) lại trở nên quý giá hơn bao giờ
                hết. Một email cảm ơn có thể bị xóa trong 1 giây, nhưng một tấm
                thiệp viết tay trên chất liệu giấy mỹ thuật sẽ được giữ lại trên
                bàn làm việc nhiều năm.
              </p>
              <p className="text-lg leading-relaxed">
                Printz Solutions ra đời để làm cầu nối giữa Thương hiệu và Khách
                hàng thông qua những vật phẩm hữu hình ấy. Chúng tôi không bán
                giấy, không bán mực.
                <strong>
                  {" "}
                  Chúng tôi cung cấp Dịch vụ Gia tăng Trải nghiệm (Brand
                  Experience Enhancement Service).
                </strong>
              </p>
            </div>
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800&auto=format&fit=crop"
                className="w-full h-80 object-cover rounded-3xl shadow-lg border-2 border-stone-200/30"
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-stone-200/50">
            <p className="text-xl text-center font-semibold text-stone-900">
              Nhiệm vụ của Printz là đảm bảo rằng:
              <br />
              <span className="text-emerald-800 italic">
                Mỗi khi khách hàng chạm vào sản phẩm của bạn, họ phải cảm nhận
                được sự Chuyên nghiệp, Sự Trân trọng và Đẳng cấp mà bạn muốn gửi
                gắm.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* TRIẾT LÝ VẬN HÀNH */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4 block">
              3. Triết lý vận hành
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 italic">
              "LÀM THẬT"
            </h2>
            <p className="text-lg text-stone-600 italic">
              Steve Jobs nói chúng ta "Vốn dĩ đã trần trụi". Vì vậy, Printz chọn
              cách làm việc không che giấu, minh bạch và chân thành nhất.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-stone-200/50 text-center hover:shadow-xl transition-all duration-300 hover:border-emerald-200/60">
              <Shield className="w-12 h-12 mx-auto mb-4 text-emerald-600" />
              <h3 className="font-serif text-xl text-stone-900 mb-4 italic">
                Không hứa hão
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Chúng tôi không hứa những điều hão huyền: Không cam kết "rẻ nhất
                thị trường" để rồi cắt xén chất lượng giấy hay dùng mực thải.
                Chúng tôi cam kết mức giá tương xứng nhất với trải nghiệm bạn
                nhận được.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-stone-200/50 text-center hover:shadow-xl transition-all duration-300 hover:border-blue-200/60">
              <Target className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-serif text-xl text-stone-900 mb-4 italic">
                Đối diện sai lầm
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Trong sản xuất, rủi ro là điều hiện hữu. Sự khác biệt của Printz
                là chúng tôi không đổ lỗi cho máy móc hay thời tiết.
                <strong>Lỗi là nhận. Hỏng là đền.</strong> Đền bù xứng đáng và
                xử lý ngay lập tức.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-stone-200/50 text-center hover:shadow-xl transition-all duration-300 hover:border-purple-200/60">
              <Heart className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-serif text-xl text-stone-900 mb-4 italic">
                Phục vụ bằng lòng trắc ẩn
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Trước mỗi dự án, đội ngũ Printz luôn tự hỏi: "Nếu mình là người
                nhận món quà này, mình có thấy vui không?". Chỉ khi câu trả lời
                là <strong>"CÓ"</strong>, chúng tôi mới bấm nút triển khai.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
                className="w-full h-80 object-cover rounded-3xl shadow-lg border-2 border-stone-200/30"
              />
            </div>
            <div className="space-y-6">
              <h3 className="font-serif text-2xl text-stone-900 italic">
                Tại sao chọn Printz làm bạn đồng hành?
              </h3>
              <p className="text-lg leading-relaxed">
                Chúng tôi định vị mình là{" "}
                <strong>Strategic Partner (Đối tác chiến lược)</strong> chứ
                không phải là Vendor (Nhà cung cấp).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE PRINTZ */}
      <section className="py-24 px-4 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
              <h3 className="font-serif text-xl mb-4 italic">Tư duy Dịch vụ</h3>
              <p className="text-stone-300 leading-relaxed">
                Chúng tôi "gánh" thay bạn những áp lực về kỹ thuật in ấn, quản
                lý màu sắc, đóng gói và vận chuyển. Bạn chỉ cần tập trung vào
                kinh doanh, phần hậu cần hình ảnh hãy để Printz lo.
              </p>
            </div>

            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
              <h3 className="font-serif text-xl mb-4 italic">Sự Nhất quán</h3>
              <p className="text-stone-300 leading-relaxed">
                Printz bị ám ảnh bởi sự hoàn hảo của màu sắc thương hiệu. Logo
                của bạn trên ly sứ, trên áo thun hay trên giấy... tất cả phải là
                một thể thống nhất.
              </p>
            </div>

            <div className="text-center">
              <Handshake className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
              <h3 className="font-serif text-xl mb-4 italic">
                Giải pháp Trọn gói
              </h3>
              <p className="text-stone-300 leading-relaxed">
                Từ lúc lên ý tưởng quà tặng, thiết kế bao bì, sản xuất, Kitting
                (đóng gói combo) cho đến khi giao tận tay từng nhân viên/khách
                hàng của bạn.
              </p>
            </div>
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
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop"
                className="w-full h-96 object-cover rounded-3xl shadow-lg border-2 border-stone-200/30"
              />
            </div>
            <div className="space-y-6">
              <blockquote className="text-lg leading-relaxed italic">
                "Cảm ơn bạn đã ghé thăm ngôi nhà của Printz.
                <br />
                <br />
                Tôi biết, bạn có hàng trăm lựa chọn ngoài kia. Nhưng nếu bạn
                đang tìm kiếm một đối tác không chỉ biết in, mà còn biết nghĩ
                cho thương hiệu của bạn; một đối tác không chỉ làm cho xong
                việc, mà làm để tự hào, thì Printz ở đây để chào đón bạn.
                <br />
                <br />
                Chúng ta chỉ sống một lần. Hãy cùng nhau tạo ra những sản phẩm
                tử tế, đẹp đẽ và để lại dấu ấn trong lòng khách hàng. Vì đó là
                cách duy nhất để không lãng phí thời gian hữu hạn của chúng ta."
              </blockquote>
              <div className="pt-6 border-t border-stone-300">
                <p className="font-semibold text-stone-900">Đặng Hoàn Phúc</p>
                <p className="text-stone-600 font-mono text-sm uppercase tracking-widest">
                  Founder, Printz Brand Solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-4xl mb-6 italic">
            Sẵn sàng bắt đầu hành trình cùng Printz?
          </h2>
          <p className="text-stone-300 mb-8 text-lg">
            Hãy để chúng tôi giúp bạn tạo ra những trải nghiệm thương hiệu đáng
            nhớ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Bắt đầu dự án
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
