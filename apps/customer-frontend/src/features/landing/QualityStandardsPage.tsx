import { Header, Footer } from "./components";
import {
  CheckCircle2,
  Clock,
  FileCheck,
  Package,
  Truck,
  Zap,
  Shield,
  Ruler,
  Download,
} from "lucide-react";

export default function QualityStandardsPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <Shield className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Tiêu chuẩn Chất lượng
          </h1>
          <p className="text-stone-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Chào mừng đến với Printz Solutions. Chúng tôi chuẩn hóa quy trình in
            ấn và dịch vụ khách hàng B2B bằng công nghệ để mang lại sự{" "}
            <span className="font-bold text-emerald-700">An tâm</span> -{" "}
            <span className="font-bold text-emerald-700">Tốc độ</span> -{" "}
            <span className="font-bold text-emerald-700">Chính xác</span> cho
            doanh nghiệp của bạn.
          </p>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl text-stone-900 mb-4 italic">
            Quy trình Vận hành (Workflow)
          </h2>
          <p className="text-stone-600">
            Quy trình 5 bước khép kín từ ý tưởng đến thành phẩm, được quản lý
            tập trung trên nền tảng Printz.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop Timeline */}
          <div className="hidden lg:block">
            <div className="flex items-start justify-between relative">
              {/* Line connecting steps */}
              <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-600"></div>

              {/* Step 1 */}
              <div className="relative z-10 flex-1 text-center px-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white border-4 border-emerald-600 rounded-full mb-6 shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                  <div className="text-emerald-600 font-bold text-sm mb-2">
                    BƯỚC 1
                  </div>
                  <h3 className="font-bold text-stone-900 mb-3">
                    Tiếp nhận & Tư vấn
                  </h3>
                  <ul className="text-sm text-stone-600 space-y-2 text-left">
                    <li>• Tiếp nhận yêu cầu qua Hệ thống/Hotline</li>
                    <li>• Gợi ý giải pháp phù hợp ngân sách</li>
                    <li className="font-bold text-emerald-700">
                      ⚡ Phản hồi trong 15 phút
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex-1 text-center px-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white border-4 border-emerald-600 rounded-full mb-6 shadow-lg">
                  <FileCheck className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                  <div className="text-emerald-600 font-bold text-sm mb-2">
                    BƯỚC 2
                  </div>
                  <h3 className="font-bold text-stone-900 mb-3">
                    Báo giá & Chốt hợp đồng
                  </h3>
                  <ul className="text-sm text-stone-600 space-y-2 text-left">
                    <li>• Báo giá chi tiết và minh bạch</li>
                    <li className="font-bold text-emerald-700">
                      ⚡ Tiêu chuẩn: 2H
                    </li>
                    <li className="font-bold text-emerald-700">
                      ⚡ Custom: 24H
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex-1 text-center px-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white border-4 border-emerald-600 rounded-full mb-6 shadow-lg">
                  <Zap className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                  <div className="text-emerald-600 font-bold text-sm mb-2">
                    BƯỚC 3
                  </div>
                  <h3 className="font-bold text-stone-900 mb-3">
                    Kiểm tra & Duyệt file
                  </h3>
                  <ul className="text-sm text-stone-600 space-y-2 text-left">
                    <li>• Kỹ thuật + AI kiểm tra file</li>
                    <li>• Gửi Maquette để ký duyệt</li>
                    <li className="font-bold text-red-600">
                      ⚠️ Chỉ in sau khi "OK IN"
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex-1 text-center px-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white border-4 border-emerald-600 rounded-full mb-6 shadow-lg">
                  <Package className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                  <div className="text-emerald-600 font-bold text-sm mb-2">
                    BƯỚC 4
                  </div>
                  <h3 className="font-bold text-stone-900 mb-3">
                    Sản xuất & Kiểm soát
                  </h3>
                  <ul className="text-sm text-stone-600 space-y-2 text-left">
                    <li>• In theo tiêu chuẩn đã duyệt</li>
                    <li>• QC ngẫu nhiên</li>
                    <li>• Loại bỏ sản phẩm lỗi</li>
                  </ul>
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative z-10 flex-1 text-center px-4">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white border-4 border-emerald-600 rounded-full mb-6 shadow-lg">
                  <Truck className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                  <div className="text-emerald-600 font-bold text-sm mb-2">
                    BƯỚC 5
                  </div>
                  <h3 className="font-bold text-stone-900 mb-3">
                    Giao hàng & Hậu mãi
                  </h3>
                  <ul className="text-sm text-stone-600 space-y-2 text-left">
                    <li>• Đóng gói quy chuẩn</li>
                    <li>• Giao hàng tận nơi</li>
                    <li className="font-bold text-emerald-700">
                      ⚡ Hỗ trợ sự cố trong 24H
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden space-y-6">
            {[
              {
                step: 1,
                icon: CheckCircle2,
                title: "Tiếp nhận & Tư vấn",
                items: [
                  "Tiếp nhận yêu cầu qua Hệ thống/Hotline",
                  "Gợi ý giải pháp phù hợp ngân sách",
                  "⚡ Phản hồi trong 15 phút",
                ],
              },
              {
                step: 2,
                icon: FileCheck,
                title: "Báo giá & Chốt hợp đồng",
                items: [
                  "Báo giá chi tiết và minh bạch",
                  "⚡ Tiêu chuẩn: 2H",
                  "⚡ Custom: 24H",
                ],
              },
              {
                step: 3,
                icon: Zap,
                title: "Kiểm tra & Duyệt file",
                items: [
                  "Kỹ thuật + AI kiểm tra file",
                  "Gửi Maquette để ký duyệt",
                  "⚠️ Chỉ in sau khi 'OK IN'",
                ],
              },
              {
                step: 4,
                icon: Package,
                title: "Sản xuất & Kiểm soát",
                items: [
                  "In theo tiêu chuẩn đã duyệt",
                  "QC ngẫu nhiên",
                  "Loại bỏ sản phẩm lỗi",
                ],
              },
              {
                step: 5,
                icon: Truck,
                title: "Giao hàng & Hậu mãi",
                items: [
                  "Đóng gói quy chuẩn",
                  "Giao hàng tận nơi",
                  "⚡ Hỗ trợ sự cố trong 24H",
                ],
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                    <item.icon className="w-8 h-8" />
                  </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                  <div className="text-emerald-600 font-bold text-sm mb-2">
                    BƯỚC {item.step}
                  </div>
                  <h3 className="font-bold text-stone-900 mb-3">
                    {item.title}
                  </h3>
                  <ul className="text-sm text-stone-600 space-y-2">
                    {item.items.map((text, i) => (
                      <li key={i}>• {text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STANDARDS SECTION */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-stone-900 mb-4 italic">
              Bộ Tiêu chuẩn Cam kết (Standards)
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* SERVICE STANDARDS */}
            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 p-8 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-stone-900">
                    Tiêu chuẩn Dịch vụ (Service SLA)
                  </h3>
                </div>
              </div>

              <p className="text-stone-600 mb-6 italic">
                Cam kết về con người và hệ thống phục vụ.
              </p>

              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Tốc độ là ưu tiên
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li>
                      • <strong>Phản hồi tư vấn:</strong> Dưới 15 phút (Giờ hành
                      chính)
                    </li>
                    <li>
                      • <strong>Xử lý khiếu nại:</strong> Đưa ra phương án (In
                      lại/Hoàn tiền) trong vòng 24H
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Giao hàng đúng hẹn (OTIF)
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li>
                      • Cam kết tỷ lệ giao hàng đúng hạn đạt{" "}
                      <span className="font-bold text-blue-600">98%</span>
                    </li>
                    <li>
                      • Thông báo chủ động trước 24H nếu có rủi ro bất khả kháng
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    In lại cấp tốc (Reprint Policy)
                  </h4>
                  <p className="text-sm text-stone-700">
                    Kích hoạt quy trình in lại và giao hỏa tốc ngay lập tức nếu
                    lỗi thuộc về Printz (Không chờ quy trình bồi thường phức
                    tạp).
                  </p>
                </div>
              </div>
            </div>

            {/* TECHNICAL STANDARDS */}
            <div className="bg-gradient-to-br from-orange-50 to-stone-50 p-8 rounded-lg border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center">
                  <Ruler className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-stone-900">
                    Tiêu chuẩn Kỹ thuật (Technical QC)
                  </h3>
                </div>
              </div>

              <p className="text-stone-600 mb-6 italic">
                Quy định về dung sai kỹ thuật để đảm bảo sự thống nhất khi
                nghiệm thu.
              </p>

              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-stone-900 mb-3">
                    Dung sai Màu sắc (ΔE)
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li>
                      • Chấp nhận độ lệch màu{" "}
                      <span className="font-bold text-orange-600">10-15%</span>{" "}
                      giữa màn hình (RGB) và bản in (CMYK)
                    </li>
                    <li>
                      • Chấp nhận độ lệch{" "}
                      <span className="font-bold text-orange-600">5-10%</span>{" "}
                      giữa các lần sản xuất khác nhau
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-stone-900 mb-3">
                    Dung sai Kích thước & Cắt bế
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li>
                      • Sai số cho phép:{" "}
                      <span className="font-bold text-orange-600">± 1-2mm</span>{" "}
                      cho các đường cắt và bế
                    </li>
                    <li>
                      • Vùng an toàn (Safe zone): Nội dung cách mép cắt tối
                      thiểu{" "}
                      <span className="font-bold text-orange-600">3mm</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-stone-900 mb-3">
                    Định lượng & Số lượng
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li>
                      • Định lượng giấy/vật liệu: Sai số{" "}
                      <span className="font-bold text-orange-600">± 5%</span>{" "}
                      theo tiêu chuẩn nhà sản xuất
                    </li>
                    <li>
                      • Số lượng bàn giao: Có thể chênh lệch{" "}
                      <span className="font-bold text-orange-600">± 5%</span>{" "}
                      (bù trừ vào giá trị thanh toán) với đơn hàng &gt;1.000 đơn
                      vị
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-12 rounded-2xl shadow-2xl text-center">
            <Download className="w-16 h-16 mx-auto mb-6" />
            <h3 className="font-serif text-3xl mb-4 italic">
              Tải trọn bộ Tiêu chuẩn & Hợp đồng mẫu
            </h3>
            <p className="text-emerald-100 mb-8 text-lg">
              Nhận ngay tài liệu chi tiết về quy trình và tiêu chuẩn chất lượng
              của Printz
            </p>
            <button className="bg-white text-emerald-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg">
              Tải tài liệu miễn phí
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
