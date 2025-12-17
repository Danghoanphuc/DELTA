import { useState } from "react";
import { Header, Footer } from "./components";
import {
  Sparkles,
  FileCheck,
  CheckCircle2,
  Download,
  Palette,
  Ruler,
  Type,
  Shield,
  AlertCircle,
  Package,
} from "lucide-react";

export default function QualityStandardsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: Sparkles },
    { id: "rules", label: "05 Quy tắc Vàng", icon: Shield },
    { id: "checklist", label: "Checklist", icon: CheckCircle2 },
    { id: "templates", label: "Thư viện Khuôn mẫu", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HERO SECTION */}
      <section className="pt-32 pb-12 px-6 border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-lg flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <span className="text-amber-800 font-bold tracking-widest uppercase text-xs mb-3 block">
            Cẩm Nang Sáng Tạo Di Sản
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight mb-4 italic">
            Tiêu Chuẩn Sáng Tạo & Chế Tác
          </h1>
          <p className="text-base text-stone-600 font-light max-w-3xl leading-relaxed mb-4">
            Hướng dẫn kỹ thuật để biến ý tưởng thành di sản
          </p>
          <p className="text-sm text-stone-500 italic">
            Cập nhật lần cuối: 20/12/2025
          </p>
        </div>
      </section>

      {/* TABS NAVIGATION */}
      <div className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-800 text-white shadow-lg"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        {/* TAB 1: TỔNG QUAN */}
        {activeTab === "overview" && (
          <div className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl text-stone-900 mb-4 italic">
                Triết Lý Sự Hoàn Hảo
              </h2>
            </div>

            {/* I. Lời Mở Đầu */}
            <section className="bg-white p-8 md:p-12 rounded-lg border border-stone-200">
              <h3 className="font-serif text-2xl text-stone-900 mb-6 italic flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-600" />
                I. Lời Mở Đầu
              </h3>
              <p className="text-stone-700 leading-relaxed text-lg">
                Mỗi tác phẩm quà tặng tại <strong>Printz</strong> là sự
                cộng hưởng giữa <strong>Nghệ thuật Thủ công</strong> (Artisan)
                và <strong>Công nghệ Chính xác</strong> (Precision Tech). Để đảm
                bảo logo thương hiệu của Quý doanh nghiệp xuất hiện hoàn hảo
                trên nền chất liệu gốm, gỗ, sơn mài... chúng tôi khuyến nghị Quý
                đối tác tuân thủ bộ quy chuẩn dưới đây.
              </p>
            </section>

            {/* II. Tại sao cần Quy chuẩn riêng biệt? */}
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 md:p-12 rounded-lg border-2 border-amber-200">
              <h3 className="font-serif text-2xl text-stone-900 mb-6 italic flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                II. Tại sao cần Quy chuẩn riêng biệt?
              </h3>
              <p className="text-stone-700 leading-relaxed mb-6">
                Không giống như in trên giấy phẳng (Offset/Digital), việc in
                ấn/khắc trên vật liệu cong (gốm) hoặc sần (gỗ, da) đòi hỏi những
                tiêu chuẩn khắt khe hơn:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
                  <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">✗</span> Rủi ro nếu sai quy chuẩn
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li>• Logo bị méo khi in lên mặt cong ấm chén</li>
                    <li>• Màu sắc bị chìm trên nền gỗ tối</li>
                    <li>• Nét khắc laser bị cháy đen</li>
                  </ul>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-lg">
                  <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <span className="text-2xl">✓</span> Lợi ích khi đúng quy
                    chuẩn
                  </h4>
                  <ul className="space-y-2 text-sm text-stone-700">
                    <li>• Logo sắc nét, sang trọng</li>
                    <li>• Giữ được "hồn" của vật liệu gốc</li>
                    <li>• Nâng tầm nhận diện thương hiệu</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* III. Quy trình Phê duyệt Mẫu */}
            <section className="bg-white p-8 md:p-12 rounded-lg border border-stone-200">
              <h3 className="font-serif text-2xl text-stone-900 mb-8 italic flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-amber-600" />
                III. Quy trình Phê duyệt Mẫu (Approval Process)
              </h3>

              <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    step: "1",
                    title: "Thiết kế",
                    subtitle: "Design",
                    desc: "Quý khách gửi file vector logo theo quy chuẩn",
                  },
                  {
                    step: "2",
                    title: "Maquette",
                    subtitle: "Demo 2D",
                    desc: "Chúng tôi lên bản vẽ kỹ thuật vị trí đặt logo",
                  },
                  {
                    step: "3",
                    title: "Mẫu thử",
                    subtitle: "Physical Proof",
                    desc: "Với đơn hàng lớn, chúng tôi sản xuất 01 mẫu thật để Quý khách duyệt",
                  },
                  {
                    step: "4",
                    title: "Sản xuất",
                    subtitle: "Crafting",
                    desc: "Tiến hành chế tác hàng loạt sau khi mẫu thử được ký duyệt",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="relative bg-gradient-to-br from-stone-50 to-amber-50 p-6 rounded-lg border border-amber-200"
                  >
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                      {item.step}
                    </div>
                    <div className="mt-4">
                      <h4 className="font-bold text-stone-900 text-lg mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-amber-700 font-semibold mb-3 uppercase tracking-wider">
                        {item.subtitle}
                      </p>
                      <p className="text-sm text-stone-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: 05 QUY TẮC VÀNG */}
        {activeTab === "rules" && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl text-stone-900 mb-4 italic">
                05 Quy Tắc Vàng
              </h2>
              <p className="text-stone-600">
                Tuân thủ 5 nguyên tắc này để đảm bảo logo xuất hiện hoàn hảo
                trên mọi chất liệu
              </p>
            </div>

            {/* QUY TẮC 1 */}
            <section className="bg-white p-8 md:p-12 rounded-lg border-2 border-amber-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-2xl shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-stone-900 mb-2 italic">
                    Định dạng Vector
                  </h3>
                  <p className="text-sm text-amber-700 font-semibold uppercase tracking-wider">
                    Vector Format
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                  <p className="font-bold text-stone-900 mb-2">
                    ✓ Yêu cầu: Bắt buộc sử dụng file Vector (.AI, .EPS, .PDF
                    vector)
                  </p>
                  <p className="text-sm text-stone-700 mb-3">
                    <strong>Lý do:</strong> Để khắc Laser hoặc in lụa trên gốm,
                    máy móc cần đọc đường line (path) chính xác tuyệt đối. File
                    ảnh (.JPG, .PNG) sẽ bị vỡ nét (pixel) khi phóng to hoặc khắc
                    lên vật liệu cứng.
                  </p>
                </div>

                <div className="bg-red-50 p-6 rounded-lg border-2 border-red-300">
                  <p className="font-bold text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Cảnh báo
                  </p>
                  <p className="text-sm text-stone-700 mt-2">
                    Chúng tôi xin phép từ chối nhận file thiết kế làm trên{" "}
                    <strong>Canva, Word, Excel</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* QUY TẮC 2 */}
            <section className="bg-white p-8 md:p-12 rounded-lg border-2 border-amber-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-2xl shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-stone-900 mb-2 italic">
                    Màu sắc Đơn sắc
                  </h3>
                  <p className="text-sm text-amber-700 font-semibold uppercase tracking-wider">
                    Monochrome & Gold
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                  <p className="font-bold text-stone-900 mb-2">
                    ✓ Yêu cầu: Ưu tiên chuyển logo về dạng 1 màu (Solid Color)
                    hoặc Mạ vàng (Gold Leaf)
                  </p>
                  <p className="text-sm text-stone-700 mb-3">
                    <strong>Lý do:</strong> Trên các chất liệu "Di sản" như Gốm
                    men hỏa biến hay Sơn mài, logo nhiều màu (Gradient/7 màu) sẽ
                    làm mất đi vẻ sang trọng và cổ điển của tác phẩm.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-6 rounded-lg border-2 border-amber-300">
                  <p className="font-bold text-amber-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Khuyến nghị
                  </p>
                  <p className="text-sm text-stone-700 mt-2">
                    Logo <strong>Mạ vàng 24K</strong> hoặc{" "}
                    <strong>Khắc Laser mộc</strong> là hai lựa chọn đẳng cấp
                    nhất cho quà tặng ngoại giao.
                  </p>
                </div>
              </div>
            </section>

            {/* QUY TẮC 3 */}
            <section className="bg-white p-8 md:p-12 rounded-lg border-2 border-amber-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-2xl shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-stone-900 mb-2 italic">
                    Độ Mảnh Nét
                  </h3>
                  <p className="text-sm text-amber-700 font-semibold uppercase tracking-wider">
                    Minimum Stroke
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                  <p className="font-bold text-stone-900 mb-2">
                    ✓ Yêu cầu: Độ dày nét tối thiểu phải đạt 0.5pt (với in lụa)
                    và 0.3mm (với khắc laser)
                  </p>
                  <p className="text-sm text-stone-700 mb-3">
                    <strong>Lý do:</strong> Nét quá mảnh sẽ bị đứt gãy khi in
                    lên bề mặt gốm lồi lõm hoặc bị cháy mất khi tia laser đi
                    qua.
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <p className="font-bold text-blue-900">Lưu ý</p>
                  <p className="text-sm text-stone-700 mt-2">
                    Tránh dùng font chữ có chân (Serif) quá mảnh ở kích thước
                    nhỏ.
                  </p>
                </div>
              </div>
            </section>

            {/* QUY TẮC 4 */}
            <section className="bg-white p-8 md:p-12 rounded-lg border-2 border-amber-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-2xl shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-stone-900 mb-2 italic">
                    Vùng An toàn trên Mặt Cong
                  </h3>
                  <p className="text-sm text-amber-700 font-semibold uppercase tracking-wider">
                    Safe Zone
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                  <p className="font-bold text-stone-900 mb-2">
                    ✓ Yêu cầu: Logo không được quá lớn so với tiết diện cong của
                    sản phẩm
                  </p>
                  <p className="text-sm text-stone-700 mb-3">
                    <strong>Ví dụ:</strong> Trên thân cốc tròn, chiều ngang logo
                    tối đa chỉ nên bằng 1/3 chu vi cốc.
                  </p>
                  <p className="text-sm text-stone-700">
                    <strong>Lý do:</strong> Nếu in quá rộng ra hai bên mép cong,
                    logo sẽ bị biến dạng (bóp méo) về mặt thị giác.
                  </p>
                </div>
              </div>
            </section>

            {/* QUY TẮC 5 */}
            <section className="bg-white p-8 md:p-12 rounded-lg border-2 border-amber-200">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-2xl shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-stone-900 mb-2 italic">
                    Font Chữ
                  </h3>
                  <p className="text-sm text-amber-700 font-semibold uppercase tracking-wider">
                    Outline Font
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                  <p className="font-bold text-stone-900 mb-2">
                    ✓ Yêu cầu: Toàn bộ chữ phải được Convert to Outline/Curve
                  </p>
                  <p className="text-sm text-stone-700">
                    <strong>Lý do:</strong> Tránh lỗi nhảy font khi mở file tại
                    xưởng chế tác.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: CHECKLIST */}
        {activeTab === "checklist" && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl text-stone-900 mb-4 italic">
                Checklist Kiểm Tra
              </h2>
              <p className="text-stone-600">
                Danh sách kiểm tra trước khi gửi file thiết kế
              </p>
            </div>

            <section className="bg-white p-8 md:p-12 rounded-lg border-2 border-emerald-200">
              <h3 className="font-serif text-2xl text-stone-900 mb-8 italic flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                Pre-Crafting Checklist
              </h3>

              <div className="space-y-4">
                {[
                  "File đã là định dạng Vector (.AI, .PDF)?",
                  "Logo đã được chuyển về 1 màu (nếu chọn in đơn sắc)?",
                  "Đã loại bỏ các hiệu ứng bóng đổ (Drop Shadow), Gradient?",
                  "Font chữ đã được Outline (Convert)?",
                  "Các nét mảnh nhất đã đạt độ dày tối thiểu 0.5pt chưa?",
                  "Kích thước logo đã được ướm thử lên vùng an toàn của sản phẩm chưa?",
                  "Đã kiểm tra lỗi chính tả tên người nhận (với đơn hàng cá nhân hóa)?",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 bg-white border-2 border-stone-300 rounded flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-stone-400 text-sm">[ ]</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gradient-to-br from-blue-50 to-emerald-50 p-6 rounded-lg border-2 border-blue-200">
                <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Hỗ trợ kỹ thuật
                </h4>
                <p className="text-sm text-stone-700">
                  Nếu quý khách không rành về kỹ thuật, đội ngũ Design của{" "}
                  <strong>Printz</strong> hỗ trợ{" "}
                  <strong className="text-emerald-700">Miễn phí</strong> việc
                  chuyển đổi file và tinh chỉnh logo cho phù hợp với chất liệu.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: THƯ VIỆN KHUÔN MẪU */}
        {activeTab === "templates" && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl text-stone-900 mb-4 italic">
                Thư Viện Khuôn Mẫu
              </h2>
              <p className="text-stone-600">
                Template Library - Tải về các file mẫu chuẩn để thiết kế
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Template 1 */}
              <div className="bg-white p-8 rounded-lg border-2 border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-lg flex items-center justify-center shrink-0">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-stone-900 mb-2">
                      Template Khắc Laser trên Gỗ/Tre
                    </h3>
                    <p className="text-sm text-stone-600">
                      File chuẩn kích thước cho nắp hộp gỗ, bút tre, khay trà.
                      Có layer giả lập màu khắc cháy.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Định dạng:</span>
                    <span className="font-semibold text-stone-900">
                      .AI (Adobe Illustrator)
                    </span>
                  </div>
                  <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Download className="w-4 h-4" />
                    Tải Template
                  </button>
                </div>
              </div>

              {/* Template 2 */}
              <div className="bg-white p-8 rounded-lg border-2 border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-lg flex items-center justify-center shrink-0">
                    <Palette className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-stone-900 mb-2">
                      Template In Decal trượt nước trên Gốm
                    </h3>
                    <p className="text-sm text-stone-600">
                      File chuẩn cho in logo lên ấm chén, cốc sứ. Bao gồm vùng
                      an toàn cho mặt cong.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Định dạng:</span>
                    <span className="font-semibold text-stone-900">
                      .AI / .PSD
                    </span>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Download className="w-4 h-4" />
                    Tải Template
                  </button>
                </div>
              </div>

              {/* Template 3 */}
              <div className="bg-white p-8 rounded-lg border-2 border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-lg flex items-center justify-center shrink-0">
                    <FileCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-stone-900 mb-2">
                      Template Thiệp Chúc Mừng
                    </h3>
                    <p className="text-sm text-stone-600">
                      Các mẫu thiệp thiết kế theo phong cách
                      Indochine/Minimalism, có sẵn chỗ trống để điền logo và lời
                      chúc.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Định dạng:</span>
                    <span className="font-semibold text-stone-900">
                      .AI (Editable Text)
                    </span>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Download className="w-4 h-4" />
                    Tải Template
                  </button>
                </div>
              </div>

              {/* Template 4 */}
              <div className="bg-white p-8 rounded-lg border-2 border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center shrink-0">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-stone-900 mb-2">
                      Template Hộp Quà
                    </h3>
                    <p className="text-sm text-stone-600">
                      Khuôn bế (Die-cut) cho hộp âm dương, hộp nam châm nắp gập.
                      Dùng để thiết kế bao bì riêng.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Định dạng:</span>
                    <span className="font-semibold text-stone-900">
                      .AI (Vector Die-line)
                    </span>
                  </div>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Download className="w-4 h-4" />
                    Tải Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-amber-400" />
          <h3 className="font-serif text-3xl md:text-4xl text-white mb-4 italic">
            Cần hỗ trợ kỹ thuật?
          </h3>
          <p className="text-stone-300 mb-8 text-lg max-w-2xl mx-auto">
            Đội ngũ Design của Printz sẵn sàng hỗ trợ miễn phí việc
            chuyển đổi file và tối ưu logo cho phù hợp với từng chất liệu
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg">
            Liên hệ Nhà Giám Tuyển
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
