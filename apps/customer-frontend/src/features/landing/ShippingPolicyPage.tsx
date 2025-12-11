import { Header, Footer } from "./components";
import { Truck, Package, Video, AlertTriangle, DollarSign } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <Truck className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Chính sách Giao vận & Quy định Đồng kiểm
          </h1>
          <p className="text-stone-600 text-lg italic">
            (Logistics & Inspection Policy)
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white p-12 md:p-16 shadow-sm border border-stone-200">
          <article className="prose prose-stone prose-lg max-w-none">
            {/* Intro */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-12">
              <p className="text-stone-700 leading-relaxed mb-0">
                <strong>Printz Solutions</strong> hợp tác với các đơn vị vận
                chuyển chuyên nghiệp (Viettel Post, AhaMove, các đội xe tải
                logistic...) để đảm bảo hàng hóa đến tay Quý khách an toàn. Dưới
                đây là quy định nhằm bảo vệ quyền lợi của Quý khách khi phát
                sinh rủi ro vận chuyển.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <Truck className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  1. Phương thức & Thời gian giao hàng
                </h2>
              </div>

              <p>
                Chúng tôi áp dụng quy trình giao hàng đa tầng tùy theo quy mô
                đơn hàng:
              </p>

              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 my-6">
                <h4 className="font-bold text-stone-900 mb-3">
                  📦 Đơn hàng mẫu / Số lượng ít (&lt; 20kg):
                </h4>
                <p className="mb-2">
                  Giao qua <strong>CPN (Chuyển phát nhanh)</strong>.
                </p>
                <p className="mb-0 text-emerald-700 font-medium">
                  ⏱️ Thời gian: 1-3 ngày làm việc tùy khu vực.
                </p>
              </div>

              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 my-6">
                <h4 className="font-bold text-stone-900 mb-3">
                  🚛 Đơn hàng B2B / Số lượng lớn (Pallet/Kiện):
                </h4>
                <p className="mb-2">
                  Giao bằng <strong>xe tải chuyên dụng</strong>.
                </p>
                <p className="mb-0 text-emerald-700 font-medium">
                  ⏱️ Thời gian: Theo lịch hẹn cụ thể trong Hợp đồng.
                </p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 my-6">
                <p className="mb-0">
                  <strong>⚠️ Lưu ý quan trọng:</strong> Với đơn hàng dự án,
                  Printz có thể giao hàng từng phần (Partial Shipment) để đảm
                  bảo tiến độ sự kiện của khách (nếu có thỏa thuận trước).
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <Package className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  2. Quy định ĐỒNG KIỂM (Inspection)
                  <br />
                  <span className="text-blue-600 text-2xl">
                    - Lá chắn bảo vệ quyền lợi
                  </span>
                </h2>
              </div>

              <p>
                Vì đặc thù hàng in ấn/quà tặng dễ vỡ (gốm sứ) hoặc hư hỏng do va
                đập, Printz áp dụng quy trình đồng kiểm{" "}
                <span className="text-red-600 font-bold">2 lớp</span>:
              </p>

              {/* Layer 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-lg border-2 border-blue-200 my-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 mb-0">
                    Lớp 1: Đồng kiểm Ngoại quan
                    <br />
                    <span className="text-base text-stone-600 font-normal">
                      (Kiểm tra cùng Shipper/Đơn vị giao hàng)
                    </span>
                  </h3>
                </div>

                <div className="space-y-4 ml-15">
                  <div>
                    <h4 className="font-bold text-stone-900 mb-2">
                      📅 Khi nào:
                    </h4>
                    <p className="mb-0">
                      <span className="text-red-600 font-bold">
                        Ngay tại thời điểm nhận hàng.
                      </span>
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 mb-2">
                      🔍 Làm gì:
                    </h4>
                    <p className="mb-2">
                      Quý khách vui lòng kiểm tra tình trạng{" "}
                      <strong>BÊN NGOÀI</strong> kiện hàng:
                    </p>
                    <ul className="space-y-1">
                      <li>
                        Hộp có bị móp méo, ướt, thủng, hay mất niêm phong Printz
                        không?
                      </li>
                      <li>Lắc nhẹ xem có tiếng vỡ vụn bên trong không?</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 mb-2">
                      ✅ Hành động:
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 p-4 rounded border border-green-200">
                        <p className="mb-0">
                          <strong className="text-green-700">
                            ✓ Nếu hộp nguyên vẹn:
                          </strong>{" "}
                          Ký nhận "Đã nhận đủ số kiện".
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded border border-red-200">
                        <p className="mb-0">
                          <strong className="text-red-700">
                            ✗ Nếu hộp hư hỏng:
                          </strong>{" "}
                          Yêu cầu Shipper lập Biên bản bất thường ngay tại chỗ
                          hoặc{" "}
                          <span className="text-red-600 font-bold">
                            TỪ CHỐI NHẬN HÀNG
                          </span>{" "}
                          và gọi ngay hotline Printz để xử lý kịp thời.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layer 2 */}
              <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-lg border-2 border-purple-200 my-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <h3 className="font-bold text-xl text-stone-900 mb-0">
                    Lớp 2: Đồng kiểm Chi tiết
                    <br />
                    <span className="text-base text-stone-600 font-normal">
                      (Kiểm tra nội bộ)
                    </span>
                  </h3>
                </div>

                <div className="space-y-4 ml-15">
                  <div>
                    <h4 className="font-bold text-stone-900 mb-2">
                      📅 Khi nào:
                    </h4>
                    <p className="mb-0">
                      Trong vòng{" "}
                      <span className="text-red-600 font-bold">24h - 48h</span>{" "}
                      sau khi nhận hàng.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 mb-2">
                      🔍 Làm gì:
                    </h4>
                    <p className="mb-0">
                      Mở hộp và kiểm tra số lượng, chất lượng in ấn bên trong.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-600 p-6">
                    <div className="flex items-start gap-3">
                      <Video className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-red-700 mb-2">
                          ⚠️ Yêu cầu bắt buộc:
                        </h4>
                        <p className="mb-2">
                          Quý khách vui lòng{" "}
                          <span className="text-red-600 font-bold text-lg">
                            QUAY VIDEO CLIP
                          </span>{" "}
                          quá trình mở kiện hàng (Unboxing).
                        </p>
                        <p className="mb-0 italic text-stone-700">
                          Đây là bằng chứng duy nhất để Printz làm việc với bên
                          Vận chuyển đền bù và kích hoạt chế độ "In bù cấp tốc"
                          cho Quý khách.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  3. Xử lý sự cố Vận chuyển
                  <br />
                  <span className="text-orange-600 text-xl">
                    (Kết nối với Chính sách Bảo hành)
                  </span>
                </h2>
              </div>

              <p>
                Nếu hàng hóa bị vỡ/hỏng do vận chuyển, quy trình xử lý sẽ kích
                hoạt{" "}
                <strong className="text-emerald-600">
                  Chính sách In lại (Reprint Policy)
                </strong>{" "}
                đã cam kết:
              </p>

              <div className="space-y-6 my-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div className="flex-1 bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-stone-900 mb-2">
                      Gửi bằng chứng
                    </h4>
                    <p className="mb-0">
                      Quý khách gửi Video mở hàng + Ảnh sản phẩm lỗi qua
                      Zalo/Email cho Printz trong thời hạn khiếu nại{" "}
                      <span className="text-red-600 font-bold">(3 ngày)</span>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div className="flex-1 bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-stone-900 mb-2">
                      Kích hoạt bảo hiểm
                    </h4>
                    <p className="mb-0">
                      Dựa trên bằng chứng này, Printz sẽ làm việc với đơn vị vận
                      chuyển để đòi bồi thường{" "}
                      <span className="italic text-stone-600">
                        (Việc này là việc của Printz, khách hàng không cần bận
                        tâm)
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div className="flex-1 bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                    <h4 className="font-bold text-emerald-800 mb-2">
                      Bù hàng cho khách
                    </h4>
                    <p className="mb-0">
                      Song song đó, Printz sẽ tiến hành{" "}
                      <span className="text-red-600 font-bold">
                        SẢN XUẤT BÙ NGAY LẬP TỨC
                      </span>{" "}
                      số lượng bị vỡ hỏng và gửi hỏa tốc cho khách (Theo cam kết
                      SLA xử lý trong 24h).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-12">
              <h2 className="font-serif text-3xl text-stone-900 italic mb-6">
                4. Trách nhiệm về hàng hóa (Liability)
              </h2>

              <div className="space-y-6">
                <div className="bg-green-50 border-l-4 border-green-600 p-6">
                  <h4 className="font-bold text-green-800 mb-3">
                    ✓ Trường hợp Printz thuê vận chuyển:
                  </h4>
                  <p className="mb-0">
                    Rủi ro mất mát, hư hỏng trên đường đi do{" "}
                    <strong>Printz và Đơn vị vận chuyển</strong> chịu trách
                    nhiệm hoàn toàn.
                  </p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-600 p-6">
                  <h4 className="font-bold text-amber-800 mb-3">
                    ⚠️ Trường hợp Khách hàng tự thuê xe đến lấy (EXW - Ex
                    Works):
                  </h4>
                  <p className="mb-0">
                    Trách nhiệm của Printz kết thúc khi hàng được bàn giao lên
                    xe của Quý khách tại kho/xưởng. Quý khách chịu rủi ro trong
                    quá trình vận chuyển về kho mình.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <DollarSign className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  5. Chi phí giao hàng
                </h2>
              </div>

              <div className="space-y-6">
                <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-3">
                    📦 Đơn hàng tiêu chuẩn:
                  </h4>
                  <p className="mb-0">
                    Phí vận chuyển được tính tách biệt hoặc gộp vào đơn hàng tùy
                    thỏa thuận báo giá.
                  </p>
                </div>

                <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 mb-3">
                    🎁 Đơn hàng Bù lỗi/Bảo hành:
                  </h4>
                  <p className="mb-0">
                    Printz chịu{" "}
                    <span className="text-red-600 font-bold">100%</span> phí vận
                    chuyển (cả 2 chiều đi và về nếu có thu hồi).
                  </p>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-stone-50 p-8 rounded-lg border border-blue-200 text-center mt-12">
              <Truck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-stone-900 mb-3 italic">
                Cần hỗ trợ về vận chuyển?
              </h3>
              <p className="text-stone-600 mb-6">
                Liên hệ ngay với đội ngũ logistics của chúng tôi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:0865726848"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hotline: 0865 726 848
                </a>
                <a
                  href="mailto:logistics@printz.vn"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-stone-900 font-medium rounded-lg border border-stone-300 hover:bg-stone-50 transition-colors"
                >
                  Email: logistics@printz.vn
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
