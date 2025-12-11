import { Header, Footer } from "./components";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import {
  Check,
  MessageCircle,
  FileText,
  Palette,
  CreditCard,
  Truck,
  Clock,
  Phone,
  Building2,
  AlertCircle,
} from "lucide-react";

const SummaryBox = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 p-6 bg-gradient-to-br from-emerald-50 to-stone-50 border-2 border-emerald-200/50 rounded-3xl shadow-lg">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <Check className="w-5 h-5 text-emerald-600" />
      </div>
      <p className="text-stone-700 font-medium leading-relaxed italic">
        {children}
      </p>
    </div>
  </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 rounded-3xl shadow-lg">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <AlertCircle className="w-5 h-5 text-amber-600" />
      </div>
      <p className="text-stone-700 font-medium leading-relaxed">{children}</p>
    </div>
  </div>
);

export default function ProcessPage() {
  const workflowSteps = [
    {
      id: "01",
      title: "Gửi yêu cầu & Tư vấn",
      icon: MessageCircle,
      color: "emerald",
      desc: "Liên hệ và cung cấp thông tin dự án",
      details: {
        method:
          "Quý khách liên hệ qua Hotline/Zalo 0865 726 848 hoặc điền Form trên website.",
        requirements: [
          "Sản phẩm cần in (Ví dụ: Hộp quà, Sổ tay, Brochure...)",
          "Số lượng dự kiến",
          "Quy cách/Kích thước (nếu có)",
          "File thiết kế (nếu có sẵn)",
        ],
        commitment:
          "Chuyên viên tư vấn của Printz sẽ phản hồi và sơ bộ giải pháp trong vòng 15 phút (Giờ hành chính).",
      },
    },
    {
      id: "02",
      title: "Báo giá & Chốt đơn",
      icon: FileText,
      color: "blue",
      desc: "Nhận báo giá chi tiết và xác nhận đơn hàng",
      details: {
        method:
          "Printz gửi Bảng báo giá chi tiết (Quotation) qua Email hoặc Zalo.",
        requirements: [
          "Đơn hàng nhỏ (< 5 triệu): Xác nhận qua Zalo/Email",
          "Đơn hàng lớn (≥ 5 triệu): Ký Hợp đồng kinh tế và Hợp đồng nguyên tắc (đối với khách hàng thân thiết)",
        ],
      },
    },
    {
      id: "03",
      title: "Thiết kế & Duyệt mẫu",
      icon: Palette,
      color: "purple",
      desc: "Kiểm tra file và duyệt mẫu trước khi sản xuất",
      details: {
        method: "Printz hỗ trợ kiểm tra file hoặc thiết kế mới theo yêu cầu.",
        requirements: [
          "Chúng tôi gửi Maquette (Mẫu duyệt) dạng file ảnh (2D/3D)",
          "Quý khách kiểm tra kỹ nội dung, chính tả, màu sắc",
          "Xác nhận 'OK IN' bằng văn bản/tin nhắn",
        ],
        warning:
          "Đơn hàng chỉ được chuyển xuống xưởng sản xuất sau khi Quý khách đã xác nhận 'OK IN'. Printz miễn trừ trách nhiệm với các lỗi nội dung sau bước này.",
      },
    },
    {
      id: "04",
      title: "Đặt cọc & Sản xuất",
      icon: CreditCard,
      color: "green",
      desc: "Thanh toán tạm ứng và bắt đầu sản xuất",
      details: {
        method:
          "Quý khách tiến hành tạm ứng (đặt cọc) theo quy định hợp đồng (thường là 50% giá trị đơn hàng).",
        requirements: [
          "Printz tiến hành sản xuất hàng loạt",
          "Tiến độ được cập nhật liên tục tới Quý khách",
        ],
      },
    },
    {
      id: "05",
      title: "Giao hàng & Nghiệm thu",
      icon: Truck,
      color: "orange",
      desc: "Giao hàng tận nơi và hoàn tất thanh toán",
      details: {
        method: "Giao hàng tận nơi theo địa chỉ yêu cầu.",
        requirements: [
          "Quý khách kiểm tra hàng hóa (Đồng kiểm), ký Biên bản bàn giao",
          "Thanh toán phần còn lại và nhận Hóa đơn GTGT (e-Invoice)",
        ],
      },
    },
  ];

  const leadTimes = [
    {
      category: "In nhanh KTS",
      products: "Namecard, Tờ rơi, Decal",
      time: "1 - 2 ngày làm việc",
      color: "green",
    },
    {
      category: "Sản phẩm Gia công",
      products: "Hộp cứng, Túi giấy, Sổ tay",
      time: "5 - 7 ngày làm việc",
      color: "blue",
    },
    {
      category: "Quà tặng & Giftset",
      products: "Số lượng lớn",
      time: "7 - 12 ngày làm việc",
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HEADER */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Quy trình Đặt hàng & Thanh toán.
          </h1>
          <p className="text-stone-600 text-lg mb-4">
            Dành cho Khách hàng Doanh nghiệp B2B
          </p>
          <p className="text-stone-500 max-w-3xl mx-auto">
            Tại Printz Solutions, chúng tôi tối ưu hóa quy trình làm việc để đảm
            bảo 3 yếu tố:
            <strong> Tốc độ - Minh bạch - Chính xác</strong>. Dưới đây là 5 bước
            tiêu chuẩn từ lúc tư vấn đến khi bạn nhận hàng trên tay.
          </p>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white p-12 md:p-16 shadow-lg border-2 border-stone-200/50 rounded-3xl mb-16">
          <h2 className="font-serif text-4xl text-stone-900 italic mb-12 text-center">
            Phần 1: Quy trình 5 bước (Workflow)
          </h2>

          <div className="space-y-12">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Step Header */}
                <div className="flex items-start gap-6 mb-6">
                  <div
                    className={`w-16 h-16 rounded-3xl bg-${step.color}-100 border-2 border-${step.color}-200/50 flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <step.icon className={`w-8 h-8 text-${step.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-mono text-2xl font-bold text-stone-400">
                        BƯỚC {step.id}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl text-stone-900 italic mb-2">
                      {step.title}
                    </h3>
                    <p className="text-stone-600">{step.desc}</p>
                  </div>
                </div>

                {/* Step Details */}
                <div className="ml-22 space-y-4">
                  <div className="bg-stone-50 p-6 rounded-3xl border-2 border-stone-200/50 shadow-lg">
                    <h4 className="font-semibold text-stone-900 mb-3">
                      Cách thức:
                    </h4>
                    <p className="text-stone-700 mb-4">{step.details.method}</p>

                    {step.details.requirements && (
                      <>
                        <h4 className="font-semibold text-stone-900 mb-3">
                          {step.id === "01"
                            ? "Thông tin cần cung cấp:"
                            : step.id === "02"
                            ? "Xác nhận đơn hàng:"
                            : "Chi tiết:"}
                        </h4>
                        <ul className="space-y-2">
                          {step.details.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-stone-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-stone-700">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {step.details.commitment && (
                      <SummaryBox>
                        <strong>Cam kết:</strong> {step.details.commitment}
                      </SummaryBox>
                    )}

                    {step.details.warning && (
                      <WarningBox>
                        <strong>Lưu ý:</strong> {step.details.warning}
                      </WarningBox>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index < workflowSteps.length - 1 && (
                  <div className="flex justify-center my-8">
                    <div className="w-px h-8 bg-stone-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PAYMENT INFORMATION */}
        <div className="bg-white p-12 md:p-16 shadow-lg border-2 border-stone-200/50 rounded-3xl mb-16">
          <h2 className="font-serif text-4xl text-stone-900 italic mb-8">
            Phần 2: Thông tin Thanh toán
          </h2>

          <p className="text-stone-600 mb-8">
            Printz khuyến khích thanh toán chuyển khoản để đảm bảo tính minh
            bạch và lưu trữ chứng từ.
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border-2 border-blue-200/50 shadow-lg mb-8">
            <h3 className="font-serif text-2xl text-stone-900 italic mb-6 flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
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

          <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200/50 shadow-lg">
            <h4 className="font-semibold text-amber-800 mb-3">
              Lưu ý về Hóa đơn:
            </h4>
            <ul className="space-y-2 text-amber-700">
              <li>
                • Giá báo trên website/bảng giá thường chưa bao gồm VAT (trừ khi
                có ghi chú khác).
              </li>
              <li>
                • Hóa đơn điện tử sẽ được gửi qua Email của Quý khách ngay sau
                khi giao hàng thành công.
              </li>
            </ul>
          </div>
        </div>

        {/* LEAD TIME SECTION */}
        <div className="bg-white p-12 md:p-16 shadow-lg border-2 border-stone-200/50 rounded-3xl">
          <h2 className="font-serif text-4xl text-stone-900 italic mb-8 flex items-center gap-3">
            <Clock className="w-8 h-8 text-stone-600" />
            Phần 3: Câu hỏi về Tiến độ (Lead Time)
          </h2>

          <div className="grid gap-6 mb-8">
            {leadTimes.map((item, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 p-6 rounded-3xl border-2 border-${item.color}-200/50 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className={`font-serif text-xl text-${item.color}-900 italic mb-2`}
                    >
                      {item.category}
                    </h3>
                    <p className={`text-${item.color}-700 text-sm`}>
                      {item.products}
                    </p>
                  </div>
                  <div
                    className={`bg-${item.color}-600 text-white px-4 py-2 rounded-3xl font-semibold shadow-lg`}
                  >
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-200/50 shadow-lg text-center">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Cần in gấp lấy ngay?
            </h4>
            <p className="text-red-700">
              Vui lòng gọi Hotline để được ưu tiên xử lý đơn hàng Hỏa tốc.
            </p>
            <a
              href="tel:0865726848"
              className="inline-block mt-3 bg-red-600 text-white px-6 py-2 rounded-3xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              0865 726 848
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center bg-stone-900 text-white">
        <h2 className="font-serif text-4xl mb-4 italic text-white">
          Sẵn sàng bắt đầu dự án của bạn?
        </h2>
        <p className="text-stone-300 mb-8 max-w-2xl mx-auto">
          Liên hệ ngay với đội ngũ tư vấn Printz để nhận báo giá chi tiết và bắt
          đầu quy trình đặt hàng.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-6 rounded-3xl text-sm font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link to="/contact">Liên hệ tư vấn</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
