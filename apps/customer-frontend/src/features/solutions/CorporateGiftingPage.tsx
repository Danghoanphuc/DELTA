import { Header, Footer } from "@/features/landing/components";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import {
  MessageSquareHeart,
  Globe,
  Feather,
  Coffee,
  ArrowRight,
} from "lucide-react";

export default function ConsultingPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HERO SECTION: Nhẹ nhàng, không hô hào */}
      <section className="pt-40 pb-20 px-4 border-b border-stone-200">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-mono text-xs text-stone-500 uppercase tracking-[0.2em] mb-4 block">
            Cultural Diplomacy
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 leading-relaxed italic">
            "Của cho không bằng Cách cho"
          </h1>
          <p className="text-stone-600 text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Chúng tôi không dám nhận mình là bậc thầy ngoại giao. <br />
            Chúng tôi chỉ xin làm người kể chuyện, giúp bạn chọn ra một vật phẩm
            đủ <strong>Tinh</strong> và đủ <strong>Tình</strong> để gửi gắm tâm
            ý đến đối tác phương xa.
          </p>
        </div>
      </section>

      {/* PHILOSOPHY: Triết lý khiêm nhường */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl text-stone-900 mb-4">
                Lắng nghe trước, <br />
                Gợi ý sau.
              </h2>
              <p className="text-stone-700 leading-relaxed font-light">
                Trước khi nói về gốm, về lụa hay sơn mài, chúng tôi muốn được
                nghe bạn kể về người nhận quà.
              </p>
              <p className="text-stone-700 leading-relaxed font-light">
                Họ đến từ đâu? Họ trân trọng sự tĩnh tại hay thích sự sôi nổi?
                Mối quan hệ giữa hai bên đang ở giai đoạn "Gõ cửa" hay đã là
                "Thâm giao"?
              </p>
              <div className="bg-stone-100 p-6 rounded-sm border-l-2 border-stone-400">
                <p className="text-stone-600 text-sm italic">
                  "Một món quà đúng ý nghĩa hơn ngàn lời nói hoa mỹ. Nó cho thấy
                  bạn đã dành thời gian để thấu hiểu văn hóa của họ."
                </p>
              </div>
            </div>
            <div className="relative h-full min-h-[300px] bg-stone-200 rounded-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544253032-4d76f4ae1a23?q=80&w=800&auto=format&fit=crop"
                alt="Tea conversation"
                className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CULTURAL CONTEXT: Thể hiện sự am hiểu một cách nhẹ nhàng */}
      <section className="py-20 bg-white border-y border-stone-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <Globe className="w-10 h-10 text-stone-400 mx-auto mb-4" />
            <h2 className="font-serif text-3xl text-stone-900 mb-4">
              Mỗi vùng đất, một ngôn ngữ quà tặng
            </h2>
            <p className="text-stone-500 font-light">
              Sự tinh tế nằm ở việc hiểu rõ những cấm kỵ và sở thích văn hóa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group p-8 border border-stone-200 hover:border-amber-800/30 transition-all duration-500 bg-[#FBFBF9]">
              <h3 className="font-serif text-xl text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                Đối tác Nhật Bản & Hàn Quốc
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed font-light mb-4">
                Họ trọng nghi thức và bao bì. Một món quà được gói ghém bằng
                khăn lụa (Furoshiki) hay hộp gỗ mộc sẽ được đánh giá cao hơn
                những thứ phô trương vàng son.
              </p>
              <ul className="text-xs text-stone-500 space-y-1 list-disc list-inside">
                <li>Gợi ý: Gốm men mộc, Trà, Hộp sơn mài tối giản.</li>
                <li>Tránh: Số lượng 4, màu trắng tang tóc.</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="group p-8 border border-stone-200 hover:border-amber-800/30 transition-all duration-500 bg-[#FBFBF9]">
              <h3 className="font-serif text-xl text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                Đối tác Âu - Mỹ
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed font-light mb-4">
                Họ yêu thích câu chuyện (Storytelling) và tính thủ công
                (Handmade). Họ muốn biết ai là người làm ra nó, ở ngôi làng nào,
                quy trình ra sao.
              </p>
              <ul className="text-xs text-stone-500 space-y-1 list-disc list-inside">
                <li>Gợi ý: Tranh khắc gỗ, Lụa tơ tằm tự nhiên.</li>
                <li>Tránh: Quà quá đắt tiền (vi phạm chính sách nhận quà).</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="group p-8 border border-stone-200 hover:border-amber-800/30 transition-all duration-500 bg-[#FBFBF9]">
              <h3 className="font-serif text-xl text-stone-900 mb-3 group-hover:text-amber-800 transition-colors">
                Đối tác Trung Hoa & Á Đông
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed font-light mb-4">
                Họ quan tâm đến Phong thủy, ý nghĩa biểu tượng và sự thịnh
                vượng. Màu đỏ, vàng kim và các biểu tượng may mắn luôn được đón
                nhận.
              </p>
              <ul className="text-xs text-stone-500 space-y-1 list-disc list-inside">
                <li>Gợi ý: Gốm vẽ vàng, Trầm hương, Tượng linh vật.</li>
                <li>Tránh: Đồng hồ, vật sắc nhọn.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROCESS: Quy trình từ tốn */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl text-stone-900 mb-12 text-center">
            Buổi trò chuyện bắt đầu thế nào?
          </h2>

          <div className="space-y-10 border-l border-stone-300 ml-4 pl-8 relative">
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-stone-200 border-4 border-[#F9F8F6]"></span>
              <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-800" />
                Trà đàm & Thấu hiểu
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-sm">
                Chúng tôi mời bạn một chén trà (hoặc qua một cuộc gọi thân mật).
                Không có catalog dày cộm, không chèo kéo. Chỉ có những câu hỏi
                để hiểu rõ "đề bài" ngoại giao của bạn.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-stone-200 border-4 border-[#F9F8F6]"></span>
              <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-800" />
                Soạn thảo Giải pháp
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-sm">
                Đội ngũ giám tuyển sẽ lục tìm trong kho tàng các làng nghề để
                chọn ra 2-3 phương án tinh tế nhất. Chúng tôi chuẩn bị cả câu
                chuyện văn hóa đi kèm (bằng tiếng Anh/Việt) để bạn kể lại với
                đối tác.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-stone-200 border-4 border-[#F9F8F6]"></span>
              <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                <MessageSquareHeart className="w-4 h-4 text-amber-800" />
                Trao gửi & Dặn dò
              </h4>
              <p className="text-stone-600 font-light leading-relaxed text-sm">
                Món quà được đóng gói chỉn chu. Chúng tôi sẽ dặn dò bạn kỹ lưỡng
                về cách trao, thời điểm trao và những lưu ý nhỏ để món quà phát
                huy hết giá trị tinh thần.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA: Nhẹ nhàng, mời gọi */}
      <section className="py-24 bg-stone-900 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-stone-400 text-sm mb-6 uppercase tracking-widest font-light">
            An Nam Curator
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#F9F8F6] mb-8 italic leading-snug">
            "Nếu bạn đang tìm một món quà để nói thay lòng mình..."
          </h2>
          <p className="text-stone-300 font-light mb-10 leading-relaxed">
            Hãy để lại thông tin. Chúng tôi sẽ liên hệ để lắng nghe câu chuyện
            của bạn một cách riêng tư và tận tâm nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-[#F9F8F6] text-stone-900 hover:bg-stone-200 px-8 py-6 rounded-sm font-bold uppercase tracking-widest text-xs transition-all w-full sm:w-auto">
                Đặt hẹn tư vấn
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                variant="outline"
                className="border-stone-600 text-stone-400 hover:text-white hover:border-white px-8 py-6 rounded-sm font-bold uppercase tracking-widest text-xs transition-all w-full sm:w-auto"
              >
                Xem Thư Viện Quà <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
