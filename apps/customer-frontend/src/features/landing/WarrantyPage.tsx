import { Header, Footer } from "./components";
import { ShieldCheck, Package, Clock, AlertCircle } from "lucide-react";

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <ShieldCheck className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Chính sách Bảo hành & Đổi trả 1-1
          </h1>
          <p className="text-stone-600 text-lg italic">
            (Cam kết chất lượng Printz Assurance)
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white p-12 md:p-16 shadow-sm border border-stone-200">
          <article className="prose prose-stone prose-lg max-w-none">
            {/* Intro */}
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 mb-12">
              <p className="text-stone-700 leading-relaxed mb-0">
                Tại <strong>Printz Solutions</strong>, chúng tôi hiểu rằng sản
                phẩm in ấn là bộ mặt thương hiệu của Quý khách. Chúng tôi cam
                kết chịu trách nhiệm đến cùng với từng sản phẩm xuất xưởng thông
                qua chính sách{" "}
                <span className="text-red-600 font-bold">
                  Đổi mới 1-1 (Reprint)
                </span>{" "}
                minh bạch dưới đây:
              </p>
            </div>

            {/* Section 1 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <Package className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  1. Phạm vi áp dụng & Cam kết đổi trả
                </h2>
              </div>

              <p>
                Chúng tôi thực hiện{" "}
                <span className="text-red-600 font-bold">
                  in lại mới 100% (miễn phí toàn bộ chi phí)
                </span>{" "}
                hoặc <span className="text-red-600 font-bold">hoàn tiền</span>{" "}
                cho các trường hợp lỗi được xác định thuộc về trách nhiệm của
                Printz và đơn vị vận chuyển, bao gồm:
              </p>

              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 my-6">
                <h4 className="font-bold text-stone-900 mb-4">
                  ✓ Sai quy cách:
                </h4>
                <p className="mb-0">
                  Sản phẩm không đúng kích thước, chất liệu, hoặc kiểu dáng như
                  trong Hợp đồng/Đơn đặt hàng đã chốt.
                </p>
              </div>

              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 my-6">
                <h4 className="font-bold text-stone-900 mb-4">
                  ✓ Lỗi kỹ thuật in nghiêm trọng:
                </h4>
                <ul className="mb-0 space-y-2">
                  <li>Hình ảnh bị nhòe, lem mực, mất nét, hoặc in ngược.</li>
                  <li>
                    Cắt/bế thành phẩm bị lệch phạm vào nội dung thiết kế quá
                    2mm.
                  </li>
                  <li>
                    Sản phẩm bị bong tróc, trầy xước bề mặt in ngay khi mở hộp.
                  </li>
                </ul>
              </div>

              <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 my-6">
                <h4 className="font-bold text-stone-900 mb-4">
                  ✓ Lỗi do vận chuyển:
                </h4>
                <p className="mb-0">
                  Sản phẩm bị móp méo, vỡ, ướt, hoặc hư hỏng trong quá trình
                  giao hàng (Áp dụng khi Quý khách cung cấp video mở hộp/đồng
                  kiểm).
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  2. Các trường hợp miễn trừ trách nhiệm{" "}
                  <span className="text-red-600">(Không bảo hành)</span>
                </h2>
              </div>

              <p>
                Để đảm bảo tính công bằng và đặc thù kỹ thuật ngành in, Printz
                xin phép{" "}
                <span className="text-red-600 font-bold">từ chối bảo hành</span>{" "}
                trong các trường hợp sau:
              </p>

              <div className="bg-red-50 border-l-4 border-red-600 p-6 my-6">
                <h4 className="font-bold text-stone-900 mb-3">
                  ✗ Lỗi nội dung từ phía khách hàng:
                </h4>
                <p className="mb-0">
                  Sai chính tả, sai số điện thoại, sai màu logo... mà lỗi này đã
                  tồn tại trong File thiết kế hoặc Maquette (Mẫu duyệt) mà Quý
                  khách đã xác nhận{" "}
                  <span className="text-red-600 font-bold">"OK in"</span>.
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-600 p-6 my-6">
                <h4 className="font-bold text-stone-900 mb-3">
                  ✗ Dung sai màu sắc:
                </h4>
                <p className="mb-0">
                  Quý khách đồng ý chấp nhận sự chênh lệch màu sắc tương đối
                  (khoảng <span className="text-red-600 font-bold">10-15%</span>
                  ) giữa màn hình máy tính (hệ màu RGB, có đèn nền) và sản phẩm
                  in thực tế (hệ màu CMYK/Pantone, chất liệu thấm hút mực).
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-600 p-6 my-6">
                <h4 className="font-bold text-stone-900 mb-3">
                  ✗ Chất lượng file nguồn thấp:
                </h4>
                <p className="mb-0">
                  File gốc Quý khách cung cấp bị vỡ nét (low resolution), nhòe
                  mờ. Chúng tôi in trung thực theo chất lượng file gốc.
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-600 p-6 my-6">
                <h4 className="font-bold text-stone-900 mb-3">
                  ✗ Sử dụng/Bảo quản sai cách:
                </h4>
                <p className="mb-0">
                  Sản phẩm hư hỏng do Quý khách tự ý giặt tẩy sai quy định (với
                  áo/túi vải), va đập, hoặc để trong môi trường ẩm mốc, nhiệt độ
                  cao sau khi đã nhận hàng.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-12">
              <div className="flex items-start gap-3 mb-6">
                <Clock className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                <h2 className="font-serif text-3xl text-stone-900 italic mb-0">
                  3. Quy trình tiếp nhận & Xử lý{" "}
                  <span className="text-emerald-600">(3 Bước nhanh gọn)</span>
                </h2>
              </div>

              <p>
                Chúng tôi tối giản quy trình để không làm mất thời gian của Quý
                khách:
              </p>

              <div className="space-y-6 my-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 mb-2">
                      Kiểm hàng & Báo lỗi
                    </h4>
                    <ul className="space-y-2">
                      <li>
                        Quý khách vui lòng kiểm tra hàng{" "}
                        <span className="text-red-600 font-bold">
                          ngay khi nhận
                        </span>
                        .
                      </li>
                      <li>
                        Nếu phát hiện lỗi, hãy quay video/chụp ảnh hiện trạng và
                        gửi cho Chuyên viên tư vấn của Printz, xử lý trong vòng{" "}
                        <span className="text-red-600 font-bold">
                          01 ngày làm việc
                        </span>{" "}
                        kể từ khi nhận hàng.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 mb-2">
                      Xác minh{" "}
                      <span className="text-emerald-600">
                        (Trong vòng 4h - 8h)
                      </span>
                    </h4>
                    <ul className="space-y-2">
                      <li>
                        Printz sẽ đối chiếu ảnh sản phẩm lỗi với File duyệt in
                        ban đầu.
                      </li>
                      <li>
                        Nếu lỗi thuộc về Printz: Chúng tôi xác nhận phương án xử
                        lý ngay lập tức.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 mb-2">Khắc phục</h4>
                    <div className="space-y-4">
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="font-bold text-emerald-800 mb-2">
                          Phương án 1 (Ưu tiên):
                        </p>
                        <p className="mb-0">
                          Printz tiến hành{" "}
                          <span className="text-red-600 font-bold">
                            IN LẠI CẤP TỐC (Express)
                          </span>{" "}
                          và giao hàng hỏa tốc miễn phí đến tận tay Quý khách.
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="font-bold text-emerald-800 mb-2">
                          Phương án 2:
                        </p>
                        <p className="mb-0">
                          Nếu Quý khách không còn nhu cầu in lại (do lỡ sự
                          kiện), Printz sẽ{" "}
                          <span className="text-red-600 font-bold">
                            HOÀN TIỀN 100%
                          </span>{" "}
                          giá trị số lượng hàng bị lỗi + Tặng Voucher xin lỗi
                          cho đơn hàng sau.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-12">
              <h2 className="font-serif text-3xl text-stone-900 italic mb-6">
                4. Thời hạn khiếu nại
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-600 p-6">
                <h4 className="font-bold text-stone-900 mb-3">
                  Thời gian tiếp nhận khiếu nại:
                </h4>
                <p className="mb-3">
                  Trong{" "}
                  <span className="text-red-600 font-bold">
                    30 phút và 02 ngày làm việc
                  </span>{" "}
                  tính từ ngày đơn vị vận chuyển báo "Giao hàng thành công".
                </p>
                <p className="mb-0 italic text-stone-600">
                  Quá thời hạn trên, Printz xin phép hiểu rằng Quý khách đã hài
                  lòng với sản phẩm và đóng đơn hàng.
                </p>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-gradient-to-br from-emerald-50 to-stone-50 p-8 rounded-lg border border-emerald-200 text-center mt-12">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-stone-900 mb-3 italic">
                Cần hỗ trợ về chính sách bảo hành?
              </h3>
              <p className="text-stone-600 mb-6">
                Liên hệ ngay với đội ngũ chăm sóc khách hàng của chúng tôi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:0865726848"
                  className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Hotline: 0865 726 848
                </a>
                <a
                  href="mailto:support@printz.vn"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-stone-900 font-medium rounded-lg border border-stone-300 hover:bg-stone-50 transition-colors"
                >
                  Email: support@printz.vn
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
