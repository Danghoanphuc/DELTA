import { useState } from "react";
import { Header, Footer } from "./components";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Shield,
  FileText,
  CreditCard,
} from "lucide-react";

const SummaryBox = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 p-6 bg-gradient-to-br from-emerald-50 to-stone-50 border-2 border-emerald-200/50 rounded-3xl shadow-lg">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <svg
          className="w-5 h-5 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-stone-700 font-medium leading-relaxed italic">
        {children}
      </p>
    </div>
  </div>
);

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => (
  <div className="border-2 border-stone-200/50 rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300">
    <button
      onClick={onToggle}
      className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-stone-50 transition-colors"
    >
      <h3 className="font-serif text-lg text-stone-900 italic pr-4">
        {question}
      </h3>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-stone-500 flex-shrink-0" />
      ) : (
        <ChevronDown className="w-5 h-5 text-stone-500 flex-shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="px-6 pb-6">
        <div className="prose prose-stone max-w-none font-light">{answer}</div>
      </div>
    )}
  </div>
);

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqSections = [
    {
      title: "Về Đặt hàng & Báo giá",
      icon: FileText,
      color: "emerald",
      items: [
        {
          question: "Tôi muốn nhận báo giá thì mất bao lâu?",
          answer: (
            <div>
              <p className="mb-4">Tại Printz, tốc độ là ưu tiên hàng đầu.</p>
              <ul className="space-y-2 mb-4">
                <li>
                  <strong>Với sản phẩm tiêu chuẩn</strong> (Namecard, Tờ rơi, Ly
                  sứ...): Bạn nhận báo giá trong vòng{" "}
                  <span className="text-emerald-600 font-semibold">
                    15 - 30 phút
                  </span>{" "}
                  (Giờ hành chính).
                </li>
                <li>
                  <strong>Với đơn hàng quà tặng phức tạp/thiết kế riêng</strong>
                  : Báo giá chi tiết được gửi trong vòng{" "}
                  <span className="text-emerald-600 font-semibold">24 giờ</span>
                  .
                </li>
              </ul>
            </div>
          ),
        },
        {
          question: "Printz có nhận in số lượng ít (1-2 cái) không?",
          answer: (
            <div>
              <p className="mb-4">
                Printz là đơn vị chuyên cung cấp giải pháp cho Doanh nghiệp
                (B2B), tuy nhiên chúng tôi vẫn hỗ trợ in số lượng ít cho một số
                dòng sản phẩm (như in Ly, Áo thun, Namecard...) để làm mẫu hoặc
                phục vụ nhu cầu cá nhân.
              </p>
              <div className="bg-amber-50 p-4 rounded-3xl border-2 border-amber-200/50 shadow-lg">
                <p className="text-amber-800 font-medium">
                  <strong>Lưu ý:</strong> Đơn hàng số lượng ít sẽ có đơn giá cao
                  hơn so với in công nghiệp số lượng lớn.
                </p>
              </div>
            </div>
          ),
        },
        {
          question:
            "Tôi có được xem mẫu thực tế trước khi đặt hàng loạt không?",
          answer: (
            <div>
              <p className="mb-4">Chắc chắn rồi!</p>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-200/50 shadow-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    ✅ Duyệt mẫu Online (Miễn phí)
                  </h4>
                  <p className="text-blue-700">
                    Printz gửi file Mockup 2D/3D để bạn hình dung.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-3xl border-2 border-purple-200/50 shadow-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    ✅ In mẫu thử (Proofing)
                  </h4>
                  <p className="text-purple-700">
                    Với đơn hàng lớn (&gt;5 triệu), chúng tôi khuyến khích in
                    mẫu thật để duyệt màu sắc và chất liệu. Phí in mẫu sẽ được{" "}
                    <strong>hoàn lại 100%</strong> khi bạn chốt đơn hàng sản
                    xuất.
                  </p>
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "Về Thanh toán & Hóa đơn",
      icon: CreditCard,
      color: "blue",
      items: [
        {
          question: "Printz có xuất hóa đơn VAT (Hóa đơn đỏ) không?",
          answer: (
            <div>
              <p className="mb-4">
                <strong>Có.</strong> Là doanh nghiệp tuân thủ pháp luật,{" "}
                <span className="text-blue-600 font-semibold">
                  100% đơn hàng
                </span>{" "}
                tại Printz đều có thể xuất hóa đơn GTGT điện tử (e-Invoice) hợp
                lệ để doanh nghiệp của bạn khấu trừ thuế.
              </p>
            </div>
          ),
        },
        {
          question: "Quy định đặt cọc và thanh toán như thế nào?",
          answer: (
            <div>
              <p className="mb-4">
                Vì đặc thù ngành in là "Sản xuất theo yêu cầu" (hàng in ra không
                thể bán lại cho người khác), Printz áp dụng quy định:
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-3xl border-2 border-green-200/50 shadow-lg">
                  <p className="text-green-800">
                    <strong>Đơn dưới 5 triệu:</strong> Thanh toán 100% trước khi
                    sản xuất.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-200/50 shadow-lg">
                  <p className="text-blue-800">
                    <strong>Đơn trên 5 triệu:</strong> Đặt cọc 50% khi chốt đơn,
                    thanh toán 50% còn lại ngay sau khi nhận hàng và nghiệm thu.
                  </p>
                </div>
              </div>
            </div>
          ),
        },
        {
          question: "Công ty tôi muốn công nợ (trả sau) được không?",
          answer: (
            <div>
              <p className="mb-4">
                Chính sách công nợ 30 ngày chỉ áp dụng cho{" "}
                <strong>Khách hàng Doanh nghiệp thân thiết</strong>, có ký Hợp
                đồng Nguyên tắc và đã trải qua quá trình thẩm định tín dụng của
                bộ phận Tài chính Printz.
              </p>
            </div>
          ),
        },
      ],
    },
    {
      title: "Về File thiết kế & Kỹ thuật",
      icon: FileText,
      color: "purple",
      items: [
        {
          question:
            "Tôi chưa có file thiết kế, Printz có hỗ trợ thiết kế không?",
          answer: (
            <div>
              <p className="mb-4">
                <strong>Có.</strong>
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-3xl border-2 border-green-200/50 shadow-lg">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Miễn phí
                  </h4>
                  <p className="text-green-700">
                    Nếu bạn chỉ cần chỉnh sửa cơ bản (thêm logo, sửa chữ) trên
                    file có sẵn.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-200/50 shadow-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">
                    💰 Tính phí
                  </h4>
                  <p className="text-orange-700">
                    Nếu bạn cần thiết kế sáng tạo mới hoàn toàn (Logo, Branding,
                    Key Visual). Chi phí sẽ được báo trước trong Hợp đồng.
                  </p>
                </div>
              </div>
            </div>
          ),
        },
        {
          question:
            "Tại sao màu in ra nhìn không giống trên màn hình điện thoại của tôi?",
          answer: (
            <div>
              <p className="mb-4">
                Đây là vấn đề kỹ thuật vật lý. Màn hình điện thoại hiển thị hệ
                màu <strong>RGB</strong> (phát sáng, rực rỡ), còn máy in dùng
                mực <strong>CMYK</strong> (hấp thụ ánh sáng, trầm hơn).
              </p>
              <div className="bg-amber-50 p-4 rounded-3xl border-2 border-amber-200/50 shadow-lg">
                <p className="text-amber-800">
                  Theo tiêu chuẩn ngành in, độ lệch màu cho phép là{" "}
                  <strong>10-15%</strong>. Để đảm bảo màu sắc chuẩn nhất, vui
                  lòng cung cấp mã màu Pantone nếu có.
                </p>
              </div>
            </div>
          ),
        },
        {
          question: "Nếu tôi gửi file sai chính tả thì sao?",
          answer: (
            <div>
              <p className="mb-4">
                Printz có quy trình <strong>"Duyệt Maquette"</strong> (Mẫu in).
                Chúng tôi chỉ tiến hành in khi bạn đã xác nhận{" "}
                <strong>"OK IN"</strong> qua Zalo/Email.
              </p>
              <div className="bg-red-50 p-4 rounded-3xl border-2 border-red-200/50 shadow-lg">
                <p className="text-red-800 font-medium">
                  <strong>Lưu ý:</strong> Printz không chịu trách nhiệm với các
                  lỗi nội dung/chính tả sau khi bạn đã xác nhận duyệt file. Hãy
                  kiểm tra thật kỹ nhé!
                </p>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "Về Giao hàng & Bảo hành",
      icon: Shield,
      color: "green",
      items: [
        {
          question: "Nếu hàng giao tới bị vỡ hoặc hỏng hóc thì xử lý thế nào?",
          answer: (
            <div>
              <p className="mb-4">
                Printz cam kết chính sách <strong>Bảo hành 1-1</strong>.
              </p>
              <p className="mb-4">
                Nếu hàng bị vỡ do vận chuyển hoặc lỗi in ấn từ phía chúng tôi,
                bạn chỉ cần quay video lúc mở hàng và gửi lại trong vòng{" "}
                <strong>3 ngày</strong>. Printz sẽ{" "}
                <span className="text-green-600 font-semibold">
                  IN LẠI CẤP TỐC
                </span>{" "}
                và giao bù miễn phí, bạn không tốn thêm bất kỳ chi phí nào.
              </p>
            </div>
          ),
        },
        {
          question: "Thời gian giao hàng mất bao lâu?",
          answer: (
            <div>
              <p className="mb-4">Tùy thuộc vào sản phẩm:</p>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-3xl border-2 border-green-200/50 shadow-lg">
                  <p className="text-green-800">
                    <strong>In nhanh KTS</strong> (Namecard, Tờ rơi):{" "}
                    <span className="font-semibold">1-2 ngày</span>
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-200/50 shadow-lg">
                  <p className="text-blue-800">
                    <strong>Quà tặng gia công</strong> (Sổ tay, Hộp cứng):{" "}
                    <span className="font-semibold">5-7 ngày</span>
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-3xl border-2 border-red-200/50 shadow-lg">
                  <p className="text-red-800">
                    <strong>Đơn hàng gấp (Hỏa tốc):</strong> Vui lòng liên hệ
                    Hotline 0865 726 848 để được ưu tiên xử lý trong{" "}
                    <span className="font-semibold">24h</span>.
                  </p>
                </div>
              </div>
            </div>
          ),
        },
        {
          question:
            "Tôi ở tỉnh xa (ngoài Bình Dương/TP.HCM) có đặt hàng được không?",
          answer: (
            <div>
              <p className="mb-4">
                <strong>Được.</strong> Printz hợp tác với Viettel Post, GHTK và
                các chành xe uy tín để giao hàng toàn quốc. Hàng hóa được đóng
                gói 3 lớp chống sốc an toàn.
              </p>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Câu hỏi thường gặp.
          </h1>
          <p className="text-stone-600 text-lg mb-4">
            Giải đáp nhanh các thắc mắc về Dịch vụ & Quy trình tại Printz
            Solutions
          </p>
          <p className="text-stone-400 text-sm">
            Cập nhật lần cuối: 20/12/2025
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="space-y-12">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div
                  className={`w-12 h-12 rounded-3xl bg-${section.color}-100 border-2 border-${section.color}-200/50 flex items-center justify-center shadow-lg`}
                >
                  <section.icon
                    className={`w-6 h-6 text-${section.color}-600`}
                  />
                </div>
                <h2 className="font-serif text-3xl text-stone-900 italic">
                  {sectionIndex + 1}. {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item, itemIndex) => {
                  const globalIndex = sectionIndex * 100 + itemIndex;
                  return (
                    <FAQItem
                      key={globalIndex}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openItems.includes(globalIndex)}
                      onToggle={() => toggleItem(globalIndex)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-gradient-to-br from-emerald-50 to-stone-50 p-8 rounded-3xl border-2 border-emerald-200/50 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="font-serif text-2xl text-stone-900 italic mb-4">
              Vẫn chưa tìm thấy câu trả lời?
            </h3>
            <p className="text-stone-600">
              Đừng ngần ngại, hãy liên hệ trực tiếp với chúng tôi. Đội ngũ
              Printz luôn sẵn sàng lắng nghe!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border-2 border-stone-200/50 shadow-lg text-center hover:shadow-xl transition-all duration-300">
              <Phone className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h4 className="font-semibold text-stone-900 mb-2">
                Hotline/Zalo
              </h4>
              <a
                href="tel:0865726848"
                className="text-emerald-600 font-medium hover:text-emerald-800 transition-colors"
              >
                0865 726 848
              </a>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-stone-200/50 shadow-lg text-center hover:shadow-xl transition-all duration-300">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-stone-900 mb-2">Email</h4>
              <a
                href="mailto:b2b@printz.vn"
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                b2b@printz.vn
              </a>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-stone-200/50 shadow-lg text-center hover:shadow-xl transition-all duration-300">
              <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-stone-900 mb-2">Live Chat</h4>
              <p className="text-purple-600 font-medium">
                Bấm nút Chat góc phải màn hình
              </p>
            </div>
          </div>
        </div>

        <SummaryBox>
          Nếu bạn cần hỗ trợ khẩn cấp ngoài giờ hành chính, vui lòng gửi tin
          nhắn Zalo hoặc Email. Chúng tôi sẽ phản hồi trong vòng 2-4 giờ.
        </SummaryBox>
      </section>

      <Footer />
    </div>
  );
}
