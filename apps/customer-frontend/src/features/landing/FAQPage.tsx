import { useState } from "react";
import { Header, Footer } from "./components";

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => (
  <div className="border-2 border-stone-900 overflow-hidden bg-white hover:bg-stone-50 transition-colors">
    <button
      onClick={onToggle}
      className="w-full px-6 py-5 text-left flex items-center justify-between"
    >
      <h3 className="font-bold text-lg text-stone-900 pr-4 uppercase tracking-wide">
        {question}
      </h3>
      <span className="text-stone-900 flex-shrink-0 font-bold text-xl">
        {isOpen ? "−" : "+"}
      </span>
    </button>
    {isOpen && (
      <div className="px-6 pb-6 border-t-2 border-stone-900">
        <div className="prose prose-stone max-w-none pt-4">{answer}</div>
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
      title: "Về Sản phẩm & Chất liệu",
      items: [
        {
          question:
            "Tại sao màu men của cái chén này không giống hệt cái trong ảnh?",
          answer: (
            <div>
              <p className="mb-4 text-stone-800 leading-relaxed">
                Thưa quý khách, đó là sự kỳ diệu của{" "}
                <strong>Gốm men Hỏa biến</strong>. Ở nhiệt độ{" "}
                <strong>1.300 độ C</strong>, ngọn lửa "vẽ" lên men một cách ngẫu
                nhiên.
              </p>
              <p className="text-stone-700 leading-relaxed">
                Không ai, kể cả nghệ nhân giỏi nhất, có thể tạo ra 2 chiếc chén
                giống hệt nhau. Quý khách đang sở hữu một{" "}
                <strong>tác phẩm độc nhất vô nhị</strong>.
              </p>
            </div>
          ),
        },
        {
          question: "Trầm hương bên bạn là tự nhiên hay nhân tạo?",
          answer: (
            <div>
              <p className="mb-4 text-stone-800 leading-relaxed">
                Printz cam kết chỉ sử dụng <strong>Trầm Kiến tự nhiên</strong>{" "}
                hoặc <strong>Trầm Vi sinh</strong> (cấy tạo trên cây Dó Bầu
                thật), tuyệt đối không dùng Trầm tẩm hóa chất ép dầu.
              </p>
              <p className="text-stone-700 leading-relaxed">
                Mùi hương khi đốt lên sẽ dịu nhẹ, ngọt sâu, không gây khét hay
                đau đầu.
              </p>
            </div>
          ),
        },
        {
          question: "Sản phẩm có được bảo hành không?",
          answer: (
            <div>
              <p className="mb-4 text-stone-800 leading-relaxed">
                Chúng tôi cam kết <strong>Bảo hành trọn đời</strong> về chất
                lượng nguyên liệu:
              </p>
              <ul className="space-y-2 text-stone-700">
                <li>• Gỗ không mối mọt, không cong vênh</li>
                <li>• Men gốm không phai màu, không bong tróc</li>
                <li>• Sơn mài không bị bạc màu theo thời gian</li>
              </ul>
            </div>
          ),
        },
      ],
    },
    {
      title: "Về Đặt hàng & Sản xuất",
      items: [
        {
          question:
            "Tôi muốn đặt số lượng ít (5-10 bộ) để tặng Sếp có được không?",
          answer: (
            <div>
              <p className="mb-4 text-stone-800 leading-relaxed">
                <strong>Hoàn toàn được.</strong> Chúng tôi có các Bộ sưu tập có
                sẵn (Ready-to-ship) dành cho nhu cầu tặng lẻ cao cấp.
              </p>
              <div className="bg-stone-50 p-4 border-2 border-stone-900">
                <p className="text-stone-900 font-bold mb-2 uppercase tracking-wide">
                  Lưu ý:
                </p>
                <p className="text-stone-700">
                  Dịch vụ "Thiết kế bao bì riêng" chỉ áp dụng cho đơn hàng từ{" "}
                  <strong>50 bộ trở lên</strong>.
                </p>
              </div>
            </div>
          ),
        },
        {
          question: "Thời gian sản xuất mất bao lâu?",
          answer: (
            <div>
              <div className="space-y-3">
                <div className="bg-stone-50 p-4 border-2 border-stone-900">
                  <p className="text-stone-800">
                    <strong>Set quà tiêu chuẩn:</strong>{" "}
                    <span className="font-bold">3-5 ngày</span>
                  </p>
                </div>
                <div className="bg-white p-4 border-2 border-stone-900">
                  <p className="text-stone-800">
                    <strong>Đơn hàng "Bespoke"</strong> (Chế tác riêng, vẽ vàng,
                    khắc tên): <span className="font-bold">10-15 ngày</span>
                  </p>
                </div>
              </div>
              <p className="mt-4 text-stone-700 leading-relaxed">
                Xin quý khách lưu ý đặt sớm để nghệ nhân có thời gian trau
                chuốt.
              </p>
            </div>
          ),
        },
        {
          question: "Có nhận đặt hàng theo thiết kế riêng không?",
          answer: (
            <div>
              <p className="mb-4 text-stone-800 leading-relaxed">
                <strong>Có.</strong> Đây chính là thế mạnh của chúng tôi. Mỗi
                doanh nghiệp có một câu chuyện riêng, và chúng tôi giúp quý
                khách kể câu chuyện đó qua món quà.
              </p>
              <p className="text-stone-700 leading-relaxed">
                Vui lòng liên hệ Nhà Giám tuyển để được tư vấn chi tiết về quy
                trình "May đo" (Bespoke).
              </p>
            </div>
          ),
        },
      ],
    },
    {
      title: "Về Vận chuyển & Hậu mãi",
      items: [
        {
          question: "Gửi đi tỉnh xa có sợ vỡ không?",
          answer: (
            <div>
              <p className="mb-4 text-stone-800 leading-relaxed">
                Chúng tôi sử dụng quy cách đóng gói{" "}
                <strong>"3 lớp bảo vệ"</strong>:
              </p>
              <ul className="space-y-2 text-stone-700 mb-4">
                <li>• Giấy rơm chèn chặt</li>
                <li>• Hộp cứng định hình</li>
                <li>• Thùng carton 5 lớp chống sốc</li>
              </ul>
              <p className="text-stone-800 leading-relaxed">
                Tỷ lệ vỡ khi vận chuyển của chúng tôi hiện tại là dưới{" "}
                <strong>0.5%</strong>. Nếu vỡ, chúng tôi đền bù ngay lập tức.
              </p>
            </div>
          ),
        },
        {
          question: "Có xuất hóa đơn đỏ không?",
          answer: (
            <div>
              <p className="text-stone-800 leading-relaxed">
                <strong>Có.</strong> 100% đơn hàng đều được xuất{" "}
                <strong>hóa đơn VAT điện tử</strong> hợp lệ, đầy đủ chứng từ
                nguồn gốc xuất xứ.
              </p>
            </div>
          ),
        },
        {
          question: "Nếu sản phẩm bị lỗi thì xử lý thế nào?",
          answer: (
            <div>
              <p className="mb-4 text-stone-800 leading-relaxed">
                Chúng tôi cam kết chính sách <strong>Đổi 1-1 trong 24h</strong>{" "}
                nếu sản phẩm bị lỗi kỹ thuật từ phía sản xuất.
              </p>
              <div className="bg-stone-50 p-4 border-2 border-stone-900">
                <p className="text-stone-900 font-bold mb-2 uppercase tracking-wide">
                  Quy trình:
                </p>
                <ol className="space-y-2 text-stone-700">
                  <li>1. Quay video lúc mở hàng</li>
                  <li>2. Gửi video và ảnh lỗi qua Zalo/Email</li>
                  <li>3. Chúng tôi xác nhận và gửi hàng thay thế ngay</li>
                </ol>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "Về Thanh toán & Chính sách",
      items: [
        {
          question: "Quy định thanh toán như thế nào?",
          answer: (
            <div>
              <div className="space-y-3">
                <div className="bg-stone-50 p-4 border-2 border-stone-900">
                  <p className="text-stone-800">
                    <strong>Đơn dưới 5 triệu:</strong> Thanh toán 100% trước khi
                    sản xuất
                  </p>
                </div>
                <div className="bg-white p-4 border-2 border-stone-900">
                  <p className="text-stone-800">
                    <strong>Đơn trên 5 triệu:</strong> Đặt cọc 70% khi chốt đơn,
                    thanh toán 30% còn lại khi nhận hàng
                  </p>
                </div>
              </div>
            </div>
          ),
        },
        {
          question: "Có chính sách công nợ (trả sau) không?",
          answer: (
            <div>
              <p className="text-stone-800 leading-relaxed">
                Chính sách công nợ 30 ngày chỉ áp dụng cho{" "}
                <strong>Khách hàng Doanh nghiệp thân thiết</strong>, có ký Hợp
                đồng Nguyên tắc và đã trải qua quá trình thẩm định tín dụng của
                bộ phận Tài chính.
              </p>
            </div>
          ),
        },
        {
          question: "Có chính sách ưu đãi cho đơn hàng lớn không?",
          answer: (
            <div>
              <p className="mb-4 text-stone-800 leading-relaxed">
                <strong>Có.</strong> Chúng tôi có chính sách giá ưu đãi theo
                khối lượng:
              </p>
              <ul className="space-y-2 text-stone-700">
                <li>• Đơn hàng từ 100 bộ: Giảm 5%</li>
                <li>• Đơn hàng từ 300 bộ: Giảm 10%</li>
                <li>
                  • Đơn hàng từ 500 bộ: Giảm 15% + Tư vấn thiết kế miễn phí
                </li>
              </ul>
            </div>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4 border-b-4 border-stone-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 font-bold leading-tight">
            GIẢI ĐÁP TỪ
            <br />
            NHÀ GIÁM TUYỂN
          </h1>
          <p className="text-stone-600 text-lg uppercase tracking-wider mb-4">
            Curator's FAQ
          </p>
          <p className="text-stone-700 max-w-2xl mx-auto leading-relaxed">
            Những câu hỏi thường gặp về sản phẩm, quy trình và chính sách tại
            Printz
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="space-y-12 mt-16">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6">
              <div className="mb-8 border-b-2 border-stone-900 pb-4">
                <h2 className="font-serif text-3xl text-stone-900 font-bold uppercase tracking-wider">
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
        <div className="mt-16 bg-stone-50 p-8 border-4 border-stone-900">
          <div className="text-center mb-6">
            <h3 className="font-serif text-2xl text-stone-900 mb-4 font-bold uppercase tracking-wider">
              Vẫn chưa tìm thấy câu trả lời?
            </h3>
            <p className="text-stone-700 leading-relaxed">
              Đừng ngần ngại, hãy liên hệ trực tiếp với chúng tôi. Đội ngũ
              Printz luôn sẵn sàng lắng nghe!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 border-2 border-stone-900 text-center hover:bg-stone-50 transition-colors">
              <div className="text-4xl mb-3">📞</div>
              <h4 className="font-bold text-stone-900 mb-2 uppercase tracking-wide">
                Hotline/Zalo
              </h4>
              <a
                href="tel:0865726848"
                className="text-stone-900 font-bold hover:text-stone-700 transition-colors"
              >
                0865 726 848
              </a>
            </div>

            <div className="bg-white p-6 border-2 border-stone-900 text-center hover:bg-stone-50 transition-colors">
              <div className="text-4xl mb-3">✉️</div>
              <h4 className="font-bold text-stone-900 mb-2 uppercase tracking-wide">
                Email
              </h4>
              <a
                href="mailto:curator@printz.vn"
                className="text-stone-900 font-bold hover:text-stone-700 transition-colors"
              >
                hello@printz.vn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 border-2 border-stone-900">
          <p className="text-stone-900 font-bold leading-relaxed uppercase tracking-wide mb-2">
            ✓ Lưu ý:
          </p>
          <p className="text-stone-700 leading-relaxed">
            Nếu bạn cần hỗ trợ khẩn cấp ngoài giờ hành chính, vui lòng gửi tin
            nhắn Zalo hoặc Email. Chúng tôi sẽ phản hồi trong vòng 30 phút.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
