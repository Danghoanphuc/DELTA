import { useState } from "react";
import {
  Search,
  ShieldCheck,
  Check,
  AlertOctagon,
  Fingerprint,
  Stamp,
  Scroll,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function ServicesPage() {
  const [serialNumber, setSerialNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async () => {
    if (!serialNumber.trim()) return;

    setIsSearching(true);
    setResult(null); // Reset kết quả cũ

    // Mô phỏng API call
    setTimeout(() => {
      // Mock data logic
      const code = serialNumber.toUpperCase().trim();
      if (code.includes("88") || code.includes("68")) {
        setResult({
          found: true,
          code: code,
          productName: "Độc Bình Gốm Chu Đậu Vẽ Vàng",
          collection: "Tinh Hoa Đại Việt 2025",
          edition: "Bản Giới Hạn (Limited Edition)",
          position: code.split("/")[0]?.replace("#", "") || "08",
          total: "88",
          issueDate: "15 tháng 01, 2025",
          material: "Gốm men tro trấu, Vàng 24K",
          craftsman: "Nghệ nhân ưu tú Phạm Thế Anh",
          certificateId: "ANC-2025-GCD-008",
          status: "verified",
        });
      } else {
        setResult({
          found: false,
          code: code,
        });
      }
      setIsSearching(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-900 font-sans pb-32">
      {/* TEXTURE NỀN TOÀN TRANG */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply"></div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-20 px-6 text-center border-b border-stone-200">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 border border-amber-800/30 px-4 py-1.5 rounded-full bg-amber-50">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-amber-900 uppercase">
              Trang xác thực
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 font-bold leading-tight">
            Tra Cứu <br />
            <span className="text-amber-800 italic">Hồ Sơ Tác Phẩm</span>
          </h1>
          <p className="text-stone-600 text-lg font-light leading-relaxed max-w-xl mx-auto">
            Mỗi vật phẩm từ Printz đều mang một <strong>Mã Định Danh</strong>{" "}
            duy nhất. Nhập mã số trên chứng thư để xác minh nguồn gốc và giá trị
            độc bản.
          </p>
        </div>
      </section>

      {/* --- SEARCH BOX --- */}
      <section className="max-w-xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white p-2 rounded-sm shadow-xl shadow-stone-200/50 border border-stone-100 flex items-center gap-2">
          <div className="pl-4 text-stone-400">
            <Search className="w-5 h-5" />
          </div>
          <Input
            type="text"
            placeholder="Nhập mã (VD: #68/88 hoặc ANC-2025...)"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 border-none shadow-none h-14 text-lg placeholder:text-stone-300 placeholder:font-serif placeholder:italic focus-visible:ring-0 bg-transparent text-stone-900 font-medium"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !serialNumber.trim()}
            className="h-14 px-8 bg-stone-900 hover:bg-amber-900 text-white rounded-sm font-bold uppercase tracking-widest text-xs transition-all"
          >
            {isSearching ? (
              <span className="animate-pulse">Đang tra cứu...</span>
            ) : (
              "Thẩm định"
            )}
          </Button>
        </div>

        <p className="text-center mt-4 text-xs text-stone-400 font-mono">
          *Mã định danh nằm ở mặt sau Chứng thư hoặc đáy sản phẩm.
        </p>
      </section>

      {/* --- RESULT AREA --- */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {result.found ? (
              // === TRƯỜNG HỢP: TÌM THẤY (Hiển thị như Chứng thư số) ===
              <div className="relative bg-[#FFFDF5] p-8 md:p-16 border-[12px] border-double border-stone-200 shadow-2xl mx-auto max-w-3xl">
                {/* Decorative Corners */}
                <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-amber-800/20"></div>
                <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-amber-800/20"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-amber-800/20"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-amber-800/20"></div>

                {/* Watermark Chìm */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <img src="/logo-symbol.svg" alt="" className="w-96 h-96" />
                </div>

                <div className="relative z-10 text-center space-y-8">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1 border border-emerald-200 bg-emerald-50 rounded-full text-emerald-800 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <Check className="w-3 h-3" /> Verified Authentic
                  </div>

                  {/* Header Chứng thư */}
                  <div>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-2">
                      CHỨNG NHẬN ĐỘC BẢN
                    </h2>
                    <p className="font-serif italic text-stone-500 text-lg">
                      Certificate of Authenticity
                    </p>
                  </div>

                  <div className="w-24 h-[1px] bg-stone-300 mx-auto"></div>

                  {/* Nội dung chi tiết */}
                  <div className="grid md:grid-cols-2 gap-8 text-left max-w-xl mx-auto">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                        Tác phẩm
                      </p>
                      <p className="font-serif text-xl font-bold text-stone-900">
                        {result.productName}
                      </p>
                      <p className="text-sm text-stone-500 mt-1 italic">
                        Thuộc BST: {result.collection}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                        Số Thứ Tự (Edition)
                      </p>
                      <p className="font-mono text-2xl text-amber-800 font-bold">
                        #{result.position}{" "}
                        <span className="text-base text-stone-400 font-light">
                          / {result.total}
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                        Nghệ nhân
                      </p>
                      <p className="font-serif text-lg text-stone-900">
                        {result.craftsman}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                        Chất liệu
                      </p>
                      <p className="font-serif text-lg text-stone-900">
                        {result.material}
                      </p>
                    </div>
                  </div>

                  {/* Footer Chứng thư */}
                  <div className="pt-8 mt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                        Mã Chứng Thư
                      </p>
                      <p className="font-mono text-sm text-stone-900 tracking-wider">
                        {result.certificateId}
                      </p>
                    </div>

                    {/* Con dấu đỏ giả lập */}
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-red-800/80 rounded-full flex items-center justify-center opacity-80 rotate-[-15deg] mix-blend-multiply mask-ink">
                        <div className="w-20 h-20 border border-red-800/50 rounded-full flex items-center justify-center text-center p-2">
                          <span className="text-[10px] font-bold text-red-900 uppercase leading-tight">
                            An Nam
                            <br />
                            Curator
                            <br />
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                        Ngày phát hành
                      </p>
                      <p className="font-serif text-sm text-stone-900">
                        {result.issueDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // === TRƯỜNG HỢP: KHÔNG TÌM THẤY ===
              <div className="max-w-xl mx-auto bg-white p-8 border-l-4 border-red-700 shadow-lg">
                <div className="flex items-start gap-4">
                  <AlertOctagon
                    className="w-10 h-10 text-red-700 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
                      Không tìm thấy dữ liệu
                    </h3>
                    <p className="text-stone-600 mb-4 leading-relaxed">
                      Mã định danh{" "}
                      <strong className="text-stone-900 font-mono bg-stone-100 px-1">
                        {result.code}
                      </strong>{" "}
                      không tồn tại trong hệ thống lưu trữ của chúng tôi.
                    </p>
                    <div className="bg-stone-50 p-4 text-sm text-stone-500 border border-stone-200">
                      <p className="font-bold text-stone-900 mb-1">
                        Khuyến nghị:
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Kiểm tra lại các ký tự (số 0 và chữ O).</li>
                        <li>
                          Sản phẩm có thể chưa được kích hoạt bảo hành điện tử.
                        </li>
                        <li>
                          Liên hệ bộ phận Giám tuyển để được hỗ trợ trực tiếp.
                        </li>
                      </ul>
                    </div>
                    <div className="mt-6 flex gap-4">
                      <Button
                        variant="outline"
                        className="border-stone-300 text-stone-600 hover:text-stone-900"
                      >
                        Thử lại
                      </Button>
                      <a
                        href="tel:0865726848"
                        className="inline-flex items-center justify-center px-4 py-2 bg-stone-900 text-white rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-amber-900 transition-colors"
                      >
                        Liên hệ hỗ trợ
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* --- INFO GRID --- */}
      <section className="max-w-6xl mx-auto px-6 mt-24">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Fingerprint,
              title: "Dấu Ấn Độc Bản",
              desc: "Mỗi tác phẩm là duy nhất với các biến số tự nhiên của chất liệu (vân gỗ, men gốm) không thể sao chép.",
            },
            {
              icon: Stamp,
              title: "Số Lượng Giới Hạn",
              desc: "Các bộ sưu tập Limited Edition được đánh số thứ tự và cam kết không tái sản xuất để bảo toàn giá trị.",
            },
            {
              icon: Scroll,
              title: "Hồ Sơ Vĩnh Viễn",
              desc: "Thông tin tác phẩm được lưu trữ vĩnh viễn trên hệ thống, giúp xác minh nguồn gốc khi chuyển nhượng.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group p-8 bg-white border border-stone-200 hover:border-amber-800/50 transition-colors duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                <item.icon size={80} className="text-amber-900" />
              </div>
              <div className="relative z-10">
                <item.icon
                  className="w-10 h-10 text-amber-800 mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-3 group-hover:text-amber-900 transition-colors">
                  {item.title}
                </h3>
                <p className="text-stone-500 font-light leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;
