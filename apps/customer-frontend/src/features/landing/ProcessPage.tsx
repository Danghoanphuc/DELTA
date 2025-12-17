import { Header, Footer } from "./components";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";

const SummaryBox = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 p-6 bg-stone-50 border-2 border-stone-900">
    <p className="text-stone-900 font-bold leading-relaxed uppercase tracking-wide mb-2">
      ✓ Kết quả:
    </p>
    <p className="text-stone-700 leading-relaxed">{children}</p>
  </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 p-6 bg-white border-4 border-stone-900">
    <p className="text-stone-900 font-bold leading-relaxed uppercase tracking-wide mb-2">
      ⚠ Lưu ý:
    </p>
    <p className="text-stone-700 leading-relaxed">{children}</p>
  </div>
);

export default function ProcessPage() {
  const workflowSteps = [
    {
      id: "I",
      title: "Tham Vấn Giám Tuyển",
      subtitle: "The Consultation",
      desc: "Lắng nghe nhu cầu ngoại giao",
      details: {
        intro:
          "Mỗi mối quan hệ đối tác đều có một 'ngôn ngữ' riêng. Chuyên gia của chúng tôi sẽ ngồi lại cùng bạn để giải mã ngôn ngữ đó. Bạn muốn trao gửi sự 'Tĩnh tại' (Trầm hương), sự 'Gắn kết' (Trà) hay sự 'Thành công' (Sơn mài)?",
        method: [
          "Tư vấn ngân sách, số lượng và câu chuyện văn hóa phù hợp",
          "Kênh ưu tiên: Zalo Official Account / Hotline: 0865 726 848",
        ],
        result:
          "Chúng tôi sẽ gửi Catalog điện tử và tư vấn set quà phù hợp nhất với vị thế của người nhận.",
      },
    },
    {
      id: "II",
      title: "Trình Mẫu & Cá Nhân Hóa",
      subtitle: "Curation & Proposal",
      desc: "Chạm vào nguyên bản",
      details: {
        intro:
          "Chúng tôi không gửi ảnh 3D vô hồn. Với các dự án quan trọng, chúng tôi mang mẫu vật phẩm (Physical Sample) đến tận văn phòng bạn. Để bạn chạm vào vân gốm, ngửi mùi hương trầm thực tế.",
        method: [
          "Gửi mẫu thực tế (Physical Sample): Với đơn hàng quan trọng, chúng tôi mang mẫu đến tận văn phòng để quý khách cầm, nắm và cảm nhận chất liệu",
          "Thiết kế Demo: Lên demo thiết kế vị trí khắc logo tinh tế (không phô trương) và nội dung thiệp chúc hạ",
        ],
      },
    },
    {
      id: "III",
      title: "Xác Nhận & Giữ Phôi",
      subtitle: "Reservation",
      desc: "Cam kết độc quyền",
      details: {
        intro:
          "Vì các tác phẩm thủ công (đặc biệt là Gốm hỏa biến và Gỗ lũa) có số lượng phôi giới hạn theo mùa. Việc đặt cọc là bước xác nhận để chúng tôi 'khóa' những phôi đẹp nhất cho riêng bạn.",
        method: [
          "Ký hợp đồng và chốt số lượng, mẫu mã cuối cùng",
          "Thanh toán cọc 70% giá trị tác phẩm",
        ],
        warning:
          "Đây là cam kết để chúng tôi giữ phôi nguyên liệu độc bản cho riêng quý khách và tiến hành in ấn cá nhân hóa (không thể tái sử dụng).",
      },
    },
    {
      id: "IV",
      title: "Chế Tác & Kiểm Định",
      subtitle: "Crafting & QC",
      desc: "Nghệ nhân thổi hồn",
      details: {
        intro:
          "Tại các xưởng làng nghề, nghệ nhân bắt đầu quy trình chế tác thủ công. Sau đó, chuyên gia của Printz sẽ thực hiện quy trình kiểm định 'Kép': Loại bỏ mọi lỗi sai dù là nhỏ nhất nhưng trân trọng những 'sai số tự nhiên' của vật liệu.",
        method: [
          "Chế tác thủ công: Nghệ nhân hoàn thiện sản phẩm tại làng nghề",
          "Kiểm định Kép: Loại bỏ lỗi kỹ thuật nhưng giữ lại đặc tính tự nhiên",
          "Chứng thực: Ký tên và đóng dấu đỏ lên 'Chứng thư Giám tuyển' (Certificate of Authenticity)",
        ],
      },
    },
    {
      id: "V",
      title: "Trao Tác Phẩm",
      subtitle: "Handover",
      desc: "Nghi thức bàn giao",
      details: {
        intro:
          "Tác phẩm được đóng gói trong hộp cứng cao cấp, thắt nơ lụa và vận chuyển bằng xe chuyên dụng để đảm bảo an toàn tuyệt đối.",
        method: [
          "Giao hàng: Đội ngũ chuyên biệt giao tận tay (khu vực nội thành)",
          "Nghiệm thu: Kiểm tra số lượng, hình thức và Chứng thư đi kèm",
          "Thanh toán: Thanh toán 30% còn lại ngay khi nhận hàng",
          "Hóa đơn: Hóa đơn VAT điện tử gửi qua email trong vòng 24h",
        ],
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HEADER */}
      <section className="pt-40 pb-20 px-4 border-b-4 border-stone-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 font-bold leading-tight">
            QUY TRÌNH TUYỂN CHỌN
            <br />& CHẾ TÁC
          </h1>
          <p className="text-stone-600 text-lg uppercase tracking-wider mb-6">
            The Bespoke Journey
          </p>
          <p className="text-stone-700 max-w-3xl mx-auto leading-relaxed mb-4 text-lg">
            Một hành trình đi từ <strong>Thấu hiểu</strong> đến{" "}
            <strong>Tuyệt tác</strong>.
          </p>
          <p className="text-stone-800 max-w-3xl mx-auto leading-relaxed font-medium">
            Tại <strong>Printz</strong>, chúng tôi không bán hàng hóa có sẵn
            trên kệ. Mỗi món quà được trao đi là kết quả của một quy trình "May
            đo" (Bespoke) tỉ mỉ, nơi Di sản văn hóa gặp gỡ Vị thế doanh nghiệp.
          </p>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white p-12 md:p-16 border-2 border-stone-900 mb-16 mt-16">
          <h2 className="font-serif text-4xl text-stone-900 mb-12 text-center font-bold uppercase tracking-wider">
            Hành Trình 5 Bước
          </h2>

          <div className="space-y-12">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Step Header */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-16 h-16 bg-stone-900 border-2 border-stone-900 flex items-center justify-center flex-shrink-0 text-white font-bold text-2xl">
                    {step.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl text-stone-900 mb-1 font-bold uppercase tracking-wide">
                      {step.title}
                    </h3>
                    {step.subtitle && (
                      <p className="text-stone-600 text-sm mb-2 uppercase tracking-wider">
                        {step.subtitle}
                      </p>
                    )}
                    <p className="text-stone-700 font-medium">{step.desc}</p>
                  </div>
                </div>

                {/* Step Details */}
                <div className="ml-22 space-y-4">
                  <div className="bg-stone-50 p-6 border-2 border-stone-900">
                    {step.details.intro && (
                      <p className="text-stone-800 mb-4 leading-relaxed font-medium">
                        {step.details.intro}
                      </p>
                    )}

                    {step.details.method && (
                      <ul className="space-y-3">
                        {step.details.method.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-stone-900 mt-2 flex-shrink-0"></div>
                            <span className="text-stone-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {step.details.result && (
                      <SummaryBox>{step.details.result}</SummaryBox>
                    )}

                    {step.details.warning && (
                      <WarningBox>{step.details.warning}</WarningBox>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index < workflowSteps.length - 1 && (
                  <div className="flex justify-center my-8">
                    <div className="w-px h-8 bg-stone-900"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT INFORMATION */}
        <div className="bg-white p-12 md:p-16 border-2 border-stone-900 mb-16">
          <h2 className="font-serif text-4xl text-stone-900 mb-8 font-bold uppercase tracking-wider">
            Thông tin Thanh toán
          </h2>

          <p className="text-stone-800 mb-8 font-medium">
            Chúng tôi trân trọng sự minh bạch trong mọi giao dịch.
          </p>

          <div className="bg-stone-50 p-8 border-2 border-stone-900 mb-8">
            <h3 className="font-bold text-stone-900 mb-6 uppercase tracking-wide text-xl">
              Tài khoản Doanh nghiệp (Nhận hóa đơn VAT)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-stone-700 mb-2">
                  <strong>Chủ tài khoản:</strong>
                  <br />
                  CÔNG TY TNHH GIẢI PHÁP THƯƠNG HIỆU PRINTZ
                </p>
                <p className="text-stone-700 mb-2">
                  <strong>Số tài khoản:</strong> [Điền số tài khoản của bạn]
                </p>
                <p className="text-stone-700">
                  <strong>Ngân hàng:</strong> [Tên ngân hàng], Chi nhánh Bình
                  Dương
                </p>
              </div>
              <div>
                <p className="text-stone-700">
                  <strong>Nội dung chuyển khoản:</strong>
                  <br />
                  [Tên Khách Hàng] + [Số điện thoại] hoặc [Mã Đơn Hàng]
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border-2 border-stone-900">
            <h4 className="font-bold text-stone-900 mb-3 uppercase tracking-wide">
              Lưu ý về Hóa đơn:
            </h4>
            <ul className="space-y-2 text-stone-700">
              <li>
                • Giá báo trên website/bảng giá thường chưa bao gồm VAT (trừ khi
                có ghi chú khác).
              </li>
              <li>
                • Hóa đơn điện tử sẽ được gửi qua Email của Quý khách ngay sau
                khi giao hàng thành công.
              </li>
            </ul>
          </div>
        </div>

        {/* POLICIES SECTION */}
        <div className="bg-white p-12 md:p-16 border-2 border-stone-900">
          <h2 className="font-serif text-4xl text-stone-900 mb-8 font-bold uppercase tracking-wider">
            Các Chính sách Quan trọng
          </h2>

          {/* Policy 1: Lead Time */}
          <div className="mb-10">
            <div className="mb-4">
              <h3 className="font-serif text-2xl text-stone-900 font-bold uppercase tracking-wide">
                1. Về Thời Gian (Lead Time)
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-50 p-6 border-2 border-stone-900">
                <p className="text-stone-700 mb-2">
                  <strong>Đơn hàng tiêu chuẩn:</strong> Cần đặt trước tối thiểu{" "}
                  <span className="text-stone-900 font-bold">3 - 5 ngày</span>.
                </p>
              </div>

              <div className="bg-white p-6 border-2 border-stone-900">
                <p className="text-stone-700 mb-2">
                  <strong>Đơn hàng hỏa tốc (trong 24h):</strong> Phụ thu phí ưu
                  tiên <span className="text-stone-900 font-bold">20%</span>{" "}
                  (Chỉ áp dụng với một số dòng sản phẩm có sẵn phôi).
                </p>
              </div>

              <WarningBox>
                Các sản phẩm thủ công (Sơn mài, Gốm) cần thời gian để xử lý bề
                mặt hoàn hảo. Chúng tôi xin phép từ chối các đơn hàng quá gấp
                làm ảnh hưởng đến chất lượng tác phẩm.
              </WarningBox>
            </div>
          </div>

          {/* Policy 2: Natural Variance */}
          <div className="mb-10">
            <div className="mb-4">
              <h3 className="font-serif text-2xl text-stone-900 font-bold uppercase tracking-wide">
                2. Về Sai số Tự nhiên (Natural Variance)
              </h3>
            </div>

            <div className="bg-stone-50 p-6 border-2 border-stone-900">
              <p className="text-stone-700 leading-relaxed">
                Như đã nêu trong{" "}
                <Link
                  to="/shipping-policy"
                  className="text-stone-900 font-bold underline hover:text-stone-700"
                >
                  Tuyên ngôn Độc bản
                </Link>
                , quý khách vui lòng chấp nhận sự chênh lệch nhỏ (không quá 5%)
                về vân men, vân gỗ hoặc sắc độ màu giữa các sản phẩm. Đây là đặc
                tính xác thực của hàng thủ công, không phải lỗi.
              </p>
            </div>
          </div>

          {/* Policy 3: Warranty */}
          <div>
            <div className="mb-4">
              <h3 className="font-serif text-2xl text-stone-900 font-bold uppercase tracking-wide">
                3. Chính sách Đổi trả & Bảo hiểm
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-50 p-6 border-2 border-stone-900">
                <h4 className="font-bold text-stone-900 mb-3 uppercase tracking-wide">
                  ✓ Cam kết 1 đổi 1 trong 24h
                </h4>
                <p className="text-stone-700 mb-0">
                  Nếu sản phẩm bị nứt, vỡ, hỏng hóc do quá trình vận chuyển.
                </p>
              </div>

              <div className="bg-white p-6 border-2 border-stone-900">
                <h4 className="font-bold text-stone-900 mb-3 uppercase tracking-wide">
                  ✓ Bảo hành trọn đời
                </h4>
                <p className="text-stone-700 mb-0">
                  Printz chịu trách nhiệm về chất lượng nguyên liệu trọn đời (Gỗ
                  không mối mọt, Men không phai màu).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-stone-900 text-white border-t-4 border-stone-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-serif text-4xl mb-4 text-white font-bold uppercase tracking-wider">
            Sẵn sàng sở hữu tác phẩm độc bản?
          </h2>
          <p className="text-stone-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Liên hệ ngay với Nhà Giám tuyển của Printz để được tư vấn về các bộ
            sưu tập giới hạn và bắt đầu quy trình chế tác riêng cho doanh nghiệp
            của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-stone-900 hover:bg-stone-100 px-8 py-6 text-sm font-bold uppercase tracking-widest border-2 border-white transition-colors"
            >
              Tư vấn Giám tuyển
            </Link>
            <a
              href="tel:0865726848"
              className="inline-flex items-center justify-center gap-2 bg-stone-800 text-white hover:bg-stone-700 px-8 py-6 text-sm font-bold uppercase tracking-widest border-2 border-white transition-colors"
            >
              0865 726 848
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
