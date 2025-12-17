import { Flame } from "lucide-react";
import { Header, Footer } from "./components";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 font-bold leading-tight">
            TUYÊN NGÔN VỀ SỰ ĐỘC BẢN
            <br />& TIÊU CHUẨN CHẾ TÁC
          </h1>
          <p className="text-stone-600 text-lg uppercase tracking-wider">
            Manifesto of Uniqueness & Craftsmanship Standards
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white p-12 md:p-16 shadow-sm border border-stone-200">
          <article className="prose prose-stone prose-lg max-w-none">
            {/* Intro */}
            <div className="border-t-4 border-b-4 border-stone-900 py-8 mb-12">
              <p className="text-stone-900 leading-relaxed mb-4 text-lg font-medium">
                Tại <strong>Printz</strong>, chúng tôi không sản xuất hàng hóa
                công nghiệp theo dây chuyền.
              </p>
              <p className="text-stone-800 leading-relaxed mb-0">
                Chúng tôi là <strong>Nhà Giám tuyển (Curators)</strong> — những
                người kiến tạo giá trị thông qua sự giao thoa giữa
                <strong> Tuyệt kỹ Thủ công (Craftsmanship)</strong> và{" "}
                <strong>Bản tính Tự nhiên (Nature's Authenticity)</strong>. Mỗi
                tác phẩm chúng tôi trao đến tay Quý doanh nghiệp đều mang dấu ấn
                độc nhất, không thể sao chép.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-12">
              <div className="border-l-4 border-stone-900 pl-6 mb-6">
                <h2 className="font-serif text-3xl text-stone-900 font-bold mb-2">
                  I. TRIẾT LÝ GIÁM TUYỂN
                </h2>
                <p className="text-stone-600 uppercase tracking-wide text-sm">
                  Curatorial Philosophy
                </p>
              </div>

              <p className="text-lg leading-relaxed font-medium text-stone-800 mb-4">
                Chúng tôi cam kết bảo vệ tính độc bản thông qua chiến lược{" "}
                <strong>"Kép"</strong>:
              </p>
              <p className="text-stone-700 leading-relaxed italic">
                Đây không chỉ là phương pháp sản xuất, mà là triết lý kinh doanh
                — đảm bảo mỗi món quà Quý doanh nghiệp trao tặng đều mang giá
                trị khan hiếm và ý nghĩa sâu sắc.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="border-2 border-stone-900 p-6">
                  <h4 className="font-bold text-stone-900 mb-3 uppercase tracking-wide">
                    1. Duy nhất về Chất liệu
                  </h4>
                  <p className="text-stone-700 mb-0 leading-relaxed">
                    Dấu ấn của thiên tạo, không có hai sản phẩm nào giống hệt
                    nhau
                  </p>
                </div>

                <div className="border-2 border-stone-900 p-6">
                  <h4 className="font-bold text-stone-900 mb-3 uppercase tracking-wide">
                    2. Giới hạn về Số lượng
                  </h4>
                  <p className="text-stone-700 mb-0 leading-relaxed">
                    Phiên bản giới hạn, đánh số thứ tự, không tái sản xuất
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <Flame className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  2. Độc bản về Chất liệu
                  <br />
                  <span className="text-orange-600 text-2xl">
                    Dấu ấn của Thiên tạo (Natural Variance)
                  </span>
                </h2>
              </div>

              <div className="bg-stone-50 border-l-4 border-orange-600 p-6 mb-6">
                <p className="text-lg leading-relaxed font-semibold text-stone-900 mb-3">
                  CAM KẾT CỦA CHÚNG TÔI:
                </p>
                <p className="text-stone-800 leading-relaxed mb-0">
                  Chúng tôi <strong>tôn trọng và bảo tồn</strong> những đặc tính
                  tự nhiên của nguyên liệu, coi đó là <strong>"chữ ký"</strong>{" "}
                  riêng biệt mà Tự nhiên khắc lên từng tác phẩm. Chúng tôi{" "}
                  <strong>từ chối</strong> mọi hình thức can thiệp hóa học nhằm
                  tạo ra sự đồng nhất giả tạo.
                </p>
              </div>

              {/* Material 1: Gốm men Hỏa biến */}
              <div className="border-2 border-stone-300 p-8 my-8">
                <h3 className="font-bold text-xl text-stone-900 mb-4 uppercase tracking-wide">
                  A. Gốm men Hỏa biến
                </h3>

                <div className="space-y-4">
                  <p className="text-stone-700 leading-relaxed">
                    Màu men là kết quả ngẫu nhiên của ngọn lửa ở nhiệt độ{" "}
                    <strong>1.300°C</strong>. Không có hai chiếc chén nào giống
                    nhau 100% về vân men, dù cùng một khuôn cốt.
                  </p>

                  <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
                    <p className="mb-2 font-semibold text-orange-900">
                      Đặc tính Tự nhiên:
                    </p>
                    <p className="mb-0 text-stone-700 leading-relaxed">
                      Vân men chảy tự nhiên, sắc độ màu dao động trong biên độ
                      5-10%, đốm lửa ngẫu nhiên xuất hiện tùy vị trí trong lò.
                      <strong> Đây là bằng chứng xác thực</strong> của quy trình
                      nung thủ công truyền thống.
                    </p>
                  </div>
                </div>
              </div>

              {/* Material 2: Gỗ & Trầm */}
              <div className="border-2 border-stone-300 p-8 my-8">
                <h3 className="font-bold text-xl text-stone-900 mb-4 uppercase tracking-wide">
                  B. Gỗ & Trầm hương
                </h3>

                <div className="space-y-4">
                  <p className="text-stone-700 leading-relaxed">
                    Các đường vân gỗ, mắt gỗ và thớ dầu trầm hương là sự kiến
                    tạo của thời gian. Chúng tôi{" "}
                    <strong>không dùng hóa chất</strong> để tẩy trắng hay vẽ vân
                    giả.
                  </p>

                  <div className="bg-green-50 border-l-4 border-green-700 p-4 rounded">
                    <p className="mb-2 font-semibold text-green-900">
                      Đặc tính Tự nhiên:
                    </p>
                    <p className="mb-0 text-stone-700 leading-relaxed">
                      Vân gỗ tự nhiên, mắt gỗ ngẫu nhiên, thớ dầu trầm phân bố
                      không đều theo tuổi đời của cây.
                      <strong> Chúng tôi cam kết 100%</strong> không tẩy trắng,
                      không vẽ vân giả, không sử dụng hương liệu tổng hợp.
                    </p>
                  </div>
                </div>
              </div>

              {/* Material 3: Sơn mài */}
              <div className="border-2 border-stone-300 p-8 my-8">
                <h3 className="font-bold text-xl text-stone-900 mb-4 uppercase tracking-wide">
                  C. Sơn mài thủ công
                </h3>

                <div className="space-y-4">
                  <p className="text-stone-700 leading-relaxed">
                    Các lớp màu được mài thủ công bởi nghệ nhân, tạo ra độ sâu
                    và sắc thái màu khác biệt trên từng bề mặt.
                  </p>

                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                    <p className="mb-2 font-semibold text-red-900">
                      Đặc tính Thủ công:
                    </p>
                    <p className="mb-0 text-stone-700 leading-relaxed">
                      Độ bóng và sắc thái màu có thể khác nhau nhẹ giữa các sản
                      phẩm do quá trình mài tay của nghệ nhân (mỗi nghệ nhân có
                      lực tay và góc mài riêng).
                      <strong> Đây là dấu ấn nhân văn</strong> không thể tái tạo
                      bằng máy móc.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="border-4 border-stone-900 p-8 my-8 bg-stone-50">
                <p className="text-stone-900 font-bold text-lg mb-4 uppercase tracking-wider">
                  ⚠ TUYÊN BỐ QUAN TRỌNG
                </p>
                <p className="text-stone-900 leading-relaxed font-medium mb-3">
                  Sự khác biệt nhỏ về sắc độ màu, đường vân, kết cấu bề mặt giữa
                  các sản phẩm trong cùng một lô hàng là{" "}
                  <strong className="text-red-700">ĐẶC TÍNH CỐT LÕI</strong> của
                  sản phẩm thủ công cao cấp,{" "}
                  <strong>KHÔNG PHẢI LỖI SẢN XUẤT</strong>.
                </p>
                <p className="text-stone-700 leading-relaxed mb-0 italic">
                  Bằng việc đặt hàng, Quý doanh nghiệp xác nhận đã hiểu rõ và
                  chấp nhận triết lý "Độc bản Tự nhiên" này. Chúng tôi{" "}
                  <strong>không chấp nhận</strong> khiếu nại liên quan đến sự
                  khác biệt tự nhiên nằm trong biên độ cho phép (&lt;5%).
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-12">
              <div className="border-l-4 border-stone-900 pl-6 mb-6">
                <h2 className="font-serif text-3xl text-stone-900 font-bold mb-2">
                  III. ĐỘC BẢN VỀ SỐ LƯỢNG
                </h2>
                <p className="text-stone-600 uppercase tracking-wide text-sm">
                  Limited Edition — Phiên bản Giới hạn
                </p>
              </div>

              <div className="border-t-2 border-b-2 border-stone-900 py-6 mb-6">
                <p className="text-lg leading-relaxed font-bold text-stone-900 mb-3 uppercase">
                  Cam kết Khan hiếm:
                </p>
                <p className="text-stone-800 leading-relaxed mb-0">
                  Để bảo vệ giá trị sưu tầm và tính độc quyền cho món quà của
                  Quý doanh nghiệp, chúng tôi áp dụng chính sách{" "}
                  <strong>"Giới hạn Cứng"</strong> (Hard Cap) không thể thương
                  lượng:
                </p>
              </div>

              <div className="space-y-6 my-8">
                <div className="border-2 border-stone-900 p-6">
                  <h4 className="font-bold text-stone-900 mb-3 uppercase tracking-wide">
                    1. Số lượng Tối đa Cố định
                  </h4>
                  <p className="mb-0 text-stone-800 leading-relaxed">
                    Mỗi Bộ sưu tập chỉ được chế tác{" "}
                    <strong>MỘT LẦN DUY NHẤT</strong> với số lượng giới hạn cố
                    định (Ví dụ: <strong>68, 88 hoặc 100 bộ</strong>). Không có
                    "đợt 2" hay "tái bản".
                  </p>
                </div>

                <div className="border-2 border-stone-900 p-6">
                  <h4 className="font-bold text-stone-900 mb-3 uppercase tracking-wide">
                    2. Hủy Khuôn Vĩnh viễn
                  </h4>
                  <p className="mb-0 text-stone-800 leading-relaxed">
                    Sau khi hoàn tất số lượng cam kết, khuôn mẫu sẽ được{" "}
                    <strong>PHÁ HỦY HOÀN TOÀN</strong> và ghi nhận trong Sổ Giám
                    tuyển. Bộ sưu tập đó sẽ không bao giờ được sản xuất lại, dù
                    có nhu cầu cao.
                  </p>
                </div>

                <div className="border-2 border-stone-900 p-6">
                  <h4 className="font-bold text-stone-900 mb-3 uppercase tracking-wide">
                    3. Chứng thư Xác thực
                  </h4>
                  <p className="mb-0 text-stone-800 leading-relaxed">
                    Mỗi tác phẩm đều được{" "}
                    <strong>đánh số thứ tự duy nhất (Serial Number)</strong>,
                    kèm theo <strong>Chứng thư Giám tuyển</strong> có chữ ký và
                    đóng dấu nổi. Thông tin được lưu trữ vĩnh viễn trong hệ
                    thống blockchain để chống giả mạo.
                  </p>
                </div>
              </div>

              <div className="border-2 border-stone-900 p-6 text-center bg-stone-50">
                <p className="text-lg font-bold text-stone-900 mb-2 uppercase">
                  Ví dụ: Bộ sưu tập "Trầm Hương Xuân"
                </p>
                <p className="text-stone-700 mb-0">
                  Chỉ có <strong>88 bộ</strong> được chế tác, mỗi bộ có số thứ
                  tự riêng:
                  <span className="font-mono font-bold">
                    {" "}
                    #01/88, #02/88, ... #88/88
                  </span>
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-12">
              <div className="border-l-4 border-stone-900 pl-6 mb-6">
                <h2 className="font-serif text-3xl text-stone-900 font-bold mb-2">
                  IV. CAM KẾT VỀ SỰ ĐỒNG BỘ
                </h2>
                <p className="text-stone-600 uppercase tracking-wide text-sm">
                  Quality Consistency
                </p>
              </div>

              <div className="border-t-2 border-b-2 border-stone-900 py-6 mb-6">
                <p className="text-lg leading-relaxed font-bold text-stone-900 mb-3 uppercase">
                  Cam kết Chất lượng:
                </p>
                <p className="text-stone-800 leading-relaxed mb-0">
                  Dù tôn trọng sự khác biệt tự nhiên của chất liệu, chúng tôi
                  hiểu rằng Doanh nghiệp cần sự{" "}
                  <strong>chỉn chu tuyệt đối</strong> về mặt kỹ thuật. Chúng tôi
                  cam kết <strong>KHÔNG THỎA HIỆP</strong> về các tiêu chuẩn
                  sau:
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6">
                  <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2 uppercase">
                    <span className="text-2xl">📐</span> Độ chính xác Kỹ thuật
                  </h4>
                  <p className="mb-0 text-stone-800 leading-relaxed">
                    Dung tích, kích thước, trọng lượng của sản phẩm đạt độ chính
                    xác{" "}
                    <span className="text-emerald-700 font-bold text-lg">
                      ≥98%
                    </span>
                    . Sai số cho phép: <strong>±2mm</strong> (kích thước),{" "}
                    <strong>±5g</strong> (trọng lượng). Vượt ngưỡng này ={" "}
                    <strong>Loại bỏ</strong>.
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 uppercase">
                    <span className="text-2xl">✨</span> Hoàn thiện Bề mặt
                  </h4>
                  <p className="mb-0 text-stone-800 leading-relaxed">
                    <strong>100%</strong> bề mặt được xử lý láng mịn, không có
                    lỗi kỹ thuật (nứt, vỡ, gai, cấn, bọt khí, vết xước). Độ nhám
                    bề mặt: <strong>&lt;0.8μm</strong> (Ra). Mọi sản phẩm không
                    đạt chuẩn sẽ bị <strong>loại bỏ ngay</strong>.
                  </p>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-600 p-6">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2 uppercase">
                    <span className="text-2xl">🔍</span> Kiểm định 3 Cấp độ
                  </h4>
                  <p className="mb-3 text-stone-800 font-medium">
                    <strong>100%</strong> sản phẩm phải vượt qua 3 cấp độ kiểm
                    định:
                  </p>
                  <div className="space-y-3 ml-4">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-purple-700 text-lg">
                        Cấp 1:
                      </span>
                      <p className="mb-0 text-stone-800">
                        <strong>Nghệ nhân tại xưởng</strong> — Kiểm tra kỹ thuật
                        cơ bản (kích thước, bề mặt, cấu trúc)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-purple-700 text-lg">
                        Cấp 2:
                      </span>
                      <p className="mb-0 text-stone-800">
                        <strong>Chuyên gia Giám tuyển</strong> — Đánh giá thẩm
                        mỹ và tính độc bản
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-purple-700 text-lg">
                        Cấp 3:
                      </span>
                      <p className="mb-0 text-stone-800">
                        <strong>Chứng thực cuối cùng</strong> — Đóng dấu nổi{" "}
                        <span className="font-mono bg-purple-100 px-2 py-1 rounded font-bold">
                          "VERIFIED"
                        </span>{" "}
                        và cấp Chứng thư
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="border-4 border-stone-900 p-10 text-center mt-12 bg-stone-100">
              <h3 className="font-serif text-3xl text-stone-900 mb-4 font-bold uppercase tracking-wider">
                Cam kết của Printz Solutions
              </h3>
              <p className="text-stone-800 mb-8 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
                Chúng tôi không chỉ bán sản phẩm. Chúng tôi trao gửi{" "}
                <strong>Di sản</strong> — những tác phẩm mang giá trị vượt thời
                gian, xứng tầm với vị thế của Quý doanh nghiệp.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:0865726848"
                  className="inline-flex items-center justify-center px-8 py-4 bg-stone-900 text-white font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors"
                >
                  Hotline: 0865 726 848
                </a>
                <a
                  href="mailto:curator@printz.vn"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 font-bold uppercase tracking-wider border-2 border-stone-900 hover:bg-stone-50 transition-colors"
                >
                  Email: curator@printz.vn
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
