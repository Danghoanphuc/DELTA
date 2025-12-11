import { useState } from "react";
import { Header, Footer } from "./components";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  Palette,
  Settings,
  Eye,
} from "lucide-react";

const SummaryBox = ({ children }: { children: React.ReactNode }) => (
  <div className="my-8 p-6 bg-gradient-to-br from-emerald-50 to-stone-50 border-2 border-emerald-200/50 rounded-3xl shadow-lg">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <CheckCircle className="w-5 h-5 text-emerald-600" />
      </div>
      <p className="text-stone-700 font-medium leading-relaxed italic">
        {children}
      </p>
    </div>
  </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
  <div className="my-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 rounded-3xl shadow-lg">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
      </div>
      <p className="text-stone-700 font-medium leading-relaxed">{children}</p>
    </div>
  </div>
);

const ChecklistItem = ({
  children,
  checked = false,
}: {
  children: React.ReactNode;
  checked?: boolean;
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-stone-50 rounded-3xl transition-colors">
      <button
        onClick={() => setIsChecked(!isChecked)}
        className={`flex-shrink-0 w-5 h-5 rounded-3xl border-2 flex items-center justify-center transition-all shadow-lg ${
          isChecked
            ? "bg-emerald-600 border-emerald-600 text-white"
            : "border-stone-300 hover:border-emerald-400"
        }`}
      >
        {isChecked && <CheckCircle className="w-3 h-3" />}
      </button>
      <span
        className={`text-sm leading-relaxed ${
          isChecked ? "line-through text-stone-400" : "text-stone-700"
        }`}
      >
        {children}
      </span>
    </div>
  );
};

const ColorSwatch = ({
  c,
  m,
  y,
  k,
  label,
  description,
}: {
  c: number;
  m: number;
  y: number;
  k: number;
  label: string;
  description: string;
}) => (
  <div className="bg-white p-4 rounded-3xl border-2 border-stone-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-12 h-12 rounded-3xl border-2 border-stone-300/50 shadow-lg"
        style={{ backgroundColor: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)` }}
      ></div>
      <div>
        <h4 className="font-semibold text-stone-900">{label}</h4>
        <p className="text-xs text-stone-500">{description}</p>
      </div>
    </div>
    <div className="text-xs font-mono text-stone-600">
      C={c} M={m} Y={y} K={k}
    </div>
  </div>
);

export default function DesignGuidelinesPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Quy chuẩn File Thiết kế.
          </h1>
          <p className="text-stone-500 mb-4">
            Hướng dẫn kỹ thuật & Quy chuẩn file in ấn
          </p>
          <p className="text-stone-400 text-sm">
            Cập nhật lần cuối: 20/12/2025
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full flex justify-center bg-transparent border-b border-stone-300 rounded-none h-auto p-0 mb-12">
            {[
              { label: "Tổng quan", value: "overview", icon: Eye },
              { label: "5 Quy tắc vàng", value: "rules", icon: Settings },
              { label: "Checklist", value: "checklist", icon: CheckCircle },
              { label: "Templates", value: "templates", icon: Download },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent px-6 py-4 font-mono text-sm font-bold text-stone-400 uppercase tracking-widest data-[state=active]:border-emerald-800 data-[state=active]:text-stone-900 data-[state=active]:bg-transparent transition-all flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value="overview"
            className="bg-white p-12 md:p-16 shadow-lg border-2 border-stone-200/50 rounded-3xl"
          >
            <article className="prose prose-stone prose-lg max-w-none font-light">
              <h2 className="font-serif text-4xl text-stone-900 italic mb-6">
                Lời mở đầu
              </h2>

              <p>
                Để đảm bảo sản phẩm cuối cùng sắc nét, đúng màu và không bị lỗi
                cắt phạm vào nội dung, Printz khuyến nghị Quý khách hàng tuân
                thủ <strong>5 Quy tắc Vàng</strong> dưới đây trước khi xuất file
                gửi xưởng.
              </p>

              <SummaryBox>
                Tuân thủ quy chuẩn = Sản phẩm hoàn hảo. Không tuân thủ = Rủi ro
                chất lượng và thời gian.
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                Tại sao cần quy chuẩn file?
              </h3>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-3xl border-2 border-red-200/50 shadow-lg">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Không tuân thủ
                  </h4>
                  <ul className="text-sm text-red-700 space-y-2">
                    <li>• Màu sắc bị xỉn, tối hơn 15-20%</li>
                    <li>• Ảnh bị vỡ nát, mờ nhòe</li>
                    <li>• Chữ bị cắt mất hoặc viền trắng</li>
                    <li>• Font chữ bị nhảy, lỗi ký tự</li>
                    <li>• Phải in lại → Tốn thời gian & chi phí</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-3xl border-2 border-emerald-200/50 shadow-lg">
                  <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Tuân thủ quy chuẩn
                  </h4>
                  <ul className="text-sm text-emerald-700 space-y-2">
                    <li>• Màu sắc chuẩn xác, sống động</li>
                    <li>• Ảnh sắc nét, chất lượng cao</li>
                    <li>• Cắt gọn gàng, không mất nội dung</li>
                    <li>• Font chữ ổn định, đẹp mắt</li>
                    <li>• In một lần đúng → Tiết kiệm & nhanh chóng</li>
                  </ul>
                </div>
              </div>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                Quy trình làm việc khuyến nghị
              </h3>

              <div className="bg-stone-50 p-6 rounded-3xl border-2 border-stone-200/50 shadow-lg my-8">
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-3xl border-2 border-emerald-200/50 flex items-center justify-center mx-auto font-bold shadow-lg">
                      1
                    </div>
                    <h4 className="font-semibold text-stone-900">Thiết kế</h4>
                    <p className="text-xs text-stone-600">
                      Theo quy chuẩn CMYK, 300 DPI
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-3xl border-2 border-emerald-200/50 flex items-center justify-center mx-auto font-bold shadow-lg">
                      2
                    </div>
                    <h4 className="font-semibold text-stone-900">Kiểm tra</h4>
                    <p className="text-xs text-stone-600">
                      Dùng Checklist bên dưới
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-3xl border-2 border-emerald-200/50 flex items-center justify-center mx-auto font-bold shadow-lg">
                      3
                    </div>
                    <h4 className="font-semibold text-stone-900">Xuất file</h4>
                    <p className="text-xs text-stone-600">
                      PDF High Quality Print
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-3xl border-2 border-emerald-200/50 flex items-center justify-center mx-auto font-bold shadow-lg">
                      4
                    </div>
                    <h4 className="font-semibold text-stone-900">Gửi xưởng</h4>
                    <p className="text-xs text-stone-600">
                      Kèm ghi chú đặc biệt
                    </p>
                  </div>
                </div>
              </div>

              <WarningBox>
                <strong>Lưu ý quan trọng:</strong> Chúng tôi KHÔNG NHẬN in các
                file: Word, Excel, PowerPoint, Canva (xuất ảnh chất lượng thấp).
                Vui lòng sử dụng Adobe Illustrator, Photoshop hoặc xuất PDF
                chuẩn.
              </WarningBox>
            </article>
          </TabsContent>

          <TabsContent
            value="rules"
            className="bg-white p-12 md:p-16 shadow-lg border-2 border-stone-200/50 rounded-3xl"
          >
            <article className="prose prose-stone prose-lg max-w-none font-light">
              <h2 className="font-serif text-4xl text-stone-900 italic mb-8">
                Năm (05) Quy tắc Vàng
              </h2>

              <div className="space-y-12">
                {/* QUY TẮC 1: HỆ MÀU */}
                <div className="border-l-4 border-emerald-600 pl-6">
                  <h3 className="font-serif text-2xl text-stone-900 italic mb-4 flex items-center gap-3">
                    <Palette className="w-6 h-6 text-emerald-600" />
                    QUY TẮC 1: HỆ MÀU (COLOR MODE) - BẮT BUỘC CMYK
                  </h3>

                  <div className="bg-emerald-50 p-4 rounded-3xl border-2 border-emerald-200/50 shadow-lg mb-6">
                    <p className="font-semibold text-emerald-800 mb-2">
                      Quy định:
                    </p>
                    <p className="text-emerald-700">
                      Tất cả file in ấn phải được thiết kế trên hệ màu CMYK.
                    </p>
                  </div>

                  <p>
                    <strong>Lý do:</strong> Màn hình máy tính hiển thị màu bằng
                    ánh sáng (RGB), còn máy in dùng mực (CMYK).
                  </p>

                  <WarningBox>
                    <strong>Cảnh báo:</strong> Nếu bạn gửi file RGB, máy in sẽ
                    tự động chuyển sang CMYK, dẫn đến màu sắc bị xỉn, tối và sai
                    lệch khoảng 15-20% so với màn hình.
                  </WarningBox>

                  <h4 className="font-semibold text-stone-900 mt-6 mb-4">
                    Lưu ý màu đen:
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <ColorSwatch
                      c={0}
                      m={0}
                      y={0}
                      k={100}
                      label="Đen chữ (Text)"
                      description="Dùng cho văn bản, không chồng lé"
                    />
                    <ColorSwatch
                      c={40}
                      m={30}
                      y={30}
                      k={100}
                      label="Đen nền (Rich Black)"
                      description="Nền đen sâu và đẹp"
                    />
                  </div>
                </div>

                {/* QUY TẮC 2: ĐỘ PHÂN GIẢI */}
                <div className="border-l-4 border-blue-600 pl-6">
                  <h3 className="font-serif text-2xl text-stone-900 italic mb-4 flex items-center gap-3">
                    <Eye className="w-6 h-6 text-blue-600" />
                    QUY TẮC 2: ĐỘ PHÂN GIẢI (RESOLUTION) - TỐI THIỂU 300 DPI
                  </h3>

                  <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-200/50 shadow-lg mb-6">
                    <p className="font-semibold text-blue-800 mb-2">
                      Quy định:
                    </p>
                    <ul className="text-blue-700 space-y-1">
                      <li>
                        • <strong>Ấn phẩm cầm tay</strong> (Namecard, Brochure,
                        Menu): 300 - 450 DPI
                      </li>
                      <li>
                        • <strong>In khổ lớn</strong> (Standee, Backdrop nhìn
                        xa): 72 - 150 DPI
                      </li>
                    </ul>
                  </div>

                  <WarningBox>
                    <strong>Sai lầm thường gặp:</strong> Lấy ảnh trên Facebook,
                    Zalo hoặc Website (thường chỉ 72 DPI) để in ấn. Kết quả ảnh
                    sẽ bị vỡ nát, mờ nhòe (pixelated).
                  </WarningBox>
                </div>

                {/* QUY TẮC 3: TRÀN LỀ & VÙNG AN TOÀN */}
                <div className="border-l-4 border-purple-600 pl-6">
                  <h3 className="font-serif text-2xl text-stone-900 italic mb-4 flex items-center gap-3">
                    <Settings className="w-6 h-6 text-purple-600" />
                    QUY TẮC 3: TRÀN LỀ & VÙNG AN TOÀN (BLEED & SAFE ZONE)
                  </h3>

                  <p className="text-red-600 font-medium mb-4">
                    Đây là lỗi phổ biến nhất khiến sản phẩm bị viền trắng hoặc
                    mất chữ.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-purple-50 p-4 rounded-3xl border-2 border-purple-200/50 shadow-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">
                        Kích thước thiết kế (Bleed Size):
                      </h4>
                      <p className="text-purple-700 mb-2">
                        Phải lớn hơn kích thước thành phẩm mỗi cạnh 2mm.
                      </p>
                      <div className="bg-white p-3 rounded border text-sm font-mono">
                        <strong>Ví dụ:</strong> Namecard thành phẩm 90x55mm
                        <br />→ File thiết kế phải là{" "}
                        <span className="text-purple-600 font-bold">
                          94x59mm
                        </span>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-3xl border-2 border-amber-200/50 shadow-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">
                        Vùng an toàn (Safe Zone):
                      </h4>
                      <p className="text-amber-700 mb-2">
                        Nội dung quan trọng (Logo, Chữ, SĐT) phải cách mép cắt
                        ít nhất 3mm - 5mm.
                      </p>
                      <div className="bg-white p-3 rounded border text-sm">
                        <strong>Lý do:</strong> Dao cắt công nghiệp có độ rung
                        sai số ±1mm. Nếu để sát mép sẽ bị cắt mất chữ.
                      </div>
                    </div>
                  </div>
                </div>

                {/* QUY TẮC 4: FONT CHỮ */}
                <div className="border-l-4 border-orange-600 pl-6">
                  <h3 className="font-serif text-2xl text-stone-900 italic mb-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-orange-600" />
                    QUY TẮC 4: FONT CHỮ (TYPOGRAPHY)
                  </h3>

                  <div className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-200/50 shadow-lg mb-6">
                    <p className="font-semibold text-orange-800 mb-2">
                      Quy định:
                    </p>
                    <p className="text-orange-700">
                      Toàn bộ văn bản phải được <strong>Create Outlines</strong>{" "}
                      (trong AI) hoặc <strong>Convert to Curves</strong> (trong
                      Corel).
                    </p>
                  </div>

                  <p>
                    <strong>Lý do:</strong> Để khóa định dạng font, tránh trường
                    hợp máy tính tại xưởng in không có font chữ của bạn, dẫn đến
                    việc bị nhảy font, lỗi ký tự.
                  </p>

                  <WarningBox>
                    <strong>Kích thước:</strong> Hạn chế dùng font chữ quá mảnh
                    hoặc nhỏ dưới 6pt (đặc biệt là chữ trắng trên nền đen) vì có
                    thể bị mất nét khi in.
                  </WarningBox>
                </div>

                {/* QUY TẮC 5: ĐỊNH DẠNG FILE */}
                <div className="border-l-4 border-green-600 pl-6">
                  <h3 className="font-serif text-2xl text-stone-900 italic mb-4 flex items-center gap-3">
                    <Download className="w-6 h-6 text-green-600" />
                    QUY TẮC 5: ĐỊNH DẠNG FILE (FILE FORMAT)
                  </h3>

                  <p className="mb-4">
                    Chúng tôi ưu tiên nhận các định dạng sau để đảm bảo chất
                    lượng tốt nhất:
                  </p>

                  <div className="grid gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-3xl border-2 border-green-200/50 shadow-lg">
                      <h4 className="font-semibold text-green-800 mb-2">
                        ✅ PDF (Chuẩn in ấn - High Quality Print)
                      </h4>
                      <p className="text-green-700 text-sm">
                        Đây là định dạng tốt nhất, nhẹ và khóa được layer.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-200/50 shadow-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        ✅ AI (Adobe Illustrator)
                      </h4>
                      <p className="text-blue-700 text-sm">
                        File gốc vector (vui lòng Package hình ảnh đi kèm).
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-3xl border-2 border-purple-200/50 shadow-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">
                        ✅ PSD (Photoshop)
                      </h4>
                      <p className="text-purple-700 text-sm">
                        Dành cho các thiết kế nhiều hiệu ứng ảnh (Phải merge
                        layers hoặc gửi kèm font).
                      </p>
                    </div>
                  </div>

                  <WarningBox>
                    <strong>Lưu ý:</strong> Chúng tôi KHÔNG NHẬN in các file:
                    Word, Excel, PowerPoint, Canva (xuất ảnh chất lượng thấp).
                  </WarningBox>
                </div>
              </div>
            </article>
          </TabsContent>

          <TabsContent
            value="checklist"
            className="bg-white p-12 md:p-16 shadow-lg border-2 border-stone-200/50 rounded-3xl"
          >
            <article className="prose prose-stone prose-lg max-w-none font-light">
              <h2 className="font-serif text-4xl text-stone-900 italic mb-8">
                Checklist Kiểm tra trước khi gửi file
              </h2>

              <p className="mb-8">
                Hãy tích vào các ô dưới đây để chắc chắn file của bạn đã sẵn
                sàng:
              </p>

              <div className="bg-stone-50 p-6 rounded-3xl border-2 border-stone-200/50 shadow-lg mb-8">
                <h3 className="font-serif text-2xl text-stone-900 italic mb-6">
                  Pre-flight Checklist
                </h3>

                <div className="space-y-2">
                  <ChecklistItem>
                    Hệ màu file đã chuyển sang CMYK chưa?
                  </ChecklistItem>
                  <ChecklistItem>
                    Kích thước file đã cộng thêm tràn lề (Bleed) 2mm mỗi cạnh
                    chưa?
                  </ChecklistItem>
                  <ChecklistItem>
                    Nội dung chữ/logo đã nằm trong Vùng an toàn chưa?
                  </ChecklistItem>
                  <ChecklistItem>
                    Toàn bộ Font chữ đã được Outline/Curve chưa?
                  </ChecklistItem>
                  <ChecklistItem>
                    Ảnh nhúng (Link images) đã đủ độ phân giải 300 DPI chưa?
                  </ChecklistItem>
                  <ChecklistItem>
                    Các hiệu ứng (Effect/Transparency) đã được Flatten chưa?
                  </ChecklistItem>
                  <ChecklistItem>
                    File đã được xuất đúng định dạng (PDF/AI/PSD) chưa?
                  </ChecklistItem>
                  <ChecklistItem>
                    Đã kiểm tra lại màu đen (Text Black vs Rich Black) chưa?
                  </ChecklistItem>
                  <ChecklistItem>
                    Đã test in thử trên máy in màu để kiểm tra màu sắc chưa?
                  </ChecklistItem>
                  <ChecklistItem>
                    Đã backup file gốc trước khi gửi chưa?
                  </ChecklistItem>
                </div>
              </div>

              <SummaryBox>
                Nếu tất cả đều được tích ✅, file của bạn đã sẵn sàng để gửi
                xưởng in!
              </SummaryBox>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-12">
                Cần hỗ trợ kỹ thuật?
              </h3>

              <p>
                Nếu bạn không chắc chắn về file của mình, đừng lo lắng. Đội ngũ
                kỹ thuật của Printz sẽ hỗ trợ kiểm tra file miễn phí (Pre-flight
                check) và báo lại lỗi cho bạn trước khi in.
              </p>

              <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-200/50 shadow-lg mt-6">
                <h4 className="font-semibold text-emerald-800 mb-4">
                  Liên hệ hỗ trợ kỹ thuật:
                </h4>
                <div className="space-y-2 text-emerald-700">
                  <p>
                    <strong>Hotline Kỹ thuật:</strong> 0865 726 848
                  </p>
                  <p>
                    <strong>Email gửi file:</strong> design@printz.vn
                  </p>
                  <p className="text-sm italic">
                    (Vui lòng ghi rõ Mã đơn hàng khi gửi file)
                  </p>
                </div>
              </div>
            </article>
          </TabsContent>

          <TabsContent
            value="templates"
            className="bg-white p-12 md:p-16 shadow-lg border-2 border-stone-200/50 rounded-3xl"
          >
            <article className="prose prose-stone prose-lg max-w-none font-light">
              <h2 className="font-serif text-4xl text-stone-900 italic mb-8">
                Tải về Template Mẫu
              </h2>

              <p className="mb-8">
                Để tiết kiệm thời gian, bạn có thể tải các file khuôn mẫu (có
                sẵn đường guide an toàn) của Printz:
              </p>

              <div className="grid gap-6">
                {/* Namecard Template */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl border-2 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl text-stone-900 italic mb-2">
                        📂 Template Namecard (90x55mm)
                      </h3>
                      <p className="text-stone-600 text-sm mb-4">
                        Khuôn mẫu namecard chuẩn với guide tràn lề và vùng an
                        toàn
                      </p>
                      <div className="flex gap-3">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-3xl text-sm font-medium hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Tải file .AI
                        </button>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-3xl text-sm font-medium hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Tải file .PSD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* A4 Flyer Template */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-3xl border-2 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl text-stone-900 italic mb-2">
                        📂 Template Tờ rơi A4 (210x297mm)
                      </h3>
                      <p className="text-stone-600 text-sm mb-4">
                        Khuôn mẫu tờ rơi A4 với hướng dẫn bố cục và vùng an toàn
                      </p>
                      <div className="flex gap-3">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-3xl text-sm font-medium hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Tải file .AI
                        </button>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-3xl text-sm font-medium hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Tải file .PSD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Envelope Template */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-3xl border-2 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl text-stone-900 italic mb-2">
                        📂 Template Phong bì thư A5
                      </h3>
                      <p className="text-stone-600 text-sm mb-4">
                        Khuôn mẫu phong bì thư với vị trí địa chỉ và logo chuẩn
                      </p>
                      <div className="flex gap-3">
                        <button className="bg-orange-600 text-white px-4 py-2 rounded-3xl text-sm font-medium hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Tải file .AI
                        </button>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-3xl text-sm font-medium hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Tải file .PSD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brochure Template */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-3xl border-2 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl text-stone-900 italic mb-2">
                        📂 Template Brochure 3 gấp (297x210mm)
                      </h3>
                      <p className="text-stone-600 text-sm mb-4">
                        Khuôn mẫu brochure 3 gấp với đường gấp và hướng dẫn bố
                        cục
                      </p>
                      <div className="flex gap-3">
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-3xl text-sm font-medium hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Tải file .AI
                        </button>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-3xl text-sm font-medium hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Tải file .PSD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <SummaryBox>
                Tất cả template đều có sẵn guide layer, bleed area và safe zone.
                Chỉ cần thay nội dung và xuất file theo quy chuẩn!
              </SummaryBox>

              <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200/50 shadow-lg mt-8">
                <h4 className="font-semibold text-amber-800 mb-3">
                  📋 Hướng dẫn sử dụng Template:
                </h4>
                <ol className="text-amber-700 space-y-2 text-sm">
                  <li>1. Tải template phù hợp với sản phẩm của bạn</li>
                  <li>2. Mở file trong Adobe Illustrator hoặc Photoshop</li>
                  <li>3. Thay thế nội dung mẫu bằng thiết kế của bạn</li>
                  <li>
                    4. Đảm bảo nội dung quan trọng nằm trong vùng Safe Zone (màu
                    xanh)
                  </li>
                  <li>
                    5. Để background/nền tràn ra ngoài Bleed Area (màu đỏ)
                  </li>
                  <li>6. Ẩn layer Guide trước khi xuất file</li>
                  <li>
                    7. Xuất PDF High Quality Print hoặc giữ nguyên format gốc
                  </li>
                </ol>
              </div>
            </article>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
}
