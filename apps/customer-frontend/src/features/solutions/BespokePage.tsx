import { Header, Footer } from "@/features/landing/components";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import {
  PenTool,
  Gem,
  Crown,
  Palette,
  Fingerprint,
  Sparkles,
} from "lucide-react";

export default function BespokePage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HERO SECTION */}
      <section className="pt-40 pb-24 px-4 border-b border-stone-200 bg-stone-900 text-white relative overflow-hidden">
        {/* Background Art */}
        <div className="absolute inset-0 opacity-20">
          {/* Giả lập vân tay nghệ nhân hoặc bản vẽ kỹ thuật mờ */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-900/30 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 border border-stone-700 px-4 py-2 rounded-full bg-stone-800/50 backdrop-blur-md">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs uppercase tracking-widest text-stone-300">
              The Bespoke Service
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">
            Độc bản.
            <br />
            <span className="italic text-amber-500">
              Như chính vị thế của bạn.
            </span>
          </h1>

          <p className="text-stone-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Khi những món quà có sẵn là không đủ để kể câu chuyện của doanh
            nghiệp. Chúng tôi mời bạn bước vào hành trình{" "}
            <strong>Đồng sáng tạo (Co-creation)</strong> cùng những nghệ nhân
            hàng đầu.
          </p>

          <Link to="/contact">
            <Button className="bg-white text-stone-900 hover:bg-stone-200 px-10 py-6 rounded-sm font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Đặt lịch thiết kế riêng
            </Button>
          </Link>
        </div>
      </section>

      {/* PHILOSOPHY: Tại sao cần Bespoke? */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-amber-800 font-bold tracking-widest uppercase text-xs mb-4 block">
              Triết lý chế tác
            </span>
            <h2 className="font-serif text-4xl text-stone-900 mb-6 leading-tight">
              Không chỉ là khắc Logo.
              <br />
              Đó là khắc <span className="italic text-stone-500">Dấu ấn</span>.
            </h2>
            <div className="space-y-6 text-stone-600 font-light leading-relaxed">
              <p>
                Nhiều người lầm tưởng "Cá nhân hóa" chỉ đơn giản là in logo công
                ty lên một chiếc cốc có sẵn. Tại Printz, chúng tôi gọi đó là
                "Đánh dấu", chưa phải là "Chế tác".
              </p>
              <p>
                <strong>Bespoke (Chế tác độc bản)</strong> là khi món quà được
                sinh ra từ chính DNA của thương hiệu bạn. Từ màu men gốm được
                pha riêng theo màu logo, đến mùi hương trầm được thiết kế để gợi
                nhớ không gian văn phòng của bạn.
              </p>
              <p className="text-stone-900 font-medium italic border-l-2 border-amber-800 pl-4">
                "Một tác phẩm Bespoke không cần nhìn logo cũng biết thuộc về
                ai."
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-stone-900 transform translate-x-4 translate-y-4"></div>
            <img
              src="https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?q=80&w=800&auto=format&fit=crop"
              alt="Artisan sketching"
              className="relative z-10 w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </section>

      {/* 3 LEVELS OF BESPOKE */}
      <section className="py-24 bg-stone-100 px-4 border-y border-stone-200">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">
              3 Cấp độ Chế tác
            </h2>
            <p className="text-stone-500 font-light">
              Lựa chọn cấp độ phù hợp với ngân sách và thông điệp ngoại giao của
              bạn
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Level 1 */}
            <div className="bg-white p-8 border border-stone-200 hover:border-stone-900 transition-all duration-300 group">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-500 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-2">
                Level 1: Signature
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-4">
                Dấu ấn Thương hiệu
              </p>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 min-h-[80px]">
                Tinh chỉnh trên những tác phẩm đã được giám tuyển sẵn. Phù hợp
                cho nhu cầu quà tặng hội nghị, sự kiện với số lượng vừa và nhỏ.
              </p>
              <ul className="space-y-3 text-sm text-stone-700 border-t border-stone-100 pt-6">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">●</span> Khắc Laser tên riêng
                  từng người nhận (Personalization)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">●</span> In lụa/Vẽ vàng Logo
                  doanh nghiệp
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">●</span> Thiệp chúc mừng
                  thiết kế riêng
                </li>
              </ul>
            </div>

            {/* Level 2 */}
            <div className="bg-stone-900 text-white p-8 border border-stone-900 transform lg:-translate-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-700 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                Most Popular
              </div>
              <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mb-6 text-amber-500">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-white mb-2">
                Level 2: Identity
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4">
                Đồng bộ Nhận diện
              </p>
              <p className="text-stone-400 text-sm leading-relaxed mb-6 min-h-[80px]">
                Thay đổi quy cách đóng gói và phối màu để món quà hòa làm một
                với bộ nhận diện thương hiệu (Brand Guidelines) của bạn.
              </p>
              <ul className="space-y-3 text-sm text-stone-300 border-t border-stone-800 pt-6">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">●</span> Mọi quyền lợi của
                  Level 1
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">●</span> Sản xuất Hộp
                  cứng/Túi giấy theo màu Brand
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">●</span> Thay đổi màu men/màu
                  dây lụa (với số lượng từ 100)
                </li>
              </ul>
            </div>

            {/* Level 3 */}
            <div className="bg-white p-8 border border-stone-200 hover:border-amber-600 transition-all duration-300 group">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-500 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-2">
                Level 3: Masterpiece
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-4">
                Chế tác Độc bản
              </p>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 min-h-[80px]">
                Đặt hàng nghệ nhân sáng tạo một tác phẩm hoàn toàn mới. Độc
                quyền kiểu dáng, khuôn mẫu. Không đụng hàng trên thị trường.
              </p>
              <ul className="space-y-3 text-sm text-stone-700 border-t border-stone-100 pt-6">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">●</span> Thiết kế Kiểu dáng &
                  Khuôn mới 100%
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">●</span> Pha chế dòng men/mùi
                  hương độc quyền
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">●</span> Cam kết hủy khuôn
                  sau khi sản xuất
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MATERIAL SHOWCASE */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=400&auto=format&fit=crop"
                className="rounded-sm mt-8"
                alt="Gốm"
              />
              <img
                src="https://images.unsplash.com/photo-1615486511484-92e172cc416d?q=80&w=400&auto=format&fit=crop"
                className="rounded-sm"
                alt="Sơn mài"
              />
            </div>
            <div className="order-1 md:order-2">
              <span className="text-amber-800 font-bold tracking-widest uppercase text-xs mb-4 block">
                Chất liệu Di sản
              </span>
              <h2 className="font-serif text-4xl text-stone-900 mb-6">
                Những chất liệu biết nói
              </h2>
              <p className="text-stone-600 leading-relaxed mb-8">
                Chúng tôi không in logo lên nhựa hay thủy tinh công nghiệp. Bảng
                màu (Palette) của chúng tôi là những chất liệu đã được thử lửa
                qua hàng thế kỷ:
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">
                      Vàng 24K (Gold Leaf)
                    </h4>
                    <p className="text-sm text-stone-500">
                      Sử dụng kỹ thuật vẽ vàng lỏng hoặc thếp vàng quỳ Kiêu Kỵ
                      để tôn vinh sự thịnh vượng.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                    <Gem className="w-5 h-5 text-stone-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900">
                      Sơn mài Hạ Thái
                    </h4>
                    <p className="text-sm text-stone-500">
                      15 lớp sơn mài thủ công tạo độ sâu thăm thẳm, bền bỉ cùng
                      thời gian như mối thâm giao.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-24 bg-stone-900 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-serif text-3xl md:text-5xl text-white mb-6 italic leading-tight">
            "Hãy biến món quà trở thành <br /> Di sản của Doanh nghiệp."
          </h2>
          <p className="text-stone-400 mb-10 font-light">
            Đừng để ý tưởng của bạn chỉ dừng lại ở bản phác thảo. <br />
            Liên hệ với Giám đốc Sáng tạo của chúng tôi để bắt đầu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-amber-700 hover:bg-amber-800 text-white px-10 py-6 rounded-sm font-bold uppercase tracking-widest transition-all">
                Liên hệ Tư vấn (1:1)
              </Button>
            </Link>
            <Link to="/process">
              <Button
                variant="outline"
                className="border-stone-600 text-stone-300 hover:border-white hover:text-white px-10 py-6 rounded-sm font-bold uppercase tracking-widest transition-all"
              >
                Xem Quy trình Chế tác
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
